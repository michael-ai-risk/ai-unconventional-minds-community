const d = <T extends Record<string, { zh: string; en: string }>>(x: T) => x;

export const dict = d({
  siteName: { zh: "AI非正常人类情报站", en: "AI Unconventional Minds Station" },
  tagline: {
    zh: "在清迈，一起聊AI、分享真实经历、认识有趣的人。",
    en: "Meet in Chiang Mai to talk AI, share real experiences, and meet curious people.",
  },
  navHome: { zh: "首页", en: "Home" },
  navEvents: { zh: "活动", en: "Events" },
  navTopics: { zh: "AI话题", en: "AI Topics" },
  navDiscussions: { zh: "社区讨论", en: "Discussions" },
  navChiangMai: { zh: "清迈生活", en: "Chiang Mai" },
  navAbout: { zh: "关于我们", en: "About" },
  navRules: { zh: "社区规则", en: "Community rules" },
  navPrivacy: { zh: "隐私说明", en: "Privacy" },
  langSwitch: { zh: "EN", en: "中文" },
  langSwitchLabel: { zh: "切换语言", en: "Switch language" },
  menu: { zh: "菜单", en: "Menu" },
  close: { zh: "关闭", en: "Close" },
  survey: { zh: "参与活动小调查", en: "Share your thoughts" },
  surveyNote: { zh: "自愿填写，由 Tally 托管。", en: "Optional survey hosted by Tally." },
  footer: {
    zh: "一个免费、开放、轻松的交流空间。",
    en: "A free, open, relaxed space to meet and talk.",
  },
  homeKicker: { zh: "清迈 · 开放的AI交流空间", en: "CHIANG MAI · AN OPEN SPACE TO TALK AI" },
  homeTitleA: { zh: "在清迈，一起聊AI", en: "In Chiang Mai, let's talk AI" },
  homeTitleB: {
    zh: "分享真实经历，认识有趣的人。",
    en: "Share real experiences. Meet curious people.",
  },
  homeIntro: {
    zh: "欢迎任何对 AI 感兴趣的人。不需要技术背景、不需要商业资源，也不用带着明确目标来。可以聊最近的新发现，也可以聊一次失败的尝试，或只是认识新朋友。",
    en: "Anyone curious about AI is welcome. No technical background, business resources, or specific goal is needed. Bring a new discovery, a failed experiment, or simply come to meet new people.",
  },
  homeThemes: { zh: "我们想聊的事", en: "Things we like to talk about" },
  latestEvent: { zh: "最近活动", en: "Next gathering" },
  latestTopics: { zh: "最近的AI话题", en: "AI topics to start with" },
  latestDiscussions: { zh: "社区讨论", en: "Community discussions" },
  noDiscussions: {
    zh: "社区讨论支持免注册参与；新发言需审核后公开。当前预览环境尚未配置反垃圾验证，暂不能发帖。",
    en: "Join community discussions without an account. New contributions are reviewed before becoming public. Anti-spam verification is not configured in this preview yet, so posting is temporarily unavailable.",
  },
  eventTba: { zh: "时间与地点待确认", en: "Date and venue to be confirmed" },
  freeEvent: { zh: "免费参与", en: "Free to attend" },
  editorialLabel: { zh: "社区编辑话题", en: "Community editorial prompt" },
  readTopic: { zh: "读一读", en: "Read topic" },
  backToTopics: { zh: "返回AI话题", en: "Back to AI topics" },
  seeAll: { zh: "查看全部", en: "See all" },
});

export type DictKey = keyof typeof dict;
