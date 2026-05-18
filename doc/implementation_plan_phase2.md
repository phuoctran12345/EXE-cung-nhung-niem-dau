# Kế hoạch triển khai Phase 2: Tour Tự thiết kế & Tiếp thị

## 1. Mục tiêu
Mở rộng tính năng tự thiết kế tour (Private Tour), tích hợp hệ thống mã giảm giá (Voucher) và nâng cao khả năng quản lý vận hành (Xuất Excel, Duyệt đối tác, Quản lý review).

## 2. Các nhiệm vụ chi tiết

### 2.1. Tính năng Private Tour (Tour tự thiết kế)
- **Backend**:
  - [ ] Thiết kế Schema cho `PrivateTourRequest` (Khách hàng gửi yêu cầu).
  - [ ] Thiết kế Schema cho `PrivateTourQuote` (Nhà cung cấp báo giá).
  - [ ] API cho Khách hàng gửi yêu cầu.
  - [ ] API cho Nhà cung cấp xem danh sách yêu cầu và gửi báo giá.
  - [ ] API cho Khách hàng chấp nhận/từ chối báo giá.
- **Frontend**:
  - [ ] Tạo Form gửi yêu cầu Private Tour cho Khách hàng.
  - [ ] Giao diện danh sách yêu cầu và Form báo giá cho Nhà cung cấp.
  - [ ] Giao diện xem báo giá và xác nhận cho Khách hàng.

### 2.2. Hệ thống Voucher (Mã giảm giá)
- **Backend**:
  - [x] Thiết kế Schema cho `Voucher` (Mã, loại giảm giá, giá trị, điều kiện, hạn dùng...).
  - [x] API tạo Voucher (cho Nhà cung cấp).
  - [x] API áp dụng Voucher và tính toán lại tổng tiền (khi checkout).
- **Frontend**:
  - [x] Giao diện quản lý Voucher cho Nhà cung cấp.
  - [x] Ô nhập Voucher và hiển thị số tiền giảm trừ tại trang thanh toán.

### 2.3. Vận hành & Quản lý (Operations)
- **Backend**:
  - [ ] API xuất dữ liệu hóa đơn đặt tour ra file Excel (Dùng thư viện như `exceljs` hoặc tương đương).
  - [ ] API duyệt tài khoản đối tác (Admin).
  - [ ] API ẩn/hiện/xóa đánh giá (Admin).
- **Frontend**:
  - [ ] Nút "Xuất Excel" trong Owner Dashboard.
  - [ ] Giao diện duyệt đối tác trong Admin Dashboard.
  - [ ] Giao diện quản lý đánh giá trong Admin Dashboard.

## 3. Thứ tự ưu tiên gợi ý
1. Hoàn thiện luồng **Duyệt đối tác** (vì bạn đang làm dở phần `be-partner` ở frontend).
2. Phát triển hệ thống **Voucher** (tăng tính hấp dẫn cho người dùng).
3. Phát triển tính năng **Private Tour** (tính năng phức tạp nhất).
4. Tính năng **Xuất Excel** và **Quản lý review**.
