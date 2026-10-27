import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';

const store = configureStore({
  reducer: { cart: cartReducer, products: productsReducer },
});

// Lưu giỏ hàng khi danh sách items thay đổi
let prevItems = store.getState().cart.items;
store.subscribe(() => {
  const items = store.getState().cart.items;
  if (items !== prevItems) {
    prevItems = items;
    AsyncStorage.setItem('cartItems', JSON.stringify(items));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;