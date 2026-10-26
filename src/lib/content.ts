export type Bilingual = { zh: string; en: string };
export type Topic = {
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  sections: { heading: Bilingual; paragraphs: Bilingual[] }[];
};

export const themes: { number: string; title: Bilingual; body: Bilingual }[] = [
  {
    number: "01",
    title: { zh: "AI的新发展", en: "Where AI is going" },
    body: {
      zh: "聊值得关注的变化，也一起分辨哪些内容只是热闹。",
      en: "Talk about changes worth noticing, and what may be mostly noise.",
    },
  },
  {
    number: "02",
    title: { zh: "真实使用经历", en: "Real experiences" },
    body: {
      zh: "分享好用的时刻、意外的结果和不太成功的尝试。",
      en: "Share useful moments, surprises, and experiments that did not quite work.",
    },
  },
  {
    number: "03",
    title: { zh: "工作与生活", en: "Work and everyday life" },
    body: {
      zh: "看看AI怎样影响日常任务、职业选择和生活习惯。",
      en: "Explore how AI touches daily tasks, career choices, and routines.",
    },
  },
  {
    number: "04",
    title: { zh: "学习与好奇心", en: "Learning and curiosity" },
    body: {
      zh: "从问题和兴趣出发，慢慢找到适合自己的学习方式。",
      en: "Start with questions and interests, then find a learning path that fits.",
    },
  },
];

export const firstEvent = {
  title: {
    zh: "AI非正常人类情报站｜第一期免费AI聚会",
    en: "AI Unconventional Minds Station | First Free AI Meetup",
  },
  description: {
    zh: "一场轻松的线下聚会：聊聊最近怎样使用AI、遇到过什么意外，以及它对工作和生活带来的真实变化。欢迎第一次接触AI的人。",
    en: "A relaxed in-person gathering to talk about how we use AI, what surprised us, and how it is changing work and everyday life. First-timers are welcome.",
  },
  language: { zh: "中文交流为主，可提供英文辅助", en: "Mainly in Chinese, with English support" },
};

export const topics: Topic[] = [
  {
    slug: "first-steps-with-ai",
    title: { zh: "第一次接触AI，可以做什么？", en: "New to AI: what can you try first?" },
    summary: {
      zh: "不必先学一整套工具。拿一件小而真实的事试试看。",
      en: "You do not need to learn a whole toolkit first. Try one small, real task.",
    },
    sections: [
      {
        heading: { zh: "从一件眼前的小事开始", en: "Start with something in front of you" },
        paragraphs: [
          {
            zh: "想一想最近有没有一件重复、费时间，或让你不知道从哪里下手的事情。可以是整理一段文字、练习一门语言、把复杂说明改写得更容易读，或者为一次旅行列出问题清单。",
            en: "Think of something repetitive, time-consuming, or hard to start. It might be organizing a note, practicing a language, making a complicated explanation easier to read, or drafting questions for a trip.",
          },
          {
            zh: "把你已有的材料和希望得到的帮助告诉AI，再看看它的回答。第一次尝试的目标不是得到完美答案，而是观察：它哪里帮上忙，哪里需要你补充背景或自己核对。",
            en: "Give the AI the material you already have and explain the help you want. The goal is not a perfect answer; notice where it helps and where you need to add context or check the result.",
          },
        ],
      },
      {
        heading: { zh: "把结果当作草稿", en: "Treat the result as a draft" },
        paragraphs: [
          {
            zh: "AI可以提供一个起点，但不一定了解你的处境。核对事实，删掉不合适的部分，再按自己的判断修改。不要把密码、身份证件、财务资料或别人的隐私放进不确定的服务。",
            en: "AI can offer a starting point without understanding your situation. Check facts, remove what does not fit, and edit with your own judgment. Avoid entering passwords, identity documents, financial details, or someone else's private information into a service you do not trust.",
          },
        ],
      },
    ],
  },
  {
    slug: "funny-ai-failures",
    title: {
      zh: "你使用AI时遇到过哪些有趣的失败？",
      en: "What funny AI failures have you run into?",
    },
    summary: {
      zh: "答非所问、一本正经地出错，往往比完美演示更值得聊。",
      en: "A confident mistake or an answer that misses the point can be more interesting than a polished demo.",
    },
    sections: [
      {
        heading: { zh: "失败也能告诉我们一些事", en: "A failure can still teach us something" },
        paragraphs: [
          {
            zh: "有时AI会误解问题、补出不存在的细节，或把简单事情说得很复杂。讲讲当时你想做什么、它给了什么回答，以及你后来怎样发现问题。",
            en: "Sometimes AI misunderstands a question, fills in details that were never there, or makes a simple task complicated. Share what you were trying to do, what it answered, and how you noticed the problem.",
          },
          {
            zh: "可以把真实姓名、公司机密和个人资料删掉再分享。重点是方法和经历，不需要贴出包含隐私的完整对话。",
            en: "Remove real names, company secrets, and personal details before sharing. The useful part is the experience and approach, not a full chat log containing private information.",
          },
        ],
      },
      {
        heading: { zh: "一起拆解哪里出了偏差", en: "Look together at what went off track" },
        paragraphs: [
          {
            zh: "问题可能来自上下文不足、任务本身含糊、工具不适合，或模型能力的边界。试着说清楚哪些部分确定、哪些部分只是猜测，再讨论下一次会怎么调整。",
            en: "The issue might be missing context, an unclear task, a poor tool fit, or a limit of the model. Separate what you know from what you are guessing, then consider what you might change next time.",
          },
        ],
      },
    ],
  },
  {
    slug: "reading-ai-news",
    title: { zh: "哪些AI新闻值得真正关注？", en: "Which AI news is worth paying attention to?" },
    summary: {
      zh: "这里不伪造实时新闻；这是一份读新闻时可以用的问题清单。",
      en: "This is not a live news feed. It is a short set of questions for reading AI news more carefully.",
    },
    sections: [
      {
        heading: { zh: "先找到原始信息", en: "Find the original information" },
        paragraphs: [
          {
            zh: "看到一条消息时，可以先找发布者、原始公告、论文或产品说明。转述可能省略条件，也可能把测试结果说成普遍能力。看清楚信息是什么时候发布、适用于什么场景。",
            en: "When a claim catches your eye, look for the original announcement, paper, or product documentation. A summary may omit conditions or turn a test result into a universal claim. Check when it was published and what setting it applies to.",
          },
        ],
      },
      {
        heading: { zh: "问问它改变了谁的什么", en: "Ask who is affected and how" },
        paragraphs: [
          {
            zh: "有用的问题包括：这项变化对谁有影响？实际成本和限制是什么？有没有独立复核？对工作流程、用户选择或隐私会有什么影响？暂时没有答案的地方，也可以直接标出来。",
            en: "Useful questions include: who might be affected? What are the practical costs and limits? Has the result been independently checked? What could change for workflows, user choice, or privacy? It is fine to mark what is still unknown.",
          },
          {
            zh: "本页是编辑整理的阅读方法，不是实时新闻报道。涉及最新产品、法律或政策时，请查阅发布方及相关主管部门的原始信息。",
            en: "This is an editorial reading guide, not current news reporting. For the latest product details, laws, or policies, check the publisher and relevant authorities directly.",
          },
        ],
      },
    ],
  },
  {
    slug: "do-you-need-to-code",
    title: { zh: "学习AI是否必须会编程？", en: "Do you need to code to learn about AI?" },
    summary: {
      zh: "要不要学编程，取决于你想解决的问题。",
      en: "Whether to learn programming depends on the questions you want to work on.",
    },
    sections: [
      {
        heading: { zh: "先区分不同的学习目标", en: "Separate the different goals" },
        paragraphs: [
          {
            zh: "如果你想更好地使用现成工具，可以从提问、核对结果、保护隐私和设计工作流程开始，不必先写代码。了解AI的基本概念也可以帮助你判断输出的边界。",
            en: "If you want to use existing tools more thoughtfully, start with asking clear questions, checking results, protecting privacy, and shaping a workflow. Coding is not a prerequisite. Basic concepts can help you understand where outputs have limits.",
          },
          {
            zh: "如果你想训练模型、连接数据、自动化复杂流程或构建产品，编程可能会很有帮助。可以等遇到具体需要时再学需要的部分。",
            en: "If you want to train models, connect data, automate a complex process, or build a product, programming may help. You can learn the parts you need when a concrete project calls for them.",
          },
        ],
      },
      {
        heading: {
          zh: "不必用技术身份来衡量好奇心",
          en: "Curiosity does not require a technical identity",
        },
        paragraphs: [
          {
            zh: "行业经验、观察问题的能力、表达和倾听，同样能让一次AI讨论变得更有意思。可以从自己熟悉的领域出发，再决定是否想继续深入技术。",
            en: "Industry experience, careful observation, communication, and listening can all make an AI conversation richer. Start from a field you know, then decide whether you want to go deeper technically.",
          },
        ],
      },
    ],
  },
  {
    slug: "ai-in-everyday-life",
    title: {
      zh: "AI给生活和工作带来的真实改变",
      en: "How AI is really changing everyday life and work",
    },
    summary: {
      zh: "从具体任务聊起，既看省下的时间，也看新增的检查和选择。",
      en: "Start with a specific task: what time was saved, and what new checking or choices appeared?",
    },
    sections: [
      {
        heading: {
          zh: "记录变化，而不是只谈感觉",
          en: "Describe a change rather than only a feeling",
        },
        paragraphs: [
          {
            zh: "可以挑一件最近做过的事：原来怎么做，用AI之后哪些步骤变了，最后结果是否更好。有没有省下一段时间？有没有花时间检查、改写或重新做？",
            en: "Choose something you recently did: how did you do it before, what changed with AI, and was the result better? Did you save time? Did you spend some of it checking, rewriting, or starting over?",
          },
          {
            zh: "变化也不一定是效率。有的人会用AI练习、整理思路或开始一段创作；也有人发现它不适合自己的任务。不同经历都值得分享。",
            en: "Change does not have to mean efficiency. Some people use AI to practice, organize their thoughts, or begin a creative project; others find it is not right for a task. Both experiences are worth sharing.",
          },
        ],
      },
      {
        heading: { zh: "留意自己仍然要做的判断", en: "Notice the judgment that still matters" },
        paragraphs: [
          {
            zh: "AI可能生成一份草稿、摘要或建议，但目标、语境和取舍仍由人来确认。讨论时可以把具体工作流程讲出来，不必把一次体验推成适用于所有人的结论。",
            en: "AI may produce a draft, summary, or suggestion, but people still need to confirm goals, context, and trade-offs. Describe the workflow you tried without turning one experience into a rule for everyone.",
          },
        ],
      },
    ],
  },
];

export const chiangMaiTopics: { title: Bilingual; body: Bilingual }[] = [
  {
    title: { zh: "生活与旅居体验", en: "Living and spending time here" },
    body: {
      zh: "分享个人经历和感受；不同人的情况可能很不一样。",
      en: "Share personal experiences and impressions; everyone's situation can be different.",
    },
  },
  {
    title: { zh: "语言学习与交流", en: "Language learning and conversation" },
    body: {
      zh: "聊聊练习语言、互相理解和跨文化交流中的小发现。",
      en: "Talk about language practice, understanding one another, and small discoveries across cultures.",
    },
  },
  {
    title: { zh: "有趣的地点与活动", en: "Places and things to do" },
    body: {
      zh: "欢迎推荐你喜欢的地方。开放时间和活动信息请出发前自行确认。",
      en: "Share places you enjoy. Check opening hours and event details directly before heading out.",
    },
  },
  {
    title: { zh: "生活习惯与成本", en: "Everyday routines and costs" },
    body: {
      zh: "个人经验可以交流，但价格和条件会变化，分享时请注明时间与背景。",
      en: "Personal experiences are welcome; prices and conditions change, so include when and where your experience applies.",
    },
  },
  {
    title: { zh: "新朋友与社群", en: "New friends and communities" },
    body: {
      zh: "不必急着加入任何群组。先参加一次公开活动、轻松聊聊也很好。",
      en: "There is no need to join a group right away. A public gathering and an easy conversation are enough.",
    },
  },
  {
    title: { zh: "AI与在地工作生活", en: "AI in local work and life" },
    body: {
      zh: "分享你在清迈怎样学习、工作或使用AI，不预设每个人都有相同目标。",
      en: "Share how you learn, work, or use AI in Chiang Mai without assuming everyone wants the same thing.",
    },
  },
];
