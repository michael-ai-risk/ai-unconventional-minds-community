ALTER TABLE categories ADD COLUMN title_zh_tw TEXT;
ALTER TABLE categories ADD COLUMN title_th TEXT;

ALTER TABLE events ADD COLUMN title_zh_tw TEXT;
ALTER TABLE events ADD COLUMN title_th TEXT;
ALTER TABLE events ADD COLUMN summary_zh_tw TEXT;
ALTER TABLE events ADD COLUMN summary_th TEXT;
ALTER TABLE events ADD COLUMN body_zh_tw TEXT;
ALTER TABLE events ADD COLUMN body_th TEXT;
ALTER TABLE events ADD COLUMN venue_zh_tw TEXT;
ALTER TABLE events ADD COLUMN venue_th TEXT;
ALTER TABLE events ADD COLUMN language_zh_tw TEXT;
ALTER TABLE events ADD COLUMN language_th TEXT;
ALTER TABLE events ADD COLUMN recap_zh_tw TEXT;
ALTER TABLE events ADD COLUMN recap_th TEXT;

ALTER TABLE articles ADD COLUMN title_zh_tw TEXT;
ALTER TABLE articles ADD COLUMN title_th TEXT;
ALTER TABLE articles ADD COLUMN excerpt_zh_tw TEXT;
ALTER TABLE articles ADD COLUMN excerpt_th TEXT;
ALTER TABLE articles ADD COLUMN body_zh_tw TEXT;
ALTER TABLE articles ADD COLUMN body_th TEXT;

UPDATE categories SET title_zh_tw='隨意聊聊', title_th='พูดคุยทั่วไป' WHERE slug='general';
UPDATE categories SET title_zh_tw='學習 AI', title_th='เรียนรู้ AI' WHERE slug='learning';
UPDATE categories SET title_zh_tw='工具體驗', title_th='ประสบการณ์ใช้เครื่องมือ' WHERE slug='tools';
UPDATE categories SET title_zh_tw='工作與生活', title_th='งานและชีวิต' WHERE slug='work-life';
UPDATE categories SET title_zh_tw='清邁生活', title_th='ชีวิตในเชียงใหม่' WHERE slug='chiangmai';
UPDATE categories SET title_zh_tw='專案與機會', title_th='โครงการและโอกาส' WHERE slug='opportunities';

UPDATE events
SET title_zh_tw='AI 非正常人類情報站｜第一場免費 AI 聚會',
    title_th='AI非正常人類情報站 | พบปะพูดคุยเรื่อง AI ครั้งแรก เข้าร่วมฟรี',
    summary_zh_tw='一場輕鬆的實體聚會：聊聊 AI 使用經驗，以及它為工作與生活帶來的真實變化。日期與地點待確認。',
    summary_th='กิจกรรมพบปะสบาย ๆ เพื่อพูดคุยเรื่องประสบการณ์ใช้ AI และความเปลี่ยนแปลงที่เกิดขึ้นจริงกับงานและชีวิตประจำวัน วันและสถานที่ยังรอยืนยัน',
    body_zh_tw='歡迎 AI 初學者、學生、上班族、工程師、創業者、數位遊牧者、旅客，以及所有對 AI 未來感興趣的人。不需要技術背景，也不強迫自我介紹或參與商業合作。',
    body_th='ยินดีต้อนรับผู้เริ่มต้นเรียนรู้ AI นักเรียน คนทำงาน โปรแกรมเมอร์ ผู้ประกอบการ ดิจิทัลโนแมด นักท่องเที่ยว และทุกคนที่สนใจอนาคตของ AI ไม่จำเป็นต้องมีพื้นฐานด้านเทคนิค ไม่บังคับแนะนำตัวหรือร่วมธุรกิจ',
    language_zh_tw='以中文交流為主，可提供英文協助',
    language_th='สื่อสารหลักเป็นภาษาจีน และมีภาษาอังกฤษช่วยเสริม'
WHERE slug='ai-unconventional-minds-first-meetup';
