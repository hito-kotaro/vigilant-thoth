import { Hono } from "hono";
import books from "./books/books";
import tenants from "./tenants/tenants";
import users from "./users/users";
import auth from "./auth/auth";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { Bindings } from "./types";
import {
  JwtTokenExpired,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";

const app = new Hono<{ Bindings: Bindings }>();

// tokenの検証
app.use("api/v1/*", async (c, next) => {
  const token = getCookie(c, "token");

  // token存在チェック
  if (!token) {
    return c.json({ message: "Not authorized" });
  }

  // トークンの検証
  try {
    const payload = await verify(token, c.env.TOKEN_SECRET);
    c.set("jwtPayload", payload);
  } catch (e) {
    if (e instanceof JwtTokenExpired) {
      return c.json({ message: "Token expired" });
    }
    if (e instanceof JwtTokenSignatureMismatched) {
      return c.json({ message: "Invalid token" });
    }
    throw e;
  }

  // payloadをrouteに渡す
  await next();
});

app.route("auth", auth);
app.route("api/v1/books", books);
app.route("api/v1/tenants", tenants);
app.route("api/v1/users", users);

export default app;
