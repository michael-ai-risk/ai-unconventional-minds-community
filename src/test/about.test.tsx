import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
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
    [
      "zh",
      "关于我们",
      "为什么我创建这个社区？",
      "在这里，我们可以一起探索什么？",
      "AI 就业与未来发展",
      "关注 AI 带来的就业变化、新兴职业与技能需求，交流如何利用 AI 提升竞争力、寻找工作与创业机会，探索未来职业发展的更多可能。",
    ],
    [
      "zhTW",
      "關於我們",
      "為什麼我創建這個社群？",
      "在這裡，我們可以一起探索什麼？",
      "AI 就業與未來發展",
      "關注 AI 帶來的就業變化、新興職業與技能需求，交流如何運用 AI 提升競爭力、尋找工作與創業機會，探索未來職涯發展的更多可能。",
    ],
    [
      "en",
      "About",
      "Why did I create this community?",
      "What can we explore together?",
      "AI, employment, and the future",
      "Explore how AI is changing work, the new roles and skills emerging, and ways to use AI to strengthen your edge, find work, pursue entrepreneurial opportunities, and shape future career paths.",
    ],
    [
      "th",
      "เกี่ยวกับเรา",
      "ทำไมผมจึงสร้างชุมชนนี้ขึ้นมา?",
      "เราจะมาสำรวจเรื่องอะไรด้วยกันได้บ้าง?",
      "AI การจ้างงาน และอนาคตการทำงาน",
      "พูดคุยถึงการเปลี่ยนแปลงด้านการจ้างงานที่เกิดจาก AI อาชีพใหม่และทักษะที่ต้องการ แลกเปลี่ยนวิธีใช้ AI เพื่อเพิ่มความสามารถในการแข่งขัน หางาน และมองหาโอกาสในการเริ่มธุรกิจ พร้อมสำรวจความเป็นไปได้ใหม่ ๆ สำหรับเส้นทางอาชีพในอนาคต",
    ],
  ])(
    "shows the full About story and participation links in %s",
    async (language, pageTitle, founderTitle, exploreTitle, topic6Title, topic6Body) => {
      await renderAbout(language);

      expect(await screen.findByRole("heading", { level: 1, name: pageTitle })).toBeInTheDocument();
      expect(screen.getByText("WHY WE MEET")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: founderTitle })).toBeInTheDocument();
      const exploreSection = screen.getByRole("region", { name: exploreTitle });
      expect(exploreSection).toBeInTheDocument();
      expect(within(exploreSection).getAllByRole("article")).toHaveLength(6);
      expect(within(exploreSection).getByText("06")).toBeInTheDocument();
      expect(
        within(exploreSection).getByRole("heading", { name: topic6Title }),
      ).toBeInTheDocument();
      expect(within(exploreSection).getByText(topic6Body)).toBeInTheDocument();
      expect(screen.getByText("WHAT YOU CAN EXPLORE")).toBeInTheDocument();
      expect(screen.getByText("MEET THE HUMANS")).toBeInTheDocument();
      expect(screen.getByText("WHY UNCONVENTIONAL")).toBeInTheDocument();
      expect(screen.getByText("COME AS YOU ARE")).toBeInTheDocument();
      expect(screen.getByText("Michael · Founder")).toBeInTheDocument();
      expect(screen.getByText("Business & Markets")).toBeInTheDocument();
      expect(screen.getByText("Digital Products")).toBeInTheDocument();
      expect(screen.getByText("Abby", { exact: true })).toBeInTheDocument();
      expect(document.querySelector('[aria-labelledby="about-founder-title"] img')).toHaveAttribute(
        "src",
        "/avatars/michael.svg",
      );
      expect(
        [...document.querySelectorAll('[aria-labelledby="about-humans-title"] article img')].map(
          (avatar) => avatar.getAttribute("src"),
        ),
      ).toEqual(["/avatars/michael.svg", "/avatars/hai.svg", "/avatars/abby.svg"]);
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
