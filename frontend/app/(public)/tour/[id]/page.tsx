"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Clock, 
  Users, 
  CalendarBlank, 
  Star, 
  CheckCircle, 
  ArrowLeft,
  ShareNetwork,
  Heart,
  CurrencyDollar,
  ShieldCheck,
  WarningCircle
} from "@phosphor-icons/react";
import Link from "next/link";
import BookingForm from "../../../components/BookingForm";

interface TourDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  slots: number;
  images: string[];
  itinerary: string[];
  dates: string[];
  duration?: string;
}

export default function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchTourDetail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        const res = await fetch(`${apiUrl}/tours/${id}`);
        const data = await res.json();
        setTour(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết tour:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTourDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!tour) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy Tour</h2>
      <Link href="/tours" className="text-[#38BDF8] font-bold flex items-center gap-2 hover:underline">
        <ArrowLeft size={20} /> Quay lại danh sách tour
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Thanh điều hướng và hành động phía trên */}
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/tours" className="flex items-center gap-2 text-gray-600 font-bold hover:text-black transition-colors">
          <ArrowLeft size={20} /> Quay lại kết quả
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Đã sao chép đường dẫn Tour vào clipboard!');
            }}
            className="p-2.5 rounded-full border border-gray-200 hover:bg-[#F0F9FF] hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <ShareNetwork size={22} />
          </button>
          <button 
            onClick={() => alert('Đã thêm Tour này vào danh sách yêu thích!')}
            className="p-2.5 rounded-full border border-gray-200 hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Heart size={22} />
          </button>
        </div>
      </div>

      {/* Bộ sưu tập hình ảnh Tour thiết kế lưới hiện đại */}
      <div className="max-w-[1200px] mx-auto px-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[500px]">
          <div className="md:col-span-2 md:row-span-2 relative rounded-[24px] overflow-hidden shadow-lg">
            <Image 
              src={tour.images?.[0] || "https://picsum.photos/seed/t1/1200/800"} 
              alt={tour.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="relative rounded-[24px] overflow-hidden shadow-md">
            <Image src={tour.images?.[1] || "https://picsum.photos/seed/t2/600/400"} alt="Gallery" fill className="object-cover" />
          </div>
          <div className="relative rounded-[24px] overflow-hidden shadow-md">
            <Image src={tour.images?.[2] || "https://picsum.photos/seed/t3/600/400"} alt="Gallery" fill className="object-cover" />
          </div>
          <div className="relative rounded-[24px] overflow-hidden shadow-md">
            <Image src={tour.images?.[3] || "https://picsum.photos/seed/t4/600/400"} alt="Gallery" fill className="object-cover" />
          </div>
          <div className="relative rounded-[24px] overflow-hidden shadow-md group cursor-pointer">
            <Image src={tour.images?.[4] || "https://picsum.photos/seed/t5/600/400"} alt="Gallery" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg group-hover:bg-black/50 transition-colors">
              + Xem tất cả
            </div>
          </div>
        </div>
      </div>

      {/* Phần nội dung chi tiết của Tour */}
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row gap-12">
        {/* Bên trái: Thông tin Tour, Mô tả và Lịch trình */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[#F5A524] font-bold text-[14px] mb-2">
            <Star weight="fill" /> 4.9 (124 đánh giá)
          </div>
          <h1 className="text-[36px] font-bold text-[#1E293B] mb-4 leading-tight">{tour.title}</h1>
          <div className="flex items-center gap-4 text-gray-500 font-medium mb-8">
            <div className="flex items-center gap-1.5"><MapPin size={20} weight="fill" className="text-[#38BDF8]" /> {tour.location}</div>
            <div className="flex items-center gap-1.5"><Clock size={20} weight="fill" className="text-[#38BDF8]" /> {tour.duration || "2 Ngày"}</div>
          </div>

          {/* Các tiện ích và thông tin nhanh */}
          <div className="border-t border-b border-gray-100 py-8 mb-10 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F0F9FF] rounded-full flex items-center justify-center text-[#38BDF8]"><Users size={24} /></div>
              <div>
                <div className="text-[14px] text-gray-400 font-bold uppercase">Số lượng tối đa</div>
                <div className="text-[16px] text-black font-bold">{tour.slots} người</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFF7ED] rounded-full flex items-center justify-center text-[#F5A524]"><CalendarBlank size={24} /></div>
              <div>
                <div className="text-[14px] text-gray-400 font-bold uppercase">Ngày khởi hành</div>
                <div className="text-[16px] text-black font-bold">{tour.dates?.[0] ? new Date(tour.dates[0]).toLocaleDateString('vi-VN') : "Linh hoạt"}</div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold text-[#1E293B] mb-4">Mô tả chi tiết</h3>
            <p className="text-gray-600 leading-relaxed text-[17px] whitespace-pre-line">
              {tour.description}
            </p>
          </div>

          {/* Hiển thị lộ trình chuyến đi theo từng bước */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-[#1E293B] mb-6">Lịch trình chuyến đi</h3>
            <div className="space-y-6">
              {tour.itinerary?.length > 0 ? tour.itinerary.map((step, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#38BDF8] text-white flex items-center justify-center font-bold z-10">
                      {idx + 1}
                    </div>
                    {idx !== tour.itinerary.length - 1 && <div className="w-[2px] flex-1 bg-gray-100 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <h4 className="text-[18px] font-bold text-[#1E293B] mb-2">Hoạt động Ngày {idx + 1}</h4>
                    <p className="text-gray-600 text-[16px] leading-relaxed">{step}</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 italic">Hiện chưa có chi tiết lịch trình.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bên phải: Thẻ hiển thị giá tiền và Nút đặt tour (Sticky) */}
        <div className="lg:w-[380px]">
          <div className="sticky top-10 bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-[14px] text-gray-400 font-bold block mb-1">Giá trọn gói</span>
                <span className="text-[26px] font-black text-[#38BDF8]">
                  {tour.price?.toLocaleString("vi-VN")} VNĐ
                </span>
                <span className="text-[16px] text-gray-400 font-medium ml-1">/ khách</span>
              </div>
              <div className="text-right">
                <span className="text-[12px] text-white bg-[#F5A524] px-3 py-1 rounded-full font-bold shadow-md">Hot Deal</span>
              </div>
            </div>

            <button 
              onClick={() => setIsBookingOpen(true)}
              className="w-full bg-[#1A2434] hover:bg-black text-white py-4 rounded-full font-bold text-[18px] transition-all shadow-xl hover:-translate-y-1 mb-6"
            >
              Đặt Tour Ngay
            </button>

            {/* Các cam kết bảo mật và hỗ trợ */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-[15px] font-medium text-gray-600">
                <ShieldCheck size={20} className="text-green-500" /> Thanh toán an toàn VNĐ qua PayOS
              </div>
              <div className="flex items-center gap-3 text-[15px] font-medium text-gray-600">
                <CheckCircle size={20} className="text-green-500" /> Xác nhận chỗ tức thì
              </div>
              <div className="flex items-center gap-3 text-[15px] font-medium text-gray-600">
                <WarningCircle size={20} className="text-amber-500" /> Hỗ trợ khách hàng 24/7
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đặt tour hiện ra khi bấm đặt ngay */}
      <BookingForm 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        tour={tour} 
        participants={1} 
      />
    </div>
  );
}
