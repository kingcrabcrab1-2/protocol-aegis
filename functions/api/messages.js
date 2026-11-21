import { json, isAdmin, unauthorized, composeTeamName } from "../_shared.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, team_name, team_number, author_name, message, is_pinned, is_protected FROM aegis_messages ORDER BY is_pinned DESC, id ASC"
    ).all();
    return json({ messages: results || [] });
  } catch (error) {
    return json({ error: "메시지를 불러오지 못했습니다.", detail: String(error?.message || error) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return unauthorized();
  try {
    const body = await request.json();
    const team_number = String(body.team_number ?? "").replace(/\D/g, "").slice(0, 4);
    const author_name = String(body.author_name || "").trim().slice(0, 60);
    if (!author_name) return json({ error: "이름을 입력해 주세요." }, 400);
    const team = composeTeamName(team_number, author_name);
    const message = String(body.message || "").trim().slice(0, 10000);
    if (!message) return json({ error: "메시지를 입력해 주세요." }, 400);

    const result = await env.DB.prepare(
      "INSERT INTO aegis_messages (team_name, team_number, author_name, message, is_pinned, is_protected) VALUES (?, ?, ?, ?, 0, 0)"
    ).bind(team, team_number || null, author_name, message).run();

    return json({ ok: true, id: result.meta.last_row_id }, 201);
  } catch (error) {
    return json({ error: "메시지 등록에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}
