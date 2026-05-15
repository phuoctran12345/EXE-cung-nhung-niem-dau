import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../products/Products';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
  route: RouteProp<RootStackParamList, 'ProductDetail'>;
};

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { state, dispatch } = useProducts();
  const product = state.products.find((p) => p.id === productId);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>← Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalValue = product.price * product.quantity;

  const handleRemove = () => {
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: { id: productId } });
    setShowConfirm(false);
    navigation.goBack();
  };

  const cancelRemove = () => {
    setShowConfirm(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#2a9d8f', '#21867a']} style={styles.header}>
        <Text style={styles.headerTitle}>Product Details</Text>
      </LinearGradient>

      <View style={styles.content}>
        <LinearGradient
          colors={['#ffffff', '#EEF4FF']}
          style={styles.detailCard}
        >
          <View style={styles.row}>
            <Text style={styles.detailIcon}>🏷️</Text>
            <View>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{product.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.detailIcon}>💰</Text>
            <View>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>${product.price.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.detailIcon}>📦</Text>
            <View>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{product.quantity}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.detailIcon}>💎</Text>
            <View>
              <Text style={styles.detailLabel}>Total Value</Text>
              <Text style={[styles.detailValue, styles.totalValue]}>
                ${totalValue.toLocaleString()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <TouchableOpacity onPress={handleRemove} activeOpacity={0.85}>
          <LinearGradient
            colors={['#e63946', '#b61f2a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.removeBtn}
          >
            <Text style={styles.removeBtnText}>🗑️  REMOVE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>← Close</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xoá sản phẩm</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc muốn xoá \"{product.name}\"?
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3FFFD',
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 14,
    width: 34,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  totalValue: {
    color: '#2a9d8f',
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginHorizontal: 4,
  },
  removeBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  removeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 1,
  },
  closeBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  closeBtnText: {
    color: '#444',
    fontWeight: '700',
    fontSize: 15,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: '#888',
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
