/**
 * Utilities for constructing and parsing shareable menu slugs.
 */
const persianAlphaNumeric = /[^\dA-Za-z\u0600-\u06FF-]+/g;

/**
 * Converts the provided cafe name into a URL-safe slug. Persian characters are preserved
 * so that the resulting link can still contain the readable cafe name.
 */
export function slugifyCafeName(name: string | null | undefined): string {
  if (!name) return "cafe";
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(persianAlphaNumeric, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "cafe"
  );
}

/**
 * Builds the slug that will be used in the /menu/[slug] route. The slug contains the
 * readable cafe name followed by a separator and userId so the page can load data quickly.
 */
export function buildMenuShareSlug(name: string | null | undefined, userId: string): string {
  const readable = slugifyCafeName(name);
  return `${readable}--${userId}`;
}

/**
 * Parses the slug coming from /menu/[slug] route and extracts the userId back.
 */
export function parseUserIdFromShareSlug(slug: string): { cafeSlug: string; userId: string } | null {
  const separatorIndex = slug.lastIndexOf("--");
  if (separatorIndex === -1) {
    return null;
  }

  const cafeSlug = slug.slice(0, separatorIndex);
  const userId = slug.slice(separatorIndex + 2);
  if (!userId) {
    return null;
  }

  return {
    cafeSlug: cafeSlug || "cafe",
    userId
  };
}
