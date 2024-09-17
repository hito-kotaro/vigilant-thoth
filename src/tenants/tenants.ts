import { Hono } from "hono";
import { Bindings, getPrisma } from "../prisma/prismaFunction";

const app = new Hono<{ Bindings: Bindings }>();

// テナント一覧
app.get("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const tenants = await prisma.mst_tenants.findMany();
    return c.json(tenants);
  } catch (e) {
    console.log(e);
    return c.json({ message: "テナントの取得に失敗しました" });
  }
});

app.get("/:id", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const tenantId = Number(c.req.param("id"));

  try {
    const tenants = await prisma.mst_tenants.findUniqueOrThrow({
      where: {
        id: tenantId,
      },
    });
    return c.json(tenants);
  } catch (e) {
    console.log(e);
    return c.json({ message: "テナントの取得に失敗しました" });
  }
});

// テナント新規作成
app.post("/", async (c) => {
  const { tenantName, rootUser, rootPassword } = await c.req.json<{
    tenantName: string;
    rootUser: string;
    rootPassword: string;
  }>();
  const prisma = getPrisma(c.env.DATABASE_URL);
  const newTenant = {
    tenant_name: tenantName,
    root_user: rootUser,
    root_password: rootPassword,
    created_at: new Date().toISOString(),
  };

  try {
    const tenant = await prisma.mst_tenants.create({ data: newTenant });
    return c.json(tenant);
  } catch (e) {
    console.log(e);
    return c.json({ message: "テナントの作成に失敗しました" });
  }
});

// テナントパスワードの更新
app.put("/:id", async (c) => {
  const { newPassword } = await c.req.json<{ newPassword: string }>();
  const tenantId = Number(c.req.param("id"));
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    await prisma.mst_tenants.update({
      where: {
        id: tenantId,
      },
      data: {
        root_password: newPassword,
      },
    });
    return c.json({ message: "パスワードを更新しました" });
  } catch (e) {
    console.log(e);
    return c.json({ message: "パスワードの更新に失敗しました" });
  }
});

export default app;
