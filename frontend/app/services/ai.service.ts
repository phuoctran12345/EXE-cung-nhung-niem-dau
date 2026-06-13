const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Hàm gọi API để lấy gợi ý lịch trình từ AI
 * @param userInput Thông tin người dùng nhập (điểm đến, số ngày...)
 * @param activities Danh sách hoạt động có sẵn
 * Kiến thức JS: export const để dùng ở file khác, async/await để xử lý bất đồng bộ
 */
export const recommendTour = async (userInput: any, activities: any[]) => {
  try {
    const res = await fetch(`${API_URL}/ai/recommend-tour`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput, activities })
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi API recommendTour:", error);
    throw error;
  }
};

/**
 * Hàm gọi API để chat với AI và chỉnh sửa lịch trình
 * @param messages Lịch sử tin nhắn
 * @param currentSchedule Lịch trình hiện tại
 * @param dataset Danh sách hoạt động
 */
export const chatTour = async (messages: any[], currentSchedule: any, dataset: any[]) => {
  try {
    const res = await fetch(`${API_URL}/ai/chat-tour`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, currentSchedule, dataset })
    });
    return await res.json();
  } catch (error) {
    console.error("Lỗi API chatTour:", error);
    throw error;
  }
};
