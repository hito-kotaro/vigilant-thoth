import { Hono } from "hono";
import { Bindings, getPrisma } from "../prisma/prismaFunction";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const tenantId = c.get("jwtPayload");

  try {
    const tenants = await prisma.mst_tenants.findUniqueOrThrow({
      where: {
        id: tenantId,
      },
    });
    return c.json(tenants);
  } catch (e) {
    console.error(e);
    return c.json({ message: "テナントが見つかりませんでした" });
  }
});

// テナントの削除
app.delete("/", async (c) => {
  const tenantId = c.get("jwtPayload");
  const prisma = getPrisma(c.env.DATABASE_URL);

  const tenant = await prisma.mst_tenants.findUnique({
    where: { id: tenantId },
  });
  if (tenant) {
    return c.json({ message: "対象テナントが存在しません" });
  }

  try {
    // cascadeが有効になっているので、書籍データを削除すると紐づく子データも削除される
    await prisma.mst_tenants.delete({
      where: {
        id: tenantId,
      },
    });

    return c.json({ message: "テナントと関連するデータを削除しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "テナントの削除に失敗しました" });
  }
});
export default app;
