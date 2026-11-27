import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("expanded preview", () => {
  test("opens from the page, traps focus, and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/components/run-graph", { waitUntil: "domcontentloaded" });

    const expand = page.getByRole("button", { name: "Expand preview" });
    await expand.click();

    const dialog = page.getByRole("dialog", { name: "RunGraph" });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/view=full/);
    await expect(page.getByRole("banner")).toBeHidden();
    await expect(dialog).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("[role=dialog] :focus")).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page).not.toHaveURL(/view=full/);
    await expect(expand).toBeFocused();
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("opens from ?view=full and from /preview/run-graph", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/components/run-graph?view=full", { waitUntil: "domcontentloaded" });
    const dialog = page.getByRole("dialog", { name: "RunGraph" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Replay" }).click();
    await expect(dialog.getByRole("region", { name: "Run" })).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toHaveCount(0);

    await page.goto("/preview/run-graph", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "RunGraph" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Run" })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(blocking).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/components\/run-graph$/);
  });

  test("stays still when motion is reduced", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/preview/run-graph", { waitUntil: "domcontentloaded" });
    const animation = await page.locator(".preview-in").evaluate((element) => getComputedStyle(element).animationName);
    expect(animation).toBe("none");
  });
});
