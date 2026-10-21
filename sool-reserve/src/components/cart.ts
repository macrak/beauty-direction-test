// 장바구니는 브라우저에 상품 ID·수량만 보관 — 가격·재고·주문 가능 여부는 매번 서버에서 재검증
export interface CartItem {
  productId: string;
  quantity: number;
}

const KEY = "sr_cart_v1";
export const CART_EVENT = "sr-cart-change";

export function readCart(): CartItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.productId === "string" && x.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(productId: string, quantity: number) {
  const cart = readCart();
  const cur = cart.find((x) => x.productId === productId);
  if (cur) cur.quantity = Math.min(24, cur.quantity + quantity);
  else cart.push({ productId, quantity: Math.min(24, quantity) });
  writeCart(cart);
}
