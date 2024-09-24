import { Hono } from "hono";
import { getPrisma } from "../prisma/prismaFunction";
import { sign } from "hono/jwt";
import { Bindings } from "../types";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{ Bindings: Bindings }>();

// memo
// tenant名/pw/mailが一致したらtokenを返す
app.post("/token", async (c) => {
  const body = await c.req.json<{
    tenantName: string;
    mail: string;
    password: string;
  }>();
  const prisma = getPrisma(c.env.DATABASE_URL);

  const user = await prisma.mst_users.findFirst({
    where: {
      tenant: {
        tenant_name: body.tenantName,
      },
      mail: body.mail,
      password: body.password,
    },
    include: {
      tenant: true,
    },
  });
  console.log(user);

  if (!user) {
    throw new HTTPException(401, { message: "認証情報に誤りがあります" });
  }

  // ペイロードを作成してトークンを返す
  const payload = {
    userId: user.id,
    tenantId: user.tenant.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, //有効期限は60分
  };
  const token = await sign(payload, c.env.TOKEN_SECRET || "");
  setCookie(c, "token", token);
  return c.json({ token });
});

app.delete("/logout", async (c) => {
  deleteCookie(c, "token");
  return c.json({ message: "ログアウト" });
});

export default app;
