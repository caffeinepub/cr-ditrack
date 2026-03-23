const SHOP_NAME_KEY = "creditrack_shop_name";
const DEFAULT_SHOP_NAME = "notre boutique";

export function getStoredShopName(): string {
  return localStorage.getItem(SHOP_NAME_KEY) || DEFAULT_SHOP_NAME;
}

export function saveShopName(name: string): void {
  localStorage.setItem(SHOP_NAME_KEY, name);
}
