import { Hono } from "hono";
import books from "./books/books";

const app = new Hono();

app.route("/books", books);

export default app;
