import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Hàm gọi AI Groq để gợi ý lịch trình (Mô hình RAG)
   * 
   * Kiến thức JS ôn phỏng vấn:
   * - fetch(): Hàm dùng để gọi API ngoài. Trả về một Promise.
   * - async/await: Dùng để đợi Promise hoàn thành mà không làm block luồng chính.
   * - JSON.stringify() / JSON.parse(): Chuyển đổi qua lại giữa Object và String.
   */
  async generateTourPlan(userInput: any, dataset: any[]): Promise<any> {
    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    const provider = process.env.EXPO_PUBLIC_AI_PROVIDER;

    if (!apiKey || provider !== 'groq') {
      return {
        success: false,
        message: "Chưa cấu hình Groq API hoặc Provider không đúng."
      };
    }

    // BƯỚC 3: AI ĐỌC DATASET THÔNG QUA PROMPT
    const prompt = `
      Bạn là một chuyên gia thiết kế tour du lịch. 
      Khách hàng muốn đi đến ${userInput.destinations?.join(', ')} trong khoảng ${userInput.days} ngày.
      
      ĐÂY LÀ DATASET CÁC HOẠT ĐỘNG HIỆN CÓ (Bạn CHỈ ĐƯỢC DÙNG các hoạt động trong này):
      ${JSON.stringify(dataset)}
      
      Dựa vào Dataset trên, hãy tạo một lịch trình chi tiết dưới dạng JSON:
      [
        {
          "day": 1,
          "time": "08:00",
          "activityId": "ID của activity"
        }
      ]
      
      Chỉ trả về JSON hợp lệ, không giải thích gì thêm. Không bọc trong dấu nháy code block.
    `;

    try {
      // BƯỚC 4: GỌI API GROQ
      // Kiến thức JS: fetch() trả về một Response object, cần dùng .json() để lấy data
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Sử dụng model Llama 3.1 mới trên Groq
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2 // Đặt thấp để AI tuân thủ đúng định dạng JSON
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi gọi API Groq");
      }

      const aiText = data.choices[0]?.message?.content;
      
      // Kiến thức JS: JSON.parse() để chuyển chuỗi String từ AI trả về thành Object JS
      const result = JSON.parse(aiText.trim());

      return {
        success: true,
        data: result,
        message: "AI đã đọc Dataset và tạo lịch trình thành công!"
      };

    } catch (error) {
      console.error("Lỗi xử lý AI:", error);
      return {
        success: false,
        message: "Lỗi khi gọi AI hoặc parse dữ liệu",
        error: error.message
      };
    }
  }

  // Hàm xử lý Chat với AI để chỉnh sửa lịch trình
  // Kiến thức JS: async/await, JSON.stringify(), JSON.parse()
  async chatTourPlan(messages: any[], currentSchedule: any, dataset: any[]) {
    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        message: "Chưa cấu hình API Key cho AI"
      };
    }

    // Tạo prompt hệ thống để hướng dẫn AI cách trả lời và định dạng JSON
    const systemPrompt = `
      Bạn là một trợ lý ảo chuyên nghiệp về du lịch.
      Người dùng đang xem một lịch trình tour và muốn thay đổi nó.
      
      Dataset các hoạt động có sẵn:
      ${JSON.stringify(dataset, null, 2)}
      
      Lịch trình hiện tại:
      ${JSON.stringify(currentSchedule, null, 2)}
      
      Yêu cầu:
      1. Trả lời người dùng một cách thân thiện.
      2. Nếu người dùng yêu cầu thay đổi lịch trình (ví dụ: "Dời X sang chiều", "Xóa Y", "Thêm Z"), hãy thực hiện và trả về lịch trình mới.
      3. Phản hồi của bạn PHẢI là một JSON object có cấu trúc như sau:
      {
        "reply": "Câu trả lời của bạn cho người dùng (ví dụ: 'Tôi đã dời lịch giúp bạn rồi nhé!')",
        "updatedSchedule": { 
          "1-08:00": { "id": "act_1", "name": "..." },
          "1-14:00": { "id": "act_2", "name": "..." }
        }
      }
      Lưu ý: "updatedSchedule" chỉ trả về nếu có sự thay đổi so với lịch trình hiện tại, nếu không cần đổi thì để null hoặc không trả về.
      Cấu trúc key của updatedSchedule là "day-time" (ví dụ: "1-08:00").
      
      Chỉ trả về JSON hợp lệ, không giải thích gì thêm ngoài JSON.
    `;

    // Chuẩn bị mảng tin nhắn để gửi cho Groq (bao gồm cả system prompt)
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: groqMessages,
          temperature: 0.2
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi gọi API Groq");
      }

      const aiText = data.choices[0]?.message?.content;
      const result = JSON.parse(aiText.trim());

      return {
        success: true,
        reply: result.reply,
        updatedSchedule: result.updatedSchedule,
        message: "AI đã phản hồi thành công!"
      };

    } catch (error) {
      console.error("Lỗi xử lý AI Chat:", error);
      return {
        success: false,
        message: "Lỗi khi gọi AI Chat hoặc parse dữ liệu",
        error: error.message
      };
    }
  }
}
