import { Hono } from "hono";
import { getPrisma } from "../prisma/prismaFunction";
import { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();
// レビュー全取得
app.get("/", async (c) => {
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const prisma = getPrisma(c.env.DATABASE_URL);

  const booksWithReview = await prisma.tx_tenant_books.findMany({
    include: { reviews: true },
    where: { tenant_id: tenantId },
  });

  return c.json({ booksWithReview });
});

// レビュー一部取得
app.get("/:bookId", async (c) => {
  const bookId = Number(c.req.param("bookId"));
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const prisma = getPrisma(c.env.DATABASE_URL);

  const bookWithReview = await prisma.tx_tenant_books.findFirst({
    include: { reviews: true },
    where: { id: bookId, tenant_id: tenantId },
  });

  return c.json({ bookWithReview });
});

// レビュー投稿
app.post("/:bookId", async (c) => {
  const bookId = Number(c.req.param("bookId"));
  const body = await c.req.json<{ comment: string; rating: number }>();
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const userId = payload.userId;

  const prisma = getPrisma(c.env.DATABASE_URL);

  // 存在チェック
  const targetBook = await prisma.tx_tenant_books.findFirst({
    where: { id: bookId, tenant_id: tenantId },
  });

  if (!targetBook) {
    return c.json({ message: "対象書籍が見つかりませんでした" });
  }

  const user = await prisma.mst_users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return c.json({ message: "ログイン状態を確認してください" });
  }
  try {
    const result = await prisma.tx_book_reviews.create({
      data: {
        book_id: bookId,
        tenant_id: tenantId,
        user_name: user.name,
        comment: body.comment,
        rating: Number(body.rating),
        created_at: new Date(),
      },
    });
    console.log(result);
    return c.json({ message: "レビューを投稿しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "レビュー投稿に失敗しました" });
  }
});

// レビュー更新
app.put("/:reviweId", async (c) => {
  const reviewId = Number(c.req.param("reviewId"));
  const body = await c.req.json<{ comment?: string; rating?: number }>();
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);

  const prisma = getPrisma(c.env.DATABASE_URL);
  // 対象確認
  const targetReview = await prisma.tx_book_reviews.findUnique({
    where: { id: reviewId, tenant_id: tenantId },
  });
  if (!targetReview) {
    return c.json({ message: "対象のレビューが見つかりませんでした" });
  }

  try {
    const result = await prisma.tx_book_reviews.update({
      data: {
        comment: body.comment ?? targetReview.comment,
        rating: body.rating ?? targetReview.rating,
        updated_at: new Date(),
      },
      where: { id: reviewId },
    });
    console.log(result);
    return c.json({ message: "レビューを更新しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "レビューの更新に失敗しました" });
  }
});

app.delete("/:reviweId", async (c) => {
  const reviewId = Number(c.req.param("reviewId"));
  const body = await c.req.json<{ comment?: string; rating?: number }>();
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);

  const prisma = getPrisma(c.env.DATABASE_URL);
  // 対象確認
  const targetReview = await prisma.tx_book_reviews.findUnique({
    where: { id: reviewId, tenant_id: tenantId },
  });
  if (!targetReview) {
    return c.json({ message: "対象のレビューが見つかりませんでした" });
  }

  try {
    const result = await prisma.tx_book_reviews.update({
      data: {
        comment: body.comment ?? targetReview.comment,
        rating: body.rating ?? targetReview.rating,
        updated_at: new Date(),
      },
      where: { id: reviewId, tenant_id: tenantId },
    });
    console.log(result);
    return c.json({ message: "レビューを更新しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "レビューの更新に失敗しました" });
  }
});

export default app;
