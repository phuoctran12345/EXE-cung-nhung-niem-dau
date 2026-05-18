"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlass, 
  Plus, 
  MapPin,
  CalendarBlank,
  Tag,
  PencilSimple,
  Trash
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

interface Tour {
  _id: string;
  title: string;
  location: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  images: string[];
}

export default function OwnerToursManagement() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách tour của chủ sở hữu
  useEffect(() => {
    const fetchTours = async () => {
      const token = localStorage.getItem("token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        const res = await fetch(`${apiUrl}/tours/owner/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        // Kiểm tra an toàn trước khi set state
        if (Array.isArray(data)) {
          setTours(data);
        } else {
          setTours([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Quản lý Tour của tôi</h1>
          <p className="text-gray-500 font-medium">Xem danh sách và trạng thái các tour du lịch bạn đã đăng.</p>
        </div>
        <Link href="/owner/create-tour" className="bg-[#38BDF8] hover:bg-[#32AADB] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#38BDF8]/20 flex items-center gap-2 hover:-translate-y-1">
          <Plus size={20} weight="bold" /> Đăng Tour mới
        </Link>
      </div>

      {/* Toolbar tìm kiếm */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên tour..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none text-[15px]"
          />
        </div>
      </div>

      {/* Danh sách Tour */}
      {tours.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Chưa có tour nào</h3>
          <p className="text-gray-500 mb-6">Bạn chưa đăng tải tour du lịch nào trên hệ thống.</p>
          <Link href="/owner/create-tour" className="inline-flex items-center gap-2 text-[#38BDF8] font-bold hover:underline">
            Đăng tour đầu tiên ngay <Plus size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tours.map((tour) => (
            <div key={tour._id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center group hover:shadow-md transition-all">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-inner bg-gray-100 flex items-center justify-center">
                {tour.images && tour.images.length > 0 ? (
                  <Image src={tour.images[0]} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  {/* Sử dụng VNĐ và toLocaleString theo định dạng vi-VN như đã thống nhất */}
                  <span className="flex items-center gap-1.5"><Tag size={18} weight="fill" className="text-green-500" /> {tour.price.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              {/* Các nút hành động */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                <button className="p-3 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Chỉnh sửa">
                  <PencilSimple size={22} weight="bold" />
                </button>
                <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xóa">
                  <Trash size={22} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component hiển thị trạng thái bằng tiếng Việt
function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { color: "text-amber-600 bg-amber-50 border-amber-100", text: "Đang chờ duyệt" },
    approved: { color: "text-green-600 bg-green-50 border-green-100", text: "Đã duyệt" },
    rejected: { color: "text-red-600 bg-red-50 border-red-100", text: "Bị từ chối" },
  };
  const config = configs[status] || configs.pending;
  return <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${config.color}`}>{config.text}</span>;
}
