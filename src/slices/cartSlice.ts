import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteProduct, Product } from './productsSlice';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  taxRate: number;
  shippingCost: number;
}

const initialState: CartState = {
  items: [],
  discountCode: null,
  taxRate: 0.1,
  shippingCost: 10,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<Product>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity += 1;
      else state.items.push({ ...action.payload, quantity: 1 });
    },
    increaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    applyDiscount: (state, action: PayloadAction<string | null>) => {
      state.discountCode = action.payload;
    },
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    });
  },
});

export default cartSlice.reducer;
export const {
  setCartItems,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  setShippingCost,
} = cartSlice.actions;