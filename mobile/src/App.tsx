import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { ProductsProvider } from './products/Products';

export default function App() {
  return (
    <ProductsProvider>
      <AppNavigator />
    </ProductsProvider>
  );
}
