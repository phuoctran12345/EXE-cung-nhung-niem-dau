import React, { createContext, useContext, useMemo, useReducer } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type ProductsState = {
  products: Product[];
};

export type ProductsAction =
  | { type: 'ADD_PRODUCT'; payload: { name: string; price: number; quantity: number } }
  | { type: 'REMOVE_PRODUCT'; payload: { id: string } };

const initialState: ProductsState = {
  products: [
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

export function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: action.payload.name,
        price: action.payload.price,
        quantity: action.payload.quantity,
      };
      return { ...state, products: [newProduct, ...state.products] };
    }
    case 'REMOVE_PRODUCT': {
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload.id),
      };
    }
    default:
      return state;
  }
}

type ProductsContextValue = {
  state: ProductsState;
  dispatch: React.Dispatch<ProductsAction>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productsReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}

