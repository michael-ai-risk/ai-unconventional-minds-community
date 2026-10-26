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
    expect(screen.getByRole("button", { name: "海 × Codex" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abby × Claude" })).toBeInTheDocument();
  });

  it("reveals the shared interaction note from the keyboard-focusable pair card", async () => {
    await renderHome("zh");
    const card = await screen.findByRole("button", { name: "Michael × ChatGPT" });

    card.focus();
    expect(card).toHaveFocus();
    fireEvent.click(card);

    expect(card).toHaveAttribute("aria-expanded", "true");
    expect(within(card).getByText("人类与 AI，一起探索更多可能。")).toBeVisible();
  });
});
