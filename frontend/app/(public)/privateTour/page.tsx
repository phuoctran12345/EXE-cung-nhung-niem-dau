"use client";

import Image from "next/image";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import Stepper from "../../components/Stepper";
import { Itinerary, Summary } from "../../components/Stepper"; 
import PrivateDestinationCard from "../../components/PrivateDestinationCard";
import YourRouteSidebar from "../../components/YourRouteSidebar";
import { formatVND, Activity } from "../../data/mockData";
import { useEffect } from "react"; 

// Định nghĩa kiểu Destination
type Destination = {
  id: string; // Đổi sang string cho ObjectId
  name: string;
  location: string;
  image: string;
};

// Dữ liệu địa điểm hiện đã được fetch từ database trong useEffect

export default function PrivateTourPage() {
  // Các state quản lý trạng thái của trang
  // Kiến thức JS: Closure được sử dụng trong useState để duy trì trạng thái
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStep, setActiveStep] = useState(1); // 1: Route, 2: Activity, 3: Itinerary, 4: Summary
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [durationMap, setDurationMap] = useState<Record<string, { days: number; nights: number }>>({}); // Đổi key sang string
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [scheduledActs, setScheduledActs] = useState<Record<string, Activity & { customDurationHours?: number }>>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [destinations, setDestinations] = useState<Destination[]>([]); // State lưu danh sách địa điểm từ DB
  const [allActivities, setAllActivities] = useState<Activity[]>([]); // State lưu tất cả hoạt động đã tải

  // Fetch danh sách địa điểm khi mount
  useEffect(() => {
    fetch('http://localhost:4001/api/tours/destinations')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((d: any) => ({
          id: d._id,
          name: d.name,
          location: "Viet Nam",
          image: d.img || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"
        }));
        setDestinations(mapped);
      })
      .catch(err => console.error("Lỗi fetch destinations:", err));
  }, []);

  // Tính toán số ngày và đêm dựa trên khoảng ngày đi/về
  const getDaysAndNights = (start: Date | null, end: Date | null) => {
    if (!start || !end) return { days: 1, nights: 1 };
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = nights + 1;
    return { days, nights };
  };

  // Tự động phân chia số ngày và đêm từ khoảng ngày chọn cho các địa điểm đang có trong danh sách
  // Kiến thức JS: Math.floor() để làm tròn xuống
  const redistributeDurations = (
    dests: Destination[], 
    start: Date | null, 
    end: Date | null
  ) => {
    if (dests.length === 0) return {};
    const { days: totalDays, nights: totalNights } = getDaysAndNights(start, end);
    
    const newMap: Record<number, { days: number; nights: number }> = {};
    
    const baseDays = Math.floor(totalDays / dests.length);
    const extraDays = totalDays % dests.length;
    
    const baseNights = Math.floor(totalNights / dests.length);
    const extraNights = totalNights % dests.length;
    
    // Kiến thức JS: Array.prototype.forEach()
    dests.forEach((dest, idx) => {
      newMap[dest.id] = {
        days: baseDays + (idx < extraDays ? 1 : 0),
        nights: baseNights + (idx < extraNights ? 1 : 0)
      };
    });
    
    return newMap;
  };

  // Xử lý khi người dùng click vào một destination
  const handleSelectDestination = (dest: Destination) => {
    if (!selectedDestinations.find((d) => d.id === dest.id)) {
      const newList = [...selectedDestinations, dest];
      setSelectedDestinations(newList);
      
      const newMap = redistributeDurations(newList, startDate, endDate);
      setDurationMap(newMap);

      // Fetch hoạt động của địa điểm vừa chọn
      fetch(`http://localhost:4001/api/tours/destinations/${dest.id}/activities`)
        .then(res => res.json())
        .then(data => {
          const mappedActs = data.map((a: any) => ({
            id: a._id,
            destinationId: a.destinationId,
            name: a.name,
            address: a.address,
            price: a.price,
            image: a.image,
            durationHours: a.durationHours,
            category: a.category
          }));
          
          setAllActivities(prev => {
            const existingIds = new Set(prev.map(act => act.id));
            const newActs = mappedActs.filter((act: any) => !existingIds.has(act.id));
            return [...prev, ...newActs];
          });
          
          // Tự động chọn tất cả hoạt động mới
          setSelectedActivityIds(prev => [...prev, ...mappedActs.map((a: any) => a.id)]);
        })
        .catch(err => console.error("Lỗi fetch activities:", err));

      if (newList.length === destinations.length) {
        setActiveStep(2);
      }
    }
  };

  // Xử lý thay đổi thời gian cho một địa điểm cụ thể
  const handleDurationChange = (id: number, days: number, nights: number) => {
    const { days: totalDays, nights: totalNights } = getDaysAndNights(startDate, endDate);
    
    if (selectedDestinations.length <= 1) return;
    
    const prevDays = durationMap[id]?.days || 1;
    const prevNights = durationMap[id]?.nights || 1;
    
    const diffDays = days - prevDays;
    const diffNights = nights - prevNights;
    
    const otherDest = selectedDestinations.find(d => d.id !== id);
    if (!otherDest) return;
    
    const otherPrevDays = durationMap[otherDest.id]?.days || 1;
    const otherPrevNights = durationMap[otherDest.id]?.nights || 1;
    
    const newOtherDays = otherPrevDays - diffDays;
    const newOtherNights = otherPrevNights - diffNights;
    
    if (days >= 1 && newOtherDays >= 1 && nights >= 0 && newOtherNights >= 0) {
      setDurationMap(prev => ({
        ...prev,
        [id]: { days, nights },
        [otherDest.id]: { days: newOtherDays, nights: newOtherNights }
      }));
    }
  };

  // Callback nhận thay đổi khoảng ngày
  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const newMap = redistributeDurations(selectedDestinations, start, end);
      setDurationMap(newMap);
    }
  };

  // Tính toán động ngày đến ngày đi dựa trên số ngày lưu trú của từng địa điểm
  const calculateDateRanges = () => {
    const ranges: Record<number, string> = {};
    let currentOffset = 0;
    const tourStartDate = startDate || new Date();
    
    selectedDestinations.forEach((dest) => {
      const duration = durationMap[dest.id] || { days: 1, nights: 1 };
      
      const arrivalDate = new Date(tourStartDate.getTime());
      arrivalDate.setDate(tourStartDate.getDate() + currentOffset);
      
      const departureDate = new Date(tourStartDate.getTime());
      departureDate.setDate(tourStartDate.getDate() + currentOffset + duration.days - 1);
      
      const formatDateStr = (date: Date) => {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        return `${dd}/${mm}`;
      };
      
      ranges[dest.id] = `${formatDateStr(arrivalDate)} - ${formatDateStr(departureDate)}`;
      currentOffset += duration.days;
    });
    
    return ranges;
  };

  const dateRanges = calculateDateRanges();

  // Kiến thức JS: Array.prototype.filter() để tìm kiếm
  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E5E7EB] pt-8 pb-20 font-sans text-[#1E293B]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 flex flex-col gap-10">
        {/* Stepper điều hướng các bước thiết kế tour */}
        <Stepper activeStep={activeStep} />

        {/* Nội dung chính: 2 cột (Trái: Danh sách điểm đến, Phải: Lịch trình đã chọn) */}
        {activeStep === 1 || activeStep === 2 ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-4">
            {/* ----- Cột trái: Tìm kiếm và danh sách destination ----- */}
            <div className="flex-1 w-full">
              {activeStep === 1 ? (
                <>
                  <h1 className="text-4xl lg:text-[42px] font-bold text-[#1C2B38] mb-3 font-serif tracking-tight">
                    Design Your Route
                  </h1>
                  <p className="text-gray-500 text-[17px] mb-8">
                    Discover and select destinations for your dream journey
                  </p>

                  {/* Ô tìm kiếm điểm đến */}
                  <div className="relative mb-8 shadow-sm rounded-full">
                    <MagnifyingGlass size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a city (e.g., Da Lat, Nha Trang...)"
                      className="w-full bg-white pl-14 pr-6 py-4 rounded-full border border-transparent focus:border-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 transition-all font-medium text-[15px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Grid danh sách các địa điểm */}
                  {/* Kiến thức JS: Array.prototype.map() */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDestinations.map((dest) => {
                      const isSelected = selectedDestinations.some(d => d.id === dest.id);
                      return (
                        <PrivateDestinationCard 
                          key={dest.id} 
                          dest={dest}
                          onSelect={handleSelectDestination}
                          isSelected={isSelected}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl lg:text-[42px] font-bold text-[#1C2B38] mb-3 font-serif tracking-tight">
                    Select Activities
                  </h1>
                  <p className="text-gray-500 text-[17px] mb-8">
                    Choose from available activities in your selected destinations
                  </p>
                  
                  {selectedDestinations.map(dest => {
                    const destActivities = allActivities.filter(act => act.destinationId === dest.id);
                    if (destActivities.length === 0) return null;
                    return (
                      <div key={dest.id} className="mb-10">
                        <h3 className="text-xl font-bold text-[#1C2B38] mb-5 border-b border-gray-200 pb-2">{dest.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {destActivities.map(act => {
                            const isSelected = selectedActivityIds.includes(act.id);
                            return (
                              <div 
                                key={act.id} 
                                onClick={() => {
                                  setSelectedActivityIds(prev => 
                                    prev.includes(act.id) ? prev.filter(x => x !== act.id) : [...prev, act.id]
                                  );
                                }}
                                className={`flex gap-4 p-3 bg-white rounded-xl border-[2px] transition-all cursor-pointer select-none relative group ${
                                  isSelected 
                                    ? 'border-[#38BDF8] bg-sky-50/20 shadow-md' 
                                    : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                                }`}
                              >
                               <div className="w-[80px] h-[75px] rounded-lg overflow-hidden relative flex-shrink-0">
                                 <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover" />
                               </div>
                               <div className="flex flex-col justify-center flex-1 min-w-0 pr-6">
                                 <h4 className="font-bold text-[#1C2B38] text-[14px] line-clamp-2 leading-tight">{act.name}</h4>
                                 <p className="text-gray-500 text-[11px] mt-1">{act.durationHours} hours</p>
                                 <div className="flex items-center justify-between mt-1">
                                    <p className="text-[#38BDF8] text-[13px] font-bold">{formatVND(act.price)}</p>
                                    <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded font-medium">{act.category}</span>
                                 </div>
                               </div>
                               {/* Checkbox indicator */}
                               <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                 isSelected ? 'bg-[#38BDF8] border-[#38BDF8] text-white' : 'border-gray-300 text-transparent'
                               }`}>
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                 </svg>
                               </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* ----- Cột phải: Component bóc tách tóm tắt lộ trình (YourRouteSidebar) ----- */}
            <YourRouteSidebar
              activeStep={activeStep}
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              selectedDestinations={selectedDestinations}
              durationMap={durationMap}
              onDurationChange={handleDurationChange}
              dateRanges={dateRanges}
              getDaysAndNights={getDaysAndNights}
              onContinue={() => {
                if (activeStep === 1 && (!startDate || !endDate)) {
                  alert("Vui lòng chọn ngày nhận phòng và trả phòng của sếp trước khi tiếp tục nhé!");
                  return;
                }
                setActiveStep(activeStep + 1);
              }}
            />
          </div>
        ) : activeStep === 3 ? (
          <div className="w-full max-w-[1000px] mx-auto mt-4 relative flex flex-col lg:flex-row gap-8">
            <Itinerary
              destinations={selectedDestinations}
              durations={durationMap}
              onDurationChange={handleDurationChange}
              onContinue={() => setActiveStep(4)}
              selectedActivityIds={selectedActivityIds}
              startDate={startDate}
              scheduledActs={scheduledActs}
              setScheduledActs={setScheduledActs}
              allActivities={allActivities}
            />
          </div>
        ) : (
          <div className="w-full mt-4">
            <Summary
              destinations={selectedDestinations}
              durations={durationMap}
              scheduledActs={scheduledActs}
              onFinish={async (data) => {
                const token = localStorage.getItem("token");
                if (!token) {
                  alert("Vui lòng đăng nhập để thực hiện đặt tour.");
                  return;
                }

                // Quy đổi sang VND nếu cần (giống BookingForm)
                const totalPriceVND = data.totalPrice < 1000 ? data.totalPrice * 25000 : data.totalPrice;

                try {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
                  const res = await fetch(`${apiUrl}/bookings`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      tourId: "6a097c4a08d85b9c3c573e18", // Dummy tour ID cho Private Tour
                      numberOfParticipants: data.participants,
                      totalPrice: totalPriceVND
                    })
                  });

                  const result = await res.json();
                  
                  if (result.success && result.data.paymentUrl) {
                    // Chuyển hướng đến cổng thanh toán PayOS
                    window.location.href = result.data.paymentUrl;
                  } else {
                    alert(result.message || "Không thể tạo link thanh toán.");
                  }
                } catch (error) {
                  console.error("Booking error:", error);
                  alert("Lỗi kết nối. Vui lòng thử lại sau.");
                }
              }}
              startDate={startDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
