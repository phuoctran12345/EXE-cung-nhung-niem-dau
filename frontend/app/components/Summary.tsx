// "use client" – component hiển thị phần Tổng kết (Summary) cuối cùng của tour
"use client";

import Image from "next/image";
import { CheckCircle } from "@phosphor-icons/react";

type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

interface SummaryProps {
  destinations: Destination[];
  onFinish: () => void; // Hành động khi người dùng hoàn thành (Xác nhận đặt tour)
}

export default function Summary({ destinations, onFinish }: SummaryProps) {
  return (
    <div className="bg-[#F3F4F6] rounded-[24px] border-[3px] border-[#38BDF8] p-7 max-w-[800px] mx-auto shadow-lg shadow-[#38BDF8]/10">
      <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-4 text-center">Tổng quan đơn hàng</h2>
      <p className="text-gray-500 mb-6 text-center">Kiểm tra lại toàn bộ thông tin chuyến đi của bạn</p>

      {/* Danh sách các điểm đến đã chọn trong hành trình */}
      <div className="space-y-4">
        {destinations.map((dest) => (
          <div key={dest.id} className="flex items-center gap-4 p-3 bg-white/70 rounded-xl border border-gray-100">
            <div className="relative w-[60px] h-[40px] rounded overflow-hidden flex-shrink-0">
              <Image src={dest.image} alt={dest.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#1C2B38] text-[14px]">{dest.name}</h4>
              <p className="text-gray-500 text-[12px]">{dest.location}</p>
            </div>
            <CheckCircle size={24} className="text-green-500" weight="fill" />
          </div>
        ))}
      </div>

      {/* Tổng thời gian của hành trình */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 px-2">
        <span className="font-semibold text-[#1C2B38]">Tổng thời gian dự kiến</span>
        <span className="font-bold text-[#38BDF8]">{destinations.length} Ngày {destinations.length - 1 > 0 ? destinations.length - 1 : 0} Đêm</span>
      </div>

      {/* Nút hoàn tất và thực hiện đặt tour */}
      <button
        className="w-full mt-8 bg-[#38BDF8] hover:bg-[#0284C7] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[#38BDF8]/20 text-[15px] uppercase tracking-widest hover:-translate-y-1 active:translate-y-0"
        onClick={onFinish}
      >
        Xác nhận & Đặt tour ngay
      </button>
    </div>
  );
}
