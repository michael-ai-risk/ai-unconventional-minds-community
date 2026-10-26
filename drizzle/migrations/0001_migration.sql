
insert into public.events (slug, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, status, starts_at, venue_zh, venue_en, signup_url)
values (
'issue-01',
'AI非正常人类情报站｜第一期',
'AI Unconventional Minds Station · Issue 01',
'一场免费的线下AI知识分享：从房地产与投资管理转向搭建AI业务系统的真实经历。时间与地点待定。',
'A free, in-person AI knowledge session: a real transition from real estate and investment management to building AI business systems. Date and venue to be announced.',
$z$## 这一期会聊什么

主讲人分享自己从房地产与投资管理行业，转向用AI搭建业务系统的真实过程：走过的弯路、真正有用的学习路径，以及哪些事情至今仍然需要人的判断。

- 不写代码的人，怎样现实地开始学AI
- AI能力的几个独立维度：为什么“会用ChatGPT”不等于“会用AI做事”
- 如何检查AI的输出，而不是盲目相信
- 专业经验 × AI：互补，而不是替代
- 商业验证：先确认真实需求，再谈工具
- 在清迈长期生活与远程工作的一些个人观察

## 形式

- 主要使用**普通话**讲解，屏幕上提供**中英双语**文字
- **免费**参加
- 分享之后有**可选的**开放讨论，不强制自我介绍或社交配对

## 时间与地点

**待定。** 确定后会在本页和报名表中更新。我们不会在确认之前公布任何场地。

## 说明

这不是中文课，也不是课程销售或求职/签证服务。这是一个以社区为先的知识分享。$z$,
$e$## What this session covers

The speaker shares a real transition from real estate and investment management to building business systems with AI: the detours, the learning paths that actually helped, and what still requires human judgment.

- How non-coders can realistically start learning AI
- Independent dimensions of AI capability: why "I use ChatGPT" is not the same as "I can get work done with AI"
- How to check AI output instead of trusting it blindly
- Professional expertise × AI: complementarity, not replacement
- Commercial validation: confirm a real need before choosing tools
- Personal observations on long-term living and remote work in Chiang Mai

## Format

- Presented mainly in **spoken Mandarin**, with **bilingual Chinese/English** on-screen text
- **Free** to attend
- An **optional** open discussion afterwards — no compulsory self-introductions or social matching

## Date and venue

**To be announced.** This page and the sign-up form will be updated once confirmed. We will not publish a venue before it is confirmed.

## Please note

This is not a Chinese-language class, a course sales pitch, or a job/visa service. It is a community-first knowledge share.$e$,
'tba', null, null, null, 'https://tally.so/r/PRdaO5');

insert into public.articles (slug, title_zh, title_en, excerpt_zh, excerpt_en, body_zh, body_en, category, kind, tags, source_links, published_at) values
(
'learning-ai-as-a-non-coder',
'不写代码，也能认真学AI：一条现实的路径',
'Learning AI as a Non-Coder: A Realistic Path',
'不必先学编程，也不必追每一条新闻。先从你每天真实要做的一件事开始。',
'You do not need to learn programming first, or chase every headline. Start with one real task you already do every week.',
$z$## 先放下“必须学会全部”的焦虑

很多人第一次接触AI时，会被大量工具名、模型名和“十分钟学会”的短视频淹没。结果是收藏了很多教程，却没有一个真正用在工作里。

一个更现实的起点是：**挑一件你每周都在重复做、而且你知道“做得好”是什么样子的事情**。比如整理会议纪要、写客户邮件初稿、汇总一份市场资料。

## 三个阶段

**1. 替代一小步。** 让AI先完成任务中的一小段，比如把杂乱的笔记整理成结构。你负责检查和修改。

**2. 建立固定做法。** 当某种提问方式反复有效时，把它记录下来，变成你自己的模板：背景、目标、格式、限制条件。

**3. 串起流程。** 只有在前两步稳定之后，才考虑把多个步骤连起来，或者使用自动化工具。

## 什么时候需要学一点技术

当你发现自己每天都在复制粘贴同样的东西，或者需要处理表格、文件、接口时，学一点基础的数据和自动化概念会很有帮助。但这是“遇到问题再学”，而不是“学完再开始”。

## 一个提醒

学习速度因人而异。网上“一个月转型”的故事通常省略了大量背景。比起速度，更重要的是：你能不能判断AI给出的结果是否可靠。$z$,
$e$## Drop the pressure to learn everything

Many people meet AI through a flood of tool names, model names and "learn it in ten minutes" videos. The result is a folder of saved tutorials and nothing actually used at work.

A more realistic starting point: **pick one task you repeat every week, where you already know what "good" looks like** — tidying meeting notes, drafting a client email, summarising market material.

## Three stages

**1. Replace one small step.** Let AI handle one slice of the task, such as turning messy notes into a structure. You review and edit.

**2. Build a repeatable method.** When a way of asking works repeatedly, write it down as your own template: context, goal, format, constraints.

**3. Connect the workflow.** Only once the first two are stable should you chain steps together or reach for automation tools.

## When to learn some technical skills

When you notice you copy-paste the same thing every day, or need to work with spreadsheets, files or APIs, a little data and automation literacy helps a lot. Learn it when the problem appears — not as a prerequisite.

## A caution

Learning speed varies a lot. Online "transformed in a month" stories usually leave out a great deal of context. Speed matters less than this: can you tell whether the AI's result is reliable?$e$,
'learning','primer', array['non-coder','workflow','learning-path'], array[]::text[], '2026-10-01'
),
(
'six-dimensions-of-ai-capability',
'AI能力的六个独立维度',
'Six Independent Dimensions of AI Capability',
'“会用AI”不是一个单一技能。把它拆成六个维度，你会更清楚自己该补哪一块。',
'"Being good at AI" is not one skill. Split it into six dimensions and it becomes clearer which one to work on next.',
$z$## 为什么要拆开看

两个人都说自己“会用AI”，可能一个擅长写提示词，另一个擅长把AI接入业务流程。把能力拆开，才能避免盲目对比，也能找到真正互补的合作伙伴。

以下是一个编辑性的思考框架，不是行业标准，欢迎讨论和修正。

## 六个维度

**1. 问题定义。** 能不能把一个模糊的需求，说成AI和人都能理解的具体任务。

**2. 表达与提示。** 能不能提供足够的背景、示例和约束，让输出接近你想要的结果。

**3. 判断与核查。** 能不能识别错误、编造和过度自信，知道哪些内容必须独立验证。

**4. 领域知识。** 你在某个行业里的经验，决定了你能否看出输出“哪里不对劲”。

**5. 工具与流程整合。** 能不能把AI放进真实的工作流程：文件、表格、自动化、团队协作。

**6. 商业与伦理意识。** 能不能判断这件事是否值得做、是否有人真的需要、是否涉及隐私或版权风险。

## 怎么用这个框架

不必每一项都很强。更现实的做法是：找到你已经有优势的一两项（往往是领域知识或判断力），再找在其他维度上互补的人一起做事。$z$,
$e$## Why split it up

Two people may both say they "know AI": one is great at prompting, the other at wiring AI into business processes. Splitting capability into parts avoids pointless comparison and helps you find genuinely complementary collaborators.

What follows is an editorial thinking framework, not an industry standard. Discussion and corrections are welcome.

## The six dimensions

**1. Problem framing.** Can you turn a vague need into a concrete task both people and AI can understand?

**2. Expression and prompting.** Can you supply enough context, examples and constraints for output to approach what you want?

**3. Judgment and verification.** Can you spot errors, fabrication and overconfidence, and know what must be checked independently?

**4. Domain knowledge.** Your industry experience determines whether you can see where an output "feels wrong".

**5. Tool and workflow integration.** Can you place AI inside real work: files, spreadsheets, automation, team collaboration?

**6. Commercial and ethical awareness.** Can you judge whether something is worth doing, whether anyone actually needs it, and whether it touches privacy or copyright risks?

## How to use this

You do not need to be strong in all six. A more realistic approach: identify the one or two where you already have an edge (often domain knowledge or judgment), then work with people who complement you on the others.$e$,
'capability','primer', array['framework','skills','collaboration'], array[]::text[], '2026-10-05'
),
(
'checking-ai-results',
'如何检查AI给出的结果',
'How to Check AI Results',
'AI的回答读起来很流畅，并不代表它是对的。一套简单的核查习惯。',
'Fluent answers are not the same as correct ones. A simple set of habits for checking AI output.',
$z$## 流畅 ≠ 正确

大语言模型擅长生成“看起来合理”的文字。这让它非常有用，也让它的错误更难被发现：数字、引用、法规、日期和人名，是最常出问题的地方。

## 五个习惯

**1. 先问自己：错了会怎样？** 写一条社交媒体文案和计算一份合同金额，需要的核查强度完全不同。

**2. 要求来源，然后亲自打开。** 让AI列出依据，再逐个确认链接存在、内容确实支持结论。AI可能编造看似真实的来源。

**3. 换一种问法再问一次。** 如果换个角度提问，答案明显变化，说明这个结论不稳定。

**4. 用你的领域常识做“合理性检查”。** 数量级对不对？时间顺序对不对？这正是专业经验最有价值的地方。

**5. 关键信息找原始出处。** 涉及法律、签证、医疗、税务和财务的内容，以官方或专业人士的最新信息为准。

## 在社区里怎么做

在本站发帖或分享时，请尽量标注哪些是你亲自核实过的，哪些是AI生成、尚未验证的内容。这是对读者的尊重。$z$,
$e$## Fluent ≠ correct

Large language models excel at producing text that *sounds* reasonable. That makes them useful — and makes their mistakes harder to see. Numbers, citations, regulations, dates and names are where things go wrong most often.

## Five habits

**1. Ask first: what happens if it is wrong?** A social media caption and a contract amount need very different levels of checking.

**2. Ask for sources, then open them yourself.** Have the AI list its basis, then confirm each link exists and actually supports the claim. AI can fabricate realistic-looking sources.

**3. Ask again, differently.** If rephrasing the question changes the answer substantially, the conclusion is not stable.

**4. Sanity-check with domain sense.** Is the order of magnitude right? Is the timeline right? This is exactly where professional experience earns its keep.

**5. Go to primary sources for key facts.** For legal, visa, medical, tax and financial matters, rely on current official information or qualified professionals.

## In this community

When posting here, please note what you verified yourself and what is AI-generated and unverified. It is a courtesy to your readers.$e$,
'judgment','primer', array['verification','critical-thinking','hallucination'], array[]::text[], '2026-10-09'
),
(
'expertise-and-customer-needs',
'专业经验与客户需求：AI时代真正稀缺的东西',
'Professional Expertise and Customer Needs: What Stays Scarce',
'工具越来越容易获得，真正稀缺的是：知道客户真正需要什么，以及怎样判断“做得好”。',
'Tools are increasingly easy to get. What stays scarce is knowing what customers actually need, and how to judge good work.',
$z$## 工具不是护城河

当越来越多的人可以用同样的AI工具时，“会用工具”本身很难成为长期优势。更难被替代的，是你在某个行业里积累的判断：客户真正担心什么、哪些细节决定成败、哪些说法只是表面需求。

## 从行业经验出发

以房地产与投资管理为例：多年的项目经验，让人知道一份分析报告里哪些数字最容易出错、投资人最在意哪些风险、沟通节奏应该怎样把握。AI可以加快资料整理和初稿撰写，但“问对问题”仍然依赖这些经验。

## 先验证需求，再搭系统

一个常见的误区是：先花几周搭建一个漂亮的AI系统，再去找人用。更稳妥的顺序是：

1. 和真实的潜在用户聊，记录他们自己描述的问题
2. 用最简单的方式（甚至手工）先交付一次结果
3. 确认有人愿意持续使用或付费，再考虑自动化

## 互补而不是全能

你不必既是行业专家、又是工程师、又是设计师。社区的意义之一，就是让不同背景的人找到彼此。本站的“项目与机会”栏目就是为此而设，但它不提供任何收入或工作保证。$z$,
$e$## Tools are not a moat

When more and more people can use the same AI tools, "knowing the tools" is hard to sustain as an advantage. What is harder to replace is the judgment you have built in a field: what customers really worry about, which details decide success, which requests are only surface needs.

## Start from industry experience

Take real estate and investment management: years of project work teach you which numbers in an analysis go wrong most often, which risks investors care about, how to pace communication. AI can speed up research and first drafts, but "asking the right question" still depends on that experience.

## Validate the need before building the system

A common trap: spend weeks building a polished AI system, then go looking for users. A safer order:

1. Talk to real potential users and record the problem in their own words
2. Deliver a result once in the simplest way possible — even manually
3. Confirm someone will keep using it or pay for it, then consider automation

## Complementary, not all-capable

You do not need to be an industry expert, an engineer and a designer at once. One purpose of a community is to help people with different backgrounds find each other. The Projects & Opportunities section exists for this — but it offers no guarantee of income or work.$e$,
'business','primer', array['expertise','validation','customers'], array[]::text[], '2026-10-14'
),
(
'chiang-mai-remote-work-questions',
'在清迈远程工作前，值得先问自己的几个问题',
'Questions Worth Asking Before Working Remotely from Chiang Mai',
'这不是攻略，也不是法律建议，而是一组帮助你理清思路的问题。',
'Not a how-to guide and not legal advice — a set of questions to help you think it through.',
$z$## 先说清楚

本文是基于个人观察的编辑性整理，**不构成法律、签证、税务或医疗建议**。泰国的相关规定会变化，请以泰国官方机构和合格专业人士提供的最新信息为准。

## 关于工作本身

- 你的收入来源是否稳定，是否依赖特定时区？
- 你的雇主或客户是否允许你在泰国工作？合同里怎么写？
- 你需要什么样的网络和工作环境才能保持效率？

## 关于身份与合规

- 你计划停留多久？这会影响你需要了解的签证类别。
- 远程工作在当地法律上的定位是什么？请向官方渠道或律师确认，不要只依赖社交媒体帖子。
- 你在原居住国和泰国分别有哪些税务义务？

## 关于生活

- 清迈的季节差异很大，尤其是旱季后期的空气质量，你和家人是否能适应？
- 你需要怎样的医疗保障？
- 你是否愿意学一点泰语，以及如何融入当地社区，而不只是待在外国人圈子里？

## 慢一点

很多人建议先短期停留、亲自体验不同季节，再做长期决定。本站的“清迈指南”栏目会持续整理经验分享，并清楚区分个人经验与现行规定。$z$,
$e$## To be clear

This is an editorial piece based on personal observation and **is not legal, visa, tax or medical advice**. Thai rules change; rely on current information from Thai official bodies and qualified professionals.

## About the work itself

- Is your income stable, and does it depend on a particular time zone?
- Does your employer or client allow you to work from Thailand? What does your contract say?
- What connectivity and work environment do you need to stay productive?

## About status and compliance

- How long do you plan to stay? That shapes which visa categories you need to understand.
- How is remote work treated under local law? Confirm with official channels or a lawyer, not just social media posts.
- What tax obligations might you have in your home country and in Thailand?

## About daily life

- Chiang Mai's seasons differ a lot, especially air quality late in the dry season. Will you and your family cope?
- What health coverage do you need?
- Are you willing to learn some Thai and connect with the local community, not only expat circles?

## Go slowly

Many people suggest a short stay first, experiencing different seasons before committing long-term. The Chiang Mai Guide section collects experience-based notes and clearly separates personal experience from current rules.$e$,
'chiangmai','primer', array['chiang-mai','remote-work','planning'], array['https://www.thaiembassy.com','https://www.immigration.go.th'], '2026-10-20'
);
