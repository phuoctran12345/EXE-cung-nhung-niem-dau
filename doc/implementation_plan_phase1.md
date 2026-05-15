# Kế hoạch triển khai Phase 1: Localization & Payment

## 1. Mục tiêu

Chuyển đổi toàn bộ nền tảng Travel Match sang thị trường Việt Nam, tích hợp cổng thanh toán nội địa PayOS và tối ưu hóa dữ liệu mẫu.

## 2. Các thay đổi chính

### Dữ liệu & Cơ sở dữ liệu

- **Đơn vị tiền tệ**: Chuyển từ USD sang VNĐ làm đơn vị gốc trong DB.
- **Dữ liệu mẫu**: Sử dụng 6 tour "siêu phẩm" tại các địa điểm du lịch nổi tiếng của Việt Nam (Hạ Long, Sapa, Phú Quốc, Đà Nẵng, Ninh Bình, Hà Giang).

### Backend (NestJS)

- **PayOS Integration**: Sử dụng thư viện `@payos/node` để xử lý thanh toán.
- **Logic tiền tệ**: Loại bỏ tỷ giá hối đoái cứng trong code, sử dụng trực tiếp giá trị từ database để gửi yêu cầu thanh toán.
- **Xác thực**: Sửa lỗi nhầm lẫn khóa API giữa Google OAuth và PayOS trong `.env`.

### Frontend (Next.js)

- **UI/UX**:
  - Loại bỏ hoàn toàn `alert()` gây phiền toái.
  - Sử dụng `.toLocaleString('vi-VN')` để định dạng tiền tệ và ngày tháng.
  - Cập nhật Dashboards để báo cáo doanh thu theo VNĐ chính xác.

## 3. Quy trình thanh toán mới (VNĐ)

1. Người dùng chọn tour (Giá hiển thị: Ví dụ 5.000.000 VNĐ).
2. Hệ thống tạo Booking với trạng thái `pending`.
3. Backend gọi PayOS API với số tiền `amount: 5000000`.
4. Người dùng thanh toán qua VietQR.
5. PayOS gửi Webhook xác nhận -> Backend cập nhật trạng thái `paid` và trừ số lượng chỗ trống (`slots`).

## 4. Kiểm chứng

- [X] Chạy lệnh `npm run seed` thành công.
- [X] Kiểm tra hiển thị TourCard và TourDetail chính xác VNĐ.
- [X] Thử đặt tour và xác nhận link PayOS nhận đúng số tiền triệu VNĐ.
- [X] Kiểm tra báo cáo doanh thu trên Owner Dashboard.
