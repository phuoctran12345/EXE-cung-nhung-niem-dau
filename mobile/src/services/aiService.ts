import Constants from 'expo-constants';
import type { Product } from '../products/Products';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const PROVIDER = process.env.EXPO_PUBLIC_AI_PROVIDER ?? 'groq';

if (PROVIDER === 'groq' && !GROQ_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Missing EXPO_PUBLIC_GROQ_API_KEY for AI assistant');
}

export type AiChartConfig =
  | {
      type: 'inventory_bar';
      title: string;
      items: { name: string; quantity: number }[];
    }
  | null;

type AiResponse = {
  message: string;
  chart: AiChartConfig;
};

export async function askProductAssistant(
  question: string,
  products: Product[]
): Promise<AiResponse> {
  const apiKey = GROQ_API_KEY;

  if (!apiKey) {
    return {
      message:
        'AI assistant chưa được cấu hình API key (EXPO_PUBLIC_GROQ_API_KEY). Vui lòng thêm key trong file .env.',
      chart: null,
    };
  }

  const systemPrompt =
    'Bạn là trợ lý React Native nói tiếng Việt, giúp phân tích danh sách sản phẩm (Name, Price, Quantity, Total) và gợi ý quản lý, tối ưu hoá danh mục sản phẩm.\n' +
    '- Nếu người dùng hỏi về biểu đồ, hãy trả về JSON THUẦN theo cấu trúc:\n' +
    '{\"type\":\"inventory_bar\",\"title\":\"<tiêu đề>\",\"items\":[{\"name\":\"Tên\",\"quantity\":40}, ...]}\n' +
    '- Không thêm bất kỳ text nào ngoài JSON.\n' +
    '- Nếu không phù hợp để vẽ biểu đồ, hãy trả lời bằng tiếng Việt bình thường.';

  const productsSummary = products
    .slice(0, 30)
    .map(
      (p) =>
        `- ${p.name}: price=${p.price}, quantity=${p.quantity}, total=${p.price * p.quantity}`
    )
    .join('\n');

  const userPrompt = `Danh sách sản phẩm hiện tại:\n${productsSummary}\n\nCâu hỏi của người dùng: ${question}\n\nNếu câu hỏi có yêu cầu vẽ biểu đồ, hãy trả về JSON đúng schema đã cho ở trên.`;

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    // eslint-disable-next-line no-console
    console.error('Groq API error:', text);
    return {
      message: 'Không gọi được AI assistant. Vui lòng kiểm tra kết nối mạng và API key.',
      chart: null,
    };
  }

  const json = (await response.json()) as any;
  const rawContent: string =
    json.choices?.[0]?.message?.content ??
    'AI assistant không trả về nội dung. Vui lòng thử lại sau.';

  let chart: AiChartConfig = null;
  let message = rawContent.trim();

  // Thử parse JSON cho mode biểu đồ
  try {
    const maybeJson = JSON.parse(rawContent);
    if (
      maybeJson &&
      maybeJson.type === 'inventory_bar' &&
      Array.isArray(maybeJson.items)
    ) {
      chart = {
        type: 'inventory_bar',
        title: typeof maybeJson.title === 'string' ? maybeJson.title : 'Phân tích tồn kho',
        items: maybeJson.items
          .filter(
            (it: any) =>
              typeof it?.name === 'string' &&
              typeof it?.quantity === 'number' &&
              Number.isFinite(it.quantity)
          )
          .slice(0, 10),
      };
      message = 'Biểu đồ đã được tạo từ dữ liệu AI.';
    }
  } catch (e) {
    // Not JSON -> giữ nguyên message string
  }

  return { message, chart };
}

