import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductManagerScreen from '../screens/ProductManagerScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import AiAssistantScreen from '../screens/AiAssistantScreen';

export type RootStackParamList = {
  ProductManager: undefined;
  ProductDetail: { productId: string };
  AiAssistant: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProductManager" component={ProductManagerScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
