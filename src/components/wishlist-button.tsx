"use client";

import { useState } from "react";
import { HeartIcon, HeartFilledIcon } from "./icons";
import { useWishlist } from "./wishlist-provider";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  className?: string;
}

export function WishlistButton({ productId, productName, className }: WishlistButtonProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();
  const wishlisted = isWishlisted(productId);
  const [animating, setAnimating] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    toggleWishlist(productId);
    const label = productName ? `: ${productName}` : "";
    showToast(
      wishlisted ? `Removed from wishlist${label}` : `Saved to wishlist${label}`,
      "wishlist"
    );
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "transition-transform duration-200 ease-out",
        animating && "scale-125",
        className
      )}
    >
      {wishlisted ? (
        <HeartFilledIcon className="h-5 w-5 text-red-500" />
      ) : (
        <HeartIcon className="h-5 w-5" />
      )}
    </button>
  );
}
