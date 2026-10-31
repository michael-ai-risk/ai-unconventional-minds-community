import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";

async function renderHome(language: string) {
  window.localStorage.setItem("aims.lang", language);
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

describe("homepage super team", () => {
  beforeEach(() => window.localStorage.clear());

  it.each([
    ["zh", "三个碳基生命，三个硅基伙伴。"],
    ["zhTW", "三個碳基生命，三個矽基夥伴。"],
    ["en", "Three carbon-based humans, three silicon-based companions."],
    ["th", "มนุษย์ฐานคาร์บอนสามคน กับเพื่อนร่วมทางฐานซิลิคอนสามราย"],
  ])("keeps the title and pairs unchanged in %s", async (language, coreLine) => {
    await renderHome(language);

    expect(await screen.findByRole("heading", { name: "super team" })).toBeInTheDocument();
    expect(await screen.findByText(coreLine)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Michael × ChatGPT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "阿海（Hai） × Codex" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abby × Claude" })).toBeInTheDocument();

    const avatars = [
      ["Michael × ChatGPT", "/avatars/michael.svg"],
      ["阿海（Hai） × Codex", "/avatars/hai.svg"],
      ["Abby × Claude", "/avatars/abby.svg"],
    ] as const;
    for (const [pair, avatar] of avatars) {
      const card = screen.getByRole("button", { name: pair });
      expect(card.querySelector("img")).toHaveAttribute("src", avatar);
      expect(card.querySelectorAll("svg")).toHaveLength(1);
    }
  });

  it("reveals Michael's real focus from the keyboard-focusable pair card", async () => {
    await renderHome("zh");
    const card = await screen.findByRole("button", { name: "Michael × ChatGPT" });

    card.focus();
    expect(card).toHaveFocus();
    fireEvent.click(card);

    expect(card).toHaveAttribute("aria-expanded", "true");
    expect(within(card).getByText("跨行业 AI 系统实践者｜商业判断与风险管理")).toBeVisible();
    expect(
      within(card).getByText(
        "Michael 拥有多年房地产、投资与企业管理经验，正从传统行业管理转向 AI 辅助系统开发。他关注怎样把专业知识转成可运行的工作流，并核验信息、识别风险与判断成果能否可靠交付。",
      ),
    ).toBeVisible();
  });

  it("reveals Abby's product focus without changing her AI partner", async () => {
    await renderHome("zh");
    const card = await screen.findByRole("button", { name: "Abby × Claude" });

    fireEvent.click(card);

    expect(card).toHaveAttribute("aria-expanded", "true");
    expect(within(card).getByText("AI 独立开发者｜数字产品与线上收入探索")).toBeVisible();
    expect(
      within(card).getByText(
        "Abby 在清迈探索 AI 独立开发与数字产品实践，尝试从真实用户需求出发设计最小可行产品，并开展用户测试与商业验证。线上收入仍是她探索的方向，不代表已经获得稳定收入。",
      ),
    ).toBeVisible();
  });

  it("reveals Hai's entrepreneurship and AI digital-employee focus with Codex", async () => {
    await renderHome("zh");
    const card = await screen.findByRole("button", { name: "阿海（Hai） × Codex" });

    fireEvent.click(card);

    expect(within(card).getByText("连续创业者｜AI 数字员工与企业组织创新")).toBeVisible();
    expect(within(card).getByText(/2012 年开始创业/)).toBeVisible();
  });
});
