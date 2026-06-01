// Component Stepper - hiển thị các bước trong quy trình tạo tour riêng
// Được tách ra để tái sử dụng và dễ bảo trì
"use client";

import React from "react";
import Image from "next/image";
import { Clock, CheckCircle, Calendar, Robot, Sparkle, X } from "@phosphor-icons/react";
import { getActivitiesByDestinationId, Activity, formatVND } from "../data/mockData";
import { recommendTour, chatTour } from "../services/ai.service";

const PRIVATE_TOUR_NOTES = [
  "Lịch trình private tour là đề xuất theo nhu cầu của bạn, có thể được điều chỉnh nhẹ theo điều kiện thực tế.",
  "Nếu bạn có yêu cầu đặc biệt (ăn chay, không ăn cay, trẻ nhỏ, người lớn tuổi), vui lòng ghi rõ trước khi thanh toán.",
  "Giá hiển thị là tạm tính theo lựa chọn hiện tại; một số dịch vụ phát sinh sẽ được xác nhận thêm khi chốt tour.",
  "Sau khi thanh toán thành công, bộ phận điều hành sẽ liên hệ để xác nhận lịch trình chi tiết.",
];

type StepperProps = {
  activeStep: number; // bước hiện tại (1‑4)
  onStepClick?: (step: number) => void;
};

export default function Stepper({ activeStep, onStepClick }: StepperProps) {
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
          <div 
            className={`flex items-center gap-3 relative z-10 ${
              step.id <= activeStep ? "cursor-pointer" : "cursor-not-allowed"
            } ${activeStep === step.id ? "text-[#38BDF8]" : "text-gray-400"}`}
            onClick={() => {
              if (onStepClick && step.id < activeStep) {
                onStepClick(step.id);
              }
            }}
          >
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
  onBack,
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
  onBack?: () => void;
  selectedActivityIds?: string[];
  startDate: Date | null;
  scheduledActs: Record<string, Activity & { customDurationHours?: number }>;
  setScheduledActs: React.Dispatch<React.SetStateAction<Record<string, Activity & { customDurationHours?: number }>>>;
  allActivities: Activity[]; // Thêm type
}) {
  const [activeDay, setActiveDay] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalDayFilter, setModalDayFilter] = React.useState<number | 'all'>('all'); // State mới cho bộ lọc ngày trong modal

  // State cho Chat AI
  const [activeTab, setActiveTab] = React.useState<'activities' | 'chat'>('activities');
  const [chatMessages, setChatMessages] = React.useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');

  // State để hiển thị thông báo thay cho alert mặc định
  const [aiMessage, setAiMessage] = React.useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Hàm gọi API AI để gợi ý lịch trình
  // Kiến thức JS: async/await dùng để xử lý bất đồng bộ (Promise).
  const handleAIRecommend = async () => {
    setAiMessage(null); // Reset thông báo cũ
    try {
      // Gọi service API đã bóc tách
      // Kiến thức JS: await dùng để đợi kết quả từ Promise (hàm async)
      const data = await recommendTour(
        {
          destinations: destinations.map(d => d.name),
          days: totalDays,
        },
        allActivitiesForDestinations
      );
      if (data.success) {
        const aiPlan = data.data; // Mảng các { day, time, activityId }
        const newScheduledActs = { ...scheduledActs };
        
        // Kiến thức JS: Array.prototype.forEach() để lặp qua mảng
        aiPlan.forEach((item: any) => {
          const act = allActivitiesForDestinations.find(a => a.id === item.activityId);
          if (act) {
            newScheduledActs[`${item.day}-${item.time}`] = act;
          }
        });
        
        setScheduledActs(newScheduledActs);
        setAiMessage({ text: "Đã cập nhật lịch trình từ AI thành công!", type: 'success' });
      } else {
        setAiMessage({ text: data.message || "Lỗi gọi AI", type: 'error' });
      }
    } catch (error) {
      console.error("Lỗi AI:", error);
      setAiMessage({ text: "Lỗi kết nối tới AI service (Có thể do sai URL hoặc Server chưa bật)", type: 'error' });
    }
  };

  // Hàm gửi tin nhắn Chat tới AI
  // Kiến thức JS: async/await, Spread Operator (...) để sao chép mảng
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Kiến thức JS: Spread operator (...) giúp tạo mảng mới giữ nguyên các phần tử cũ
    const newMessages = [...chatMessages, { role: 'user' as const, content: inputMessage }];
    setChatMessages(newMessages);
    setInputMessage('');
    
    try {
      // Gọi service API đã bóc tách
      const data = await chatTour(newMessages, scheduledActs, allActivitiesForDestinations);
      if (data.success) {
        setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        if (data.updatedSchedule) {
          setScheduledActs(data.updatedSchedule);
          setAiMessage({ text: "AI đã cập nhật lại lịch trình theo yêu cầu của bạn!", type: 'success' });
        }
      } else {
        setAiMessage({ text: data.message || "Lỗi gọi AI Chat", type: 'error' });
      }
    } catch (error) {
      console.error("Lỗi Chat AI:", error);
      setAiMessage({ text: "Lỗi kết nối tới AI Chat", type: 'error' });
    }
  };
  
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
    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200 overflow-hidden flex flex-col h-[800px] animate-fade-in">
      {/* Header */}
      <div className="bg-white px-8 py-5 border-b border-slate-100 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Calendar size={28} className="text-[#38BDF8]" />
          <div>
            <h3 className="text-xl font-bold font-serif text-[#1C2B38]">Lập Kế Hoạch Lịch Trình (Interactive Calendar)</h3>
            <p className="text-[12.5px] text-slate-400 font-medium">Kéo thả hoạt động sang cột của từng ngày và khung giờ mong muốn</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={modalDayFilter}
            onChange={(e) => setModalDayFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-[#38BDF8] cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="all">Tất cả các ngày (All Days)</option>
            {Array.from({ length: totalDays || 1 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>Ngày {day} ({getFormattedDayDate(day)})</option>
            ))}
          </select>
          
          <button 
            onClick={handleAIRecommend}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.01]"
          >
            <Sparkle size={16} /> GỢI Ý BẰNG AI
          </button>

          {onBack && (
            <button 
              onClick={onBack}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold text-[13.5px] rounded-xl shadow-sm transition-all flex items-center gap-1.5 hover:bg-slate-50 hover:scale-[1.01]"
            >
              ← QUAY LẠI
            </button>
          )}

          <button 
            onClick={onContinue}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-[13.5px] rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.01]"
          >
            TIẾP TỤC ĐẾN TỔNG QUAN →
          </button>
        </div>
      </div>
      
      {aiMessage && (
        <div className={`mx-8 mt-4 p-3.5 rounded-xl text-sm font-medium flex justify-between items-center flex-shrink-0 shadow-sm ${
          aiMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          <div className="flex items-center gap-2">
            <span>{aiMessage.type === 'success' ? '🎉' : '❌'}</span>
            <span>{aiMessage.text}</span>
          </div>
          <button onClick={() => setAiMessage(null)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left: Activities List */}
        <div className="w-[280px] bg-white border-r border-slate-100 p-4 flex flex-col overflow-hidden flex-shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-20">
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
                  className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 cursor-grab active:cursor-grabbing transition-all duration-300 group"
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
          
          {/* Summary mini */}
          <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
             <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-slate-500 font-medium">Đã chọn</span>
                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{allActivitiesForDestinations.length} hoạt động</span>
             </div>
             <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500 font-bold">Tổng chi phí</span>
                <span className="font-extrabold text-[#38BDF8] text-[15px]">{formatVND(totalActivitiesPrice)}</span>
             </div>
          </div>
        </div>
        
        {/* Middle: Interactive Board Grid */}
        <div className="flex-1 overflow-auto bg-slate-50/50 p-6 z-10">
          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            
            <div className="flex border-b border-slate-200 sticky top-0 bg-white z-30">
              <div className="w-[70px] flex-shrink-0 border-r border-slate-200 bg-slate-50 flex items-center justify-center shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] font-bold text-slate-400">GIỜ</span>
              </div>
              
              {Array.from({ length: totalDays || 1 }, (_, i) => i + 1)
                .filter(dayNum => modalDayFilter === 'all' || modalDayFilter === dayNum)
                .map((dayNum) => (
                <div key={dayNum} className="flex-1 min-w-[180px] border-r border-slate-200 bg-white py-3 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-extrabold text-[#38BDF8] tracking-wider uppercase bg-sky-50 px-2 py-0.5 rounded mb-1">Ngày {dayNum}</span>
                  <span className="text-[13px] font-bold text-slate-700 mt-0.5">{getFormattedDayDate(dayNum)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="w-[70px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]">
                {ALL_TIME_SLOTS.map((time) => (
                  <div key={time} className="h-[76px] border-b border-slate-200 flex items-center justify-center font-mono text-[11px] font-bold text-slate-400 bg-white/50 backdrop-blur-sm">
                    {time}
                  </div>
                ))}
              </div>
              
              {Array.from({ length: totalDays || 1 }, (_, i) => i + 1)
                .filter(dayNum => modalDayFilter === 'all' || modalDayFilter === dayNum)
                .map((dayNum) => {
                const coveredHours = getCoveredHoursForDay(dayNum);
                
                return (
                  <div key={dayNum} className="flex-1 min-w-[180px] border-r border-slate-100 flex flex-col bg-white/80 backdrop-blur-sm">
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
                              className="flex flex-col bg-white p-2.5 rounded-xl border border-sky-100 hover:border-sky-300 hover:shadow-lg shadow-md w-full h-full relative transition-all duration-300 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4px] before:bg-gradient-to-b before:from-sky-400 before:to-sky-500 before:rounded-l-xl overflow-hidden group"
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
                                    <span className="text-[9px] bg-sky-50 text-[#38BDF8] px-1.5 py-0.5 rounded font-bold border border-sky-100/50">
                                      {duration}h
                                    </span>
                                    <p className="text-[#38BDF8] text-[10px] font-extrabold">{formatVND(act.price)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleRemove(time, dayNum); }}
                                className="absolute right-2 top-2 w-5 h-5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 text-[9px] shadow-sm font-bold border border-rose-100"
                                title="Xoá khỏi lịch trình"
                              >
                                ✕
                              </button>

                              <div 
                                className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize flex items-center justify-center group-hover:bg-sky-50/80 transition-colors rounded-b-2xl z-20"
                                onMouseDown={(mouseDownEvent) => {
                                  mouseDownEvent.preventDefault();
                                  mouseDownEvent.stopPropagation();
                                  resizeStartYRef.current = mouseDownEvent.clientY;
                                  resizeStartDurationRef.current = duration;
                                  setResizingSlot(slotKey);
                                  setResizeDeltaY(0);
                                }}
                              >
                                <div className="w-6 h-1 bg-[#38BDF8] rounded-full shadow-sm hover:scale-y-150 transition-transform" />
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div 
                          key={time}
                          className="h-[76px] border-b border-slate-100/60 p-1 relative hover:bg-sky-50/40 transition-all duration-200 group flex items-center justify-center border-dashed border-sky-200/50"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDropForDay(dayNum, time, e)}
                        >
                          <div className="opacity-0 group-hover:opacity-100 text-[10px] text-sky-500 font-bold transition-opacity pointer-events-none bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-lg shadow-sm">
                            + Thả vào khung giờ này
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

        {/* Right: AI Chat Box */}
        <div className="w-[300px] bg-slate-50 border-l border-slate-200 p-4 flex flex-col overflow-hidden flex-shrink-0 shadow-[-2px_0_10px_rgba(0,0,0,0.02)] z-20">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex-1 flex flex-col overflow-hidden shadow-sm">
            <h4 className="font-extrabold text-[#1C2B38] text-[14.5px] tracking-tight mb-1 flex items-center gap-2">
              <div className="bg-purple-100 p-1.5 rounded-lg">
                <Sparkle size={14} className="text-purple-600" />
              </div>
              Chat với AI
            </h4>
            <p className="text-slate-400 text-[11px] font-medium mb-4 pb-3 border-b border-slate-100">Yêu cầu AI phân bổ lại thời gian hoặc thay đổi lịch trình</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin mb-4 flex flex-col">
              {chatMessages.length === 0 ? (
                <div className="text-center py-6 my-auto">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <Robot size={24} className="text-purple-500" />
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed">Ví dụ: <br/><span className="text-slate-700 italic">"Dời lịch tham quan Đại Nội sang buổi chiều"</span> hoặc <span className="text-slate-700 italic">"Sắp xếp lại sao cho rảnh buổi tối"</span>.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl text-[12.5px] max-w-[85%] flex flex-col shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white self-end ml-auto font-medium border-transparent' 
                        : 'bg-slate-50 text-slate-700 mr-auto border border-slate-200 font-medium'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập yêu cầu..."
                className="flex-1 text-[12.5px] p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 bg-slate-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] font-medium"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-[12.5px] rounded-xl transition-all shadow-md hover:scale-105 flex items-center justify-center"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  durations: Record<string, { days: number; nights: number }>;
  scheduledActs: Record<string, Activity & { customDurationHours?: number }>;
  onFinish: (data: { participants: number, totalPrice: number, customerNotes?: string }) => void;
  startDate: Date | null;
}) {
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [customerNotes, setCustomerNotes] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<'overview' | 'itinerary' | 'reviews' | 'policies'>('itinerary');
  const [activeDay, setActiveDay] = React.useState(1);

  const totalDays = Object.values(durations).reduce((sum, d) => sum + d.days, 0);
  const totalNights = Object.values(durations).reduce((sum, d) => sum + d.nights, 0);
  
  const scheduledList = Object.values(scheduledActs);
  const totalActivitiesCount = scheduledList.length;

  const totalStayPriceUSD = destinations.reduce((sum, dest) => {
    const days = durations[dest.id]?.days || 1;
    return sum + 60.00 * days;
  }, 0);

  const totalActivitiesPriceUSD = scheduledList.reduce((sum, act) => sum + act.price, 0);
  const pricePerPersonUSD = totalStayPriceUSD + totalActivitiesPriceUSD;
  const totalPriceUSD = (adults + children * 0.5) * pricePerPersonUSD;

  const getFormattedDayDate = (dayNum: number) => {
    if (!startDate) return `Day ${dayNum}`;
    const date = new Date(startDate.getTime());
    date.setDate(startDate.getDate() + dayNum - 1);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDestinationForDay = (dayNum: number) => {
    let currentDay = 0;
    for (const dest of destinations) {
      const days = durations[dest.id]?.days || 1;
      currentDay += days;
      if (dayNum <= currentDay) return dest.name;
    }
    return destinations[destinations.length - 1]?.name || "";
  };

  const getActivitiesForPeriod = (dayNum: number, period: 'morning' | 'afternoon' | 'night') => {
    const dayActs: { time: string; act: Activity }[] = [];
    
    Object.entries(scheduledActs).forEach(([key, act]) => {
      const [d, t] = key.split('-');
      if (parseInt(d, 10) === dayNum) {
        dayActs.push({ time: t, act });
      }
    });

    dayActs.sort((a, b) => a.time.localeCompare(b.time));

    return dayActs.filter(({ time }) => {
      const hour = parseInt(time.split(':')[0], 10);
      if (period === 'morning') return hour >= 6 && hour < 12;
      if (period === 'afternoon') return hour >= 12 && hour < 18;
      if (period === 'night') return hour >= 18 || hour < 6;
      return false;
    });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 max-w-[1200px] mx-auto mt-4 px-4 mb-10">
      
      {/* Left Column: Trip Summary & Tabs */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <h2 className="text-[24px] font-bold font-serif text-[#1C2B38] mb-4">Trip Summary</h2>
        
        {/* Tabs / Filters (Yêu cầu của sếp: "nhớ có cái filter chỗ này") */}
        {/* Kiến thức JS: onClick gọi arrow function để cập nhật state */}
        <div className="flex gap-6 border-b border-slate-100 mb-6">
          {['overview', 'itinerary', 'reviews', 'policies'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 text-[14px] font-bold capitalize transition-all relative ${
                activeTab === tab ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#38BDF8] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'itinerary' ? (
          <div>
            {/* Day Tabs */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
              {Array.from({ length: totalDays || 1 }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex flex-col items-center p-2.5 min-w-[80px] rounded-xl border transition-all ${
                    activeDay === day 
                      ? 'bg-sky-50 border-sky-200 text-[#38BDF8] font-bold shadow-sm' 
                      : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Day {day}</span>
                  <span className="text-[14px] font-bold mt-0.5">{getFormattedDayDate(day)}</span>
                </button>
              ))}
            </div>

            {/* Destination Header */}
            <div className="text-center mb-6">
              <h3 className="text-[18px] font-bold text-[#38BDF8] uppercase tracking-wider">{getDestinationForDay(activeDay)}</h3>
            </div>

            {/* Timeline Periods */}
            {['morning', 'afternoon', 'night'].map((period) => {
              const periodActs = getActivitiesForPeriod(activeDay, period as any);
              if (periodActs.length === 0) return null;

              return (
                <div key={period} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{period}</span>
                    <div className="flex-1 h-[1px] bg-slate-100" />
                  </div>

                  <div className="space-y-3">
                    {periodActs.map(({ time, act }) => (
                      <div key={time} className="flex gap-4 items-center bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-sky-100 transition-colors shadow-sm group">
                        <span className="text-[13px] font-mono font-bold text-slate-400 min-w-[45px] text-center">{time}</span>
                        <div className="w-[60px] h-[45px] rounded-lg overflow-hidden flex-shrink-0 relative">
                          <Image src={act.image || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"} alt={act.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#1C2B38] text-[13.5px] line-clamp-1">{act.name}</h4>
                          <p className="text-slate-400 text-[11px] truncate mt-0.5">{act.address}</p>
                        </div>
                        <p className="text-[#38BDF8] text-[14px] font-extrabold">{formatVND(act.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {['morning', 'afternoon', 'night'].every(p => getActivitiesForPeriod(activeDay, p as any).length === 0) && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-[13px] font-medium">Không có hoạt động nào được lên lịch cho ngày này.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-[14px] font-medium">
             Nội dung phần <span className="text-[#38BDF8] font-bold capitalize">{activeTab}</span> đang được cập nhật...
          </div>
        )}
      </div>

      {/* Right Column: Trip Overview Sidebar */}
      <div className="w-full lg:w-[380px] flex-shrink-0">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] sticky top-24">
          <h3 className="text-[18px] font-bold text-[#1C2B38] mb-1">Trip Overview</h3>
          <p className="text-[#38BDF8] text-[16px] font-extrabold mb-6">
            {formatVND(pricePerPersonUSD)} <span className="text-slate-400 text-[12px] font-medium">/ person</span>
          </p>
          
          <div className="space-y-3 mb-6 border-b border-slate-100 pb-6">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500 font-medium">Total Destinations</span>
              <span className="font-bold text-slate-700">{destinations.length.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500 font-medium">Total Activities</span>
              <span className="font-bold text-slate-700">{totalActivitiesCount.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500 font-medium">Total Time</span>
              <span className="font-bold text-slate-700">{totalDays}D{totalNights}N</span>
            </div>
          </div>

          {/* Destination List with small images */}
          <div className="space-y-3 mb-6 border-b border-slate-100 pb-6">
            {destinations.map((dest, idx) => {
              const days = durations[dest.id]?.days || 1;
              const destStayPriceUSD = 60.00 * days;
              return (
                <div key={dest.id} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="w-[40px] h-[30px] rounded overflow-hidden flex-shrink-0 relative shadow-sm">
                    <Image src={dest.image} alt={dest.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1C2B38] text-[12px] truncate">{dest.name}</h4>
                    <p className="text-slate-400 text-[10px] font-medium">Day {idx + 1}</p>
                  </div>
                  <span className="text-[#38BDF8] font-bold text-[12px]">{formatVND(destStayPriceUSD)}</span>
                </div>
              );
            })}
          </div>

          {/* Guest Counter */}
          <div className="mb-6 border-b border-slate-100 pb-6">
            <h4 className="font-bold text-[#1C2B38] text-[13px] mb-3">No. Of Guest</h4>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
              <span className="text-[12.5px] text-slate-600 font-medium">Adults</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                  className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-colors text-[12px] font-bold shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-[12.5px] w-4 text-center text-slate-700">{adults}</span>
                <button 
                  onClick={() => setAdults(prev => prev + 1)}
                  className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-colors text-[12px] font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[12.5px] text-slate-600 font-medium">Children</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                  className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-colors text-[12px] font-bold shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-[12.5px] w-4 text-center text-slate-700">{children}</span>
                <button 
                  onClick={() => setChildren(prev => prev + 1)}
                  className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-colors text-[12px] font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-slate-500 text-[12px] tracking-wider uppercase">Total</span>
            <span className="font-extrabold text-[#38BDF8] text-[22px]">{formatVND(totalPriceUSD)}</span>
          </div>

          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-amber-700">
              Lưu ý khi đặt Private Tour
            </p>
            <ul className="space-y-1.5">
              {PRIVATE_TOUR_NOTES.map((note) => (
                <li key={note} className="text-[12px] leading-relaxed text-amber-800">
                  - {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <label className="block text-[12px] font-extrabold uppercase tracking-wide text-sky-700 mb-2">
              Yêu cầu riêng cho hướng dẫn viên (không bắt buộc)
            </label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="VD: Mình dị ứng hải sản, không ăn cay, muốn đi xe đạp buổi sáng..."
              rows={3}
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Lưu ý này sẽ được gửi cho phía tour để chuẩn bị tốt hơn cho bạn.
            </p>
          </div>

          <button
            className="w-full bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(56,189,248,0.25)] text-[14px] mb-3 hover:scale-[1.01]"
            onClick={() => onFinish({ 
              participants: adults + children, 
              totalPrice: totalPriceUSD,
              customerNotes: customerNotes.trim() || undefined,
            })}
          >
            CONFIRM BOOKING
          </button>

          <div className="flex gap-2">
             <button className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors">
                Save To Wishlist
             </button>
             <button className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors">
                Share The Activity
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
