import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProducts } from '../products/Products';
import { askProductAssistant, AiChartConfig } from '../services/aiService';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AiAssistant'>;
};

export default function AiAssistantScreen({ navigation }: Props) {
  const { state } = useProducts();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [chart, setChart] = useState<AiChartConfig>(null);

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }
    setLoading(true);
    try {
      const res = await askProductAssistant(question.trim(), state.products);
      setAnswer(res.message);
      setChart(res.chart);
    } catch (e) {
      setAnswer('Đã xảy ra lỗi khi gọi AI. Vui lòng thử lại sau.');
      setChart(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#2a9d8f', '#21867a']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Product Assistant</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Hỏi AI về danh sách sản phẩm của bạn</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ví dụ: Gợi ý nên tăng/giảm số lượng hoặc giá cho sản phẩm nào?"
            placeholderTextColor="#9aa"
            multiline
          />
          <TouchableOpacity style={styles.askBtn} onPress={handleAsk} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.askText}>HỎI AI</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.answerContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.answerCard}>
            <Text style={styles.answerTitle}>Trả lời</Text>
            <Text style={styles.answerText}>
              {answer || 'Nhập câu hỏi và bấm HỎI AI để nhận gợi ý quản lý sản phẩm.'}
            </Text>
          </View>

          {chart && chart.type === 'inventory_bar' && chart.items.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{chart.title}</Text>
              <View style={{ height: 220 }}>
                <Svg width="100%" height="100%" viewBox="0 0 320 220">
                  <G>
                    <Line
                      x1={32}
                      y1={10}
                      x2={32}
                      y2={190}
                      stroke="#cbd5d1"
                      strokeWidth={1}
                    />
                    <Line
                      x1={32}
                      y1={190}
                      x2={310}
                      y2={190}
                      stroke="#cbd5d1"
                      strokeWidth={1}
                    />
                  </G>
                  {(() => {
                    const max = Math.max(...chart.items.map((it) => it.quantity), 1);
                    const barAreaWidth = 260;
                    const barWidth = barAreaWidth / chart.items.length - 8;
                    return chart.items.map((it, idx) => {
                      const x = 40 + idx * (barWidth + 8);
                      const barHeight = (it.quantity / max) * 150;
                      const y = 190 - barHeight;
                      return (
                        <G key={it.name}>
                          <Rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill="#2a9d8f"
                            rx={4}
                            ry={4}
                          />
                          <SvgText
                            x={x + barWidth / 2}
                            y={200}
                            fontSize={8}
                            fill="#4b5563"
                            textAnchor="middle"
                          >
                            {it.name}
                          </SvgText>
                          <SvgText
                            x={x + barWidth / 2}
                            y={y - 4}
                            fontSize={9}
                            fill="#1b4f47"
                            textAnchor="middle"
                          >
                            {it.quantity}
                          </SvgText>
                        </G>
                      );
                    });
                  })()}
                </Svg>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3FFFD',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  input: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3ded9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    marginBottom: 12,
  },
  askBtn: {
    borderRadius: 12,
    backgroundColor: '#2a9d8f',
    paddingVertical: 12,
    alignItems: 'center',
  },
  askText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  answerContainer: {
    flex: 1,
  },
  answerCard: {
    backgroundColor: '#e8f6f3',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  chartCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b4f47',
    marginBottom: 4,
    textAlign: 'center',
  },
  answerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b4f47',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#1b4f47',
    lineHeight: 20,
  },
});

