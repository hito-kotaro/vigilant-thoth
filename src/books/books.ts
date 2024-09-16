import { Hono } from "hono";
import { getPrisma } from "../prisma/prismaFunction";

type Bindings = {
  DATABASE_URL: string;
};
const app = new Hono<{ Bindings: Bindings }>();

// 書籍一覧

let books: {
  id?: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published_at: string;
}[] = [];

app.get("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const mstBooks = await prisma.mst_books.findMany();
    return c.json({ books: mstBooks });
  } catch (e) {
    console.log(e);
    return c.json({ message: "書籍の取得に失敗しました" });
  }
});

app.post("/", async (c) => {
  const { isbn, title, author, publisher, published_at } = await c.req.json<{
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    published_at: string;
  }>();

  const prisma = getPrisma(c.env.DATABASE_URL);

  const existBook = await prisma.mst_books.findUnique({
    where: {
      isbn: isbn,
    },
  });

  if (existBook) {
    return c.json(existBook);
  }

  // 書籍が新規登録であれば以降の処理を実施する
  const newBook = {
    isbn,
    title,
    author,
    publisher,
    published_at,
    created_at: new Date().toISOString(),
  };

  try {
    const book = await prisma.mst_books.create({
      data: newBook,
    });

    return c.json(book);
  } catch (e) {
    console.log(e);
    return c.json({ message: "書籍の登録に失敗しました" });
  }
});

app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const prisma = getPrisma(c.env.DATABASE_URL);
  const updatedBook = await c.req.json<{
    isbn?: string;
    title?: string;
    author?: string;
    publisher?: string;
    published_at?: string;
  }>();

  if (!id) {
    return c.json({ error: "IDが指定されていません" }, 400);
  }

  try {
    const book = await prisma.mst_books.update({
      where: {
        id: id,
      },
      data: updatedBook,
    });
    return c.json(book);
  } catch (e) {
    console.log(e);
    return c.json({ message: "書籍の更新に失敗しました" });
  }
});

app.delete("/:id", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ error: "IDが指定されていません" }, 400);
  }

  const book = await prisma.mst_books.delete({
    where: {
      id,
    },
  });
  return c.json(book);
  try {
  } catch (e) {
    console.log(e);
    return c.json({ message: "削除に失敗しました" });
  }
});

export default app;
