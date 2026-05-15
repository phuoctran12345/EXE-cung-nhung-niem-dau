"use client";

import { useState, useEffect } from "react";
import { Users, CreditCard, ShieldCheck, ArrowRight, X, WarningCircle, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react";
import Image from "next/image";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  tour: any;
  participants?: number;
}

export default function BookingForm({ isOpen, onClose, tour, participants: initialParticipants = 1 }: BookingFormProps) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const price = tour?.price || 0;
  const totalPrice = price * participants;

  const formatVND = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập để thực hiện đặt tour.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId: tour._id,
          numberOfParticipants: participants,
          totalPrice: totalPrice
        })
      });

      const result = await res.json();
      
      if (result.success && result.data.paymentUrl) {
        // Giả lập hiệu ứng chờ 1 giây để người dùng thấy thông báo chuyển hướng
        setTimeout(() => {
          window.location.href = result.data.paymentUrl;
        }, 1200);
      } else {
        setLoading(false);
        setError(result.message || "Không thể tạo link thanh toán.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setLoading(false);
      setError("Lỗi kết nối. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay mờ nền */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Lớp phủ trạng thái đang chuyển hướng thanh toán (Premium UX) */}
      {loading && !error && (
        <div className="absolute inset-0 z-[10001] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in rounded-[32px]">
          <div className="relative">
            <CircleNotch size={80} weight="bold" className="text-[#38BDF8] animate-spin" />
            <PaperPlaneTilt size={32} weight="fill" className="text-[#38BDF8] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="mt-8 text-[22px] font-black text-[#1A2434]">Đang kết nối thanh toán...</h3>
          <p className="mt-2 text-gray-500 font-medium text-center px-10">
            Chúng tôi đang chuyển bạn đến cổng thanh toán an toàn của <strong>PayOS</strong>. Vui lòng không tắt trình duyệt.
          </p>
        </div>
      )}

      <div className="relative w-full max-w-[500px] bg-white rounded-[32px] overflow-hidden shadow-2xl animate-fade-in flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <X size={20} weight="bold" />
        </button>

        <div className="relative h-[180px] w-full">
          <Image src={tour?.images?.[0] || "https://picsum.photos/seed/travel/800/600"} alt={tour?.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-white text-xl font-bold line-clamp-1">{tour?.title}</h2>
            <p className="text-white/80 text-sm font-medium flex items-center gap-1">
              Địa điểm: {tour?.location}
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
              <WarningCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" weight="fill" />
              <span className="text-red-600 text-[14px] font-bold">{error}</span>
            </div>
          )}

          <div className="mb-8">
            <label className="text-gray-500 font-bold text-sm uppercase mb-3 block tracking-wider">Số lượng người tham gia</label>
            <div className="flex items-center gap-4 bg-[#F8F9FA] p-2 rounded-2xl border border-gray-100">
              <button 
                onClick={() => setParticipants(prev => Math.max(1, prev - 1))}
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#F5A524] shadow-sm hover:bg-gray-50 transition-all font-bold text-xl"
              >-</button>
              <div className="flex-1 flex items-center justify-center gap-2 font-bold text-xl text-[#1E293B]">
                <Users size={24} weight="bold" className="text-[#38BDF8]" /> {participants}
              </div>
              <button 
                onClick={() => setParticipants(prev => Math.min(tour?.slots || 10, prev + 1))}
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#F5A524] shadow-sm hover:bg-gray-50 transition-all font-bold text-xl"
              >+</button>
            </div>
            <p className="text-[12px] text-gray-400 mt-2 font-medium italic text-center">Chỗ trống còn lại: {tour?.slots} người</p>
          </div>

          <div className="bg-[#F0F9FF] rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">{formatVND(price)} x {participants} người</span>
              <span className="text-gray-800 font-bold">{formatVND(totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#38BDF8]/20">
              <span className="text-[#1E293B] font-extrabold text-lg">Tổng cộng tạm tính</span>
              <span className="text-[#38BDF8] font-black text-2xl">{formatVND(totalPrice)}</span>
            </div>
          </div>

          <button 
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-[#38BDF8] hover:bg-[#32AADB] text-white py-4 rounded-full font-bold text-[18px] flex items-center justify-center gap-3 shadow-lg shadow-[#38BDF8]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <CreditCard size={24} weight="bold" />
            Tiến hành thanh toán <ArrowRight size={20} weight="bold" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-gray-400 font-medium italic">
            <ShieldCheck size={18} className="text-green-500" /> Thanh toán an toàn và bảo mật qua PayOS
          </div>
        </div>
      </div>
    </div>
  );
}
