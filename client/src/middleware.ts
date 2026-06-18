import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname === "/" || pathname === "/register") {
    return next();
  }

  const cookie = context.request.headers.get("cookie") || "";
  
  try {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: { Cookie: cookie }
    });

    if (!res.ok) {
      return context.redirect("/");
    }
  } catch (err) {
    return context.redirect("/");
  }

  return next();
});