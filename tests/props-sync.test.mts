import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import { COMPONENTS } from "../src/lib/registry.ts";

const root = process.cwd();
const agenticDir = join(root, "src/components/agentic");

/** Props type for a registry component: StreamingText → StreamingTextProps. */
function propsTypeName(componentName: string) {
  return `${componentName}Props`;
}

/**
 * Property names on an exported type alias, via the TypeScript compiler API.
 * Used so docs PropRow[] names stay in lockstep with the real component props.
 */
function propNamesFromType(program: ts.Program, filePath: string, typeName: string): string[] {
  const sourceFile = program.getSourceFile(filePath);
  assert.ok(sourceFile, `missing source file ${filePath}`);
  const checker = program.getTypeChecker();

  let typeNode: ts.TypeAliasDeclaration | undefined;
  for (const statement of sourceFile.statements) {
    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName) {
      typeNode = statement;
      break;
    }
  }
  assert.ok(typeNode, `${filePath} has no type alias ${typeName}`);

  const type = checker.getTypeAtLocation(typeNode.name);
  return checker
    .getPropertiesOfType(type)
    .map((symbol) => symbol.getName())
    .filter((name) => !name.startsWith("__"))
    .sort();
}

function documentedPropNames(props: { name: string }[]): string[] {
  return [...props.map((prop) => prop.name)].sort();
}

describe("props tables match component types", () => {
  const files = COMPONENTS.map((component) => join(agenticDir, component.file));
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
  assert.ok(configPath, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  assert.equal(configFile.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
  const program = ts.createProgram({ rootNames: files, options: parsed.options });

  it("lists the same prop names in registry PropRow[] and the TypeScript Props type", () => {
    const problems: string[] = [];

    for (const component of COMPONENTS) {
      const filePath = join(agenticDir, component.file);
      const typeName = propsTypeName(component.name);
      const fromTypes = propNamesFromType(program, filePath, typeName);
      const fromDocs = documentedPropNames(component.props);

      const onlyInTypes = fromTypes.filter((name) => !fromDocs.includes(name));
      const onlyInDocs = fromDocs.filter((name) => !fromTypes.includes(name));

      if (onlyInTypes.length || onlyInDocs.length) {
        const parts = [`${component.name} (${component.slug})`];
        if (onlyInTypes.length) parts.push(`in type only: ${onlyInTypes.join(", ")}`);
        if (onlyInDocs.length) parts.push(`in docs only: ${onlyInDocs.join(", ")}`);
        problems.push(parts.join(" — "));
      }
    }

    assert.deepEqual(problems, [], problems.join("\n"));
  });

  it("has a Props type alias for every registry component file", () => {
    for (const component of COMPONENTS) {
      const filePath = join(agenticDir, component.file);
      const names = propNamesFromType(program, filePath, propsTypeName(component.name));
      assert.ok(names.length > 0, component.slug);
    }
  });
});
