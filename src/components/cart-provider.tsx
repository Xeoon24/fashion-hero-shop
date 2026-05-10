"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { CartItem, Product, ProductColor } from "@/types";
import { CartDrawer } from "./cart-drawer";
import { useToast } from "./toast-provider";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, color: ProductColor, size: number) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const addItem = useCallback(
    (product: Product, color: ProductColor, size: number) => {
      setItems((prev) => {
        const existing = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.color.hex === color.hex &&
            item.size === size
        );
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = { ...next[existing], quantity: next[existing].quantity + 1 };
          return next;
        }
        return [...prev, { product, color, size, quantity: 1 }];
      });
      showToast(`Added to cart: ${product.name}`, "cart");
      setIsOpen(true);
    },
    [showToast]
  );

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity };
      return next;
    });
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        itemCount,
      }}
    >
      {children}
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
    </CartContext.Provider>
  );
}
