import { anatomyFor, type AnatomyNode } from "./anatomy";
import { keyboardFor } from "./keyboard-interactions";
import { getComponent, type ComponentDoc } from "./registry";
import { shadcnInstallCommand } from "./registry-url";
import { insteadSentence, whenFor } from "./when-to-use";

/** The component page as Markdown: usage, props and accessibility, plus the sections around them. */
export function componentMarkdown(component: ComponentDoc): string {
  const guide = whenFor(component.slug);
  const anatomy = anatomyFor(component.slug);
  const lines: string[] = [
    `# ${component.name}`,
    "",
    component.summary,
    "",
    "## The design question",
    "",
    component.question,
    "",
    ...component.decisions.map((decision) => `- ${decision}`),
    "",
  ];

  if (anatomy) {
    lines.push("## Anatomy", "", ...anatomyMarkdown(anatomy, 0), "");
  }

  lines.push(
    "## When to use",
    "",
    "### Use when",
    "",
    ...guide.useWhen.map((item) => `- ${item}`),
    "",
    "### Use another component when",
    "",
    ...guide.instead.map((item) => {
      const other = getComponent(item.slug);
      if (!other) throw new Error(`When-to-use for ${component.slug} points at unknown component ${item.slug}`);
      return `- ${insteadSentence(other.name, item.when)}`;
    }),
    "",
    "## Usage",
    "",
    "```tsx",
    `import { ${component.name} } from "@/components/agentic"`,
    "",
    component.usage,
    "```",
    "",
    "## Props",
    "",
    ...component.props.map((prop) => `- \`${prop.name}\` (\`${prop.type}\`): ${prop.note}`),
    "",
    "## Accessibility",
    "",
    ...component.a11y.map((note) => `- ${note}`),
    "",
    "### Keyboard interactions",
    "",
    ...keyboardFor(component.slug).map((row) => `- **${row.key}.** ${row.action}`),
    "",
    "## Deliberately not built",
    "",
    ...component.notBuilt.map((item) => `- ${item}`),
    "",
    "## Install",
    "",
    "```bash",
    shadcnInstallCommand(component.slug),
    "```",
    "",
  );

  return lines.join("\n");
}

function anatomyMarkdown(nodes: readonly AnatomyNode[], depth: number): string[] {
  const lines: string[] = [];
  for (const node of nodes) {
    lines.push(`${"  ".repeat(depth)}- \`${node.name}\` — ${node.answers}`);
    if (node.children?.length) lines.push(...anatomyMarkdown(node.children, depth + 1));
  }
  return lines;
}
