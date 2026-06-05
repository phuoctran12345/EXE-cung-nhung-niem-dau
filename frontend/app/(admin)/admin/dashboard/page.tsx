"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  CurrencyDollar, 
  MapPin, 
  TrendUp,
  Clock,
  CheckCircle,
  WarningCircle
} from "@phosphor-icons/react";
import Image from "next/image";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTours: 0,
    pendingTours: 0,
    totalRevenue: 0,
    totalGmv: 0,
    platformBalance: 0,
  });
  const [recentFees, setRecentFees] = useState<any[]>([]);
  const [recentTours, setRecentTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        
        // 1. Lấy danh sách toàn bộ các tour
        const resTours = await fetch(`${apiUrl}/tours/admin/all`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const tours = await resTours.json();

        // 2. Lấy danh sách toàn bộ người dùng để đếm số lượng thực tế
        const resUsers = await fetch(`${apiUrl}/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const users = await resUsers.json();

        const resWalletStats = await fetch(`${apiUrl}/wallets/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const walletStats = resWalletStats.ok ? await resWalletStats.json() : {};

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalTours: Array.isArray(tours) ? tours.length : 0,
          pendingTours: Array.isArray(tours)
            ? tours.filter((t: any) => t.status === "pending").length
            : 0,
          totalRevenue: Number(walletStats.platformRevenue) || 0,
          totalGmv: Number(walletStats.totalGmv) || 0,
          platformBalance: Number(walletStats.platformBalance) || 0,
        });
        setRecentFees(Array.isArray(walletStats.recentPlatformFees) ? walletStats.recentPlatformFees : []);
        if (Array.isArray(tours)) {
          setRecentTours(tours.slice(0, 5));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard quản trị:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatVND = (n?: number) => (Number(n) || 0).toLocaleString("vi-VN");

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Chào buổi sáng, Quản trị viên!</h1>
        <p className="text-gray-500 font-medium">Cập nhật nhanh tình hình hoạt động của toàn bộ hệ thống Travel Match.</p>
      </div>

      {/* Grid thống kê các chỉ số kinh doanh then chốt với đơn vị VNĐ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<Users size={32} weight="fill" className="text-[#38BDF8]" />} 
          label="Tổng Người dùng" 
          value={stats.totalUsers} 
          trend="+12% so với tháng trước"
          color="bg-blue-50"
        />
        <StatCard 
          icon={<MapPin size={32} weight="fill" className="text-green-500" />} 
          label="Tổng số Tour" 
          value={stats.totalTours} 
          trend="Đang hoạt động trên sàn"
          color="bg-green-50"
        />
        <StatCard 
          icon={<WarningCircle size={32} weight="fill" className="text-amber-500" />} 
          label="Tour chờ duyệt" 
          value={stats.pendingTours} 
          trend="Cần xử lý phê duyệt ngay"
          color="bg-amber-50"
        />
        <StatCard 
          icon={<CurrencyDollar size={32} weight="fill" className="text-purple-500" />} 
          label="Phí sàn 10% (VNĐ)" 
          value={formatVND(stats.totalRevenue)} 
          trend={`GMV: ${formatVND(stats.totalGmv)} · Ví: ${formatVND(stats.platformBalance)}`}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bảng danh sách các sản phẩm du lịch vừa cập nhật */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1E293B]">Sản phẩm mới cập nhật</h2>
            <button className="text-[#38BDF8] font-bold text-sm hover:underline transition-colors">Quản lý toàn bộ</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-4 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Thông tin chi tiết Tour</th>
                  <th className="pb-4 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                  <th className="pb-4 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTours.map((tour) => (
                  <tr key={tour._id} className="group">
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                          <Image src={tour.images?.[0] || "https://picsum.photos/seed/t1/100/100"} alt="" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <div className="font-bold text-[#1E293B] group-hover:text-[#38BDF8] transition-colors">{tour.title}</div>
                          <div className="text-[12px] text-gray-400 font-medium">{tour.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-gray-500 text-[14px] font-medium">
                      {new Date(tour.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-5">
                      <StatusBadge status={tour.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khu vực theo dõi nhật ký hoạt động của toàn bộ hệ thống */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#1E293B] mb-8">Hoạt động hệ thống</h2>
          <div className="space-y-8">
            <ActivityItem icon={<CheckCircle size={20} className="text-green-500" />} title="Sản phẩm du lịch mới được duyệt" time="2 phút trước" />
            <ActivityItem icon={<Users size={20} className="text-[#38BDF8]" />} title="Thành viên mới đăng ký hệ thống" time="15 phút trước" />
            {recentFees.length > 0 ? recentFees.slice(0, 3).map((fee) => (
              <ActivityItem
                key={fee.id}
                icon={<TrendUp size={20} className="text-purple-500" />}
                title={`Phí sàn +${fee.amount?.toLocaleString("vi-VN")} VNĐ`}
                time={fee.createdAt ? new Date(fee.createdAt).toLocaleString("vi-VN") : "—"}
              />
            )) : (
              <ActivityItem icon={<TrendUp size={20} className="text-purple-500" />} title="Chưa có phí sàn từ tour cá nhân" time="—" />
            )}
            <ActivityItem icon={<Clock size={20} className="text-amber-500" />} title="Yêu cầu thanh toán từ Đối tác" time="3 giờ trước" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Thành phần card thống kê dành cho quản trị viên
function StatCard({ icon, label, value, trend, color }: any) {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>{icon}</div>
      <div className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[24px] font-black text-[#1E293B] mb-2">{value}</div>
      <div className="text-[12px] font-bold text-green-500">{trend}</div>
    </div>
  );
}

// Huy hiệu hiển thị trạng thái của các tour
function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { color: "text-amber-600 bg-amber-50", text: "Chờ phê duyệt" },
    approved: { color: "text-green-600 bg-green-50", text: "Đang hoạt động" },
    rejected: { color: "text-red-600 bg-red-50", text: "Bị từ chối" },
  };
  const config = configs[status] || configs.pending;
  return <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${config.color}`}>{config.text}</span>;
}

// Thành phần hiển thị từng mục hoạt động trong nhật ký
function ActivityItem({ icon, title, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">{icon}</div>
      <div className="flex flex-col">
        <div className="text-[14px] font-bold text-[#1E293B] leading-tight">{title}</div>
        <div className="text-[12px] text-gray-400 mt-1 font-medium">{time}</div>
      </div>
    </div>
  );
}
