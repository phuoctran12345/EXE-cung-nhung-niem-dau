// "use client" – Component hiển thị thanh bên tóm tắt lộ trình (Your Route Sidebar)
"use client";

import React from "react";
import RouteNode from "./RouteNode";
import StayRangePicker from "./StayRangePicker";

// Định nghĩa cấu trúc Destination cho đồng nhất dữ liệu
interface Destination {
  id: number;
  name: string;
  location: string;
  image: string;
}

interface YourRouteSidebarProps {
  activeStep: number;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  selectedDestinations: Destination[];
  durationMap: Record<number, { days: number; nights: number }>;
  onDurationChange: (id: number, days: number, nights: number) => void;
  dateRanges: Record<number, string>;
  getDaysAndNights: (start: Date | null, end: Date | null) => { days: number; nights: number };
  onContinue: () => void;
}

export default function YourRouteSidebar({
  activeStep,
  startDate,
  endDate,
  onDateChange,
  selectedDestinations,
  durationMap,
  onDurationChange,
  dateRanges,
  getDaysAndNights,
  onContinue,
}: YourRouteSidebarProps) {
  return (
    <div className="w-full lg:w-[420px] bg-[#F3F4F6] rounded-[24px] border-[3px] border-[#38BDF8] p-7 sticky top-24 shadow-lg shadow-[#38BDF8]/10 flex-shrink-0">
      {/* Tiêu đề góc nhìn tổng quan lộ trình */}
      <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-1">
        {activeStep === 1 ? "Your Route" : "Your Route Summary"}
      </h2>
      <p className="text-gray-400 text-sm mb-6 font-medium">
        {activeStep === 1 ? "Customize your stay duration" : "Review your chosen destinations"}
      </p>

      {/* Component chọn khoảng ngày lưu trú đã được bóc tách */}
      <StayRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={onDateChange}
      />

      {/* Danh sách các chặng dừng chân (Route Nodes) với kết nối đường kẻ dọc */}
      <div className="relative pl-[14px] space-y-6">
        {selectedDestinations.length > 0 && (
          <div className="absolute left-[27px] top-6 bottom-16 w-[2px] border-l-[2px] border-dashed border-[#38BDF8] z-0" />
        )}
        {selectedDestinations.map((dest, idx) => (
          <RouteNode 
            key={dest.id} 
            index={idx + 1} 
            dest={dest} 
            duration={durationMap[dest.id] || { days: 1, nights: 1 }}
            onDurationChange={(days, nights) => onDurationChange(dest.id, days, nights)}
            dateRange={dateRanges[dest.id]}
          />
        ))}
        {selectedDestinations.length === 0 && (
          <p className="text-[13.5px] text-gray-400 italic text-center py-4 select-none">
            Chưa có địa điểm dừng chân nào được chọn
          </p>
        )}
      </div>

      {/* Tổng thời gian (tính động dựa trên khoảng ngày đã chọn) */}
      <div className="mt-8 border-t-[1.5px] border-gray-300/80 pt-5 flex items-center justify-between">
        <span className="font-bold text-[#1C2B38] text-[15px]">Total Time</span>
        <span className="font-bold text-[#38BDF8] text-[15px]">
          {getDaysAndNights(startDate, endDate).days} Days {getDaysAndNights(startDate, endDate).nights} Nights
        </span>
      </div>

      {/* Nút tiếp tục bước kế tiếp */}
      <button
        className="w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-md text-[15px] select-none uppercase tracking-wide hover:scale-[1.01] duration-200"
        onClick={onContinue}
      >
        {activeStep === 1 && "CONTINUE TO ACTIVITIES"}
        {activeStep === 2 && "CONTINUE TO ITINERARY"}
      </button>
    </div>
  );
}
