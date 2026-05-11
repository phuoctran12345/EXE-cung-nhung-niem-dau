// "use client" – trang Private Tour cho phép người dùng chọn các điểm đến và tiến hành bước Activity
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { MagnifyingGlass, CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";
import Stepper from "../../components/Stepper";
import { Itinerary, Summary } from "../../components/Stepper"; // import các component mới
import PrivateDestinationCard from "../../components/PrivateDestinationCard";
import RouteNode from "../../components/RouteNode";
import { getActivitiesByDestinationId, formatVND, Activity } from "../../data/mockData";

// Định nghĩa kiểu Destination để tái sử dụng
type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

// Dữ liệu mock cho các điểm đến (Destinations)
const DESTINATIONS: Destination[] = [
  { id: 1, name: "Thua Thien Hue", location: "Viet Nam", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 2, name: "Da Nang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80" },
  { id: 3, name: "Ha Giang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 4, name: "Mang Den", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 5, name: "Ca Mau", location: "Viet Nam", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 6, name: "Kien Trung Palace", location: "Thua Thien Hue", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 7, name: "Da Nang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80" },
  { id: 8, name: "Ha Giang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 9, name: "Mang Den", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 10, name: "Ca Mau", location: "Viet Nam", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 11, name: "Kien Trung Palace", location: "Thua Thien Hue", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 12, name: "Da Nang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80" },
  { id: 13, name: "Ha Giang", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 14, name: "Mang Den", location: "Viet Nam", image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80" },
  { id: 15, name: "Ca Mau", location: "Viet Nam", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
  { id: 16, name: "Kien Trung Palace", location: "Thua Thien Hue", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80" },
];

export default function PrivateTourPage() {
  // Trạng thái tìm kiếm, bước hiện tại và danh sách các destination đã chọn
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStep, setActiveStep] = useState(1); // 1: Route, 2: Activity, 3: Itinerary, 4: Summary
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [durationMap, setDurationMap] = useState<Record<number, { days: number; nights: number }>>({});
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [scheduledActs, setScheduledActs] = useState<Record<string, Activity & { customDurationHours?: number }>>({});

  // Tính toán số ngày và đêm dựa trên khoảng ngày đi/về
  const getDaysAndNights = (start: Date | null, end: Date | null) => {
    if (!start || !end) return { days: 1, nights: 1 };
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = nights + 1;
    return { days, nights };
  };

  // Tự động phân chia số ngày và đêm từ khoảng ngày chọn cho các địa điểm đang có trong danh sách
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
    // Nếu destination chưa tồn tại trong danh sách đã chọn thì thêm vào
    if (!selectedDestinations.find((d) => d.id === dest.id)) {
      const newList = [...selectedDestinations, dest];
      setSelectedDestinations(newList);
      
      // Tự động chia đều số ngày đêm của Stay Range cho toàn bộ danh sách điểm đến mới
      const newMap = redistributeDurations(newList, startDate, endDate);
      setDurationMap(newMap);

      // Tự động chọn tất cả hoạt động của địa điểm mới
      const destActs = getActivitiesByDestinationId(dest.id);
      setSelectedActivityIds(prev => [...prev, ...destActs.map(a => a.id)]);

      // Khi đã chọn hết tất cả các destination (hoặc đạt số lượng mong muốn) thì chuyển sang bước Activity
      if (newList.length === DESTINATIONS.length) {
        setActiveStep(2);
      }
    }
  };

  // Xử lý thay đổi thời gian cho một địa điểm cụ thể
  // Đảm bảo tổng số ngày và đêm của các địa điểm luôn khớp tuyệt đối với khoảng ngày đã chọn (Stay Range)
  const handleDurationChange = (id: number, days: number, nights: number) => {
    const { days: totalDays, nights: totalNights } = getDaysAndNights(startDate, endDate);
    
    // Nếu chỉ có 1 địa điểm, số ngày đêm của nó bị khoá cứng bằng đúng khoảng ngày đã chọn
    if (selectedDestinations.length <= 1) return;
    
    const prevDays = durationMap[id]?.days || 1;
    const prevNights = durationMap[id]?.nights || 1;
    
    const diffDays = days - prevDays;
    const diffNights = nights - prevNights;
    
    // Tìm địa điểm khác để điều chỉnh lượng ngày/đêm bù trừ ngược lại
    const otherDest = selectedDestinations.find(d => d.id !== id);
    if (!otherDest) return;
    
    const otherPrevDays = durationMap[otherDest.id]?.days || 1;
    const otherPrevNights = durationMap[otherDest.id]?.nights || 1;
    
    const newOtherDays = otherPrevDays - diffDays;
    const newOtherNights = otherPrevNights - diffNights;
    
    // Đảm bảo số ngày ít nhất là 1, số đêm ít nhất là 0
    if (days >= 1 && newOtherDays >= 1 && nights >= 0 && newOtherNights >= 0) {
      setDurationMap(prev => ({
        ...prev,
        [id]: { days, nights },
        [otherDest.id]: { days: newOtherDays, nights: newOtherNights }
      }));
    }
  };

  const toggleActivitySelection = (id: string) => {
    setSelectedActivityIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Quản lý khoảng ngày được chọn của Tour (Nhận phòng / Trả phòng)
  const [startDate, setStartDate] = useState<Date | null>(new Date(2026, 4, 13)); // Mặc định: Thứ 4, 13 thg 5 2026
  const [endDate, setEndDate] = useState<Date | null>(new Date(2026, 5, 3)); // Mặc định: Thứ 4, 03 thg 6 2026
  // Trạng thái tháng hiển thị hiện tại trên lịch (lịch trái)
  const [baseCalendarMonth, setBaseCalendarMonth] = useState<Date>(new Date(2026, 4, 1)); // Tháng 5 năm 2026
  // Trạng thái mở/đóng lịch popover chọn ngày
  const [isDateOpen, setIsDateOpen] = useState(false);
  // Tham chiếu DOM dùng để bắt sự kiện click ra ngoài để đóng lịch chọn
  const dateRef = useRef<HTMLDivElement>(null);

  // useEffect bắt sự kiện click ra ngoài vùng hiển thị của lịch để tự động đóng popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy thứ trong tuần dạng tiếng Việt viết tắt giống mockup (Thứ 2, Thứ 3, Thứ 4, Chủ Nhật)
  const getVietnameseDayOfWeek = (d: Date) => {
    const day = d.getDay();
    if (day === 0) return "Chủ Nhật";
    return `Thứ ${day + 1}`;
  };

  // Định dạng ngày hiển thị theo kiểu: "Thứ 4, 13 thg 5 2026"
  const formatDateVietnamese = (d: Date | null) => {
    if (!d) return "Chưa chọn ngày";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = d.getMonth() + 1;
    const yyyy = d.getFullYear();
    return `${getVietnameseDayOfWeek(d)}, ${dd} thg ${mm} ${yyyy}`;
  };

  // Định dạng nhãn hiển thị rút gọn ở nút chọn: "13 thg 5 - 03 thg 6"
  const formatDateLabelShort = (start: Date | null, end: Date | null) => {
    if (!start) return "Chọn ngày đi";
    const startStr = `${start.getDate()} thg ${start.getMonth() + 1}`;
    if (!end) return startStr;
    const endStr = `${end.getDate()} thg ${end.getMonth() + 1}`;
    return `${startStr} - ${endStr}`;
  };

  // Di chuyển cả 2 tháng sang tháng tiếp theo
  const nextMonth = () => {
    setBaseCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Di chuyển cả 2 tháng lùi về tháng trước
  const prevMonth = () => {
    setBaseCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Hàm render giao diện của một tháng đơn
  const renderCalendar = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Tính toán khoảng trống dịch đầu tháng (Thứ 2 là cột đầu tiên)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    // Kiểm tra xem một ngày d có nằm trong khoảng được chọn hay không
    const isSelectedRange = (d: Date) => {
      if (!startDate) return false;
      if (endDate) return d >= startDate && d <= endDate;
      return d.toDateString() === startDate.toDateString();
    };

    const isStart = (d: Date) => startDate && d.toDateString() === startDate.toDateString();
    const isEnd = (d: Date) => endDate && d.toDateString() === endDate.toDateString();

    // Xử lý khi người dùng click vào một ngày trên lịch
    const handleDateClick = (d: Date) => {
      let newStart = startDate;
      let newEnd = endDate;

      if (!startDate || (startDate && endDate)) {
        newStart = d;
        newEnd = null;
        setStartDate(d);
        setEndDate(null);
      } else {
        if (d < startDate) {
          newStart = d;
          newEnd = null;
          setStartDate(d);
          setEndDate(null);
        } else {
          newEnd = d;
          setEndDate(d);
        }
      }

      // Khi người dùng chọn xong cả Ngày đi (newStart) và Ngày về (newEnd)
      // Tự động phân chia lại số ngày lưu trú cho các địa điểm để luôn trùng khớp tuyệt đối
      if (newStart && newEnd) {
        const newMap = redistributeDurations(selectedDestinations, newStart, newEnd);
        setDurationMap(newMap);
      }
    };

    return (
      <div className="w-[280px] select-none flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Tiêu đề tháng và nút chuyển đổi tương tự thiết kế */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); prevMonth(); }} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="text-center font-bold text-[#1E293B] text-[14px]">
            tháng {month + 1} năm {year}
          </div>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); nextMonth(); }} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        {/* Các cột thứ trong tuần */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-bold text-gray-400 mb-2 uppercase">
          <div>Th 2</div><div>Th 3</div><div>Th 4</div><div>Th 5</div><div>Th 6</div><div>Th 7</div><div className="text-red-500">CN</div>
        </div>

        {/* Các ô ngày */}
        <div className="grid grid-cols-7 text-center text-[13px] font-medium gap-y-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="p-1"></div>;

            const selectedRange = isSelectedRange(d);
            const start = isStart(d);
            const end = isEnd(d);
            const isToday = d.toDateString() === new Date().toDateString();

            let bgClass = "";
            // Đổ màu nền khoảng giữa (không phải ngày đi/về)
            if (selectedRange && !start && !end) {
              bgClass = "bg-[#E0F2FE] text-[#0284C7]";
            }
            // Điểm bắt đầu (đổ nền gradient hướng sang phải)
            if (start && endDate) {
              bgClass = "bg-gradient-to-r from-transparent via-[#E0F2FE]/50 to-[#E0F2FE]";
            }
            // Điểm kết thúc (đổ nền gradient hướng sang trái)
            if (end && startDate) {
              bgClass = "bg-gradient-to-r from-[#E0F2FE] via-[#E0F2FE]/50 to-transparent";
            }

            return (
              <div
                key={i}
                onClick={() => handleDateClick(d)}
                className={`py-1 cursor-pointer relative ${bgClass}`}
              >
                <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all
                  ${start || end ? 'bg-[#38BDF8] text-white font-bold shadow-md shadow-[#38BDF8]/20' : 'hover:bg-gray-100 text-[#1E293B]'} 
                  ${isToday && !start && !end ? 'border border-[#38BDF8] text-[#38BDF8]' : ''}`
                }>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
                    <input
                      type="text"
                      placeholder="Search for a city (e.g., Da Lat, Nha Trang...)"
                      className="w-full bg-[#F3F4F6] border-2 border-[#E5E7EB] focus:border-[#38BDF8] rounded-full py-4 pl-7 pr-12 text-[15px] focus:outline-none transition-colors text-[#1C2B38] font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlass size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Grid danh sách các destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DESTINATIONS.filter((dest) =>
                      dest.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((dest) => (
                      <PrivateDestinationCard
                        key={dest.id}
                        dest={dest}
                        onSelect={handleSelectDestination}
                      />
                    ))}
                  </div>

                  {/* Phân trang dummy (có thể mở rộng) */}
                  <div className="flex flex-col items-center mt-12">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F5A524]" />
                      <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]" />
                      <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]" />
                      <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]" />
                      <span className="text-[#F5A524] mx-1">-</span>
                      <div className="w-2.5 h-2.5 rounded-full border border-[#F5A524]" />
                    </div>
                    <div className="flex items-center gap-[19px] mt-2 text-[13px] text-[#F5A524] font-bold">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                      <span className="ml-[14px] text-lg font-normal">&gt;</span>
                    </div>
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
                    const destActivities = getActivitiesByDestinationId(dest.id);
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
                                onClick={() => toggleActivitySelection(act.id)}
                                className={`flex gap-4 p-3 bg-white rounded-xl border-[2px] transition-all cursor-pointer select-none relative group ${
                                  isSelected 
                                    ? 'border-[#38BDF8] bg-sky-50/20 shadow-md' 
                                    : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                                }`}
                              >
                               <div className="w-[80px] h-[75px] rounded-lg overflow-hidden relative flex-shrink-0">
                                 <Image src={act.image} alt={act.name} fill className="object-cover" />
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

            {/* ----- Cột phải ----- */}
            <div className="w-full lg:w-[420px] bg-[#F3F4F6] rounded-[24px] border-[3px] border-[#38BDF8] p-7 sticky top-24 shadow-lg shadow-[#38BDF8]/10 flex-shrink-0">
              <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-1">
                {activeStep === 1 ? "Your Route" : "Your Route Summary"}
              </h2>
              <p className="text-gray-400 text-sm mb-6 font-medium">
                {activeStep === 1 ? "Customize your stay duration" : "Review your chosen destinations"}
              </p>

              {/* Bộ chọn Ngày ở (Stay Range Date Picker) */}
              <div className="mb-6 relative" ref={dateRef}>
                <div 
                  onClick={() => setIsDateOpen(!isDateOpen)}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 hover:border-[#38BDF8] transition-all shadow-sm cursor-pointer flex items-center gap-3 select-none"
                >
                  <CalendarBlank size={20} weight="bold" className="text-[#38BDF8]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Thời gian tour (Stay Range)</span>
                    <span className="text-[14px] font-bold text-[#1E293B]">
                      {formatDateLabelShort(startDate, endDate)}
                    </span>
                  </div>
                </div>

                {isDateOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] md:w-[640px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-50 flex flex-col cursor-default">
                    {/* Header thông tin Nhận phòng / Trả phòng */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-5">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-none">Nhận phòng</span>
                        <span className="text-[14px] font-bold text-[#1E293B] mt-1.5">
                          {formatDateVietnamese(startDate)}
                        </span>
                      </div>
                      <div className="w-8 h-[1.5px] bg-gray-300"></div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider leading-none">Trả phòng</span>
                        <span className="text-[14px] font-bold text-[#1E293B] mt-1.5">
                          {formatDateVietnamese(endDate)}
                        </span>
                      </div>
                    </div>
                    {/* Giao diện 2 lịch cạnh nhau */}
                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                      {renderCalendar(baseCalendarMonth)}
                      <div className="hidden md:block w-[1px] bg-gray-100"></div>
                      <div className="hidden md:block">
                        {renderCalendar(new Date(baseCalendarMonth.getFullYear(), baseCalendarMonth.getMonth() + 1, 1))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative pl-[14px] space-y-6">
                <div className="absolute left-[27px] top-6 bottom-16 w-[2px] border-l-[2px] border-dashed border-[#38BDF8] z-0" />
                {selectedDestinations.map((dest, idx) => (
                  <RouteNode 
                    key={dest.id} 
                    index={idx + 1} 
                    dest={dest} 
                    duration={durationMap[dest.id] || {days: 1, nights: 1}}
                    onDurationChange={(days, nights) => handleDurationChange(dest.id, days, nights)}
                    dateRange={dateRanges[dest.id]}
                  />
                ))}
              </div>

              {/* Tổng thời gian (tính động dựa trên khoảng ngày đã chọn trên lịch kép) */}
              <div className="mt-8 border-t-[1.5px] border-gray-300/80 pt-5 flex items-center justify-between">
                <span className="font-bold text-[#1C2B38] text-[15px]">Total Time</span>
                <span className="font-bold text-[#38BDF8] text-[15px]">
                  {getDaysAndNights(startDate, endDate).days} Days {getDaysAndNights(startDate, endDate).nights} Nights
                </span>
              </div>

              <button
                className="w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-md text-[15px]"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                {activeStep === 1 && "CONTINUE TO ACTIVITIES"}
                {activeStep === 2 && "CONTINUE TO ITINERARY"}
              </button>
            </div>
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
            />
          </div>
        ) : (
          <div className="w-full mt-4">
            <Summary
              destinations={selectedDestinations}
              durations={durationMap}
              scheduledActs={scheduledActs}
              onFinish={() => alert('Đặt tour thành công!')}
              startDate={startDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
