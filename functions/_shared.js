export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function isAdmin(request, env) {
  const given = request.headers.get("X-Admin-Password") || "";
  const expected = env.ADMIN_PASSWORD || "";
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export const unauthorized = () => json({ error: "관리자 비밀번호가 올바르지 않습니다." }, 401);
