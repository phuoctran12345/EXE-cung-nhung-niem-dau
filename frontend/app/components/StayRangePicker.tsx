// "use client" – Component bộ chọn khoảng ngày lưu trú (Stay Range Date Picker) siêu sang xịn dạng kép (Dual Calendar)
"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface StayRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
}

export default function StayRangePicker({
  startDate,
  endDate,
  onDateChange,
}: StayRangePickerProps) {
  // Trạng thái tháng hiển thị hiện tại trên lịch trái (mặc định: Tháng 5 năm 2026 giống thiết kế mẫu)
  const [baseCalendarMonth, setBaseCalendarMonth] = useState<Date>(new Date(2026, 4, 1));
  // Trạng thái đóng/mở popover chọn ngày
  const [isDateOpen, setIsDateOpen] = useState(false);
  // Tham chiếu DOM để bắt sự kiện click bên ngoài tự động đóng popover
  const dateRef = useRef<HTMLDivElement>(null);

  // useEffect lắng nghe sự kiện click bên ngoài để đóng popover lịch chọn ngày
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy thứ trong tuần dạng Tiếng Việt viết tắt
  const getVietnameseDayOfWeek = (d: Date) => {
    const day = d.getDay();
    if (day === 0) return "Chủ Nhật";
    return `Thứ ${day + 1}`;
  };

  // Định dạng ngày hiển thị Tiếng Việt: "Thứ 4, 13 thg 5 2026"
  const formatDateVietnamese = (d: Date | null) => {
    if (!d) return "Chưa chọn ngày";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = d.getMonth() + 1;
    const yyyy = d.getFullYear();
    return `${getVietnameseDayOfWeek(d)}, ${dd} thg ${mm} ${yyyy}`;
  };

  // Định dạng nhãn hiển thị rút gọn ở nút trigger chọn: "13 thg 5 - 03 thg 6"
  const formatDateLabelShort = (start: Date | null, end: Date | null) => {
    if (!start) return "Chọn ngày đi";
    const startStr = `${start.getDate()} thg ${start.getMonth() + 1}`;
    if (!end) return startStr;
    const endStr = `${end.getDate()} thg ${end.getMonth() + 1}`;
    return `${startStr} - ${endStr}`;
  };

  // Di chuyển cả 2 lịch sang tháng tiếp theo
  const nextMonth = () => {
    setBaseCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Di chuyển cả 2 lịch lùi về tháng trước
  const prevMonth = () => {
    setBaseCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Hàm render giao diện của một tháng đơn bên trong lịch kép
  const renderCalendarMonth = (baseDate: Date) => {
    const today = new Date();
    const minSelectableDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Tính toán khoảng trống lùi đầu tháng (Thứ 2 là cột đầu tiên)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    // Kiểm tra xem một ngày có nằm trong khoảng được chọn hay không
    const isSelectedRange = (d: Date) => {
      if (!startDate) return false;
      if (endDate) return d >= startDate && d <= endDate;
      return d.toDateString() === startDate.toDateString();
    };

    const isStart = (d: Date) => startDate && d.toDateString() === startDate.toDateString();
    const isEnd = (d: Date) => endDate && d.toDateString() === endDate.toDateString();

    // Xử lý khi người dùng chọn một ô ngày cụ thể
    const handleDateClick = (d: Date) => {
      // Không cho chọn ngày trong quá khứ
      if (d < minSelectableDate) return;

      let newStart = startDate;
      let newEnd = endDate;

      if (!startDate || (startDate && endDate)) {
        newStart = d;
        newEnd = null;
        onDateChange(d, null);
      } else {
        if (d < startDate) {
          newStart = d;
          newEnd = null;
          onDateChange(d, null);
        } else {
          newEnd = d;
          onDateChange(startDate, d);
        }
      }
    };

    return (
      <div className="w-[280px] select-none flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Tiêu đề tháng và các nút lật trang */}
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

        {/* Cột thứ tự trong tuần */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-bold text-gray-400 mb-2 uppercase">
          <div>Th 2</div><div>Th 3</div><div>Th 4</div><div>Th 5</div><div>Th 6</div><div>Th 7</div><div className="text-red-500">CN</div>
        </div>

        {/* Các ô số ngày của tháng */}
        <div className="grid grid-cols-7 text-center text-[13px] font-medium gap-y-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="p-1"></div>;

            const selectedRange = isSelectedRange(d);
            const start = isStart(d);
            const end = isEnd(d);
            const isToday = d.toDateString() === new Date().toDateString();
            const isPast = d < minSelectableDate;

            let bgClass = "";
            // Màu nền vùng khoảng giữa
            if (selectedRange && !start && !end) {
              bgClass = "bg-[#E0F2FE] text-[#0284C7]";
            }
            // Điểm bắt đầu với hiệu ứng gradient sang phải
            if (start && endDate) {
              bgClass = "bg-gradient-to-r from-transparent via-[#E0F2FE]/50 to-[#E0F2FE]";
            }
            // Điểm kết thúc với hiệu ứng gradient sang trái
            if (end && startDate) {
              bgClass = "bg-gradient-to-r from-[#E0F2FE] via-[#E0F2FE]/50 to-transparent";
            }

            return (
              <div
                key={i}
                onClick={() => handleDateClick(d)}
                className={`py-1 relative ${isPast ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${bgClass}`}
              >
                <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full transition-all
                  ${start || end ? "bg-[#38BDF8] text-white font-bold shadow-md shadow-[#38BDF8]/20" : `${isPast ? "text-gray-400" : "hover:bg-gray-100 text-[#1E293B]"}`} 
                  ${isToday && !start && !end ? "border border-[#38BDF8] text-[#38BDF8]" : ""}`
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

  // Tháng hiển thị kế tiếp ở cột lịch bên phải
  const nextCalendarMonth = new Date(baseCalendarMonth.getFullYear(), baseCalendarMonth.getMonth() + 1, 1);

  return (
    <div className="mb-6 relative" ref={dateRef}>
      {/* Nút trigger kích hoạt mở popover chọn ngày */}
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

      {/* Popover 2 ô lịch kép kề vai sát cánh siêu đẹp */}
      {isDateOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] md:w-[640px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-50 flex flex-col cursor-default">
          {/* Header hiển thị ngày nhận/trả chi tiết */}
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

          {/* Render song lịch kép */}
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            {renderCalendarMonth(baseCalendarMonth)}
            {renderCalendarMonth(nextCalendarMonth)}
          </div>
        </div>
      )}
    </div>
  );
}
