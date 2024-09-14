import { Hono } from "hono";

const app = new Hono();

// 書籍一覧

let books: {
  id?: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published_at: string;
}[] = [];

app.get("/", (c) => {
  return c.json({ books: books });
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
    id: books.length + 1,
    isbn,
    title,
    author,
    publisher,
    published_at,
  };
  books = [...books, newBook];

  return c.json(books);
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
