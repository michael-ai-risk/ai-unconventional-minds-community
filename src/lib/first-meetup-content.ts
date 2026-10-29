import type { Lang } from "./i18n";

type Topic = { title: string; body: string };
type Speaker = { name: "Michael" | "Abby"; role: string; title: string; summary: string };

export type FirstMeetupCopy = {
  title: string;
  subtitle: string;
  intro: string[];
  freeTag: string;
  timeAndPlaceTag: string;
  languageTag: string;
  cityLabel: string;
  city: string;
  venueLabel: string;
  dateTimeLabel: string;
  toBeAnnounced: string;
  capacityLabel: string;
  capacity: string;
  eventNote: string;
  speakersKicker: string;
  speakersHeading: string;
  speakers: Speaker[];
  topicsHeading: string;
  topics: Topic[];
  audienceHeading: string;
  audience: string[];
  noPrerequisites: string;
  formatHeading: string;
  formatIntro: string;
  formatSteps: string[];
  posterHeading: string;
  posterPending: string;
  posterNote: string;
};

export const firstMeetupContent: Record<Lang, FirstMeetupCopy> = {
  zh: {
    title: "AI 都这么厉害了，我到底该怎么用？",
    subtitle: "带着一个真实问题来，一起试试 AI 能帮到哪一步。",
    intro: [
      "AI 已经走进我们的工作和生活，但很多人仍然不知道应该从哪里开始，选择什么工具，以及怎样真正使用 AI 解决自己的问题。",
      "这不是一场复杂的技术讲座，也不是商业培训课程。",
      "我们希望在清迈聚集一群对 AI 感兴趣的朋友，分享真实经历、自学方法、工具体验和避坑经验，一起探索 AI 在生活、工作和商业中的实际应用。",
    ],
    freeTag: "免费参与",
    timeAndPlaceTag: "时间与地点：敬请期待",
    languageTag: "中文交流为主，可提供英文辅助",
    cityLabel: "活动地点",
    city: "清迈 Chiang Mai",
    venueLabel: "具体地点",
    dateTimeLabel: "活动日期与时间",
    toBeAnnounced: "敬请期待",
    capacityLabel: "活动规模",
    capacity: "预计 30 人",
    eventNote: "以轻松的交流形式进行，具体活动安排以正式公告为准。",
    speakersKicker: "分享者",
    speakersHeading: "本期分享者",
    speakers: [
      {
        name: "Michael",
        role: "跨行业 AI 系统实践",
        title: "从传统行业到 AI 系统实践：普通人如何借助 AI 跨越专业边界",
        summary:
          "从传统行业经验出发，讨论如何借助 AI 进行系统实践，以及如何看待信息可靠性、风险识别与真实交付。",
      },
      {
        name: "Abby",
        role: "AI 独立开发与数字产品",
        title: "一个人，如何用 AI 做产品，建立自己的线上收入？",
        summary:
          "从真实用户需求出发，讨论最小可行产品、用户测试、市场推广和线上收入探索，并把商业想法当作需要验证的假设。",
      },
    ],
    topicsHeading: "我们会聊什么？",
    topics: [
      {
        title: "普通人如何开始自学 AI？",
        body: "从哪里开始，怎样选择学习材料，如何避免盲目购买课程和追逐新工具。",
      },
      {
        title: "哪些 AI 工具真正值得用？",
        body: "交流 ChatGPT、Claude、Codex 等工具的使用经验，了解不同工具适合解决什么问题。",
      },
      {
        title: "AI 经常答错，怎样避坑？",
        body: "讨论 AI 幻觉、错误信息、成本浪费、隐私风险，以及如何验证 AI 生成的结果。",
      },
      {
        title: "AI 在生活和工作中能做什么？",
        body: "通过真实问题交流 AI 在研究、分析、内容制作、商业、营销、电商及其他实际场景中的应用。",
      },
    ],
    audienceHeading: "适合谁参加？",
    audience: [
      "对 AI 感兴趣，但还不知道怎么开始的人。",
      "已经用过 ChatGPT、Claude 等工具，但没有真正用起来的人。",
      "想让 AI 帮助提高工作效率、学习新技能的人。",
      "关注 AI 就业、商业应用和未来发展的人。",
      "希望结识其他 AI 爱好者、交流想法的人。",
    ],
    noPrerequisites: "无需编程基础，不要求 AI 专业知识。",
    formatHeading: "这次我们怎么交流？",
    formatIntro: "活动采用免费、开放的线下交流形式。",
    formatSteps: [
      "认识新朋友，分享各自的 AI 使用经历。",
      "两位分享者将介绍各自的实践和思考，之后开放交流。",
      "选择现场提出的真实问题，一起尝试使用 AI 寻找解决方法。",
      "交流 AI 在工作、商业、投资研究、数字产品等方向的应用经验。",
      "自由提问、讨论，分享下一次希望探索的话题。",
    ],
    posterHeading: "活动海报",
    posterPending: "30 人版海报待确认",
    posterNote: "活动时间、地点和二维码确认后，将在这里更新正式海报。",
  },
  zhTW: {
    title: "AI 都這麼厲害了，我到底該怎麼用？",
    subtitle: "帶著一個真實問題來，一起試試 AI 能幫到哪一步。",
    intro: [
      "AI 已經走進我們的工作與生活，但很多人仍不知道該從哪裡開始、選擇什麼工具，以及如何真正用 AI 解決自己的問題。",
      "這不是一場複雜的技術講座，也不是商業培訓課程。",
      "我們希望在清邁聚集一群對 AI 感興趣的朋友，分享真實經歷、自學方法、工具體驗與避坑經驗，一起探索 AI 在生活、工作與商業中的實際應用。",
    ],
    freeTag: "免費參加",
    timeAndPlaceTag: "時間與地點：敬請期待",
    languageTag: "以中文交流為主，可提供英文協助",
    cityLabel: "活動地點",
    city: "清邁 Chiang Mai",
    venueLabel: "詳細地點",
    dateTimeLabel: "活動日期與時間",
    toBeAnnounced: "敬請期待",
    capacityLabel: "活動規模",
    capacity: "預計 30 人",
    eventNote: "以輕鬆交流的形式進行，詳細安排以正式公告為準。",
    speakersKicker: "分享者",
    speakersHeading: "本期分享者",
    speakers: [
      {
        name: "Michael",
        role: "跨領域 AI 系統實踐",
        title: "從傳統產業到 AI 系統實踐：一般人如何借助 AI 跨越專業界線",
        summary:
          "從傳統產業經驗出發，討論如何借助 AI 進行系統實踐，以及如何看待資訊可靠性、風險識別與實際交付。",
      },
      {
        name: "Abby",
        role: "AI 獨立開發與數位產品",
        title: "一個人，如何用 AI 做產品，建立自己的線上收入？",
        summary:
          "從真實使用者需求出發，討論最小可行產品、使用者測試、市場推廣與線上收入探索，並將商業想法視為有待驗證的假設。",
      },
    ],
    topicsHeading: "我們會聊些什麼？",
    topics: [
      {
        title: "一般人如何開始自學 AI？",
        body: "從哪裡開始、如何選擇學習素材，以及如何避免盲目買課和追逐新工具。",
      },
      {
        title: "哪些 AI 工具真正值得使用？",
        body: "交流 ChatGPT、Claude、Codex 等工具的使用經驗，了解不同工具適合解決哪些問題。",
      },
      {
        title: "AI 常常答錯，該如何避坑？",
        body: "討論 AI 幻覺、錯誤資訊、成本浪費、隱私風險，以及如何查證 AI 產生的結果。",
      },
      {
        title: "AI 在生活和工作中能做什麼？",
        body: "透過真實問題交流 AI 在研究、分析、內容製作、商業、行銷、電商及其他實際情境中的應用。",
      },
    ],
    audienceHeading: "適合哪些人參加？",
    audience: [
      "對 AI 感興趣，但還不知道如何開始的人。",
      "用過 ChatGPT、Claude 等工具，卻還沒有真正用起來的人。",
      "希望用 AI 提升工作效率、學習新技能的人。",
      "關注 AI 就業、商業應用與未來發展的人。",
      "想認識其他 AI 愛好者、交流想法的人。",
    ],
    noPrerequisites: "不需要程式背景，也不要求具備 AI 專業知識。",
    formatHeading: "這次我們會怎麼交流？",
    formatIntro: "活動採免費、開放的線下交流形式。",
    formatSteps: [
      "認識新朋友，分享各自使用 AI 的經驗。",
      "兩位分享者會介紹各自的實踐與想法，之後開放交流。",
      "從現場提出的真實問題中選題，一起嘗試用 AI 尋找解決方法。",
      "交流 AI 在工作、商業、投資研究、數位產品等方向的應用經驗。",
      "自由提問與討論，分享下次想探索的主題。",
    ],
    posterHeading: "活動海報",
    posterPending: "30 人版海報待確認",
    posterNote: "活動時間、地點與 QR Code 確認後，會在這裡更新正式海報。",
  },
  en: {
    title: "AI is so capable now. How do I actually use it?",
    subtitle: "Bring a real problem. Let’s see together what AI can help with.",
    intro: [
      "AI is already part of work and everyday life, yet many people are still unsure where to begin, which tools to choose, or how to use AI to solve problems they actually have.",
      "This is not a technical lecture or a commercial training course.",
      "We hope to bring together people in Chiang Mai who are curious about AI to share real experiences, self-learning methods, tool experiences, and lessons from common pitfalls—and explore practical uses in life, work, and business.",
    ],
    freeTag: "Free to attend",
    timeAndPlaceTag: "Time and place: to be announced",
    languageTag: "Mainly Chinese, with English support available",
    cityLabel: "City",
    city: "Chiang Mai",
    venueLabel: "Venue",
    dateTimeLabel: "Date and time",
    toBeAnnounced: "To be announced",
    capacityLabel: "Expected group size",
    capacity: "Around 30 people",
    eventNote:
      "A relaxed exchange; the detailed schedule will be shared in the official announcement.",
    speakersKicker: "FEATURED SPEAKERS",
    speakersHeading: "Featured speakers",
    speakers: [
      {
        name: "Michael",
        role: "Cross-industry AI systems practice",
        title:
          "From traditional industries to AI systems: how everyday people can cross professional boundaries with AI",
        summary:
          "Starting from experience in traditional industries, this talk explores AI-assisted systems practice, information reliability, risk identification, and what real-world delivery involves.",
      },
      {
        name: "Abby",
        role: "AI-assisted independent development and digital products",
        title: "How can one person use AI to build a product and explore online income?",
        summary:
          "Starting with real user needs, this talk explores minimum viable products, user testing, marketing, and online income as a possibility to validate rather than a promised result.",
      },
    ],
    topicsHeading: "What will we talk about?",
    topics: [
      {
        title: "How can anyone start learning AI on their own?",
        body: "Where to begin, how to choose learning materials, and how to avoid buying courses or chasing every new tool without a plan.",
      },
      {
        title: "Which AI tools are genuinely useful?",
        body: "Share experiences with ChatGPT, Claude, Codex, and other tools, and discuss the kinds of problems each can help solve.",
      },
      {
        title: "AI gets things wrong. How can we avoid the pitfalls?",
        body: "Talk about hallucinations, misinformation, wasted costs, privacy risks, and ways to check AI-generated results.",
      },
      {
        title: "What can AI do in everyday life and at work?",
        body: "Use real questions to explore AI in research, analysis, content creation, business, marketing, e-commerce, and other practical settings.",
      },
    ],
    audienceHeading: "Who is this for?",
    audience: [
      "People curious about AI who are not sure where to start.",
      "People who have tried ChatGPT, Claude, or similar tools but have not found a practical use for them yet.",
      "People who want AI to help with work or learning new skills.",
      "People interested in AI, jobs, business applications, and what comes next.",
      "People who would like to meet other AI enthusiasts and exchange ideas.",
    ],
    noPrerequisites: "No programming background or specialist AI knowledge is needed.",
    formatHeading: "How will we spend the time?",
    formatIntro: "A free, open, in-person gathering with plenty of room for conversation.",
    formatSteps: [
      "Meet new people and share how you have used AI.",
      "Both speakers will introduce their practical explorations, followed by open conversation.",
      "Choose a real question from the group and try using AI together to explore possible approaches.",
      "Exchange experiences using AI at work and in business, investment research, digital products, and other areas.",
      "Ask questions, talk freely, and suggest topics for a future gathering.",
    ],
    posterHeading: "Event poster",
    posterPending: "The updated 30-person poster is pending",
    posterNote:
      "The final poster will appear here once the date, venue, and QR codes are confirmed.",
  },
  th: {
    title: "AI เก่งขนาดนี้แล้ว แล้วเราจะใช้ให้เป็นได้อย่างไร?",
    subtitle: "นำปัญหาจริงมาสักเรื่อง แล้วมาลองดูกันว่า AI ช่วยได้ถึงขั้นไหน",
    intro: [
      "AI เข้ามาเป็นส่วนหนึ่งของงานและชีวิตประจำวันแล้ว แต่หลายคนยังไม่แน่ใจว่าจะเริ่มจากตรงไหน เลือกเครื่องมืออะไร หรือจะใช้ AI แก้ปัญหาของตัวเองได้อย่างไร",
      "นี่ไม่ใช่การบรรยายเทคนิคที่ซับซ้อนหรือหลักสูตรฝึกอบรมเชิงพาณิชย์",
      "เราอยากชวนคนที่สนใจ AI ในเชียงใหม่มาพบกัน เพื่อแบ่งปันประสบการณ์จริง วิธีเรียนรู้ด้วยตัวเอง การทดลองใช้เครื่องมือ และบทเรียนจากข้อผิดพลาด แล้วช่วยกันสำรวจการใช้ AI ในชีวิต การทำงาน และธุรกิจ",
    ],
    freeTag: "เข้าร่วมฟรี",
    timeAndPlaceTag: "เวลาและสถานที่: รอประกาศ",
    languageTag: "สื่อสารหลักเป็นภาษาจีน และมีภาษาอังกฤษช่วยเสริม",
    cityLabel: "เมือง",
    city: "เชียงใหม่ Chiang Mai",
    venueLabel: "สถานที่จัดงาน",
    dateTimeLabel: "วันและเวลา",
    toBeAnnounced: "รอประกาศ",
    capacityLabel: "ขนาดกลุ่มโดยประมาณ",
    capacity: "ประมาณ 30 คน",
    eventNote: "พูดคุยกันอย่างสบาย ๆ รายละเอียดกิจกรรมจะแจ้งในประกาศอย่างเป็นทางการ",
    speakersKicker: "ผู้แบ่งปันประสบการณ์",
    speakersHeading: "ผู้แบ่งปันประสบการณ์ในครั้งนี้",
    speakers: [
      {
        name: "Michael",
        role: "การลงมือทำระบบ AI ข้ามอุตสาหกรรม",
        title:
          "จากอุตสาหกรรมดั้งเดิมสู่การทำระบบ AI: คนทั่วไปจะใช้ AI ก้าวข้ามขอบเขตความเชี่ยวชาญได้อย่างไร",
        summary:
          "เริ่มจากประสบการณ์ในอุตสาหกรรมดั้งเดิม แล้วพูดคุยถึงการทดลองทำระบบด้วย AI ความน่าเชื่อถือของข้อมูล การระบุความเสี่ยง และการส่งมอบงานจริง",
      },
      {
        name: "Abby",
        role: "การพัฒนาอิสระด้วย AI และผลิตภัณฑ์ดิจิทัล",
        title: "คนคนเดียวจะใช้ AI ทำผลิตภัณฑ์และสำรวจรายได้ออนไลน์ได้อย่างไร?",
        summary:
          "เริ่มจากความต้องการจริงของผู้ใช้ พูดคุยเรื่องผลิตภัณฑ์ขั้นต่ำที่ใช้งานได้ การทดสอบกับผู้ใช้ การทำตลาด และการสำรวจรายได้ออนไลน์โดยถือเป็นสมมติฐานที่ต้องตรวจสอบ",
      },
    ],
    topicsHeading: "เราจะคุยเรื่องอะไรบ้าง?",
    topics: [
      {
        title: "คนทั่วไปจะเริ่มเรียนรู้ AI ด้วยตัวเองอย่างไร?",
        body: "ควรเริ่มจากตรงไหน เลือกสื่อเรียนรู้อย่างไร และหลีกเลี่ยงการซื้อคอร์สหรือไล่ตามเครื่องมือใหม่โดยไม่จำเป็นได้อย่างไร",
      },
      {
        title: "เครื่องมือ AI ไหนที่น่าใช้จริง?",
        body: "แลกเปลี่ยนประสบการณ์กับ ChatGPT, Claude, Codex และเครื่องมืออื่น ๆ พร้อมคุยกันว่าแต่ละอย่างเหมาะกับปัญหาแบบใด",
      },
      {
        title: "AI ตอบผิดบ่อย จะหลีกเลี่ยงปัญหาได้อย่างไร?",
        body: "พูดคุยเรื่อง AI หลอน ข้อมูลผิดพลาด ค่าใช้จ่ายที่เสียไป ความเสี่ยงด้านความเป็นส่วนตัว และวิธีตรวจสอบผลลัพธ์จาก AI",
      },
      {
        title: "AI ทำอะไรได้บ้างในชีวิตและการทำงาน?",
        body: "ใช้ปัญหาจริงมาคุยถึงการใช้ AI ในงานวิจัย การวิเคราะห์ การสร้างเนื้อหา ธุรกิจ การตลาด อีคอมเมิร์ซ และสถานการณ์อื่น ๆ",
      },
    ],
    audienceHeading: "เหมาะกับใคร?",
    audience: [
      "คนที่สนใจ AI แต่ยังไม่รู้ว่าจะเริ่มอย่างไร",
      "คนที่เคยใช้ ChatGPT, Claude หรือเครื่องมือคล้ายกัน แต่ยังนำไปใช้จริงไม่ค่อยได้",
      "คนที่อยากใช้ AI ช่วยเพิ่มประสิทธิภาพการทำงานหรือเรียนรู้ทักษะใหม่",
      "คนที่สนใจงาน ธุรกิจ และอนาคตที่เปลี่ยนไปเพราะ AI",
      "คนที่อยากพบปะผู้สนใจ AI คนอื่นและแลกเปลี่ยนไอเดีย",
    ],
    noPrerequisites: "ไม่จำเป็นต้องเขียนโปรแกรมเป็นหรือมีความรู้ AI ระดับผู้เชี่ยวชาญ",
    formatHeading: "เราจะพูดคุยกันอย่างไร?",
    formatIntro: "พบปะพูดคุยแบบออฟไลน์ เปิดกว้าง และไม่มีค่าใช้จ่าย",
    formatSteps: [
      "ทำความรู้จักเพื่อนใหม่และแบ่งปันประสบการณ์การใช้ AI",
      "ผู้แบ่งปันทั้งสองคนจะแนะนำสิ่งที่ได้ลองทำและมุมมองของตนเอง จากนั้นเปิดวงพูดคุย",
      "เลือกปัญหาจริงที่ผู้เข้าร่วมนำมา แล้วลองใช้ AI หาวิธีรับมือไปด้วยกัน",
      "แลกเปลี่ยนประสบการณ์ใช้ AI ในงาน ธุรกิจ การวิจัยการลงทุน และผลิตภัณฑ์ดิจิทัล",
      "ถามและพูดคุยกันได้อย่างอิสระ พร้อมเสนอหัวข้อที่อยากสำรวจในครั้งต่อไป",
    ],
    posterHeading: "โปสเตอร์กิจกรรม",
    posterPending: "โปสเตอร์ฉบับ 30 คนอยู่ระหว่างยืนยัน",
    posterNote: "จะเพิ่มโปสเตอร์ฉบับสมบูรณ์ที่นี่เมื่อยืนยันวัน เวลา สถานที่ และ QR Code แล้ว",
  },
  ja: {
    title: "AIはこんなにすごい。結局、どう使えばいい？",
    subtitle:
      "実際の悩みをひとつ持ち寄って、AIにどこまで手伝ってもらえるか一緒に試してみましょう。",
    intro: [
      "AIは仕事や暮らしに広がっていますが、どこから始めるか、どのツールを選ぶか、自分の課題にどう役立てるか迷う人も少なくありません。",
      "難しい技術講演でも、商業目的の研修講座でもありません。",
      "チェンマイでAIに関心のある人が集まり、実体験、独学の方法、ツールの使い心地、失敗から学んだことを共有しながら、暮らし・仕事・ビジネスでの実用的な使い方を探ります。",
    ],
    freeTag: "参加無料",
    timeAndPlaceTag: "日時・会場：近日お知らせ",
    languageTag: "主に中国語で進行。英語でのサポートも可能です",
    cityLabel: "開催地",
    city: "チェンマイ Chiang Mai",
    venueLabel: "会場",
    dateTimeLabel: "開催日時",
    toBeAnnounced: "近日お知らせ",
    capacityLabel: "参加人数の目安",
    capacity: "約30人",
    eventNote: "気軽な交流会です。詳しい内容は正式なお知らせでご案内します。",
    speakersKicker: "今回の発表者",
    speakersHeading: "今回の発表者",
    speakers: [
      {
        name: "Michael",
        role: "業界横断のAIシステム実践",
        title: "従来の業界からAIシステムの実践へ：一般の人はAIで専門分野の壁をどう越えられるか",
        summary:
          "従来の業界での経験を出発点に、AIを使ったシステムづくり、情報の信頼性、リスクの把握、実務での提供について考えます。",
      },
      {
        name: "Abby",
        role: "AIを活用した個人開発とデジタル製品",
        title: "一人でAIを使って製品を作り、オンライン収入を目指すには？",
        summary:
          "実際のユーザーニーズから始め、最小限の製品づくり、ユーザーテスト、マーケティング、オンライン収入の可能性を検証する方法を話します。",
      },
    ],
    topicsHeading: "何を話す？",
    topics: [
      {
        title: "普通の人はどうやってAIを独学し始める？",
        body: "何から始めるか、学習資料をどう選ぶか、講座を衝動買いしたり新しいツールを追いかけ続けたりしない方法を話します。",
      },
      {
        title: "本当に使う価値のあるAIツールは？",
        body: "ChatGPT、Claude、Codexなどの使用経験を共有し、各ツールがどんな課題に向いているかを考えます。",
      },
      {
        title: "AIは間違える。どうすれば失敗を減らせる？",
        body: "AIの幻覚や誤情報、無駄なコスト、プライバシーのリスク、生成結果を確かめる方法を話します。",
      },
      {
        title: "暮らしや仕事でAIに何ができる？",
        body: "実際の問いをもとに、調査、分析、コンテンツ制作、ビジネス、マーケティング、ECなどでの活用を探ります。",
      },
    ],
    audienceHeading: "こんな方におすすめ",
    audience: [
      "AIに興味はあるけれど、何から始めればよいか分からない方。",
      "ChatGPTやClaudeなどを使ったものの、まだ活用しきれていない方。",
      "AIで仕事の効率を上げたり、新しいスキルを学んだりしたい方。",
      "AIによる仕事の変化、ビジネス活用、これからの展開に関心がある方。",
      "ほかのAI好きと出会い、アイデアを話してみたい方。",
    ],
    noPrerequisites: "プログラミング経験やAIの専門知識は必要ありません。",
    formatHeading: "どんなふうに交流する？",
    formatIntro: "無料で参加できる、オープンな対面交流会です。",
    formatSteps: [
      "新しい人と知り合い、それぞれのAI利用経験を共有します。",
      "二人の発表者がそれぞれの実践と考えを紹介し、その後、自由に話し合います。",
      "参加者が持ち寄った実際の課題を選び、AIを使って解決の糸口を一緒に探します。",
      "仕事、ビジネス、投資リサーチ、デジタル製品などでのAI活用経験を交換します。",
      "自由に質問・相談し、次回取り上げたいテーマも話し合います。",
    ],
    posterHeading: "イベントポスター",
    posterPending: "30人版ポスターは確認中です",
    posterNote: "開催日時・会場・QRコードが確定したら、正式なポスターをここに掲載します。",
  },
  ko: {
    title: "AI가 이렇게 대단한데, 나는 어떻게 써야 할까?",
    subtitle: "실제 고민 하나를 가져와 AI가 어디까지 도울 수 있는지 함께 시험해 봐요.",
    intro: [
      "AI는 이미 일과 생활 속에 들어왔지만, 어디서 시작해야 할지, 어떤 도구를 골라야 할지, 내 문제를 해결하는 데 어떻게 써야 할지 막막한 사람도 많습니다.",
      "복잡한 기술 강연도, 상업적인 교육 과정도 아닙니다.",
      "치앙마이에서 AI에 관심 있는 사람들이 모여 실제 경험과 독학 방법, 도구 사용 경험, 시행착오에서 얻은 교훈을 나누고 생활·일·비즈니스에서의 실용적인 활용을 함께 찾아보려 합니다.",
    ],
    freeTag: "무료 참여",
    timeAndPlaceTag: "시간과 장소: 추후 안내",
    languageTag: "주로 중국어로 진행하며 영어 지원이 가능합니다",
    cityLabel: "도시",
    city: "치앙마이 Chiang Mai",
    venueLabel: "장소",
    dateTimeLabel: "날짜와 시간",
    toBeAnnounced: "추후 안내",
    capacityLabel: "예상 규모",
    capacity: "약 30명",
    eventNote: "편안한 교류 모임으로 진행하며, 자세한 일정은 공식 안내를 확인해 주세요.",
    speakersKicker: "이번 모임의 발표자",
    speakersHeading: "이번 모임의 발표자",
    speakers: [
      {
        name: "Michael",
        role: "산업 간 AI 시스템 실천",
        title:
          "전통 산업에서 AI 시스템 실천으로: 일반인은 AI로 전문 분야의 경계를 어떻게 넘을 수 있을까?",
        summary:
          "전통 산업에서의 경험을 바탕으로 AI를 활용한 시스템 실천, 정보의 신뢰성, 위험 식별, 실제 현장 전달을 살펴봅니다.",
      },
      {
        name: "Abby",
        role: "AI 독립 개발과 디지털 제품",
        title: "한 사람이 AI로 제품을 만들고 온라인 수입 가능성을 탐색하려면?",
        summary:
          "실제 사용자 요구에서 출발해 최소 기능 제품, 사용자 테스트, 마케팅과 온라인 수입 탐색을 이야기하며, 사업 아이디어는 검증이 필요한 가정으로 다룹니다.",
      },
    ],
    topicsHeading: "무엇을 이야기할까요?",
    topics: [
      {
        title: "보통 사람은 AI 독학을 어떻게 시작할까?",
        body: "어디서 시작하고 자료를 어떻게 고를지, 무작정 강의를 사거나 새 도구를 쫓아다니지 않는 방법을 이야기합니다.",
      },
      {
        title: "정말 쓸 만한 AI 도구는 무엇일까?",
        body: "ChatGPT, Claude, Codex 등의 사용 경험을 나누고 각 도구가 어떤 문제를 해결하는 데 적합한지 살펴봅니다.",
      },
      {
        title: "AI가 자주 틀리는데, 어떻게 조심해야 할까?",
        body: "AI 환각, 잘못된 정보, 비용 낭비, 개인정보 위험과 AI 결과를 확인하는 방법을 이야기합니다.",
      },
      {
        title: "생활과 일에서 AI로 무엇을 할 수 있을까?",
        body: "실제 질문을 바탕으로 조사, 분석, 콘텐츠 제작, 비즈니스, 마케팅, 전자상거래 등에서의 활용을 살펴봅니다.",
      },
    ],
    audienceHeading: "이런 분께 잘 맞아요",
    audience: [
      "AI에 관심은 있지만 어떻게 시작할지 모르는 분",
      "ChatGPT, Claude 등을 써봤지만 아직 제대로 활용하지 못한 분",
      "AI로 업무 효율을 높이거나 새로운 기술을 배우고 싶은 분",
      "AI와 일자리, 비즈니스 활용, 미래 변화에 관심 있는 분",
      "다른 AI 관심자와 만나 생각을 나누고 싶은 분",
    ],
    noPrerequisites: "프로그래밍 배경이나 AI 전문 지식은 필요하지 않습니다.",
    formatHeading: "어떤 방식으로 이야기할까요?",
    formatIntro: "무료로 참여할 수 있는 열린 오프라인 모임입니다.",
    formatSteps: [
      "새로운 사람들과 만나 각자의 AI 사용 경험을 나눕니다.",
      "두 발표자가 각자의 실제 탐색 경험과 생각을 소개한 뒤 자유롭게 이야기를 나눕니다.",
      "참가자들이 가져온 실제 문제를 골라 AI로 해결 방법을 함께 찾아봅니다.",
      "일, 비즈니스, 투자 조사, 디지털 제품 등에서 AI를 활용한 경험을 나눕니다.",
      "자유롭게 질문하고 토론하며 다음 모임에서 다루고 싶은 주제를 제안합니다.",
    ],
    posterHeading: "행사 포스터",
    posterPending: "30명 버전 포스터 확인 중",
    posterNote: "날짜, 장소, QR 코드가 확정되면 공식 포스터를 여기에 게시합니다.",
  },
};
