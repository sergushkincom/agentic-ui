/** Resolve extensionless relative imports to .ts so node:test can load the docs modules. */
export async function resolve(specifier, context, nextResolve) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (relative && !/\.[a-z]+$/i.test(specifier)) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}
