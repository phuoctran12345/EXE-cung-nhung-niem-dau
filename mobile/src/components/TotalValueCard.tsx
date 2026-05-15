import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from '../products/Products';

export default function TotalValueCard() {
  const { state } = useProducts();
  const total = state.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <LinearGradient
      colors={['#2a9d8f', '#21867a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      <Text style={styles.label}>Total</Text>
      <Text style={styles.value}>${total.toLocaleString()}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#2a9d8f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
});
