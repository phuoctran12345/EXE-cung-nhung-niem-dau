"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlass, 
  Funnel, 
  Check, 
  X,
  Eye,
  MapPin,
  CalendarBlank,
  Tag
} from "@phosphor-icons/react";
import Image from "next/image";

interface Tour {
  _id: string;
  title: string;
  location: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  images: string[];
}

export default function AdminTourManagement() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      const token = localStorage.getItem("token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        const res = await fetch(`${apiUrl}/tours/admin/all`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setTours(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Hàm gọi API cập nhật trạng thái
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
      const res = await fetch(`${apiUrl}/tours/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        setTours(tours.map(t => t._id === id ? { ...t, status } : t));
        alert(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} tour thành công!`);
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message || "Bạn không có quyền thực hiện hoặc lỗi server."}`);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Đã xảy ra lỗi mạng khi cập nhật!");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Kiểm duyệt Tour</h1>
        <p className="text-gray-500 font-medium">Quản lý và phê duyệt các tour du lịch mới được đăng tải từ các đối tác.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên tour hoặc địa điểm..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none text-[15px]"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#F8F9FA] rounded-xl text-gray-600 font-bold text-[14px] hover:bg-gray-100 transition-colors">
            <Funnel size={18} /> Tất cả trạng thái
          </button>
        </div>
      </div>

      {/* Grid Danh sách Tour */}
      <div className="grid grid-cols-1 gap-6">
        {tours.map((tour) => (
          <div key={tour._id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center group hover:shadow-md transition-all">
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-inner bg-gray-100 flex items-center justify-center">
              {tour.images && tour.images.length > 0 ? (
                <Image src={tour.images[0]} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-gray-400 text-sm font-medium">Chưa có ảnh</span>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <StatusBadge status={tour.status} />
                <span className="text-[12px] text-gray-400 font-bold flex items-center gap-1">
                  <CalendarBlank size={14} /> {new Date(tour.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h3 className="text-[20px] font-extrabold text-[#1E293B] mb-2">{tour.title}</h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[14px] text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><MapPin size={18} weight="fill" className="text-[#38BDF8]" /> {tour.location}</span>
                {/* Đổi từ $ sang VNĐ theo yêu cầu của người dùng */}
                <span className="flex items-center gap-1.5"><Tag size={18} weight="fill" className="text-green-500" /> {tour.price.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
              <button className="p-3 text-gray-400 hover:text-[#38BDF8] hover:bg-blue-50 rounded-xl transition-all" title="Xem chi tiết">
                <Eye size={24} weight="bold" />
              </button>
              {tour.status === 'pending' && (
                <>
                  <button 
                    onClick={() => updateStatus(tour._id, 'approved')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all"
                  >
                    <Check size={20} weight="bold" /> Phê duyệt
                  </button>
                  <button 
                    onClick={() => updateStatus(tour._id, 'rejected')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-5 py-3 rounded-xl font-bold transition-all"
                  >
                    <X size={20} weight="bold" /> Từ chối
                  </button>
                </>
              )}
              {tour.status !== 'pending' && (
                <button className="text-[13px] font-bold text-gray-400 cursor-default px-4 py-2 bg-gray-50 rounded-lg">
                  Đã xử lý
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { color: "text-amber-600 bg-amber-50", text: "Chờ phê duyệt" },
    approved: { color: "text-green-600 bg-green-50", text: "Đã hoạt động" },
    rejected: { color: "text-red-600 bg-red-50", text: "Đã từ chối" },
  };
  const config = configs[status] || configs.pending;
  return <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${config.color}`}>{config.text}</span>;
}
