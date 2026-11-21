import { expect, test } from "@playwright/test";

test.describe("home hero", () => {
  test("shows the legend, the run link, and a live handoff card", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const legend = page.getByRole("list", { name: "Colour legend" });
    await expect(legend.getByText("agent", { exact: true })).toBeVisible();
    await expect(legend.getByText("you", { exact: true })).toBeVisible();

    await expect(page.getByRole("link", { name: "Browse components" })).toHaveAttribute("href", "/components");
    await expect(page.getByRole("link", { name: "See an agent run" })).toHaveAttribute("href", "/examples/agent-run");
    await expect(page.getByRole("link", { name: "View on GitHub" })).toHaveCount(0);

    const card = page.getByRole("complementary", { name: "Live example of confidence and override" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("meter", { name: "Agent confidence" })).toHaveAttribute("aria-valuenow", "64");
    await expect(card.getByText("Not sure, asks you")).toBeVisible();

    await card.getByRole("button", { name: "Change" }).click();
    await card.getByLabel("Cost centre").fill("4200 · Assembly");
    await card.getByRole("button", { name: "Save" }).click();
    await expect(card.getByText("Changed by you")).toBeVisible();
    await expect(card.getByText("Agent had")).toBeVisible();
    await expect(card.getByText("4100 · Production")).toBeVisible();

    await page.getByRole("link", { name: "See an agent run" }).click();
    await expect(page).toHaveURL(/\/examples\/agent-run$/);
    await expect(page.getByRole("heading", { name: "One agent run" })).toBeVisible();
  });

  test("confidence climbs, and stays put when motion is reduced", async ({ page }) => {
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { __seen: string[] }).__seen = seen;
      const read = () => {
        const node = document.querySelector('[role="meter"][aria-label="Agent confidence"]');
        const value = node?.getAttribute("aria-valuenow");
        if (value && seen[seen.length - 1] !== value) seen.push(value);
      };
      const watch = () => {
        if (!document.documentElement) return;
        new MutationObserver(read).observe(document.documentElement, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["aria-valuenow"],
        });
        read();
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
      else watch();
    });

    const seen = () => page.evaluate(() => (window as unknown as { __seen: string[] }).__seen.map(Number));

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect.poll(async () => {
      const values = await seen();
      if (values.length === 0 || Math.min(...values) >= 50) return "";
      return String(values.at(-1));
    }).toBe("64");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("meter", { name: "Agent confidence" })).toHaveAttribute("aria-valuenow", "64");
    const started = Date.now();
    await expect.poll(async () => {
      const values = await seen();
      if (Date.now() - started < 700 || values.length === 0) return false;
      return values.every((value) => value === 64);
    }).toBe(true);
  });

  test("drops the card below the large breakpoint and keeps the legend and link", async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("aside")).toBeHidden();
    await expect(page.getByRole("list", { name: "Colour legend" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See an agent run" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
