import { Hono } from "hono";
import { Bindings, getPrisma } from "../prisma/prismaFunction";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

const app = new Hono<{ Bindings: Bindings }>();

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
    console.error(e);
    return c.json({ message: "テナントが見つかりませんでした" });
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

  const alreadyExist = await prisma.mst_tenants.findFirst({
    where: { tenant_name: tenantName },
  });

  if (alreadyExist) {
    return c.json({ message: "テナント名がすでに使用されています" });
  }

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
    console.error(e);
    return c.json({ message: "テナントの作成に失敗しました" });
  }
});

// テナントパスワードの更新
app.put("/:id", async (c) => {
  const { newPassword } = await c.req.json<{ newPassword: string }>();
  const tenantId = Number(c.req.param("id"));

  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const alreadyExist = await prisma.mst_tenants.findUniqueOrThrow({
      where: { id: tenantId },
    });
  } catch (e) {
    console.error(e);
    return c.json({ message: "パスワードの更新に失敗しました" });
  }

  try {
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

// テナントの削除
app.put("/:id", async (c) => {
  const tenantId = Number(c.req.param("id"));

  const prisma = getPrisma(c.env.DATABASE_URL);

  try {
    const alreadyExist = await prisma.mst_tenants.findUniqueOrThrow({
      where: { id: tenantId },
    });
  } catch (e) {
    console.error(e);
    return c.json({ message: "対象テナントが存在しません" });
  }

  try {
    // テナントIDをもつ、Bookを取得して、
    const tenantBooks = await prisma.tx_tenant_books.findMany({
      where: { tenant_id: tenantId },
    });

    // Bookをもつデータ全てを削除してから、Bookを消して、Tenantを削除
    tenantBooks.map(async (tenantBook) => {
      const bookReview = await prisma.tx_book_reviews.deleteMany({
        where: { book_id: tenantBook.id },
      });
      console.log(bookReview);

      const rentalHistory = await prisma.tx_rental_histories.deleteMany({
        where: { book_id: tenantBook.id },
      });
      console.log(rentalHistory);
    });

    // ユーザを削除
    await prisma.mst_users.deleteMany({
      where: {
        tenant_id: tenantId,
      },
    });

    // 最後にテナントを削除
    await prisma.mst_tenants.deleteMany({
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
