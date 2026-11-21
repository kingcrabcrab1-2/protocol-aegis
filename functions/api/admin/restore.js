import { json, isAdmin, unauthorized } from "../../_shared.js";

// POST { messages: [...] } — 병합 복원: 이미 있는 ID는 건너뛰고, 없는 ID만 원래 ID로 추가 (기존 기록 삭제/덮어쓰기 없음)
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return unauthorized();
  try {
    const body = await request.json();
    const list = Array.isArray(body.messages) ? body.messages : null;
    if (!list || list.length > 5000) return json({ error: "올바른 백업 파일이 아닙니다." }, 400);

    const stmt = env.DB.prepare(
      "INSERT OR IGNORE INTO aegis_messages (id, team_name, team_number, author_name, message, is_pinned, is_protected) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    const batch = [];
    for (const m of list) {
      const id = Number(m.id);
      const message = String(m.message || "").slice(0, 10000);
      if (!Number.isInteger(id) || id < 1 || !message) continue;
      batch.push(stmt.bind(
        id,
        String(m.team_name || "UNKNOWN TIMELINE").slice(0, 120),
        m.team_number == null ? null : String(m.team_number).slice(0, 4),
        m.author_name == null ? null : String(m.author_name).slice(0, 60),
        message,
        m.is_pinned ? 1 : 0,
        m.is_protected ? 1 : 0
      ));
    }
    if (!batch.length) return json({ error: "복원할 유효한 기록이 없습니다." }, 400);
    const res = await env.DB.batch(batch);
    const added = res.reduce((n, r) => n + (r.meta?.changes || 0), 0);
    return json({ ok: true, added, skipped: batch.length - added });
  } catch (error) {
    return json({ error: "복원에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}
