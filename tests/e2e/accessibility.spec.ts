import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { COMPONENTS } from "../../src/lib/registry";

const routes = ["/", "/changelog", ...COMPONENTS.map((component) => `/components/${component.slug}`)];

test.describe("production docs accessibility", () => {
  for (const route of routes) {
    test(`has no serious or critical axe violations: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );

      expect(
        blockingViolations,
        `Blocking accessibility violations on ${route}:\n${formatViolations(blockingViolations)}`,
      ).toEqual([]);
    });
  }
});

function formatViolations(
  violations: ReadonlyArray<{
    id: string;
    impact?: string | null;
    description: string;
    nodes: ReadonlyArray<{ target: unknown }>;
  }>,
) {
  if (violations.length === 0) return "none";
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => JSON.stringify(node.target)).join(", ");
      return `- ${violation.id} (${violation.impact ?? "unknown"}): ${violation.description} [${targets}]`;
    })
    .join("\n");
}
