import path from "path";

export function getIcorRoot(): string {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), "..");
}

export function icorPath(...segments: string[]): string {
  return path.join(getIcorRoot(), ...segments);
}
