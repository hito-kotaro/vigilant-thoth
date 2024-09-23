import { Hono } from "hono";
import { getPrisma } from "../prisma/prismaFunction";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

// テナント新規契約
app.post("/", async (c) => {
  const { tenantName, userName, mail, password } = await c.req.json<{
    tenantName: string;
    userName: string;
    mail: string;
    password: string;
  }>();

  const prisma = getPrisma(c.env.DATABASE_URL);

  // テナント名の重複確認
  const alreadyExist = await prisma.mst_tenants.findFirst({
    where: { tenant_name: tenantName },
  });

  if (alreadyExist) {
    return c.json({ message: "テナント名がすでに使用されています" });
  }

  // メールアドレス被りはシステム全体で排除
  const mailAlreadyExist = await prisma.mst_users.findFirst({
    where: { mail },
  });

  if (mailAlreadyExist) {
    return c.json({ message: "メールアドレスはすでに使われています" });
  }
  // テナント内部の名前被りは考慮しない

  try {
    const tenant = await prisma.mst_tenants.create({
      data: {
        tenant_name: tenantName,
        created_at: new Date().toISOString(),
      },
    });

    // ユーザ作成
    const user = await prisma.mst_users.create({
      data: {
        tenant_id: tenant.id,
        name: userName,
        mail,
        password,
        admin: true,
        created_at: new Date().toISOString(),
      },
    });

    // 作成時にトークンを払い出す
    const payload = {
      tenantId: tenant.id,
      userId: user.id,
      admin: user.admin,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, //有効期限は30分
    };

    const token = await sign(payload, c.env.TOKEN_SECRET || "");
    setCookie(c, "token", token);
    return c.json({ message: "テナントを作成しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "テナントの作成に失敗しました" });
  }
});

export default app;
