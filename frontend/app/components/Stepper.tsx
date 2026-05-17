// Component Stepper - hiển thị các bước trong quy trình tạo tour riêng
// Được tách ra để tái sử dụng và dễ bảo trì
"use client";

import React from "react";
import Image from "next/image";
import { Clock, CheckCircle } from "@phosphor-icons/react";
import { getActivitiesByDestinationId, Activity, formatVND } from "../data/mockData";

type StepperProps = {
  activeStep: number; // bước hiện tại (1‑4)
};

export default function Stepper({ activeStep }: StepperProps) {
  const steps = [
    { id: 1, label: "Route" },
    { id: 2, label: "Activity" },
    { id: 3, label: "Itinerary" },
    { id: 4, label: "Summary" },
  ];

  return (
    <div className="bg-[#F3F4F6] border border-gray-300/80 rounded-[20px] px-10 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] max-w-[800px] mx-auto w-full relative">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center gap-3 relative z-10 ${activeStep === step.id ? "text-[#38BDF8]" : "text-gray-400"}`}>
            <div className={`w-7 h-7 rounded-full ${activeStep === step.id ? "bg-[#38BDF8] text-white" : "bg-gray-200 text-gray-500"} flex items-center justify-center text-sm font-bold shadow-md`}>{step.id}</div>
            <span className={`font-medium text-[15px] ${activeStep === step.id ? "text-[#38BDF8] font-bold" : ""}`}>{step.label}</span>
            {activeStep === step.id && (
              <div className="absolute -bottom-[22px] left-0 w-full h-[3px] bg-[#38BDF8] rounded-t-md" />
            )}
          </div>
          {idx < steps.length - 1 && (
            <div className="h-[1px] flex-1 mx-4 lg:mx-8 bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ==== Additional Components for Itinerary workflow ==== 

type Destination = {
  id: string; // Đổi sang string cho ObjectId
  name: string;
  location: string;
  image: string;
};

export function ActivityItem({ 
  activity, 
  isPlaceholder = false, 
  onDrop,
  draggable,
  onDragStart,
  onRemove
}: { 
  activity?: Activity, 
  isPlaceholder?: boolean, 
  onDrop?: (e: React.DragEvent) => void,
  draggable?: boolean,
  onDragStart?: (e: React.DragEvent) => void,
  onRemove?: () => void
}) {
  if (isPlaceholder || !activity) {
    return (
      <div 
        className="border border-dashed border-slate-200 hover:border-sky-300 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50/50 hover:bg-sky-50/20 text-[13px] font-medium h-full w-full pointer-events-none transition-colors duration-200 shadow-sm"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-[#38BDF8] text-[16px] font-bold">+</span> Kéo thả hoạt động vào đây
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all duration-300 w-full group relative ${draggable ? 'cursor-grab active:cursor-grabbing hover:scale-[1.01]' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="w-[60px] h-[50px] rounded-lg overflow-hidden flex-shrink-0 relative pointer-events-none shadow-sm">
        <Image src={activity.image} alt={activity.name} fill className="object-cover" />
      </div>
      <div className="flex-1 pointer-events-none min-w-0">
        <h4 className="font-bold text-[#1C2B38] text-[13.5px] line-clamp-1 group-hover:text-[#38BDF8] transition-colors leading-snug">{activity.name}</h4>
        <p className="text-slate-400 text-[11px] truncate mt-0.5">{activity.address}</p>
        <p className="text-[#38BDF8] text-[13px] font-bold mt-1">{formatVND(activity.price)}</p>
      </div>
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm border border-red-100"
          title="Remove from itinerary"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function Itinerary({ 
  destinations, 
  durations, 
  onDurationChange, 
  onContinue, 
  selectedActivityIds, 
  startDate,
  scheduledActs,
  setScheduledActs,
  allActivities // Thêm prop này
}: {
  destinations: Destination[];
  durations: Record<string, { days: number; nights: number }>;
  onDurationChange: (id: string, days: number, nights: number) => void;
  onContinue: () => void;
  selectedActivityIds?: string[];
  startDate: Date | null;
  scheduledActs: Record<string, Activity & { customDurationHours?: number }>;
  setScheduledActs: React.Dispatch<React.SetStateAction<Record<string, Activity & { customDurationHours?: number }>>>;
  allActivities: Activity[]; // Thêm type
}) {
  const [activeDay, setActiveDay] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalDayFilter, setModalDayFilter] = React.useState<number | 'all'>('all'); // State mới cho bộ lọc ngày trong modal
  
  // State cho hiệu ứng kéo giãn mượt mà
  const [resizingSlot, setResizingSlot] = React.useState<string | null>(null);
  const [resizeDeltaY, setResizeDeltaY] = React.useState(0);
  
  // Refs để lưu trữ giá trị bắt đầu khi kéo (Tránh closure stale state)
  const resizeStartYRef = React.useRef(0);
  const resizeStartDurationRef = React.useRef(0);

  const totalDays = React.useMemo(() => Object.values(durations).reduce((sum, d) => sum + d.days, 0), [durations]);

  // Effect quản lý sự kiện mousemove và mouseup khi kéo giãn (Đảm bảo dọn dẹp event listener chuẩn React)
  React.useEffect(() => {
    if (!resizingSlot) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartYRef.current;
      setResizeDeltaY(deltaY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeStartYRef.current;
      const newDuration = Math.max(1, resizeStartDurationRef.current + Math.round(deltaY / 76));
      
      setScheduledActs(prev => {
        const existing = prev[resizingSlot];
        if (!existing) return prev;
        return {
          ...prev,
          [resizingSlot]: {
            ...existing,
            customDurationHours: newDuration
          }
        };
      });
      
      setResizingSlot(null);
      setResizeDeltaY(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingSlot]);

  const allActivitiesForDestinations = React.useMemo(() => {
     if (selectedActivityIds) {
       return allActivities.filter(act => selectedActivityIds.includes(act.id));
     }
     return allActivities;
  }, [allActivities, selectedActivityIds]);

  const scheduledListForDay = React.useMemo(() => {
    const list: { time: string; act: Activity & { customDurationHours?: number } }[] = [];
    Object.keys(scheduledActs).forEach(key => {
      if (key.startsWith(`${activeDay}-`)) {
        const time = key.substring(key.indexOf("-") + 1);
        list.push({ time, act: scheduledActs[key] });
      }
    });
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [scheduledActs, activeDay]);

  const totalActivitiesPrice = allActivitiesForDestinations.reduce((sum, act) => sum + act.price, 0);

  const handleDropForDay = (dayNum: number, time: string, e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    
    try {
      const data = JSON.parse(dataStr);
      const act = allActivitiesForDestinations.find(a => a.id === data.activityId);
      if (act) {
        setScheduledActs(prev => {
          const next = { ...prev };
          if (data.sourceSlot && data.sourceSlot !== `${dayNum}-${time}`) {
            delete next[data.sourceSlot]; // Xoá ở ô cũ khi kéo từ lịch cũ sang lịch mới
          }
          next[`${dayNum}-${time}`] = act;
          return next;
        });
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const handleDrop = (time: string, e: React.DragEvent) => {
    handleDropForDay(activeDay, time, e);
  };

  const handleRemove = (time: string, dayNum?: number) => {
    const targetDay = dayNum !== undefined ? dayNum : activeDay;
    setScheduledActs(prev => {
      const next = { ...prev };
      delete next[`${targetDay}-${time}`];
      return next;
    });
  };

  // Danh sách các slots thời gian trong ngày
  const ALL_TIME_SLOTS = [
    "07:00", "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  // Tính toán các slotKey bị gộp che phủ bởi chặng hoạt động kéo dài trước đó
  const getCoveredSlots = () => {
    const covered = new Set<string>();
    Object.keys(scheduledActs).forEach(key => {
      const [dayStr, time] = key.split("-");
      const day = parseInt(dayStr, 10);
      if (day !== activeDay) return;
      
      const act = scheduledActs[key];
      const duration = act.customDurationHours || act.durationHours || 1;
      
      if (duration > 1) {
        const startIndex = ALL_TIME_SLOTS.indexOf(time);
        if (startIndex !== -1) {
          for (let i = 1; i < duration; i++) {
            const nextTime = ALL_TIME_SLOTS[startIndex + i];
            if (nextTime) {
              covered.add(`${day}-${nextTime}`);
            }
          }
        }
      }
    });
    return covered;
  };

  const coveredSlots = getCoveredSlots();

  // Tính toán hiển thị đúng ngày dựa trên ngày bắt đầu (startDate) được chọn
  const getFormattedDayDate = (dayNum: number) => {
    if (!startDate) return "10/04";
    const date = new Date(startDate.getTime());
    date.setDate(startDate.getDate() + (dayNum - 1));
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  const renderSlot = (time: string) => {
    const slotKey = `${activeDay}-${time}`;
    if (coveredSlots.has(slotKey)) return null;

    const act = scheduledActs[slotKey];
    if (act && act.name) {
      const duration = act.customDurationHours || act.durationHours || 1;
      
      // Tính toán chiều cao mượt mà nếu đang kéo
      const isResizing = resizingSlot === slotKey;
      const baseHeight = duration * 68 + (duration - 1) * 8;
      const cardHeight = isResizing ? Math.max(68, baseHeight + resizeDeltaY) : baseHeight;
      
      return (
        <div 
          key={time}
          className={`flex gap-4 relative z-10 w-full rounded-xl -ml-2 pl-2 py-1 ${isResizing ? 'transition-none' : 'transition-all duration-300'}`}
          style={{ height: `${cardHeight}px` }}
        >
           <span className="w-[35px] flex-shrink-0 text-slate-400 text-[12px] pt-3 font-semibold tracking-wider pointer-events-none">{time}</span>
           <div className="flex-1 min-w-0 h-full relative group">
             <div 
               className="flex items-start gap-4 bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-sky-300 hover:shadow-lg shadow-sm w-full h-full relative transition-all duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4.5px] before:bg-gradient-to-b before:from-sky-400 before:to-sky-500 before:rounded-l-2xl overflow-hidden"
               draggable
               onDragStart={(e) => {
                 e.dataTransfer.setData("application/json", JSON.stringify({ activityId: act.id, sourceSlot: slotKey }));
               }}
             >
               <div className="w-[75px] h-[58px] rounded-xl overflow-hidden flex-shrink-0 relative pointer-events-none shadow-sm">
                 <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover" />
               </div>
               
               <div className="flex-1 min-w-0 flex flex-col justify-between h-full pointer-events-none pr-6">
                 <div>
                   <h4 className="font-bold text-[#1C2B38] text-[14px] line-clamp-1 group-hover:text-[#38BDF8] transition-colors leading-snug">{act.name}</h4>
                   <p className="text-slate-400 text-[11px] mt-0.5 truncate">{act.address}</p>
                 </div>
                 
                 <div className="flex items-center gap-2.5 mt-auto pt-1">
                   <p className="text-[#38BDF8] text-[13px] font-extrabold">{formatVND(act.price)}</p>
                   <span className="text-[10px] bg-sky-50/80 text-[#38BDF8] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-sky-100/30">
                     {duration} giờ (hours)
                   </span>
                 </div>
               </div>
               
               <button 
                 onClick={(e) => { e.stopPropagation(); handleRemove(time); }}
                 className="absolute right-3.5 top-3 w-6 h-6 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-sm border border-rose-100 text-[10px] font-bold"
                 title="Remove from itinerary"
               >
                 ✕
               </button>

               {/* Tay kéo kéo giãn thời lượng hoạt động chuẩn Google Calendar */}
               <div 
                 className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize flex items-center justify-center group-hover:bg-sky-50/50 transition-colors rounded-b-2xl z-20"
                 onMouseDown={(mouseDownEvent) => {
                   mouseDownEvent.preventDefault();
                   mouseDownEvent.stopPropagation();
                   resizeStartYRef.current = mouseDownEvent.clientY;
                   resizeStartDurationRef.current = duration;
                   setResizingSlot(slotKey);
                   setResizeDeltaY(0);
                 }}
               >
                 <div className="w-8 h-1.5 bg-[#38BDF8] rounded-full shadow-sm hover:scale-y-125 transition-transform" />
               </div>
             </div>
           </div>
        </div>
      );
    }

    return (
      <div 
        key={time}
        className="flex gap-4 relative z-10 w-full rounded-xl transition-all duration-200 -ml-2 pl-2 py-1 h-[68px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(time, e)}
      >
         <span className="w-[35px] flex-shrink-0 text-slate-300 text-[12px] pt-3 font-semibold tracking-wider pointer-events-none">{time}</span>
         <div className="flex-1 min-w-0 h-full">
           <ActivityItem isPlaceholder />
         </div>
      </div>
    );
  };

  const getCoveredHoursForDay = (dayNum: number) => {
    const covered = new Set<string>();
    ALL_TIME_SLOTS.forEach((time, index) => {
      const slotKey = `${dayNum}-${time}`;
      const act = scheduledActs[slotKey];
      if (act && act.name) {
        const duration = act.customDurationHours || act.durationHours || 1;
        const roundedDuration = Math.round(duration);
        for (let i = 1; i < roundedDuration; i++) {
          const nextIndex = index + i;
          if (nextIndex < ALL_TIME_SLOTS.length) {
            covered.add(ALL_TIME_SLOTS[nextIndex]);
          }
        }
      }
    });
    return covered;
  };

  return (
    <>
    <div className="flex-1 bg-white rounded-[24px] border border-slate-100 p-0 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] min-w-0">
      <div className="p-6 pb-2 border-b border-slate-50">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-[26px] font-bold font-serif text-[#1C2B38] mb-1">Arrange Itinerary</h2>
            <p className="text-slate-400 text-[14px]">Xem lịch trình tóm tắt và nhấn nút mở bản đồ thời gian chi tiết bên dưới.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-[#38BDF8] font-bold text-[13px] rounded-xl shadow-sm transition-all flex items-center gap-1.5 border border-sky-100/50"
          >
            📅 MỞ LỊCH CHI TIẾT
          </button>
        </div>
        
        <div className="bg-sky-50/50 text-sky-700 text-[13px] p-3.5 rounded-xl flex items-start gap-2.5 mb-4 border border-sky-100/30">
           <span>💡</span>
           <span className="font-medium">Mẹo: Chỉ các khung giờ được lên lịch mới hiển thị bên dưới. Sếp hãy mở Lịch Chi Tiết để dễ dàng kéo thả nhé!</span>
        </div>

        <div className="flex gap-4 px-4 border-b border-slate-50 overflow-x-auto whitespace-nowrap scrollbar-none pb-0">
           {Array.from({ length: totalDays || 1 }, (_, i) => i + 1).map(day => (
              <button 
                 key={day} 
                 onClick={() => setActiveDay(day)}
                 className={`pb-3 pt-1 px-4 flex flex-col items-center gap-1 transition-all duration-300 relative ${activeDay === day ? 'text-[#38BDF8] font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <span className="text-[10px] font-extrabold tracking-widest uppercase">Day {day}</span>
                 <span className="text-[15px]">{getFormattedDayDate(day)}</span>
                 {activeDay === day && (
                   <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-gradient-to-r from-sky-400 to-sky-500 rounded-full animate-fade-in" />
                 )}
              </button>
           ))}
        </div>
      </div>

      <div className="p-6 bg-white max-h-[500px] overflow-y-auto scrollbar-thin">
         {scheduledListForDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center text-[28px] text-[#38BDF8] mb-4 shadow-sm animate-pulse">📅</div>
               <h3 className="font-bold text-[#1C2B38] text-[15.5px] mb-1">Chưa có hoạt động nào được xếp lịch cho ngày này</h3>
               <p className="text-slate-400 text-[12.5px] max-w-[320px] mb-6">Hãy sử dụng bộ lập kế hoạch thông minh để kéo thả hoạt động cực kỳ trực quan!</p>
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="px-6 py-3 bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold text-[13.5px] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-[1.01]"
               >
                 <span>📅 LÊN LỊCH TRÌNH CHI TIẾT / CALENDAR VIEW</span>
               </button>
            </div>
         ) : (
            <div className="space-y-6 relative pl-6 border-l-[3px] border-dashed border-sky-100 py-3 ml-4 animate-fade-in">
              {scheduledListForDay.map(({ time, act }) => {
                const duration = act.customDurationHours || act.durationHours || 1;
                return (
                  <div key={time} className="relative flex gap-4 items-start group">
                    <div className="absolute -left-[32px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-[#38BDF8] ring-4 ring-sky-50/50 group-hover:ring-[#38BDF8]/20 transition-all z-10" />
                    
                    <span className="text-[12px] font-extrabold text-[#38BDF8] bg-sky-50/80 border border-sky-100/30 px-2.5 py-1 rounded-md min-w-[58px] text-center mt-1 shadow-sm font-mono">
                      {time}
                    </span>
                    
                    <div className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 relative hover:border-sky-200 transition-colors">
                      <div className="w-[60px] h-[50px] rounded-lg overflow-hidden flex-shrink-0 relative pointer-events-none shadow-sm">
                        <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <h4 className="font-bold text-[#1C2B38] text-[13.5px] truncate">{act.name}</h4>
                        <p className="text-slate-400 text-[11px] truncate mt-0.5">{act.address}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[#38BDF8] text-[12.5px] font-extrabold">{formatVND(act.price)}</p>
                          <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {duration} giờ (hours)
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleRemove(time)}
                        className="absolute right-3.5 top-3.5 w-6 h-6 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shadow-sm font-bold border border-rose-100"
                        title="Xoá khỏi lịch trình"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-6 flex justify-center">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-sky-50 hover:bg-sky-100 border border-sky-100/50 text-[#38BDF8] font-bold text-[13.5px] rounded-xl transition-all flex items-center gap-2 hover:scale-[1.01]"
                >
                  <span>✏️ MỞ LỊCH TRÌNH CHI TIẾT (CALENDAR VIEW)</span>
                </button>
              </div>
            </div>
         )}
      </div>
    </div>
    
    <div className="w-full lg:w-[420px] flex-shrink-0 bg-white rounded-[24px] border border-slate-100 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sticky top-24 h-fit">
        <h2 className="text-[22px] font-bold text-[#1C2B38] tracking-tight mb-1">Your Activities</h2>
        <p className="text-slate-400 text-sm mb-6 font-medium">Kéo thả hoạt động để lên lịch trình</p>
        
        <div className="space-y-6">
           <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {allActivitiesForDestinations.length > 0 ? allActivitiesForDestinations.map((act, idx) => {
                 return (
                    <div 
                      key={act.id} 
                      className="flex gap-4 relative cursor-grab active:cursor-grabbing hover:translate-x-1 transition-transform duration-200"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({ activityId: act.id }));
                      }}
                    >
                       {idx < allActivitiesForDestinations.length - 1 && (
                          <div className="absolute left-3 top-8 bottom-[-24px] w-[2px] border-l-[2px] border-dashed border-slate-100 z-0" />
                       )}
                       <div className="w-6 h-6 rounded-full bg-sky-50 text-[#38BDF8] border border-sky-100 flex items-center justify-center text-xs font-bold z-10">{idx + 1}</div>
                       <div className="flex-1 flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 shadow-sm z-10 hover:border-sky-100 hover:bg-white transition-all duration-300">
                          <div className="w-[50px] h-[40px] rounded-lg overflow-hidden flex-shrink-0 relative pointer-events-none shadow-sm">
                             <Image src={act.image} alt="" fill className="object-cover" />
                          </div>
                          <div className="flex-1 pointer-events-none min-w-0">
                             <h4 className="font-bold text-[#1C2B38] text-[13px] line-clamp-1">{act.name}</h4>
                             <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5"><Clock size={11}/> {act.durationHours} hours</p>
                          </div>
                          <span className="text-[#38BDF8] font-bold text-[13px] pr-2 pointer-events-none">{formatVND(act.price)}</span>
                       </div>
                    </div>
                 )
              }) : (
                 <p className="text-[14px] text-slate-400 italic text-center py-6">Vui lòng chọn hoạt động ở bước trước.</p>
              )}
           </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
           <div className="flex justify-between items-center text-[13.5px]">
              <span className="text-slate-500 font-medium">Total Activities</span>
              <span className="font-semibold text-slate-700">{allActivitiesForDestinations.length.toString().padStart(2, '0')} Activities</span>
           </div>
           <div className="flex justify-between items-center text-[14px]">
              <span className="text-slate-500 font-bold">Total Cost</span>
              <span className="font-extrabold text-[#38BDF8] text-[16.5px]">{formatVND(totalActivitiesPrice)}</span>
           </div>
        </div>

        <button
          className="w-full bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(56,189,248,0.25)] hover:shadow-[0_6px_20px_rgba(56,189,248,0.35)] text-[14px] mt-6 flex items-center justify-center gap-2 hover:scale-[1.01]"
          onClick={onContinue}
        >
          TIẾP TỤC XEM TỔNG QUAN →
        </button>
    </div>

    {/* popup MODAL lập lịch trình full-screen siêu cấp trực quan dạng Google Calendar */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-6 animate-fade-in">
        <div className="bg-slate-50/95 rounded-[32px] w-[95vw] h-[90vh] max-w-[1280px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-white flex flex-col overflow-hidden animate-scale-up">
          
          {/* Modal Header */}
          <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <span className="text-[28px]">📅</span>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#1C2B38]">Lập Kế Hoạch Lịch Trình (Interactive Calendar)</h3>
                <p className="text-[12.5px] text-slate-400 font-medium">Kéo thả hoạt động sang cột của từng ngày và khung giờ mong muốn</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bộ lọc chọn xem lịch theo ngày cụ thể hoặc tất cả các ngày */}
              <select 
                value={modalDayFilter}
                onChange={(e) => setModalDayFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-[#38BDF8] cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Tất cả các ngày (All Days)</option>
                {Array.from({ length: totalDays || 1 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>Ngày {day} ({getFormattedDayDate(day)})</option>
                ))}
              </select>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.01]"
              >
                LƯU & ĐÓNG ✓
              </button>
            </div>
          </div>
          
          {/* Modal Body */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Workspace Sidebar containing Activities List */}
            <div className="w-[320px] bg-white border-r border-slate-100 p-6 flex flex-col overflow-hidden">
              <h4 className="font-extrabold text-[#1C2B38] text-[14.5px] tracking-tight mb-1 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#38BDF8] rounded-full" />
                Danh sách hoạt động
              </h4>
              <p className="text-slate-400 text-[11px] font-medium mb-4">Kéo các hoạt động thả vào bảng giờ bên phải</p>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {allActivitiesForDestinations.length > 0 ? allActivitiesForDestinations.map((act) => {
                  return (
                    <div 
                      key={act.id} 
                      className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/10 cursor-grab active:cursor-grabbing transition-all duration-300 group"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify({ activityId: act.id }));
                      }}
                    >
                      <div className="w-[45px] h-[36px] rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm pointer-events-none">
                        <Image src={act.image} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 pointer-events-none min-w-0">
                        <h5 className="font-bold text-slate-800 text-[12.5px] line-clamp-1 leading-snug">{act.name}</h5>
                        <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1"><Clock size={10}/> {act.durationHours} giờ</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-[12px] text-slate-400 italic text-center py-6">Không có hoạt động.</p>
                )}
              </div>
            </div>
            
            {/* Right Interactive Board Grid (Google Calendar style) */}
            <div className="flex-1 overflow-x-auto overflow-y-auto bg-slate-100/30 p-6">
              <div className="min-w-[800px] bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                
                {/* Board Columns Header */}
                <div className="flex border-b border-slate-100 sticky top-0 bg-white z-30">
                  <div className="w-[70px] flex-shrink-0 border-r border-slate-100 bg-slate-50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400">GIỜ</span>
                  </div>
                  
                  {Array.from({ length: totalDays || 1 }, (_, i) => i + 1)
                    .filter(dayNum => modalDayFilter === 'all' || modalDayFilter === dayNum)
                    .map((dayNum) => (
                    <div key={dayNum} className="flex-1 min-w-[180px] border-r border-slate-100 bg-slate-50 py-3 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">DAY {dayNum}</span>
                      <span className="text-[13px] font-bold text-slate-700 mt-0.5">{getFormattedDayDate(dayNum)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Board Slots Matrix */}
                <div className="flex relative">
                  {/* Left hours timeline axis */}
                  <div className="w-[70px] flex-shrink-0 flex flex-col border-r border-slate-100 bg-slate-50/50">
                    {ALL_TIME_SLOTS.map((time) => (
                      <div key={time} className="h-[76px] border-b border-slate-100/60 flex items-center justify-center font-mono text-[11px] font-bold text-slate-400">
                        {time}
                      </div>
                    ))}
                  </div>
                  
                  {/* Columns for Days */}
                  {Array.from({ length: totalDays || 1 }, (_, i) => i + 1)
                    .filter(dayNum => modalDayFilter === 'all' || modalDayFilter === dayNum)
                    .map((dayNum) => {
                    const coveredHours = getCoveredHoursForDay(dayNum);
                    
                    return (
                      <div key={dayNum} className="flex-1 min-w-[180px] border-r border-slate-100 flex flex-col bg-slate-50/5">
                        {ALL_TIME_SLOTS.map((time, index) => {
                          const slotKey = `${dayNum}-${time}`;
                          if (coveredHours.has(time)) return null;
                          
                          const act = scheduledActs[slotKey];
                          if (act && act.name) {
                            const duration = act.customDurationHours || act.durationHours || 1;
                            const cardHeight = duration * 76;
                            
                            return (
                              <div 
                                key={time} 
                                className="p-1 relative z-20 w-full"
                                style={{ height: `${cardHeight}px` }}
                              >
                                <div 
                                  className="flex flex-col bg-white p-2.5 rounded-xl border border-slate-100 hover:border-sky-300 hover:shadow-md shadow-sm w-full h-full relative transition-all duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3.5px] before:bg-gradient-to-b before:from-sky-400 before:to-sky-500 before:rounded-l-xl overflow-hidden group"
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("application/json", JSON.stringify({ activityId: act.id, sourceSlot: slotKey }));
                                  }}
                                >
                                  <div className="flex items-start gap-2 h-full min-w-0 pointer-events-none">
                                    <div className="w-[45px] h-[36px] rounded-lg overflow-hidden flex-shrink-0 relative shadow-sm pointer-events-none">
                                      <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                      <div>
                                        <h5 className="font-extrabold text-slate-800 text-[11px] line-clamp-1 group-hover:text-[#38BDF8] transition-colors leading-tight">{act.name}</h5>
                                        <p className="text-slate-400 text-[9px] truncate mt-0.5">{act.address}</p>
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-auto">
                                        <span className="text-[9px] bg-sky-50 text-[#38BDF8] px-1.5 rounded font-bold">
                                          {duration}h
                                        </span>
                                        <p className="text-[#38BDF8] text-[10px] font-extrabold">{formatVND(act.price)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemove(time, dayNum); }}
                                    className="absolute right-2 top-2 w-5 h-5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 text-[9px] shadow-sm font-bold"
                                    title="Xoá khỏi lịch trình"
                                  >
                                    ✕
                                  </button>

                                  {/* Tay kéo kéo giãn thời lượng hoạt động chuẩn Google Calendar */}
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize flex items-center justify-center group-hover:bg-sky-50/50 transition-colors rounded-b-2xl z-20"
                                    onMouseDown={(mouseDownEvent) => {
                                      mouseDownEvent.preventDefault();
                                      mouseDownEvent.stopPropagation();
                                      resizeStartYRef.current = mouseDownEvent.clientY;
                                      resizeStartDurationRef.current = duration;
                                      setResizingSlot(slotKey);
                                      setResizeDeltaY(0);
                                    }}
                                  >
                                    <div className="w-5 h-1 bg-[#38BDF8] rounded-full shadow-sm" />
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div 
                              key={time}
                              className="h-[76px] border-b border-slate-100/60 p-1 relative hover:bg-sky-50/20 transition-all duration-200 group flex items-center justify-center"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleDropForDay(dayNum, time, e)}
                            >
                              <div className="opacity-0 group-hover:opacity-100 text-[10px] text-sky-400 font-bold transition-opacity pointer-events-none">
                                + Thả vào đây
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export function Summary({ 
  destinations, 
  durations, 
  scheduledActs, 
  onFinish,
  startDate
}: { 
  destinations: Destination[]; 
  durations: Record<string, { days: number; nights: number }>; // Đổi key sang string
  scheduledActs: Record<string, Activity & { customDurationHours?: number }>;
  onFinish: (data: { participants: number, totalPrice: number }) => void;
  startDate: Date | null;
}) {
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);

  const totalDays = Object.values(durations).reduce((sum, d) => sum + d.days, 0);
  const totalNights = Object.values(durations).reduce((sum, d) => sum + d.nights, 0);
  
  // Tổng số hoạt động thực tế đã được xếp lịch
  const scheduledList = Object.values(scheduledActs);
  const totalActivitiesCount = scheduledList.length;

  // Tổng tiền phòng/stay của các thành phố (mặc định mỗi ngày ở thành phố là $60.00 = 1.500.000₫)
  const totalStayPriceUSD = destinations.reduce((sum, dest) => {
    const days = durations[dest.id]?.days || 1;
    return sum + 60.00 * days;
  }, 0);

  // Tổng tiền các hoạt động đã lên lịch
  const totalActivitiesPriceUSD = scheduledList.reduce((sum, act) => sum + act.price, 0);

  // Đơn giá trên mỗi người (Bằng tổng tiền stay + tiền các hoạt động)
  const pricePerPersonUSD = totalStayPriceUSD + totalActivitiesPriceUSD;

  // Tổng tiền quyết toán (Người lớn tính full giá, Trẻ em tính nửa giá cho chân thực)
  const totalPriceUSD = (adults + children * 0.5) * pricePerPersonUSD;

  // Tính ngày đến cụ thể của từng địa điểm
  const getDestinationDateLabel = (destIdx: number) => {
    if (!startDate) return `Day ${destIdx + 1}`;
    // Tính tổng số ngày lưu trú của các điểm trước đó
    const prevDays = destinations.slice(0, destIdx).reduce((sum, d) => sum + (durations[d.id]?.days || 1), 0);
    const date = new Date(startDate.getTime());
    date.setDate(startDate.getDate() + prevDays);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return `Day ${prevDays + 1} (${date.toLocaleDateString('vi-VN', options)})`;
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-7 max-w-[800px] mx-auto shadow-sm">
      <h2 className="text-[22px] font-bold font-serif text-[#1C2B38] mb-1">Trip Overview</h2>
      <p className="text-[#38BDF8] text-[15px] font-medium mb-6">
        {formatVND(pricePerPersonUSD)} <span className="text-gray-400 text-sm font-normal">/ person</span>
      </p>
      
      <div className="space-y-3 mb-6 border-b pb-6">
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-gray-500">Total Destinations</span>
          <span className="font-semibold text-[#38BDF8]">{destinations.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-gray-500">Total Activities</span>
          <span className="font-semibold text-[#38BDF8]">{totalActivitiesCount.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex justify-between items-center text-[14px]">
          <span className="text-gray-500">Total Time</span>
          <span className="font-semibold text-[#38BDF8]">{totalDays}D{totalNights}N</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {destinations.map((dest, idx) => {
          const days = durations[dest.id]?.days || 1;
          const destStayPriceUSD = 60.00 * days;
          return (
            <div key={dest.id} className="flex items-center gap-4 relative">
              {idx < destinations.length - 1 && (
                <div className="absolute left-3 top-8 bottom-[-16px] w-[2px] bg-blue-100 z-0" />
              )}
              <div className="w-6 h-6 rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-xs font-bold z-10">
                {idx + 1}
              </div>
              <div className="flex-1 flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm z-10">
                <div className="w-[50px] h-[40px] rounded overflow-hidden flex-shrink-0 relative">
                  <Image src={dest.image} alt={dest.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1C2B38] text-[13px]">{dest.name}</h4>
                  <p className="text-gray-500 text-[11px]"><Clock size={12} className="inline mr-1"/>{getDestinationDateLabel(idx)}</p>
                </div>
                <span className="text-[#38BDF8] font-semibold text-[13px] pr-2">{formatVND(destStayPriceUSD)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-[#1C2B38] text-[14px] mb-3">No. Of Guest</h4>
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
          <span className="text-[14px] text-gray-600">Adults</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAdults(prev => Math.max(1, prev - 1))}
              className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="font-semibold text-[14px] w-4 text-center">{adults}</span>
            <button 
              onClick={() => setAdults(prev => prev + 1)}
              className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="text-[14px] text-gray-600">Children</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setChildren(prev => Math.max(0, prev - 1))}
              className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="font-semibold text-[14px] w-4 text-center">{children}</span>
            <button 
              onClick={() => setChildren(prev => prev + 1)}
              className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-200">
        <span className="font-bold text-gray-500 text-[13px] tracking-wider uppercase">Total</span>
        <span className="font-bold text-[#38BDF8] text-[24px]">{formatVND(totalPriceUSD)}</span>
      </div>

      <button
        className="w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md text-[14px] mb-3"
        onClick={() => onFinish({ 
          participants: adults + children, 
          totalPrice: totalPriceUSD 
        })}
      >
        CONFIRM BOOKING
      </button>

      <div className="flex gap-3">
         <button className="flex-1 py-2.5 border border-blue-100 text-[#38BDF8] rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
            Save To Wishlist
         </button>
         <button className="flex-1 py-2.5 border border-blue-100 text-[#38BDF8] rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
            Share The Activity
         </button>
      </div>
    </div>
  );
}
