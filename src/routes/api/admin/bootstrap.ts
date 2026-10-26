import { auth } from "@/lib/auth";
import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export const Route = createFileRoute("/api/admin/bootstrap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!env.ADMIN_BOOTSTRAP_SECRET) return json({ error: "Bootstrap is disabled." }, 404);
        const origin = request.headers.get("origin");
        if (!origin || origin !== new URL(request.url).origin)
          return json({ error: "Same-origin request required." }, 403);
        const supplied = request.headers.get("x-admin-bootstrap-key") || "";
        if (supplied.length !== env.ADMIN_BOOTSTRAP_SECRET.length)
          return json({ error: "Invalid bootstrap key." }, 403);
        let difference = 0;
        for (let index = 0; index < supplied.length; index++)
          difference |= supplied.charCodeAt(index) ^ env.ADMIN_BOOTSTRAP_SECRET.charCodeAt(index);
        if (difference !== 0) return json({ error: "Invalid bootstrap key." }, 403);

        const existing = await env.DB.prepare(
          "SELECT 1 FROM roles WHERE role='admin' LIMIT 1",
        ).first();
        if (existing) return json({ error: "An administrator is already configured." }, 409);
        const length = Number(request.headers.get("content-length") || 0);
        if (length > 2_000 || !request.body) return json({ error: "Invalid request body." }, 413);
        let body: unknown;
        try {
          const reader = request.body.getReader();
          const chunks: Uint8Array[] = [];
          let total = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > 2_000) {
              await reader.cancel();
              return json({ error: "Invalid request body." }, 413);
            }
            chunks.push(value);
          }
          const bytes = new Uint8Array(total);
          let offset = 0;
          for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
          }
          body = JSON.parse(new TextDecoder().decode(bytes));
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }
        if (!body || typeof body !== "object" || Array.isArray(body))
          return json({ error: "Invalid request body." }, 400);
        const record = body as Record<string, unknown>;
        const email =
          typeof record["email"] === "string" ? record["email"].trim().toLowerCase() : "";
        const password = typeof record["password"] === "string" ? record["password"] : "";
        const name =
          typeof record["name"] === "string" ? record["name"].trim() : "Community administrator";
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          password.length < 12 ||
          password.length > 128 ||
          name.length < 1 ||
          name.length > 100
        )
          return json(
            {
              error:
                "Use a valid admin email, a 12–128 character password, and a name up to 100 characters.",
            },
            400,
          );
        const claim = await env.DB.prepare(
          "INSERT OR IGNORE INTO admin_bootstrap_lock(id) VALUES(1)",
        ).run();
        if (!claim.meta.changes)
          return json({ error: "Admin bootstrap has already been claimed." }, 409);
        try {
          const created = await auth.api.signUpEmail({ body: { email, password, name } });
          const userId = created.user?.id;
          if (!userId) return json({ error: "Could not create the staff account." }, 400);
          await env.DB.prepare("INSERT INTO roles(user_id,role) VALUES(?, 'admin')")
            .bind(userId)
            .run();
          return json(
            {
              created: true,
              next: "Remove ADMIN_BOOTSTRAP_SECRET from the Worker environment, then sign in at /admin.",
            },
            201,
          );
        } catch (error) {
          console.error("Admin bootstrap failed", error);
          const admin = await env.DB.prepare(
            "SELECT 1 FROM roles WHERE role='admin' LIMIT 1",
          ).first();
          if (!admin) await env.DB.prepare("DELETE FROM admin_bootstrap_lock WHERE id=1").run();
          return json({ error: "Could not create the staff account." }, 400);
        }
      },
    },
  },
});
