import { Hono } from "hono";
import books from "./books/books";
import tenants from "./tenants/tenants";
import users from "./users/users";
import auth from "./auth/auth";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

// ここMiddlewareでCookieを検証するのが良さそう
app.use("api/v1/*", async (c, next) => {
  const token = getCookie(c, "token");

  // tokenチェック
  if (!token) {
    return c.json({ message: "not authorized" });
  }

  try {
    // トークンの検証
    const payload = await verify(token, c.env.TOKEN_SECRET);
    // 日付の検証もしてくれる？

    // //  payloadの有効期限を確認
    // if (!payload.exp || payload.exp >= Math.floor(Date.now() / 1000)) {
    //   return c.json({ message: "Expired token" });
    // }
    c.set("jwtPayload", payload);
  } catch (e) {
    console.error(e);
    return c.json({ message: "Invalid token" });
  }

  await next();
});
app.route("auth", auth);
app.route("api/v1/books", books);
app.route("api/v1/tenants", tenants);
app.route("api/v1/users", users);

export default app;
