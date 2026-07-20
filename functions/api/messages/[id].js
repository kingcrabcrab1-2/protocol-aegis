import { json, isAdmin, unauthorized } from "../../_shared.js";

export async function onRequestPatch({ request, env, params }) {
  if (!isAdmin(request, env)) return unauthorized();
  try {
    const id = Number(params.id);
    const body = await request.json();

    if (Object.prototype.hasOwnProperty.call(body, "message")) {
      const message = String(body.message || "").trim().slice(0, 10000);
      if (!message) return json({ error: "메시지를 입력해 주세요." }, 400);
      await env.DB.prepare("UPDATE aegis_messages SET message = ? WHERE id = ?").bind(message, id).run();
    }

    if (Object.prototype.hasOwnProperty.call(body, "is_pinned")) {
      await env.DB.prepare("UPDATE aegis_messages SET is_pinned = ? WHERE id = ?")
        .bind(body.is_pinned ? 1 : 0, id).run();
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: "메시지 수정에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAdmin(request, env)) return unauthorized();
  try {
    await env.DB.prepare("DELETE FROM aegis_messages WHERE id = ?").bind(Number(params.id)).run();
    return json({ ok: true });
  } catch (error) {
    return json({ error: "메시지 삭제에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}
