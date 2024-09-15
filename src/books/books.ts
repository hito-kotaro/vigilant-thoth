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
  const mstBooks = await prisma.mst_books.findMany();
  return c.json({ books: mstBooks });
});

app.post("/", async (c) => {
  const { isbn, title, author, publisher, published_at } = await c.req.json<{
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    published_at: string;
  }>();

  const newBook = {
    isbn,
    title,
    author,
    publisher,
    published_at,
    created_at: new Date().toISOString(),
  };
  const prisma = getPrisma(c.env.DATABASE_URL);
  const book = await prisma.mst_books.create({
    data: newBook,
  });

  return c.json(book);
});

app.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
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

  const index = books.findIndex((book) => book.id === id);
  if (index === -1) {
    return c.json({ error: "指定されたIDの書籍が見つかりません" }, 404);
  }

  books[index] = {
    ...books[index],
    ...updatedBook,
  };

  return c.json(books[index]);
});

app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ error: "IDが指定されていません" }, 400);
  }

  const index = books.findIndex((book) => book.id === id);
  if (index === -1) {
    return c.json({ error: "指定されたIDの書籍が見つかりません" }, 404);
  } else {
    books = books.filter((book) => book.id !== id);
  }

  return c.json({ message: "削除が完了しました" });
});

export default app;
