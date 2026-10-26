import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";

async function renderAbout(language: string) {
  window.localStorage.setItem("aims.lang", language);
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: ["/about"] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

describe("About Us page", () => {
  beforeEach(() => window.localStorage.clear());

  it.each([
    ["zh", "关于我们", "为什么我创建这个社区？", "在这里，我们可以一起探索什么？"],
    ["zhTW", "關於我們", "為什麼我創建這個社群？", "在這裡，我們可以一起探索什麼？"],
    ["en", "About", "Why did I create this community?", "What can we explore together?"],
    [
      "th",
      "เกี่ยวกับเรา",
      "ทำไมผมจึงสร้างชุมชนนี้ขึ้นมา?",
      "เราจะมาสำรวจเรื่องอะไรด้วยกันได้บ้าง?",
    ],
  ])(
    "shows the full About story and participation links in %s",
    async (language, pageTitle, founderTitle, exploreTitle) => {
      await renderAbout(language);

      expect(await screen.findByRole("heading", { level: 1, name: pageTitle })).toBeInTheDocument();
      expect(screen.getByText("WHY WE MEET")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: founderTitle })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: exploreTitle })).toBeInTheDocument();
      expect(screen.getByText("WHAT YOU CAN EXPLORE")).toBeInTheDocument();
      expect(screen.getByText("MEET THE HUMANS")).toBeInTheDocument();
      expect(screen.getByText("WHY UNCONVENTIONAL")).toBeInTheDocument();
      expect(screen.getByText("COME AS YOU ARE")).toBeInTheDocument();
      expect(screen.getByText("Michael · Founder")).toBeInTheDocument();
      expect(screen.getByText("Business & Markets")).toBeInTheDocument();
      expect(screen.getByText("Digital Products")).toBeInTheDocument();
      expect(screen.getByText("Abby", { exact: true })).toBeInTheDocument();
      expect(
        screen
          .getAllByRole("link")
          .some((link) => link.getAttribute("href") === "https://tally.so/r/PRdaO5"),
      ).toBe(true);
      expect(
        screen.getAllByRole("link").some((link) => link.getAttribute("href") === "/discussions"),
      ).toBe(true);
      expect(
        screen
          .getAllByRole("link")
          .some((link) => link.getAttribute("href") === "/community-rules"),
      ).toBe(true);
    },
  );
});
