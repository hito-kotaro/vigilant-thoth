import { Hono } from "hono";
import { getPrisma } from "../prisma/prismaFunction";

type Bindings = {
  DATABASE_URL: string;
};
const app = new Hono<{ Bindings: Bindings }>();

// テナント内の書籍一覧を取得
app.get("/", async (c) => {
  // ペイロード取得
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);

  // prismaインスタンス取得
  const prisma = getPrisma(c.env.DATABASE_URL);

  // クエリ実行＆レスポンス
  try {
    const books = await prisma.tx_tenant_books.findMany({
      where: {
        tenant_id: tenantId,
      },
    });
    return c.json({ books, total: books.length });
  } catch (e) {
    console.error(e);
    return c.json({ message: "書籍の取得に失敗しました" });
  }
});

// テナントの本棚に書籍を追加する
app.post("/isbn", async (c) => {
  const { isbn } = await c.req.json<{
    isbn: string;
  }>();

  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);

  const prisma = getPrisma(c.env.DATABASE_URL);

  // 存在チェック
  const alreadyExist = await prisma.tx_tenant_books.findFirst({
    where: { isbn, tenant_id: tenantId },
  });

  if (alreadyExist) {
    return c.json({ message: "この書籍は登録済みです" });
  }

  const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
  const data: {
    summary: {
      isbn: string;
      title: string;
      publisher: string;
      author: string;
      pubdate: string;
    };
  }[] = await response.json();

  if (data[0] === null) {
    return c.json({ message: "isbn番号が見つかりませんでした" });
  }

  try {
    const result = await prisma.tx_tenant_books.create({
      data: {
        tenant_id: Number(tenantId),
        isbn: data[0].summary.isbn,
        available: true,
        title: data[0].summary.title,
        author: data[0].summary.author,
        publisher: data[0].summary.publisher,
        published_at: data[0].summary.pubdate,
        created_at: new Date(),
      },
    });

    console.log(result);

    return c.json({ message: "書籍を登録しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "登録に失敗しました" });
  }
});

// 手動書籍登録
app.post("/", async (c) => {
  const { isbn, title, author, publisher, publishedAt } = await c.req.json<{
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publishedAt: string;
  }>();

  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);

  const prisma = getPrisma(c.env.DATABASE_URL);

  // 存在チェック
  const alreadyExist = await prisma.tx_tenant_books.findFirst({
    where: { isbn, tenant_id: tenantId },
  });

  if (alreadyExist) {
    return c.json({ message: "この書籍は登録済みです" });
  }

  try {
    const result = await prisma.tx_tenant_books.create({
      data: {
        tenant_id: Number(tenantId),
        isbn,
        available: true,
        title,
        author,
        publisher,
        published_at: publishedAt,
        created_at: new Date(),
      },
    });
    console.log(result);
    return c.json({ message: "書籍を登録しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "登録に失敗しました" });
  }
});

// テナントの本を修正する
app.put("/:bookId", async (c) => {
  // ペイロード取得
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const bookId = Number(c.req.param("bookId"));
  const body = await c.req.json<{
    title?: string;
    author?: string;
    publisher?: string;
    published_at?: string;
  }>();

  const prisma = getPrisma(c.env.DATABASE_URL);

  const targetBook = await prisma.tx_tenant_books.findUnique({
    where: { id: bookId, tenant_id: tenantId },
  });

  if (!targetBook) {
    return c.json({ message: "更新対象の書籍が見つかりません" });
  }

  try {
    const result = await prisma.tx_tenant_books.update({
      where: { id: bookId, tenant_id: tenantId },
      data: {
        title: body.title || targetBook.title,
        author: body.author || targetBook.author,
        publisher: body.publisher || targetBook.publisher,
        published_at: body.published_at || targetBook.published_at,
        updated_at: new Date(),
      },
    });
    console.log(result);
    return c.json({ message: "書籍情報を更新しました" });
  } catch (e) {
    console.log(e);
    return c.json({ message: "更新に失敗しました" });
  }
});

// テナント内の書籍を削除する
app.delete("/:bookId", async (c) => {
  // ペイロード取得
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);

  const bookId = Number(c.req.param("bookId"));

  const prisma = getPrisma(c.env.DATABASE_URL);

  const targetBook = await prisma.tx_tenant_books.findUnique({
    where: { id: bookId, tenant_id: tenantId },
  });

  if (!targetBook) {
    return c.json({ message: "削除対象の書籍が見つかりません" });
  }

  try {
    // cascadeが有効になっているので、書籍データを削除すると紐づく子データも削除される
    const book_result = await prisma.tx_tenant_books.delete({
      where: { id: bookId, tenant_id: tenantId },
    });
    console.log(book_result);
    return c.json({ message: "書籍情報を削除しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "更新に失敗しました" });
  }
});

//書籍の借用/返却をするAPI
app.put("/rental/:bookId", async (c) => {
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const userId = payload.userId;
  const bookId = Number(c.req.param("bookId"));
  const { action } = await c.req.json<{
    action: boolean;
  }>();

  const prisma = getPrisma(c.env.DATABASE_URL);

  // 書籍存在チェック
  const targetBook = await prisma.tx_tenant_books.findFirst({
    where: { id: bookId, tenant_id: tenantId },
  });

  if (!targetBook) {
    return c.json({ message: "本棚に書籍がありません" });
  }

  // 貸出対象書籍のステータス確認
  if (action) {
    // 借用する時貸出中だったら
    if (!targetBook.available) {
      return c.json({ message: "その書籍は貸出中です" });
    }
  } else {
    // 貸出可能書籍に対する返却は、特に何も起こらないが、更新日時が変わってしまうのでここで止める
    if (targetBook.available) {
      return c.json({ message: "その書籍はすでに返却されています" });
    }
  }
  // ステータス更新
  try {
    // ユーザ名を取得
    const user = await prisma.mst_users.findUniqueOrThrow({
      where: { id: userId },
    });

    const result = await prisma.tx_tenant_books.update({
      data: {
        // actionが借用（true）だったら、ステータスは貸出中（false)
        // actionが返却（false）だったら、ステータスは貸出可能（true)
        available: !action,
        updated_at: new Date(),
      },
      where: { id: bookId, tenant_id: tenantId },
    });
    console.log(result);

    const history = await prisma.tx_rental_histories.create({
      data: {
        book_id: bookId,
        tenant_id: tenantId,
        user_name: user.name,
        action,
        created_at: new Date(),
      },
    });
    console.log(history);
    return c.json({ message: "書籍の貸し出し状態を更新しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "書籍の更新に失敗しました" });
  }
  // 履歴追加
});

// テナントないの書籍全ての貸出履歴を取得
app.get("/histories", async (c) => {
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const prisma = getPrisma(c.env.DATABASE_URL);

  const histories = await prisma.tx_tenant_books.findMany({
    where: { tenant_id: tenantId },
    include: { histories: true },
  });
  return c.json(histories);
});

// テナント内の特定書籍の貸出履歴を取得
app.get("/history/:bookId", async (c) => {
  const bookId = Number(c.req.param("id"));
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenantId);
  const prisma = getPrisma(c.env.DATABASE_URL);

  const histories = await prisma.tx_tenant_books.findFirst({
    where: { id: bookId, tenant_id: tenantId },
    include: { histories: true },
  });
  return c.json(histories);
});

// レビュー全取得
app.get("/review", async (c) => {
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenant_id);
  const prisma = getPrisma(c.env.DATABASE_URL);

  const booksWithReview = await prisma.tx_tenant_books.findMany({
    include: { reviews: true },
    where: { tenant_id: tenantId },
  });

  return c.json({ booksWithReview });
});

// レビュー一部取得
app.get("/review/:bookId", async (c) => {
  const bookId = Number(c.req.param("bookId"));
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenant_id);
  const prisma = getPrisma(c.env.DATABASE_URL);

  const bookWithReview = await prisma.tx_tenant_books.findFirst({
    include: { reviews: true },
    where: { id: bookId, tenant_id: tenantId },
  });

  return c.json({ bookWithReview });
});

// レビュー投稿
app.post("/review/:bookId", async (c) => {
  const bookId = Number(c.req.param("bookId"));
  const body = await c.req.json<{ comment: string; rating: number }>();
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenant_id);
  const userName = payload.userName;
  const prisma = getPrisma(c.env.DATABASE_URL);

  // 存在チェック
  const targetBook = await prisma.tx_tenant_books.findFirst({
    where: { id: bookId, tenant_id: tenantId },
  });

  if (!targetBook) {
    return c.json({ message: "対象書籍が見つかりませんでした" });
  }
  try {
    const result = await prisma.tx_book_reviews.create({
      data: {
        book_id: bookId,
        tenant_id: tenantId,
        user_name: userName,
        comment: body.comment,
        rating: body.rating,
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
app.put("/review/:reviweId", async (c) => {
  const reviewId = Number(c.req.param("reviewId"));
  const body = await c.req.json<{ comment?: string; rating?: number }>();
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenant_id);

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

app.delete("/review/:reviweId", async (c) => {
  const reviewId = Number(c.req.param("reviewId"));
  const body = await c.req.json<{ comment?: string; rating?: number }>();
  const payload = c.get("jwtPayload");
  const tenantId = Number(payload.tenant_id);

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
