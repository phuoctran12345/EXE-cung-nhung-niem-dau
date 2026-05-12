# ĐẶC TẢ CHI TIẾT CHỨC NĂNG HỆ THỐNG TRAVELOFY (TOUR BOOKING PLATFORM)

## 1. Giới thiệu dự án
[cite_start]Travelofy là một nền tảng cung cấp dịch vụ đặt tour du lịch trực tuyến[cite: 1, 2]. [cite_start]Hệ thống cho phép người dùng tìm kiếm, đặt các tour cố định hoặc gửi yêu cầu thiết kế tour riêng (Private Tour) để tối ưu hóa trải nghiệm cá nhân[cite: 52, 57].

---

## 2. Nhóm chức năng dành cho Khách hàng (Customer/Guest)

### 2.1. Quản lý tài khoản (UC-01 -> UC-07)
* [cite_start]**Đăng nhập/Đăng ký**: Cho phép người dùng tạo tài khoản mới hoặc đăng nhập nhanh thông qua Google Authenticator[cite: 68, 73].
* [cite_start]**Quản lý hồ sơ**: Xem và cập nhật thông tin cá nhân, thay đổi ảnh đại diện[cite: 68, 83].
* [cite_start]**Quên mật khẩu**: Hỗ trợ khôi phục mật khẩu thông qua mã xác thực gửi về Email[cite: 79].

### 2.2. Tìm kiếm & Khám phá Tour (UC-08, UC-21)
* [cite_start]**Tìm kiếm Tour cố định**: Tìm kiếm theo địa điểm, số lượng người, ngày khởi hành và ngày kết thúc[cite: 68, 105].
* [cite_start]**Xem chi tiết Tour**: Hiển thị lịch trình (Itinerary), giá cả, các dịch vụ bao gồm và thông tin nhà cung cấp[cite: 135, 145].
* [cite_start]**Danh sách yêu thích**: Thêm hoặc xóa các tour quan tâm vào danh sách yêu thích để xem lại sau[cite: 125, 127].

### 2.3. Đặt Tour & Thanh toán (UC-11, UC-19)
* [cite_start]**Quy trình đặt Tour**: Khách hàng chọn tour, nhập số lượng hành khách và xác nhận thông tin[cite: 131].
* **Áp dụng Mã giảm giá (Voucher)**: Cho phép khách hàng chọn hoặc nhập mã voucher giảm giá (theo phần trăm hoặc giá tiền cố định) khi đặt tour để được giảm trừ trực tiếp trên hóa đơn.
* [cite_start]**Thanh toán trực tuyến**: Tích hợp nền tảng PayOS để thanh toán qua QR Code hoặc chuyển khoản ngân hàng[cite: 139].
* [cite_start]**Quản lý giao dịch**: Xem lịch sử các tour đã đặt và trạng thái thanh toán (All, Processing, Finished, Cancel)[cite: 81].
* [cite_start]**Hủy Tour**: Cho phép khách hàng hủy tour đã đặt (theo chính sách hoàn tiền) và chuyển trạng thái sang "Cancel"[cite: 107].

### 2.4. Chức năng Tour Private (Tự thiết kế) - *Mở rộng*
* [cite_start]**Gửi yêu cầu Custom**: Khách hàng điền thông tin về điểm đi, điểm đến mong muốn, ngân sách và yêu cầu đặc biệt[cite: 77].
* [cite_start]**Nhận báo giá**: Theo dõi các báo giá được gửi từ nhà cung cấp cho lịch trình riêng của mình[cite: 95].

---

## 3. Nhóm chức năng dành cho Nhà cung cấp (Tour Owner/Host)

### 3.1. Quản lý chương trình Tour & Khuyến mãi (UC-20, UC-24, UC-28)
* [cite_start]**Tạo Tour mới**: Đăng tải thông tin tour, lịch trình và hình ảnh minh họa[cite: 133].
* [cite_start]**Quản lý suất khởi hành**: Cập nhật ngày khởi hành cụ thể và số lượng chỗ còn trống[cite: 68, 143].
* [cite_start]**Quản lý dịch vụ đi kèm**: Thiết lập các dịch vụ bổ sung như hướng dẫn viên, xe đưa đón hoặc bữa ăn[cite: 87, 91].
* **Quản lý Voucher & Ưu đãi**: Phát hành mã giảm giá (voucher) linh hoạt theo % hoặc giá trị tiền mặt trực tiếp. Thiết lập thời gian hiệu lực, số lượng tối đa và điều kiện áp dụng tối thiểu (ví dụ: giá trị hóa đơn từ X đồng). Theo dõi hiệu quả sử dụng của các chiến dịch voucher.

### 3.2. Vận hành & Xử lý yêu cầu (UC-35, UC-38.3)
* [cite_start]**Xử lý Tour Private**: Tiếp nhận yêu cầu tự thiết kế từ khách hàng, xây dựng lịch trình và gửi báo giá[cite: 99].
* [cite_start]**Xem lịch trình tour**: Theo dõi lịch khởi hành của các đoàn khách trong tháng[cite: 111].
* [cite_start]**Quản lý hóa đơn & Tất toán**: Xem và xuất dữ liệu hóa đơn đặt tour dưới dạng file Excel[cite: 121]. Theo dõi doanh thu thực nhận sau khi đã tự động khấu trừ **10% phí hoa hồng nền tảng (Platform Commission)** chuyển cho Admin.

---

## 4. Nhóm chức năng dành cho Đối tác Cung ứng Dịch vụ (Service Partner)
*(Dành cho các đơn vị liên kết: Khách sạn/Resort, Nhà xe/Vận chuyển, Nhà hàng, Hướng dẫn viên tự do, Điểm vui chơi giải trí)*

### 4.1. Đăng ký & Hồ sơ Năng lực (UC-P01 -> UC-P04)
* **Đăng ký tài khoản doanh nghiệp**: Cung cấp hồ sơ pháp lý (Giấy phép kinh doanh, Mã số thuế, Chứng chỉ hành nghề) để Admin xét duyệt.
* **Quản lý hồ sơ năng lực**: Đăng tải hình ảnh, thông tin giới thiệu, vị trí, danh sách tiện ích và bảng giá dịch vụ cơ bản.
* **Cấu hình chính sách chiết khấu**: Thiết lập mức chiết khấu/hoa hồng ưu đãi (B2B rates) dành riêng cho các Công ty du lịch (Tour Owner) trên hệ thống.

### 4.2. Quản lý Kho dịch vụ & Lịch rảnh (UC-P05 -> UC-P08)
* **Quản lý danh mục dịch vụ**: Cập nhật thông tin chi tiết về phòng trống (Allotment), loại xe/số chỗ, thực đơn nhà hàng, hoặc khu vực hoạt động (đối với HDV).
* **Lịch trực quan (Inventory Calendar)**: Đồng bộ và cập nhật tình trạng trống theo thời gian thực để tránh tình trạng overbooking (trùng lịch).

### 4.3. Quy trình Hợp tác B2B (UC-P09 -> UC-P12)
* **Tiếp nhận & Phản hồi yêu cầu**: Nhận yêu cầu đặt dịch vụ (thuê xe, đặt phòng, đặt ăn, thuê HDV) từ các Công ty du lịch cho các tour cố định hoặc Private Tour. Hỗ trợ Xác nhận, Từ chối hoặc Đề xuất giá mới.
* **Quản lý hợp đồng & SLA**: Lưu trữ và ký kết hợp đồng điện tử, cam kết chất lượng dịch vụ (SLA) giữa hai bên.
* **Kênh trao đổi nội bộ (B2B Chat)**: Chat trực tiếp giữa Điều hành tour (Tour Owner) và Đối tác cung ứng để xử lý nhanh các phát sinh (đổi xe, đổi thực đơn, dời giờ đón...).

### 4.4. Vận hành & Đối soát tài chính (UC-P13 -> UC-P16)
* **Thông tin vận hành (Dispatching Info)**: Tài xế nhận danh sách khách, điểm đón; HDV nhận lịch trình chi tiết và chi phí tạm ứng; Nhà hàng nhận số lượng suất ăn và giờ phục vụ.
* **Xác nhận dịch vụ qua QR**: Quét mã QR hoặc xác nhận "Đã hoàn thành dịch vụ" trên hệ thống tại điểm đến để đồng bộ tiến độ tour thời gian thực về cho Công ty du lịch.
* **Đối soát công nợ & Thanh toán**: Tự động tổng hợp hóa đơn, doanh thu và đối soát định kỳ (tuần/tháng) với các công ty du lịch hoặc sàn Travelofy.

---

## 5. Nhóm chức năng dành cho Quản trị viên (Admin)

### 5.1. Phê duyệt & Kiểm soát (UC-38.1, UC-38.2)
* [cite_start]**Duyệt đối tác**: Kiểm tra hồ sơ pháp lý và phê duyệt tài khoản nhà cung cấp tour mới[cite: 95, 115].
* [cite_start]**Duyệt chương trình Tour**: Kiểm duyệt nội dung tour trước khi cho phép hiển thị công khai trên sàn[cite: 97].

### 5.2. Quản lý người dùng (UC-23, UC-40)
* [cite_start]**Khóa/Mở khóa tài khoản**: Xử lý các tài khoản khách hàng hoặc đối tác vi phạm quy định của nền tảng[cite: 117, 123].
* [cite_start]**Quản lý phản hồi**: Giám sát và xóa các đánh giá/phản hồi không phù hợp từ người dùng[cite: 68].

### 5.3. Quản lý Tài chính & Hoa hồng (UC-41 -> UC-43)
* **Khấu trừ hoa hồng 10%**: Tự động trích xuất **10% phí hoa hồng nền tảng** trên tổng giá trị của mỗi giao dịch đặt tour thành công trước khi thực hiện thanh toán phần còn lại cho Nhà cung cấp.
* **Đối soát & Thống kê doanh thu**: Theo dõi tổng doanh thu, biểu đồ dòng tiền hoa hồng thu về theo thời gian và quản lý trạng thái thanh toán đối soát chuyển tiền (payout) cho các Tour Owner.

---

## 6. Danh sách thông báo hệ thống (Application Messages)
* [cite_start]**MSG01**: "Sai email hoặc mật khẩu. Vui lòng thử lại"[cite: 180].
* [cite_start]**MSG29**: "Bạn có chắc chắn muốn hủy đặt tour này không? Hành động này không thể hoàn tác"[cite: 180].
* [cite_start]**MSG33**: "Bạn phải chọn ít nhất một tour/chỗ trước khi tiến hành đặt chỗ"[cite: 180].
* [cite_start]**MSG40**: "Email đã tồn tại! Vui lòng sử dụng email khác"[cite: 180].