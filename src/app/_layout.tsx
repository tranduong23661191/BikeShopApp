import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { setCartItems } from '../slices/cartSlice';
import store from '../store';

export default function RootLayout() {
  useEffect(() => {
    AsyncStorage.getItem('cartItems').then((v) => {
      if (v) store.dispatch(setCartItems(JSON.parse(v)));
    });
  }, []);

  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}