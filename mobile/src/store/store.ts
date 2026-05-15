import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
  },
});

// Kiểu dữ liệu cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
