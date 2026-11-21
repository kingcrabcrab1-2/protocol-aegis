import { json, isAdmin, unauthorized, composeTeamName } from "../../_shared.js";

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

    if (body.team_number !== undefined || body.author_name !== undefined) {
      const row = await env.DB.prepare("SELECT team_number, author_name FROM aegis_messages WHERE id = ?").bind(id).first();
      if (row) {
        const tn = body.team_number !== undefined ? String(body.team_number).replace(/\D/g, "").slice(0, 4) : row.team_number;
        const an = body.author_name !== undefined ? String(body.author_name).trim().slice(0, 60) : row.author_name;
        if (!an) return json({ error: "이름을 입력해 주세요." }, 400);
        await env.DB.prepare("UPDATE aegis_messages SET team_number = ?, author_name = ?, team_name = ? WHERE id = ?")
          .bind(tn || null, an, composeTeamName(tn, an), id).run();
      }
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: "메시지 수정에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAdmin(request, env)) return unauthorized();
  try {
    const id = Number(params.id);
    const row = await env.DB.prepare("SELECT is_protected FROM aegis_messages WHERE id = ?").bind(id).first();
    if (row && row.is_protected) {
      return json({ error: "DELETION AUTHORIZATION : DENIED — 보호된 기록입니다. 먼저 보호를 해제하세요." }, 403);
    }
    await env.DB.prepare("DELETE FROM aegis_messages WHERE id = ? AND is_protected = 0").bind(id).run();
    return json({ ok: true });
  } catch (error) {
    return json({ error: "메시지 삭제에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}
