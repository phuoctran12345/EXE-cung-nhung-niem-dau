// "use client" – component hiển thị phần Itinerary của chuyến đi
"use client";

import Image from "next/image";
import { Clock } from "@phosphor-icons/react";

type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

interface ItineraryProps {
  destinations: Destination[];
  onContinue: () => void; // chuyển sang bước Summary
}

export default function Itinerary({ destinations, onContinue }: ItineraryProps) {
  return (
    <div className="bg-[#F3F4F6] rounded-[24px] border-[3px] border-[#38BDF8] p-7 max-w-[800px] mx-auto shadow-lg shadow-[#38BDF8]/10">
      <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-4">Itinerary</h2>
      <p className="text-gray-500 mb-6">Lịch trình chi tiết cho các điểm đến đã chọn</p>

      {/* Danh sách các ngày */}
      <div className="space-y-6">
        {destinations.map((dest, idx) => (
          <div key={dest.id} className="flex items-center gap-4 p-4 bg-[#E5E7EB]/70 rounded-xl">
            <div className="w-[70px] h-[52px] rounded-lg overflow-hidden flex-shrink-0">
              <Image src={dest.image} alt={dest.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#1C2B38] text-[15px]">Day {idx + 1}: {dest.name}</h4>
              <p className="text-gray-500 text-[12px] flex items-center gap-1.5 mt-1">
                <Clock size={12} weight="bold" />
                Duration 1 day 1 night
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Nút chuyển sang Summary */}
      <button
        className="w-full mt-8 bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-4 rounded-xl transition-colors shadow-md text-[15px]"
        onClick={onContinue}
      >
        CONTINUE TO SUMMARY
      </button>
    </div>
  );
}
