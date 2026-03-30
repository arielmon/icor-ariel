import path from "path";

export function getIcorRoot(): string {
  // In production (Vercel), data is copied to dashboard/data/ by prebuild script.
  // Locally, data/ also exists after running the prebuild.
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data");
}

export function icorPath(...segments: string[]): string {
  return path.join(getIcorRoot(), ...segments);
}
