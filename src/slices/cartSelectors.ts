import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const DISCOUNTS: Record<string, number> = { SUMMER10: 0.1, SPECIAL20: 0.2 };

export const selectCartSummary = createSelector(
  [
    (s: RootState) => s.cart.items,
    (s: RootState) => s.cart.discountCode,
    (s: RootState) => s.cart.taxRate,
    (s: RootState) => s.cart.shippingCost,
  ],
  (items, code, taxRate, shipping) => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = subtotal * (DISCOUNTS[code ?? ''] ?? 0);
    const tax = (subtotal - discount) * taxRate;
    const total = items.length ? subtotal - discount + tax + shipping : 0;
    const itemCount = items.reduce((n, i) => n + i.quantity, 0);
    return { subtotal, discount, tax, shipping, total, itemCount };
  }
);