import { json, isAdmin, unauthorized } from "../../_shared.js";

// POST { id, protected: true|false, confirm?: "RELEASE" }  — 해제에는 확인 문구 필수
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) return unauthorized();
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) return json({ error: "잘못된 기록 ID입니다." }, 400);
    if (!body.protected && body.confirm !== "RELEASE") {
      return json({ error: "보호 해제에는 확인 문구 RELEASE 가 필요합니다." }, 400);
    }
    const r = await env.DB.prepare("UPDATE aegis_messages SET is_protected = ? WHERE id = ?")
      .bind(body.protected ? 1 : 0, id).run();
    return json({ ok: true, changes: r.meta?.changes ?? 0 });
  } catch (error) {
    return json({ error: "보호 설정에 실패했습니다.", detail: String(error?.message || error) }, 500);
  }
}
