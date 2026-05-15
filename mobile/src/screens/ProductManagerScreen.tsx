import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ProductInput from '../components/ProductInput';
import ProductList from '../components/ProductList';
import TotalValueCard from '../components/TotalValueCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductManager'>;
};

export default function ProductManagerScreen({ navigation }: Props) {
  const handleViewProduct = (id: string) => {
    navigation.navigate('ProductDetail', { productId: id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#2a9d8f', '#21867a']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>ProductManager</Text>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate('AiAssistant')}
          >
            <Text style={styles.aiButtonText}>AI</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProductInput />

        <Text style={styles.sectionTitle}>Product List</Text>
        <ProductList onPressItem={handleViewProduct} />

        <TotalValueCard />
      </ScrollView>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  aiButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    marginTop: 4,
  },
});
