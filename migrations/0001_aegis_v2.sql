-- 한 번만 실행하세요. 기존 컬럼/데이터는 변경하지 않고 컬럼만 추가합니다.
-- wrangler d1 execute <DB_NAME> --remote --file=migrations/0001_aegis_v2.sql
ALTER TABLE aegis_messages ADD COLUMN team_number TEXT;
ALTER TABLE aegis_messages ADD COLUMN author_name TEXT;
ALTER TABLE aegis_messages ADD COLUMN is_protected INTEGER NOT NULL DEFAULT 0;
-- 기존 "네르사 N팀 / 이름" 형식만 안전하게 분해 (A01264599 같은 예외는 NULL 유지)
UPDATE aegis_messages SET
  team_number = substr(team_name, 5, instr(team_name, '팀 / ') - 5),
  author_name = substr(team_name, instr(team_name, '팀 / ') + 4)
WHERE team_name LIKE '네르사 %팀 / %'
  AND substr(team_name, 5, instr(team_name, '팀 / ') - 5) NOT GLOB '*[^0-9]*';
-- 신지안 기록(ID 1)을 보호 기록으로 지정
UPDATE aegis_messages SET is_protected = 1 WHERE id = 1;
