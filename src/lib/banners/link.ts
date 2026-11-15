// Banner links starting with "/" are pages on this site; anything else opens in a new tab.
export function isInternalLink(link: string): boolean {
  return link.startsWith("/");
}
