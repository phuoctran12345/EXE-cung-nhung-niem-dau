// "use client" – component hiển thị một destination trong Private Tour
"use client";

import Image from "next/image";
import type { FC } from "react";

type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

interface PrivateDestinationCardProps {
  dest: Destination;
  onSelect?: (dest: Destination) => void;
  isSelected?: boolean; // Prop mới để xác định trạng thái được chọn
}

const PrivateDestinationCard: FC<PrivateDestinationCardProps> = ({ dest, onSelect, isSelected }) => {
  return (
    <div
      className={`bg-[#F3F4F6] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border group cursor-pointer relative ${
        isSelected ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/20' : 'border-[#E5E7EB]/50'
      }`}
      onClick={() => onSelect && onSelect(dest)}
    >
      {/* Checkbox indicator khi được chọn */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#38BDF8] text-white flex items-center justify-center z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}
      
      <div className="relative h-[100px] w-full overflow-hidden">
        <Image src={dest.image} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-2 bg-[#F3F4F6]">
        <h3 className="font-bold text-[#1C2B38] text-[14px] mb-1">{dest.name}</h3>
        <p className="text-gray-500 text-[12px]">{dest.location}</p>
      </div>
    </div>
  );
};

export default PrivateDestinationCard;
