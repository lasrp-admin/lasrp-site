/**
 * Updates URL parameters to match favorites list.
 * @param favorites Set containing IDs of favorited resources
 */
export function updateURL(favorites: Set<number>) {
  const params = new URLSearchParams(window.location.search);
  params.set("f", Array.from(favorites).join(","));
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newURL);
}

/**
 * Reads URL to get favorite resources
 * @returns Set containing IDs of resources to be favorited
 */
export function readURL(): Set<number> {
  const params = new URLSearchParams(window.location.search);
  const favString = params.get("f");
  if (!favString) return new Set();
  return new Set<number>(favString.split(",").map(Number));
}
