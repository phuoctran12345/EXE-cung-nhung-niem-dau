import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from '../products/Products';

export default function ProductInput() {
  const { dispatch } = useProducts();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !price.trim() || !quantity.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }
    const parsedPrice = parseFloat(price);
    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Lỗi', 'Giá sản phẩm phải là số dương!');
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Lỗi', 'Số lượng phải là số dương!');
      return;
    }
    dispatch({
      type: 'ADD_PRODUCT',
      payload: { name: name.trim(), price: parsedPrice, quantity: parsedQty },
    });
    setName('');
    setPrice('');
    setQuantity('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Enter product name</Text>
      <TextInput
        style={styles.input}
        placeholder="Product name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#aaa"
      />
      <Text style={styles.label}>Enter price</Text>
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />
      <Text style={styles.label}>Enter quantity</Text>
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity onPress={handleAdd} activeOpacity={0.85}>
        <LinearGradient
          colors={['#2a9d8f', '#21867a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>ADD PRODUCT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
