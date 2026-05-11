// "use client" – component hiển thị một node trong danh sách "Your Route"
"use client";

import Image from "next/image";
import { Clock, Plus, Minus } from "@phosphor-icons/react";

type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

interface RouteNodeProps {
  index: number; // vị trí thứ tự trong list
  dest: Destination;
  duration: { days: number; nights: number };
  onDurationChange: (days: number, nights: number) => void;
  dateRange?: string;
}

export default function RouteNode({ index, dest, duration, onDurationChange, dateRange }: RouteNodeProps) {
  return (
    <div className="flex items-center gap-4 relative z-10 group">
      {/* Số thứ tự vòng tròn */}
      <div className="w-[28px] h-[28px] rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 shadow-md">
        {index}
      </div>
      {/* Thông tin địa điểm */}
      <div className="flex flex-col gap-2 bg-[#E5E7EB]/70 hover:bg-[#E5E7EB] transition-colors p-3 rounded-xl w-full border border-gray-200/50">
        <div className="flex gap-3">
           <div className="relative w-[70px] h-[52px] rounded-lg overflow-hidden flex-shrink-0">
             <Image src={dest.image} alt={dest.name} fill className="object-cover" />
           </div>
           <div className="flex flex-col justify-center">
             <h4 className="font-bold text-[#1C2B38] text-[14px] leading-tight">{dest.name}</h4>
             {dateRange && (
               <span className="text-[12px] text-[#38BDF8] font-bold mt-1 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 w-fit">
                 {dateRange}
               </span>
             )}
             <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-1">
               <Clock size={11} weight="bold" />
               Duration {duration.days}D {duration.nights}N
             </p>
           </div>
        </div>
        
        {/* Buttons to edit duration */}
        <div className="flex items-center gap-4 mt-2 border-t border-gray-300/50 pt-2">
           <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-medium w-10">Days:</span>
              <button onClick={() => onDurationChange(Math.max(1, duration.days - 1), duration.nights)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#38BDF8]"><Minus size={10} weight="bold"/></button>
              <span className="text-[13px] font-bold w-4 text-center">{duration.days}</span>
              <button onClick={() => onDurationChange(duration.days + 1, duration.nights)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#38BDF8]"><Plus size={10} weight="bold"/></button>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-medium w-10">Nights:</span>
              <button onClick={() => onDurationChange(duration.days, Math.max(0, duration.nights - 1))} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#38BDF8]"><Minus size={10} weight="bold"/></button>
              <span className="text-[13px] font-bold w-4 text-center">{duration.nights}</span>
              <button onClick={() => onDurationChange(duration.days, duration.nights + 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#38BDF8]"><Plus size={10} weight="bold"/></button>
           </div>
        </div>
      </div>
    </div>
  );
}
