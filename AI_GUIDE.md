# HƯỚNG DẪN LÀM AI TOUR (ĐƠN GIẢN)

## 1. Cách hoạt động
*   **Frontend**: Gửi dữ liệu người dùng (điểm đến, số ngày) và danh sách hoạt động lên Backend.
*   **Backend**: Nhận dữ liệu, tạo câu lệnh (Prompt) và gửi cho AI (OpenAI/Gemini). AI trả về lịch trình dạng JSON.
*   **Frontend**: Nhận JSON và hiển thị lên màn hình.

## 2. Code mẫu gọi API từ Frontend
```javascript
// Hàm gọi AI
const goiAITour = async () => {
  try {
    // Kiến thức JS: Dùng fetch để gọi API (trả về một Promise)
    const res = await fetch('http://localhost:4001/api/ai/recommend-tour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: { destinations: ['Đà Lạt'], days: 3 },
        activities: [] // Truyền mảng hoạt động ở đây
      })
    });
    
    // Kiến thức JS: Chuyển response về dạng JSON
    const data = await res.json();
    console.log("Kết quả:", data);
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
```

## 3. Kiến thức JS ôn phỏng vấn 💡
*   **`async/await`**: Giúp viết code bất đồng bộ trông giống như đồng bộ, dễ đọc hơn. Bản chất vẫn dựa trên `Promise`.
*   **`JSON.stringify()`**: Chuyển Object thành chuỗi String để gửi qua mạng.
*   **`JSON.parse()`**: Chuyển chuỗi String nhận được về lại thành Object để dùng.

---
> [!IMPORTANT]
> **Nhắc nhở**: Nhớ luôn luôn comment code bằng **Tiếng Việt** trước khi xong task nhé!
