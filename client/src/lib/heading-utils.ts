export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`#\[\]]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function getHeadingId(text: string, index: number): string {
  const slug = slugify(text);
  return slug ? `${slug}-${index}` : `heading-${index}`;
}
