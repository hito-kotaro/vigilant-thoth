import { Hono } from "hono";
import books from "./books/books";
import tenants from "./tenants/tenants";

const app = new Hono();

app.route("/books", books);
app.route("/tenants", tenants);

export default app;
