"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, Car, Star, CaretRight } from "@phosphor-icons/react";

interface TourCardProps {
  id: number | string;
  title: string;
  location: string;
  price: string | number; // Chấp nhận cả chuỗi hoặc số từ cơ sở dữ liệu
  img: string;
  duration?: string;
  plan?: string;
  transport?: string;
  rating?: number;
}

export default function TourCard({
  id,
  title,
  location,
  price,
  img,
  duration = "1 ngày",
  plan = "Gói gia đình",
  transport = "Xe du lịch đời mới",
  rating = 4.8,
}: TourCardProps) {
  
  // Hàm xử lý định dạng hiển thị giá tiền VNĐ
  const formatPrice = (p: string | number) => {
    let numericPrice = 0;
    if (typeof p === "string") {
      // Loại bỏ các ký tự không phải số nếu đầu vào là chuỗi
      numericPrice = parseFloat(p.replace(/[^\d.]/g, ""));
    } else {
      numericPrice = p;
    }

    // Vì dữ liệu đã là VNĐ, chỉ cần định dạng phân tách hàng nghìn
    return numericPrice.toLocaleString("vi-VN") + " VNĐ";
  };

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col h-full text-left overflow-hidden group hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all">
      {/* Container Hình ảnh Tour */}
      <div className="p-3 pb-0 relative">
        <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden">
          <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          {/* Nhãn điểm đánh giá */}
          <div className="absolute top-0 left-0 bg-[#F5A524] text-white text-[11px] font-bold px-2 py-1 rounded-br-[12px] flex items-center gap-1 shadow-md">
            <Star weight="fill" size={12} /> {rating}
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 pb-4">
        {/* Địa điểm Tour */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
          <MapPin size={14} className="text-[#F5A524]" weight="fill" /> {location}
        </div>
        <Link href={`/tour/${id}`}>
          <h3 className="text-[18px] font-bold text-[#1E293B] mb-5 line-clamp-2 group-hover:text-[#38BDF8] transition-colors min-h-[54px]">{title}</h3>
        </Link>

        {/* Thông tin vắn tắt về Tour */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
            <Clock size={16} /> Thời lượng: {duration}
          </div>
          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
            <Users size={16} /> {plan}
          </div>
          <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
            <Car size={16} /> {transport}
          </div>
        </div>
      </div>

      {/* Phần chân thẻ hiển thị giá tiền VNĐ trực tiếp từ database */}
      <div className="bg-[#F8F9FA] pt-4 pb-4 px-5 flex items-center justify-between border-t border-gray-100">
        <div>
          <div className="text-[18px] font-black text-[#38BDF8] leading-none">{formatPrice(price)}</div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium italic">mỗi khách</div>
        </div>
        <Link href={`/tour/${id}`} className="text-[13px] font-bold text-[#F5A524] flex items-center gap-1 hover:underline">
          Đặt ngay <CaretRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
