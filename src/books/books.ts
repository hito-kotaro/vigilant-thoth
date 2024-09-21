import { Hono } from "hono";
import { getPrisma } from "../prisma/prismaFunction";

type Bindings = {
  DATABASE_URL: string;
};
const app = new Hono<{ Bindings: Bindings }>();

// テナント内の書籍一覧を取得
app.get("/:tenantId", async (c) => {
  const tenantId = Number(c.req.param("tenantId"));
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const books = await prisma.tx_tenant_books.findMany({
      where: {
        tenant_id: tenantId,
      },
    });
    return c.json({ books });
  } catch (e) {
    console.error(e);
    return c.json({ message: "書籍の取得に失敗しました" });
  }
});

// テナントの本棚に書籍を追加する
app.post("/", async (c) => {
  const { tenantId, isbn } = await c.req.json<{
    tenantId: number;
    isbn: string;
  }>();

  const prisma = getPrisma(c.env.DATABASE_URL);
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

// テナントの本を修正する
app.put("/:id", async (c) => {
  const bookId = Number(c.req.param("id"));
  const body = await c.req.json<{
    title?: string;
    author?: string;
    publisher?: string;
    published_at?: string;
  }>();

  const prisma = getPrisma(c.env.DATABASE_URL);

  const targetBook = await prisma.tx_tenant_books.findUnique({
    where: { id: bookId },
  });

  if (!targetBook) {
    return c.json({ message: "更新対象の書籍が見つかりません" });
  }

  try {
    const result = await prisma.tx_tenant_books.update({
      where: { id: bookId },
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
app.delete("/:id", async (c) => {
  const bookId = Number(c.req.param("id"));

  const prisma = getPrisma(c.env.DATABASE_URL);

  const targetBook = await prisma.tx_tenant_books.findUnique({
    where: { id: bookId },
  });

  if (!targetBook) {
    return c.json({ message: "削除対象の書籍が見つかりません" });
  }

  try {
    // 関連するデータ全てを削除
    const history_result = await prisma.tx_rental_histories.deleteMany({
      where: { book_id: bookId },
    });
    console.log(history_result);
    const review_result = await prisma.tx_book_reviews.deleteMany({
      where: { book_id: bookId },
    });
    console.log(review_result);
    const book_result = await prisma.tx_tenant_books.deleteMany({
      where: { id: bookId },
    });
    console.log(book_result);
    return c.json({ message: "書籍情報を削除しました" });
  } catch (e) {
    console.error(e);
    return c.json({ message: "更新に失敗しました" });
  }
});

export default app;
