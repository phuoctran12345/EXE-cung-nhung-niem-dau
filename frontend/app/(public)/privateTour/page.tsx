"use client";

import Image from "next/image";
import { useState } from "react";
import { MagnifyingGlass, Clock } from "@phosphor-icons/react";
import Stepper from "../../components/Stepper";
import { Itinerary, Summary } from "../../components/Stepper"; 
import PrivateDestinationCard from "../../components/PrivateDestinationCard";
import YourRouteSidebar from "../../components/YourRouteSidebar";
import { formatVND, Activity } from "../../data/mockData";
import { useEffect } from "react"; 
import heroBg from "../../assets/privateTour/image.png";

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
  
  const [activityCityFilter, setActivityCityFilter] = useState<string>("all");
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>("All");

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
      {/* Hero Section - Banner đầu trang */}
      {/* Kiến thức JS: component Image của Next.js tự động tối ưu ảnh */}
      <div className="relative h-[350px] w-full overflow-hidden">
        <Image 
          src={heroBg} 
          alt="Private Tour" 
          fill 
          className="object-cover"
          priority
        />
        {/* Lớp phủ đen mờ để làm nổi bật chữ */}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl lg:text-6xl font-bold font-serif mb-4 tracking-wider text-center">PRIVATE TOUR</h1>
          <div className="flex gap-6 text-sm font-medium">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full"/> Exclusive</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full"/> Personalized</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full"/> Intimate</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 flex flex-col gap-10 mt-10 pb-20">
        {/* Stepper điều hướng các bước thiết kế tour */}
        <Stepper activeStep={activeStep} onStepClick={setActiveStep} />

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
                  {/* Header phần chọn hoạt động */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                      <h1 className="text-4xl lg:text-[42px] font-bold text-[#1C2B38] mb-2 font-serif tracking-tight">
                        Explore Activities
                      </h1>
                      <p className="text-gray-500 text-[17px]">
                        Explore and select activities to make your journey unforgettable
                      </p>
                    </div>
                    {/* Bộ lọc chọn thành phố */}
                    <div className="w-full md:w-auto">
                      <select 
                        value={activityCityFilter}
                        onChange={(e) => setActivityCityFilter(e.target.value)}
                        className="w-full md:w-[200px] px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-bold text-[#1C2B38] focus:outline-none focus:border-[#38BDF8] shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9IiM5Q0ExQjIiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZD0iTTE5IDlsLTcgNy03LTciLz48L3N2Zz4=')] bg-[length:20px_20px] bg-[position:right_12px_center] bg-no-repeat pr-10"
                      >
                        <option value="all">All Destinations</option>
                        {selectedDestinations.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Bộ lọc category */}
                  <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {["All", "Sightseeing", "Dining", "Entertainment", "Shopping", "Relax"].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActivityCategoryFilter(cat)}
                        className={`px-5 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all shadow-sm ${
                          activityCategoryFilter === cat 
                            ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white border-transparent' 
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Danh sách hoạt động */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {selectedDestinations
                      .filter(dest => activityCityFilter === "all" || activityCityFilter === dest.id)
                      .map(dest => {
                      const destActivities = allActivities.filter(act => 
                        act.destinationId === dest.id && 
                        (activityCategoryFilter === "All" || act.category === activityCategoryFilter)
                      );
                      
                      if (destActivities.length === 0) return null;
                      
                      return destActivities.map(act => {
                        const isSelected = selectedActivityIds.includes(act.id);
                        return (
                          <div 
                            key={act.id} 
                            onClick={() => {
                              setSelectedActivityIds(prev => 
                                prev.includes(act.id) ? prev.filter(x => x !== act.id) : [...prev, act.id]
                              );
                            }}
                            className={`flex flex-col bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer select-none relative group ${
                              isSelected 
                                ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/20 shadow-md' 
                                : 'border-gray-100 shadow-sm hover:shadow-lg'
                            }`}
                          >
                           {/* Checkbox indicator */}
                           <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-colors z-10 ${
                             isSelected ? 'bg-[#38BDF8] border-[#38BDF8] text-white' : 'border-white/80 bg-black/20 text-transparent'
                           }`}>
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                             </svg>
                           </div>
                           
                           <div className="relative h-[180px] w-full overflow-hidden">
                             <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                           </div>
                           <div className="p-5 flex flex-col flex-1 bg-white">
                             <h4 className="font-extrabold text-[#1C2B38] text-[16px] line-clamp-1 mb-1.5">{act.name}</h4>
                             <div className="flex items-center gap-2 text-[12.5px] text-gray-500 mb-4 font-medium">
                                <span className="flex items-center text-yellow-400">★ 4.8 <span className="text-gray-400 ml-1">(120 reviews)</span></span>
                                <span>•</span>
                                <span>{act.durationHours} hours</span>
                             </div>
                             <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                <p className="text-[#38BDF8] text-[18px] font-extrabold">{formatVND(act.price)}</p>
                                <span className="text-[13px] text-gray-400 font-bold group-hover:text-[#38BDF8] transition-colors flex items-center gap-1">
                                  View more
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                </span>
                             </div>
                           </div>
                          </div>
                        );
                      });
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ----- Cột phải: Component bóc tách tóm tắt lộ trình (YourRouteSidebar) ----- */}
            {activeStep === 1 ? (
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
                    // Dùng thông báo thay cho alert mặc định nếu được (tuân thủ yêu cầu), nhưng hiện tại ở đây ta có thể dùng alert tạm hoặc toast.
                    // Theo rules: "Không dùng alert mặc định của trình duyệt". 
                    // Tạm thời bỏ alert và chỉ return, hoặc set state lỗi nếu có. 
                    // Vì codebase cũ dùng alert, tôi sẽ thay bằng thông báo custom (nếu có) hoặc 그냥 return
                    return; 
                  }
                  setActiveStep(activeStep + 1);
                }}
              />
            ) : (
              <div className="w-full lg:w-[360px] flex-shrink-0 bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24 h-fit">
                <h2 className="text-[20px] font-bold text-[#1C2B38] tracking-tight mb-1">Your Activities</h2>
                <p className="text-slate-400 text-[13px] mb-6 font-medium">Các hoạt động bạn đã chọn</p>
                
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
                  {selectedActivityIds.length > 0 ? (
                    allActivities.filter(a => selectedActivityIds.includes(a.id)).map((act, idx) => (
                      <div key={act.id} className="flex gap-3 relative animate-fade-in group">
                        {idx < selectedActivityIds.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] border-l-[2px] border-dashed border-slate-100 z-0" />
                        )}
                        <div className="w-6 h-6 rounded-full bg-sky-50 text-[#38BDF8] border border-sky-100 flex items-center justify-center text-[11px] font-bold z-10 flex-shrink-0">{idx + 1}</div>
                        <div className="flex-1 flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 shadow-sm z-10 hover:border-sky-200 transition-colors">
                            <div className="w-[48px] h-[40px] rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm">
                                <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#1C2B38] text-[12.5px] line-clamp-1">{act.name}</h4>
                                <p className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5"><Clock size={10}/> {act.durationHours} hours</p>
                            </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center flex flex-col items-center">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 shadow-inner">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <p className="text-[13px] text-slate-400 font-medium">Chưa có hoạt động nào được chọn.</p>
                       <p className="text-[11px] text-slate-300 mt-1">Hãy khám phá và chọn bên trái!</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex justify-between items-center text-[13px]">
                      <span className="text-slate-500 font-medium">Tổng số hoạt động</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{selectedActivityIds.length} hoạt động</span>
                  </div>
                  <div className="flex justify-between items-center text-[13.5px]">
                      <span className="text-slate-500 font-bold">Tổng chi phí</span>
                      <span className="font-extrabold text-[#38BDF8] text-[16px]">
                        {formatVND(allActivities.filter(a => selectedActivityIds.includes(a.id)).reduce((sum, act) => sum + act.price, 0))}
                      </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    className="w-full bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(56,189,248,0.25)] text-[13.5px] flex items-center justify-center gap-2 hover:scale-[1.01]"
                    onClick={() => {
                      if (selectedActivityIds.length === 0) {
                        // Không dùng alert
                        return;
                      }
                      setActiveStep(activeStep + 1);
                    }}
                  >
                    TIẾP TỤC ĐẾN LỊCH TRÌNH →
                  </button>
                  <button
                    className="w-full bg-white border border-slate-200 text-slate-500 font-bold py-3.5 rounded-xl transition-all text-[13.5px] flex items-center justify-center gap-2 hover:bg-slate-50 hover:scale-[1.01]"
                    onClick={() => setActiveStep(activeStep - 1)}
                  >
                    ← QUAY LẠI BƯỚC TRƯỚC
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeStep === 3 ? (
          <div className="w-full max-w-[1400px] mx-auto mt-4 px-2 lg:px-6 relative flex flex-col lg:flex-row gap-8">
            <Itinerary
              destinations={selectedDestinations}
              durations={durationMap}
              onDurationChange={handleDurationChange}
              onContinue={() => setActiveStep(4)}
              onBack={() => setActiveStep(2)}
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
