import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";

async function renderApp() {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

describe("site navigation", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens the mobile menu, navigates to a real route, and closes", async () => {
    const router = await renderApp();
    const menuButton = await screen.findByRole("button", { name: "菜单" });

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = document.getElementById("mobile-navigation");
    const eventsLink = document.querySelector<HTMLAnchorElement>(
      "#mobile-navigation a[href='/events']",
    );
    expect(mobileNavigation).toBeTruthy();
    expect(eventsLink).toBeTruthy();

    fireEvent.click(eventsLink!);

    await waitFor(() => expect(router.state.location.pathname).toBe("/events"));
    expect(screen.getByRole("heading", { name: "活动" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "菜单" })).toHaveAttribute("aria-expanded", "false");
  });

  it("switches navigation language", async () => {
    await renderApp();
    fireEvent.change(await screen.findByRole("combobox", { name: "选择语言" }), {
      target: { value: "en" },
    });

    expect(await screen.findByRole("combobox", { name: "Choose language" })).toHaveValue("en");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toHaveTextContent(
      "AI Topics",
    );
  });

  it("keeps the optional Tally survey destination on the home page", async () => {
    await renderApp();
    const surveys = await screen.findAllByRole("link", { name: /参与活动小调查/ });
    expect(surveys.length).toBeGreaterThanOrEqual(1);
    for (const survey of surveys) {
      expect(survey).toHaveAttribute("href", "https://tally.so/r/PRdaO5");
      expect(survey).toHaveAttribute("target", "_blank");
    }
  });
});
