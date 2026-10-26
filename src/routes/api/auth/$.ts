import { auth } from "@/lib/auth";
import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => {
        const path = new URL(request.url).pathname.toLowerCase();
        if (path.startsWith("/api/auth/sign-up") || path.startsWith("/api/auth/signup")) {
          return Response.json(
            {
              error:
                "Public account registration is disabled. Community posting does not require an account.",
            },
            { status: 410, headers: { "Cache-Control": "no-store" } },
          );
        }
        if (path === "/api/auth/sign-in/email") {
          return (async () => {
            const length = Number(request.headers.get("content-length") || 0);
            if (length > 4_000)
              return Response.json({ error: "Invalid request." }, { status: 413 });
            const reader = request.clone().body?.getReader();
            if (!reader) return Response.json({ error: "Invalid request." }, { status: 400 });
            const chunks: Uint8Array[] = [];
            let total = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              total += value.byteLength;
              if (total > 4_000) {
                await reader.cancel();
                return Response.json({ error: "Invalid request." }, { status: 413 });
              }
              chunks.push(value);
            }
            const bytes = new Uint8Array(total);
            let offset = 0;
            for (const chunk of chunks) {
              bytes.set(chunk, offset);
              offset += chunk.byteLength;
            }
            let body: { email?: unknown };
            try {
              body = JSON.parse(new TextDecoder().decode(bytes)) as { email?: unknown };
            } catch {
              return Response.json({ error: "Invalid request." }, { status: 400 });
            }
            const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
            if (!email) return Response.json({ error: "Invalid credentials." }, { status: 401 });
            const staff = await env.DB.prepare(
              `SELECT 1 FROM "user" u JOIN roles r ON r.user_id=u.id
               WHERE lower(u.email)=? AND r.role IN ('admin','moderator') LIMIT 1`,
            )
              .bind(email)
              .first();
            if (!staff)
              return Response.json(
                { error: "Invalid credentials." },
                { status: 401, headers: { "Cache-Control": "no-store" } },
              );
            return auth.handler(request);
          })();
        }
        if (path !== "/api/auth/sign-out")
          return Response.json({ error: "Authentication endpoint unavailable." }, { status: 404 });
        return auth.handler(request);
      },
    },
  },
});
