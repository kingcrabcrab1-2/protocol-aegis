import { json, isAdmin, unauthorized } from "../../_shared.js";

export async function onRequestPost({ request, env }) {
  return isAdmin(request, env) ? json({ ok: true }) : unauthorized();
}
