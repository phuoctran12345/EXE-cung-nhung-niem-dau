import React, { useState } from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import ProductItem from './ProductItem';
import { useProducts } from '../products/Products';

interface Props {
  onPressItem: (id: string) => void;
}

export default function ProductList({ onPressItem }: Props) {
  const { state, dispatch } = useProducts();
  const products = [...state.products].sort(
    (a, b) => b.price * b.quantity - a.price * a.quantity
  );

  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingProduct =
    pendingId != null ? state.products.find((p) => p.id === pendingId) : null;

  const handleRemove = (id: string) => {
    setPendingId(id);
  };

  const confirmRemove = () => {
    if (pendingId) {
      dispatch({ type: 'REMOVE_PRODUCT', payload: { id: pendingId } });
    }
    setPendingId(null);
  };

  const cancelRemove = () => {
    setPendingId(null);
  };

  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No products yet. Add one above!</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem product={item} onPress={onPressItem} onRemove={handleRemove} />
        )}
        scrollEnabled={false}
      />

      <Modal visible={pendingId != null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xoá sản phẩm</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc muốn xoá \"{pendingProduct?.name ?? 'sản phẩm'}\"?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={cancelRemove}
              >
                <Text style={styles.modalCancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDelete]}
                onPress={confirmRemove}
              >
                <Text style={styles.modalDeleteText}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#e0e0e0',
  },
  modalDelete: {
    backgroundColor: '#e63946',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: '700',
  },
  modalDeleteText: {
    color: '#fff',
    fontWeight: '800',
  },
});
