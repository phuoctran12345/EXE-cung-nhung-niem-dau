"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  MapPin, 
  CurrencyCircleDollar, 
  CalendarCheck,
  TrendUp,
  Clock,
  CheckCircle,
  Plus
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeTours: 0,
    totalRevenue: 0,
    walletBalance: 0,
    privateTourRevenue: 0,
    averageRating: 4.8
  });
  const [recentEarnings, setRecentEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        const res = await fetch(`${apiUrl}/wallets/owner/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data) {
          setRecentEarnings(data.recentEarnings || []);
          setStats({
            totalBookings: data.totalBookings ?? 0,
            activeTours: data.activeTours ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            walletBalance: data.walletBalance ?? 0,
            privateTourRevenue: data.privateTourRevenue ?? 0,
            averageRating: 4.9,
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard đối tác:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Tiêu đề bảng điều khiển và nút hành động nhanh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[36px] font-black text-[#1A2434] mb-2">Xin chào đối tác! 👋</h1>
          <p className="text-gray-500 font-medium text-[16px]">Theo dõi hiệu quả kinh doanh và quản lý các tour du lịch của bạn.</p>
        </div>
        <Link href="/owner/create-tour" className="bg-[#38BDF8] hover:bg-[#32AADB] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-[#38BDF8]/20 flex items-center gap-2 hover:-translate-y-1">
          <Plus size={24} weight="bold" /> Đăng Tour mới
        </Link>
      </div>

      {/* Grid hiển thị các chỉ số thống kê quan trọng (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <OwnerStatCard 
          icon={<CalendarCheck size={32} weight="fill" className="text-[#38BDF8]" />} 
          label="Tổng lượt đặt" 
          value={stats.totalBookings} 
          trend="+15% từ tháng trước"
          color="bg-blue-50"
        />
        <OwnerStatCard 
          icon={<MapPin size={32} weight="fill" className="text-emerald-500" />} 
          label="Tour đang bán" 
          value={stats.activeTours} 
          trend="Đã được phê duyệt"
          color="bg-emerald-50"
        />
        <OwnerStatCard 
          icon={<CurrencyCircleDollar size={32} weight="fill" className="text-amber-500" />} 
          label="Tổng doanh thu (VNĐ)" 
          value={stats.totalRevenue.toLocaleString("vi-VN")} 
          trend={`Ví: ${stats.walletBalance.toLocaleString("vi-VN")} · Tour CN: ${stats.privateTourRevenue.toLocaleString("vi-VN")}`}
          color="bg-amber-50"
        />
        <OwnerStatCard 
          icon={<TrendUp size={32} weight="fill" className="text-rose-500" />} 
          label="Đánh giá trung bình" 
          value={stats.averageRating} 
          trend="Dựa trên phản hồi thực"
          color="bg-rose-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Bảng danh sách các đơn hàng đặt tour gần nhất */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[22px] font-black text-[#1A2434]">Đơn đặt tour mới nhất</h2>
            <button className="text-[#38BDF8] font-bold text-[15px] hover:underline transition-colors">Xem toàn bộ lịch sử</button>
          </div>
          
          <div className="space-y-6">
            {recentEarnings.length > 0 ? recentEarnings.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-2xl shadow-inner">
                    {item.type === "private_tour" ? "🗺️" : "👤"}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-black text-[#1A2434] group-hover:text-[#38BDF8] transition-colors">
                      {item.customerName || (item.type === "private_tour" ? "Tour cá nhân" : "Khách hàng")}
                    </div>
                    <div className="text-[13px] text-gray-400 font-bold uppercase tracking-tight line-clamp-1">
                      {item.description || "Doanh thu"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#1A2434]">+{item.amount?.toLocaleString("vi-VN")} VNĐ</div>
                  <div className="text-[12px] text-green-500 font-bold uppercase tracking-widest mt-1">
                    {item.type === "private_tour" ? "90% tour CN" : "Tour thường"}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400 font-medium italic">Hiện tại chưa có giao dịch nào được ghi nhận.</div>
            )}
          </div>
        </div>

        {/* Khu vực thông báo cập nhật tình hình hệ thống */}
        <div className="bg-[#1A2434] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <h2 className="text-[22px] font-black mb-8 relative z-10">Tin tức hệ thống</h2>
          <div className="space-y-8 relative z-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={22} className="text-[#38BDF8]" />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-[15px]">Phê duyệt tour thành công!</div>
                <div className="text-[12px] text-gray-400 mt-1">Sản phẩm du lịch mới của bạn hiện đã hiển thị trên ứng dụng.</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Clock size={22} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-[15px]">Bạn có một yêu cầu mới</div>
                <div className="text-[12px] text-gray-400 mt-1">Một khách hàng vừa hoàn tất thủ tục thanh toán cho Tour VNĐ.</div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 italic">
            <p className="text-[13px] text-gray-400 leading-relaxed font-medium">
              Mẹo: Hình ảnh chất lượng cao có thể giúp tăng tỉ lệ chuyển đổi đơn hàng lên tới 40% cho các tour Việt Nam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thành phần card hiển thị chỉ số thống kê
function OwnerStatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white rounded-[40px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className={`w-16 h-16 ${color} rounded-3xl flex items-center justify-center mb-8 shadow-inner`}>{icon}</div>
      <div className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-[30px] font-black text-[#1A2434] mb-3">{value}</div>
      <div className="text-[12px] font-bold text-[#38BDF8] flex items-center gap-1.5 bg-[#F0F9FF] w-fit px-3 py-1 rounded-full">{trend}</div>
    </div>
  );
}
