import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/community-rules")({
  head: () => ({ meta: [{ title: "社区规则 · AI非正常人类情报站" }] }),
  component: RulesPage,
});

function RulesPage() {
  const { lang } = useI18n();
  const rules =
    lang === "zh"
      ? [
          ["尊重彼此", "欢迎不同背景和不同意见。讨论观点，不攻击个人；不要骚扰、歧视或威胁他人。"],
          [
            "保护隐私",
            "未经同意，不公开他人的姓名、照片、联系方式、聊天记录或工作信息。分享AI对话前先删去敏感内容。",
          ],
          [
            "分享真实经验",
            "区分事实、个人体验和猜测。不要伪装成其他成员，也不要发布虚构新闻或误导性内容。",
          ],
          ["保持自愿", "不强迫自我介绍、加入群组、交换联系方式、参与商业合作或接受拍摄。"],
          [
            "活动中的相互照顾",
            "遵守场地的安全和清理要求。拍摄、录音或发布可识别他人的内容前，先征得同意。",
          ],
        ]
      : [
          [
            "Treat people with respect",
            "Different backgrounds and views are welcome. Discuss ideas without attacking people; do not harass, discriminate against, or threaten anyone.",
          ],
          [
            "Protect privacy",
            "Do not share another person's name, photo, contact details, chat, or work information without consent. Remove sensitive details before sharing AI chats.",
          ],
          [
            "Share real experiences",
            "Separate facts, personal experience, and guesses. Do not impersonate members or post fabricated news or misleading content.",
          ],
          [
            "Keep participation voluntary",
            "No one should be pressured to introduce themselves, join a group, exchange contact details, take part in business, or be photographed.",
          ],
          [
            "Look after one another at events",
            "Follow venue safety and cleanup requirements. Ask before recording or publishing identifiable images or audio.",
          ],
        ];
  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-12 md:py-16">
      <p className="label-mono text-accent">4SEAS / COMMUNITY CARE</p>
      <h1 className="mt-3 font-cn-black text-4xl md:text-5xl">
        {lang === "zh" ? "社区规则" : "Community rules"}
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        {lang === "zh"
          ? "让每个人都能轻松、安心地参与。"
          : "Help make it easy and comfortable for everyone to take part."}
      </p>
      <div className="mt-8 space-y-6">
        {rules.map(([title, body], index) => (
          <section key={title} className="border-t-2 border-foreground pt-5">
            <p className="label-mono text-accent">0{index + 1}</p>
            <h2 className="mt-2 font-cn-black text-xl">{title}</h2>
            <p className="mt-2 text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
