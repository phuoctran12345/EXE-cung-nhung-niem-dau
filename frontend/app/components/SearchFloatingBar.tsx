"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarBlank,
  Users,
  MagnifyingGlass,
  ListDashes,
} from "@phosphor-icons/react";
import { destinations } from "../data/mockData";

const ACTIVITIES = ["Tham quan (Sightseeing)", "Khám phá (Adventure)", "Văn hóa (Culture)", "Ẩm thực (Food)", "Thiên nhiên (Nature)"];

export default function SearchFloatingBar() {
  const router = useRouter();

  // State quản lý giá trị của các ô tìm kiếm
  const [destination, setDestination] = useState("");
  const [activity, setActivity] = useState("");

  // State quản lý khoảng thời gian tour
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date(Date.now() + 86400000 * 2)); // Ngày mốt

  // State quản lý Số lượng hành khách
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // State quản lý trạng thái mở/đóng của dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // Tham chiếu (ref) để xử lý click outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Hàm xử lý tìm kiếm theo địa điểm (dùng cho dropdown)
  const handleSearch = (slug?: string) => {
    setIsDropdownOpen(false);
    if (slug) {
      router.push(`/tours/${slug}`);
    } else if (destination.trim()) {
      const searchSlug = destination.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/tours/${searchSlug}`);
    } else {
      router.push('/tours');
    }
  };

  // Đóng tất cả dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setIsDropdownOpen(false);
      if (activityRef.current && !activityRef.current.contains(target)) setIsActivityOpen(false);
      if (dateRef.current && !dateRef.current.contains(target)) setIsDateOpen(false);
      if (guestsRef.current && !guestsRef.current.contains(target)) setIsGuestsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format ngày theo kiểu "10 thg 5"
  const formatDate = (d: Date | null) => {
    if (!d) return "";
    return `${d.getDate()} thg ${d.getMonth() + 1}`;
  };

  // Hàm render bộ lịch (Calendar UI)
  const renderCalendar = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const isSelected = (d: Date) => {
      if (!startDate) return false;
      if (endDate) return d >= startDate && d <= endDate;
      return d.getTime() === startDate.getTime();
    };

    const isStart = (d: Date) => startDate && d.getTime() === startDate.getTime();
    const isEnd = (d: Date) => endDate && d.getTime() === endDate.getTime();

    const handleDateClick = (d: Date) => {
      if (!startDate || (startDate && endDate)) {
        setStartDate(d);
        setEndDate(null);
      } else {
        if (d < startDate) {
          setStartDate(d);
        } else {
          setEndDate(d);
          setIsDateOpen(false);
        }
      }
    };

    return (
      <div className="w-full">
        <div className="text-center font-bold text-[#1E293B] mb-4 text-[15px]">tháng {month + 1} năm {year}</div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-[13px] font-medium text-gray-500 mb-2">
          <div>Th 2</div><div>Th 3</div><div>Th 4</div><div>Th 5</div><div>Th 6</div><div>Th 7</div><div className="text-red-500">CN</div>
        </div>
        <div className="grid grid-cols-7 text-center text-[14px] font-medium">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="p-2"></div>;

            const selected = isSelected(d);
            const start = isStart(d);
            const end = isEnd(d);
            const isToday = d.toDateString() === new Date().toDateString();

            let bgClass = "";
            if (selected && !start && !end) bgClass = "bg-[#E0F2FE]";
            if (start && endDate) bgClass = "bg-gradient-to-r from-transparent via-[#E0F2FE] to-[#E0F2FE]";
            if (end && startDate) bgClass = "bg-gradient-to-r from-[#E0F2FE] via-[#E0F2FE] to-transparent";
            if (start && end) bgClass = "";

            return (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); handleDateClick(d); }}
                className={`py-1 cursor-pointer relative ${bgClass}`}
              >
                <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-colors
                  ${start || end ? 'bg-[#0284C7] text-white font-bold shadow-md' : 'hover:bg-gray-100 text-[#1E293B]'} 
                  ${isToday && !start && !end ? 'border border-[#0284C7] text-[#0284C7]' : ''}`
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

  const currentMonthDate = new Date();
  const nextMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);

  return (
    <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-3 px-4 flex flex-col md:flex-row items-center justify-between border border-gray-100 relative">

      {/* 1. Điểm đến (Destination) */}
      <div className="flex-1 flex items-center gap-3 px-4 lg:px-6 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0 relative" ref={dropdownRef}>
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px] mb-0.5">
            Điểm đến
          </div>
          <div className="flex items-center w-full relative gap-2">
            <MapPin size={20} weight="bold" className="text-[#0284C7] flex-shrink-0" />
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              className="text-[14px] lg:text-[15px] text-[#1E293B] font-bold w-full outline-none bg-transparent placeholder-gray-400 truncate"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Dropdown Địa điểm */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+24px)] left-0 w-full md:w-[400px] bg-white rounded-[16px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                <button className="flex items-center gap-2 text-[#0284C7] font-bold text-[14px] p-3 hover:bg-white rounded-[12px] transition-colors w-full">
                  <MapPin size={18} weight="bold" /> Gần tôi
                </button>
              </div>
              <div className="p-3">
                <div className="text-[15px] font-bold text-[#1E293B] mb-2 px-3 pt-2">
                  Điểm đến phổ biến
                </div>
                <div className="flex flex-col">
                  {destinations.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => {
                        setDestination(dest.name);
                        setIsDropdownOpen(false);
                      }}
                      className="flex flex-row items-center justify-between py-3 px-3 hover:bg-[#F8F9FA] cursor-pointer rounded-[12px] transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1E293B] text-[15px]">{dest.name}</span>
                        <span className="text-[13px] text-gray-500 mt-0.5">Việt Nam</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="bg-[#E0F2FE] text-[#0284C7] text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide">Thành Phố</span>
                        <span className="text-[12px] text-gray-500 font-medium mt-1">{dest.toursCount} tours</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Trải nghiệm (Activity) */}
      <div
        className="flex-1 flex items-center gap-3 px-4 lg:px-6 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0 cursor-pointer relative"
        ref={activityRef}
        onClick={() => setIsActivityOpen(!isActivityOpen)}
      >
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px] mb-0.5">
            Trải nghiệm
          </div>
          <div className="flex items-center gap-2 w-full">
            <ListDashes size={20} weight="bold" className="text-[#0284C7] flex-shrink-0" />
            <span className={`text-[14px] lg:text-[15px] font-bold truncate ${activity ? 'text-[#1E293B]' : 'text-gray-400'}`}>
              {activity || "Tất cả hoạt động"}
            </span>
          </div>

          {/* Dropdown Trải nghiệm */}
          {isActivityOpen && (
            <div className="absolute top-[calc(100%+24px)] left-0 w-full md:w-[280px] bg-white rounded-[16px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-2">
              <div className="flex flex-col">
                <div
                  onClick={() => setActivity("")}
                  className="py-3 px-4 hover:bg-[#F8F9FA] cursor-pointer rounded-[12px] font-bold text-[14px] text-[#0284C7] transition-colors"
                >
                  Tất cả hoạt động
                </div>
                {ACTIVITIES.map((act, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivity(act)}
                    className="py-3 px-4 hover:bg-[#F8F9FA] cursor-pointer rounded-[12px] font-medium text-[14px] text-[#1E293B] transition-colors"
                  >
                    {act}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Thời gian (Date Range) */}
      <div
        className="flex-1 flex items-center gap-3 px-4 lg:px-6 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0 cursor-pointer relative"
        ref={dateRef}
        onClick={() => setIsDateOpen(!isDateOpen)}
      >
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px] mb-0.5">
            Khởi hành
          </div>
          <div className="flex items-center gap-2 w-full relative">
            <CalendarBlank size={20} weight="bold" className="text-[#0284C7] flex-shrink-0" />
            <span className={`text-[14px] lg:text-[15px] font-bold truncate ${startDate ? 'text-[#1E293B]' : 'text-gray-400'}`}>
              {startDate ? formatDate(startDate) : "Ngày đi"} - {endDate ? formatDate(endDate) : "Ngày về"}
            </span>
          </div>

          {/* Double Calendar Popover */}
          {isDateOpen && (
            <div
              className="absolute top-[calc(100%+24px)] left-[-100px] md:left-[-150px] lg:left-[-50px] w-[300px] md:w-[650px] bg-white rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-6 flex flex-col md:flex-row gap-8 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {renderCalendar(currentMonthDate)}
              <div className="hidden md:block w-[1px] bg-gray-100"></div> {/* Divider */}
              <div className="hidden md:block flex-1">
                {renderCalendar(nextMonthDate)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Hành khách (Guests) */}
      <div
        className="flex-1 flex items-center gap-3 px-4 lg:px-6 py-2 md:py-0 cursor-pointer relative"
        ref={guestsRef}
        onClick={() => setIsGuestsOpen(!isGuestsOpen)}
      >
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-[13px] mb-0.5">
            Hành khách
          </div>
          <div className="flex items-center gap-2 w-full">
            <Users size={20} weight="bold" className="text-[#0284C7] flex-shrink-0" />
            <span className="text-[14px] lg:text-[15px] font-bold text-[#1E293B] truncate">
              {adults} Lớn{children > 0 ? `, ${children} Trẻ` : ''}
            </span>
          </div>

          {/* Popover chọn Số lượng người */}
          {isGuestsOpen && (
            <div
              className="absolute top-[calc(100%+24px)] right-0 w-[300px] bg-white rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-5 flex flex-col gap-5 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold text-[#1E293B] text-[15px]">Người lớn</span>
                  <span className="block text-[12px] text-gray-500 mt-0.5">&gt; 12 tuổi</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center hover:bg-blue-100 font-bold transition-colors"
                  >-</button>
                  <span className="font-bold text-[#1E293B] w-6 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center hover:bg-blue-100 font-bold transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold text-[#1E293B] text-[15px]">Trẻ em</span>
                  <span className="block text-[12px] text-gray-500 mt-0.5">2 - 12 tuổi</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center hover:bg-blue-100 font-bold transition-colors"
                  >-</button>
                  <span className="font-bold text-[#1E293B] w-6 text-center">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center hover:bg-blue-100 font-bold transition-colors"
                  >+</button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* 5. Nút Search */}
      <button
        onClick={() => {
          setIsDropdownOpen(false);
          // Nếu có giá trị destination, tạo slug và chuyển tới trang tours tương ứng
          const slug = destination.trim().toLowerCase().replace(/\s+/g, '-');
          if (slug) {
            router.push(`/tours/${slug}`);
          } else {
            router.push('/tours');
          }
        }}
        className="bg-[#EA580C] hover:bg-[#C2410C] text-white w-12 h-12 lg:w-14 lg:h-14 rounded-full font-bold flex items-center justify-center transition-colors ml-2 mt-4 md:mt-0 flex-shrink-0 shadow-md"
      >
        <MagnifyingGlass size={22} weight="bold" />
      </button>

    </div>
  );
}
