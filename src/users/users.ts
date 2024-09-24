import { Hono } from "hono";
import { Bindings, getPrisma } from "../prisma/prismaFunction";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const payload = c.get("jwtPayload");
  const tenantId = payload.tenantId;

  try {
    const users = await prisma.mst_users.findMany({
      where: {
        tenant_id: tenantId,
      },
    });
    return c.json({ users, total: users.length });
  } catch (e) {
    console.error(e);
    return c.json({ message: "ユーザ一覧の取得に失敗しました" });
  }
});

// ユーザ登録
app.post("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const payload = c.get("jwtPayload");
  const tenantId = payload.tenantId;
  const { name, mail, password, admin } = await c.req.json<{
    tenantId: number;
    name: string;
    mail: string;
    password: string;
    admin: boolean;
  }>();

  //　mail重複チェック
  const alreadyExist = await prisma.mst_users.findFirst({
    where: { mail },
  });

  if (alreadyExist) {
    console.log("mail alreay exists");
    return c.json({ message: "ユーザの登録に失敗しました" });
  }

  try {
    const result = await prisma.mst_users.create({
      data: {
        tenant_id: tenantId,
        name,
        password,
        mail,
        admin,
        created_at: new Date(),
      },
    });
    console.log(result);
    return c.json({ message: "ユーザを登録しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "ユーザの登録に失敗しました" });
  }
});

app.put("/:userId", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = Number(c.req.param("userId"));

  // ユーザ存在チェック
  const targetUser = await prisma.mst_users.findFirst({
    where: { id: userId },
  });
  if (!targetUser) {
    return c.json({ message: "ユーザが見つかりませんでした" });
  }

  // body受け取り
  const body = await c.req.json<{
    name?: string;
    mail?: string;
    password?: string;
  }>();

  //　mail重複チェック
  const alreadyExist = await prisma.mst_users.findFirst({
    where: { mail: body.mail },
  });

  if (alreadyExist) {
    return c.json({ message: "同じメールアドがすでに登録されています" });
  }

  // 更新
  try {
    const result = await prisma.mst_users.update({
      data: {
        name: body.name || targetUser.name,
        password: body.password || targetUser.password,
        mail: body.mail || targetUser.mail,
        updated_at: new Date(),
      },
      where: { id: userId },
    });
    console.log(result);
    return c.json({ message: "ユーザを更新しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "ユーザの更新に失敗しました" });
  }
});

app.delete("/:userId", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = Number(c.req.param("userId"));

  // ユーザ存在チェック
  const targetUser = await prisma.mst_users.findFirst({
    where: { id: userId },
  });
  if (!targetUser) {
    return c.json({ message: "ユーザが見つかりませんでした" });
  }

  // 削除処理
  try {
    // 貸出履歴やレビューデータは残しておく（外部参照なし）
    const result = await prisma.mst_users.delete({
      where: { id: userId },
    });
    console.log(result);
    return c.json({ message: "ユーザを削除しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "ユーザの削除に失敗しました" });
  }
});
export default app;
