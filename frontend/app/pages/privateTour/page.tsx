// "use client" để dùng state và các event phía client
"use client";

import Image from "next/image";
import { useState } from "react";
import { MagnifyingGlass, Plus, Clock } from "@phosphor-icons/react";

// Dữ liệu mock cho các điểm đến (Destinations)
const DESTINATIONS = [
  { id: 1, name: "Thua Thien Hue", location: "Viet Nam", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 2, name: "Da Nang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80" },
  { id: 3, name: "Ha Giang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 4, name: "Mang Den", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 5, name: "Ca Mau", location: "Viet Nam", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 6, name: "Kien Trung Palace", location: "Thua Thien Hue", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
];

export default function PrivateTourPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#E5E7EB] pt-8 pb-20 font-sans text-[#1E293B]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 flex flex-col gap-10">
        
        {/* Stepper điều hướng các bước thiết kế tour */}
        <div className="bg-[#F3F4F6] border border-gray-300/80 rounded-[20px] px-10 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] max-w-[800px] mx-auto w-full relative">
          {/* Step 1: Route (Active) */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-7 h-7 rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-sm font-bold shadow-md">1</div>
            <span className="text-[#38BDF8] font-bold text-[15px]">Route</span>
            <div className="absolute -bottom-[22px] left-0 w-full h-[3px] bg-[#38BDF8] rounded-t-md"></div>
          </div>
          
          <div className="h-[1px] flex-1 mx-4 lg:mx-8 bg-gray-300"></div>
          
          {/* Step 2: Activity */}
          <div className="flex items-center gap-3 text-gray-400 relative z-10">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</div>
            <span className="font-medium text-[15px]">Activity</span>
          </div>
          
          <div className="h-[1px] flex-1 mx-4 lg:mx-8 bg-gray-300"></div>
          
          {/* Step 3: Itinerary */}
          <div className="flex items-center gap-3 text-gray-400 relative z-10">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
            <span className="font-medium text-[15px]">Itinerary</span>
          </div>
          
          <div className="h-[1px] flex-1 mx-4 lg:mx-8 bg-gray-300"></div>
          
          {/* Step 4: Summary */}
          <div className="flex items-center gap-3 text-gray-400 relative z-10">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">4</div>
            <span className="font-medium text-[15px]">Summary</span>
          </div>
        </div>

        {/* Nội dung chính: 2 cột (Trái: Danh sách điểm đến, Phải: Tuyến đường đã chọn) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-4">
          
          {/* Cột trái: Tìm kiếm và Danh sách */}
          <div className="flex-1 w-full">
            <h1 className="text-4xl lg:text-[42px] font-bold text-[#1C2B38] mb-3 font-serif tracking-tight">Design Your Route</h1>
            <p className="text-gray-500 text-[17px] mb-8">Discover and select destinations for your dream journey</p>

            {/* Ô tìm kiếm điểm đến */}
            <div className="relative mb-8 shadow-sm rounded-full">
              <input 
                type="text" 
                placeholder="Search for a city (e.g., Da Lat, Nha Trang...)" 
                className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#38BDF8] rounded-full py-4 pl-7 pr-12 text-[15px] focus:outline-none transition-colors text-[#1C2B38] font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlass size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Grid danh sách điểm đến */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DESTINATIONS.map(dest => (
                <div key={dest.id} className="bg-[#F3F4F6] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB]/50 group cursor-pointer">
                  <div className="relative h-[150px] w-full overflow-hidden">
                    <Image src={dest.image} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 bg-[#F3F4F6]">
                    <h3 className="font-bold text-[#1C2B38] text-[16px] mb-1">{dest.name}</h3>
                    <p className="text-gray-500 text-[13px]">{dest.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang (Pagination) */}
            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"></div>
                <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]"></div>
                <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]"></div>
                <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]"></div>
                <span className="text-[#F5A524] mx-1">-</span>
                <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]"></div>
              </div>
              <div className="flex items-center gap-[19px] mt-2 text-[13px] text-[#F5A524] font-bold">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span className="ml-[14px] text-lg font-normal">&gt;</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Your Route (Lịch trình đã chọn) */}
          <div className="w-full lg:w-[420px] bg-[#F3F4F6] rounded-[24px] border-[3px] border-[#38BDF8] p-7 sticky top-24 shadow-lg shadow-[#38BDF8]/10">
            <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-1">Your Route</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">Drag to reorder destinations</p>

            <div className="relative pl-[14px] space-y-6">
              {/* Đường nối dọc (Line) */}
              <div className="absolute left-[27px] top-6 bottom-16 w-[2px] border-l-[2px] border-dashed border-[#38BDF8] z-0"></div>

              {/* Node 1: Thừa Thiên Huế */}
              <div className="flex items-center gap-4 relative z-10 group cursor-pointer">
                <div className="w-[28px] h-[28px] rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 shadow-md">1</div>
                <div className="flex gap-3 bg-[#E5E7EB]/70 hover:bg-[#E5E7EB] transition-colors p-2.5 rounded-xl w-full border border-gray-200/50">
                  <div className="relative w-[70px] h-[52px] rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={DESTINATIONS[0].image} alt="Hue" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-[#1C2B38] text-[15px]">{DESTINATIONS[0].name}</h4>
                    <p className="text-gray-500 text-[12px] flex items-center gap-1.5 mt-1">
                      <Clock size={12} weight="bold" />
                      Duration 1 day 1 night
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 2: Đà Nẵng */}
              <div className="flex items-center gap-4 relative z-10 group cursor-pointer">
                <div className="w-[28px] h-[28px] rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 shadow-md">2</div>
                <div className="flex gap-3 bg-[#E5E7EB]/70 hover:bg-[#E5E7EB] transition-colors p-2.5 rounded-xl w-full border border-gray-200/50">
                  <div className="relative w-[70px] h-[52px] rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={DESTINATIONS[1].image} alt="Da Nang" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-[#1C2B38] text-[15px]">{DESTINATIONS[1].name}</h4>
                    <p className="text-gray-500 text-[12px] flex items-center gap-1.5 mt-1">
                      <Clock size={12} weight="bold" />
                      Duration 1 day 1 night
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 3: Hội An */}
              <div className="flex items-center gap-4 relative z-10 group cursor-pointer">
                <div className="w-[28px] h-[28px] rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0 shadow-md">3</div>
                <div className="flex gap-3 bg-[#E5E7EB]/70 hover:bg-[#E5E7EB] transition-colors p-2.5 rounded-xl w-full border border-gray-200/50">
                  <div className="relative w-[70px] h-[52px] rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={DESTINATIONS[2].image} alt="Hoi An" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-[#1C2B38] text-[15px]">Hoi An</h4>
                    <p className="text-gray-500 text-[12px] flex items-center gap-1.5 mt-1">
                      <Clock size={12} weight="bold" />
                      Duration 1 day
                    </p>
                  </div>
                </div>
              </div>

              {/* Node 4: Add next destination */}
              <div className="flex items-center gap-4 relative z-10 pt-2">
                <div className="w-[28px] h-[28px] rounded-full border-[1.5px] border-gray-400 bg-[#F3F4F6] text-gray-400 flex items-center justify-center text-[13px] font-bold flex-shrink-0">4</div>
                <button className="flex items-center justify-center gap-2 border-[1.5px] border-dashed border-gray-300 rounded-xl py-3.5 w-full text-gray-500 text-[14px] font-medium hover:bg-gray-200/50 hover:text-[#38BDF8] hover:border-[#38BDF8]/50 transition-all">
                  <Plus size={16} weight="bold" />
                  Add next destination
                </button>
              </div>
            </div>

            {/* Tổng thời gian */}
            <div className="mt-8 border-t-[1.5px] border-gray-300/80 pt-5 flex items-center justify-between">
              <span className="font-bold text-[#1C2B38] text-[15px]">Total Time</span>
              <span className="font-bold text-[#38BDF8] text-[15px]">3 Days 2 Nights</span>
            </div>

            {/* Nút tiếp tục */}
            <button className="w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-md text-[15px]">
              CONTINUE TO ACTIVITIES
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
