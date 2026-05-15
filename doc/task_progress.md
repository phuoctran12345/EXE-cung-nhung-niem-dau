# Task Progress - Travel Match Project

## Phase 1: Localization & Payment Integration (Hoàn thành 100%)

- [x] **Việt hóa toàn bộ giao diện người dùng**
  - [x] Chuyển đổi ngôn ngữ hiển thị sang tiếng Việt.
  - [x] Chuyển đổi đơn vị tiền tệ từ USD sang VNĐ.
  - [x] Định dạng ngày tháng, con số theo chuẩn Việt Nam.
- [x] **Tích hợp cổng thanh toán PayOS**
  - [x] Cấu hình biến môi trường và Merchant Key.
  - [x] Xử lý luồng tạo link thanh toán và Webhook.
  - [x] Sửa lỗi cấu hình khóa PayOS bị nhầm với Google Client ID.
- [x] **Dọn dẹp và làm đẹp dữ liệu**
  - [x] Cập nhật bộ Seed Data với các tour Việt Nam đặc sắc.
  - [x] Lưu trữ giá tiền trực tiếp bằng đơn vị VNĐ trong cơ sở dữ liệu.
- [x] **Nâng cấp trải nghiệm người dùng (UX)**
  - [x] Loại bỏ các thông báo `alert()` mặc định của trình duyệt.
  - [x] Thay thế bằng thông báo lỗi trực tiếp (Inline UI) trong Form đặt chỗ.
  - [x] Cập nhật Bảng điều khiển (Dashboard) cho Admin và Đối tác hiển thị doanh thu VNĐ.

## Phase 2: Responsive & Optimization (Tiếp theo)

- [ ] **Tối ưu hóa hiển thị di động (Responsive)**
  - [ ] Điều chỉnh lưới (Grid) hiển thị tour trên màn hình nhỏ.
  - [ ] Tối ưu hóa menu điều hướng di động.
- [ ] **Tăng tốc độ tải trang**
  - [ ] Tối ưu hóa kích thước hình ảnh.
  - [ ] Cấu hình Caching cho các truy vấn Tour phổ biến.
