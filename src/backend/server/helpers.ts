import * as path from "node:path";

type PathLike = Pick<typeof path, "isAbsolute" | "relative" | "resolve">;

export function slugifyTitle(title: string): string {
  return title
    .replace(/[/\\]/g, "-")
    .replace(/\.\./g, "-")
    .replace(/[<>:"|?*\x00-\x1f]/g, "")
    .replace(/^\.+/, "")
    .slice(0, 120)
    .trim() || "entity";
}

function isPathWithinDir(
  filePath: string,
  allowedDir: string,
  pathApi: PathLike = path,
): boolean {
  const resolved = pathApi.resolve(filePath);
  const allowedResolved = pathApi.resolve(allowedDir);
  const relativePath = pathApi.relative(allowedResolved, resolved);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !pathApi.isAbsolute(relativePath))
  );
}

export function assertWithinDir(filePath: string, allowedDir: string): void {
  if (!isPathWithinDir(filePath, allowedDir)) {
    throw new Error("Path traversal detected");
  }
}
