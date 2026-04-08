UPDATE owner.menu_snapshot SET "closingDate" = '2026-02-23' WHERE "closingDate" = '2026-02-22';
UPDATE owner.daily_closing SET date = '2026-02-23' WHERE date = '2026-02-22';
SELECT id, "closingDate", name FROM owner.menu_snapshot ORDER BY id DESC LIMIT 5;
