import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductsState {
  items: Product[];
}

const initialState: ProductsState = {
  items: [
    { id: '1', name: 'Laptop', price: 1200, quantity: 5 },
    { id: '2', name: 'Phone', price: 800, quantity: 10 },
    { id: '3', name: 'Headphones', price: 150, quantity: 20 },
    { id: '4', name: 'Tablet', price: 600, quantity: 8 },
    { id: '5', name: 'Smartwatch', price: 300, quantity: 15 },
    { id: '6', name: 'Keyboard', price: 90, quantity: 25 },
    { id: '7', name: 'Mouse', price: 45, quantity: 40 },
    { id: '8', name: 'Monitor', price: 280, quantity: 12 },
    { id: '9', name: 'Speaker', price: 110, quantity: 18 },
    { id: '10', name: 'Router', price: 75, quantity: 30 },
    { id: '11', name: 'Power Bank', price: 55, quantity: 35 },
    { id: '12', name: 'Webcam', price: 65, quantity: 22 },
    { id: '13', name: 'Microphone', price: 140, quantity: 14 },
    { id: '14', name: 'SSD 1TB', price: 120, quantity: 16 },
    { id: '15', name: 'External HDD 2TB', price: 95, quantity: 19 },
    { id: '16', name: 'USB-C Hub', price: 50, quantity: 28 },
    { id: '17', name: 'Printer', price: 210, quantity: 9 },
    { id: '18', name: 'Scanner', price: 180, quantity: 7 },
    { id: '19', name: 'Desk Lamp', price: 35, quantity: 45 },
    { id: '20', name: 'Backpack', price: 60, quantity: 24 },
  ],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (
      state,
      action: PayloadAction<{ name: string; price: number; quantity: number }>
    ) => {
      state.items.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addProduct, removeProduct } = productsSlice.actions;
export default productsSlice.reducer;

// Selectors
export const selectProductsSortedDesc = (state: { products: ProductsState }) =>
  [...state.products.items].sort(
    (a, b) => b.price * b.quantity - a.price * a.quantity
  );

export const selectTotalValueAll = (state: { products: ProductsState }) =>
  state.products.items.reduce((sum, p) => sum + p.price * p.quantity, 0);

export const selectProductById = (id: string) => (state: { products: ProductsState }) =>
  state.products.items.find((p) => p.id === id);
