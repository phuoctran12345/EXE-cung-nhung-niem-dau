// "use client" – component hiển thị phần Summary cuối cùng của tour
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
  onFinish: () => void; // hành động khi người dùng hoàn thành (có thể chuyển trang hoặc lưu dữ liệu)
}

export default function Summary({ destinations, onFinish }: SummaryProps) {
  return (
    <div className="bg-[#F3F4F6] rounded-[24px] border-[3px] border-[#38BDF8] p-7 max-w-[800px] mx-auto shadow-lg shadow-[#38BDF8]/10">
      <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-4">Summary</h2>
      <p className="text-gray-500 mb-6">Tổng quan chuyến đi của bạn</p>

      {/* Danh sách các destination đã chọn */}
      <div className="space-y-4">
        {destinations.map((dest) => (
          <div key={dest.id} className="flex items-center gap-4 p-2 bg-[#E5E7EB]/70 rounded-lg">
            <div className="w-[60px] h-[40px] rounded overflow-hidden flex-shrink-0">
              <Image src={dest.image} alt={dest.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#1C2B38] text-[14px]">{dest.name}</h4>
              <p className="text-gray-500 text-[12px]">{dest.location}</p>
            </div>
            <CheckCircle size={20} className="text-[#38BDF8]" weight="fill" />
          </div>
        ))}
      </div>

      {/* Tổng thời gian – có thể tính động, hiện tại tạm thời */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="font-semibold text-[#1C2B38]">Total Time</span>
        <span className="font-bold text-[#38BDF8]">3 Days 2 Nights</span>
      </div>

      {/* Nút hoàn tất */}
      <button
        className="w-full mt-6 bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-4 rounded-xl transition-colors shadow-md text-[15px]"
        onClick={onFinish}
      >
        CONFIRM &amp; BOOK
      </button>
    </div>
  );
}
