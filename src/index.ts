import { Hono } from "hono";
import books from "./books/books";
import tenants from "./tenants/tenants";
import users from "./users/users";

const app = new Hono();

app.route("/books", books);
app.route("/tenants", tenants);
app.route("/users", users);

export default app;
