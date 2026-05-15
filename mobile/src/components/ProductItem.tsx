import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../products/Products';

interface Props {
  product: Product;
  onPress: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ProductItem({ product, onPress, onRemove }: Props) {
  const total = product.price * product.quantity;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.detail}>Price: ${product.price.toLocaleString()}</Text>
        <Text style={styles.detail}>Qty: {product.quantity}</Text>
        <Text style={styles.total}>Total: ${total.toLocaleString()}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => onPress(product.id)}>
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(product.id)}>
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2a9d8f',
    marginTop: 4,
  },
  actions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  viewBtn: {
    backgroundColor: '#DFF3F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: {
    color: '#2a9d8f',
    fontWeight: '700',
    fontSize: 13,
  },
  removeBtn: {
    backgroundColor: '#FDE2E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeBtnText: {
    color: '#e63946',
    fontWeight: '800',
    fontSize: 13,
  },
});
