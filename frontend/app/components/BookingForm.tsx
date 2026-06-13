"use client";

import { useState, useEffect } from "react";
import { Users, CreditCard, ShieldCheck, ArrowRight, X, WarningCircle, CircleNotch, PaperPlaneTilt, Ticket, Wallet } from "@phosphor-icons/react";
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
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setVoucherCode("");
      setDiscountAmount(0);
      setAppliedVoucher(null);
      const token = localStorage.getItem("token");
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        fetch(`${apiUrl}/wallets/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => setWalletBalance(d?.balance ?? 0))
          .catch(() => setWalletBalance(0));
      } else {
        setWalletBalance(0);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setDiscountAmount(0);
    setAppliedVoucher(null);
  }, [participants]);

  if (!isOpen || !mounted) return null;

  const price = tour?.price || 0;
  const subtotal = price * participants;
  const totalPrice = Math.max(0, subtotal - discountAmount);
  const isFreeCheckout = totalPrice === 0 && !!appliedVoucher;
  const walletUsed = Math.min(walletBalance, totalPrice);
  const payosAmount = Math.max(0, totalPrice - walletUsed);
  const paysFullyByWallet = totalPrice > 0 && payosAmount === 0;

  const formatVND = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const getTourId = () => tour?._id || tour?.id;

  const getErrorMessage = (data: unknown, fallback: string) => {
    if (!data || typeof data !== "object") return fallback;
    const msg = (data as { message?: string | string[] }).message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    return fallback;
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError("Vui lòng nhập mã voucher.");
      return;
    }
    const tourId = getTourId();
    if (!tourId) {
      setError("Không xác định được tour. Vui lòng tải lại trang.");
      return;
    }

    setVoucherLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${apiUrl}/vouchers/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode.trim(),
          tourId,
          subtotal,
        }),
      });
      const result = await res.json();
      if (result.valid) {
        setDiscountAmount(Math.round(result.discountAmount));
        setAppliedVoucher(result.code);
        setVoucherCode(result.code);
      } else {
        setDiscountAmount(0);
        setAppliedVoucher(null);
        setError(result.message || "Voucher không hợp lệ.");
      }
    } catch {
      setError("Không thể kiểm tra voucher. Vui lòng thử lại.");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscountAmount(0);
    setAppliedVoucher(null);
    setError(null);
  };

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Yêu cầu: khi người dùng chưa có phân quyền thì hãy redirect về trang đăng nhập / đăng kí
      onClose(); // Đóng form booking hiện tại
      window.dispatchEvent(new Event("open-login-modal")); // Mở popup đăng nhập
      return;
    }

    const tourId = getTourId();
    if (!tourId) {
      setError("Không xác định được tour. Vui lòng tải lại trang.");
      return;
    }

    if (voucherCode.trim() && !appliedVoucher) {
      setError('Vui lòng nhấn "Áp dụng" mã voucher trước khi thanh toán.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const body: Record<string, unknown> = {
        tourId,
        numberOfParticipants: participants,
      };

      if (appliedVoucher) {
        body.voucherCode = appliedVoucher;
      } else {
        body.totalPrice = subtotal;
      }

      const res = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      const data = result?.data;
      const paymentUrl = data?.paymentUrl;
      const redirectUrl = data?.redirectUrl;

      if (!res.ok) {
        setLoading(false);
        // Xử lý lỗi 401 Unauthorized từ server (token hết hạn hoặc không hợp lệ)
        if (res.status === 401) {
          onClose();
          window.dispatchEvent(new Event("open-login-modal"));
          return;
        }
        setError(getErrorMessage(result, "Không thể hoàn tất đặt tour."));
        return;
      }

      if (data?.paidFully && redirectUrl) {
        setTimeout(() => {
          window.location.assign(redirectUrl);
        }, 600);
        return;
      }

      if (paymentUrl) {
        if (data?.walletUsed > 0 && data?.payosAmount > 0) {
          alert(
            `Đã trừ ${data.walletUsed.toLocaleString("vi-VN")} VNĐ từ ví. ` +
              `Chuyển PayOS để thanh toán phần còn lại ${data.payosAmount.toLocaleString("vi-VN")} VNĐ.`
          );
        }
        const delay = data?.isFree ? 400 : 1200;
        setTimeout(() => {
          window.location.assign(paymentUrl);
        }, delay);
        return;
      }

      setLoading(false);
      setError(getErrorMessage(result, "Không nhận được link thanh toán từ server."));
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
          <h3 className="mt-8 text-[22px] font-black text-[#1A2434]">
            {isFreeCheckout ? "Đang hoàn tất đặt tour miễn phí..." : "Đang kết nối thanh toán..."}
          </h3>
          <p className="mt-2 text-gray-500 font-medium text-center px-10">
            {isFreeCheckout ? (
              <>Voucher giảm 100% — không cần thanh toán qua PayOS.</>
            ) : (
              <>Chúng tôi đang chuyển bạn đến cổng thanh toán an toàn của <strong>PayOS</strong>. Vui lòng không tắt trình duyệt.</>
            )}
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

          <div className="mb-6">
            <label className="text-gray-500 font-bold text-sm uppercase mb-3 block tracking-wider">Mã giảm giá</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#38BDF8]" />
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={!!appliedVoucher}
                  placeholder="Nhập mã voucher"
                  className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl border border-gray-100 focus:ring-2 focus:ring-[#38BDF8] outline-none font-bold uppercase disabled:opacity-60"
                />
              </div>
              {appliedVoucher ? (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="px-4 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                >
                  Xóa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={voucherLoading || !voucherCode.trim()}
                  className="px-5 py-3 rounded-xl font-bold text-white bg-[#1A2434] hover:bg-[#2a3a52] transition-all disabled:opacity-50"
                >
                  {voucherLoading ? "..." : "Áp dụng"}
                </button>
              )}
            </div>
            {appliedVoucher && (
              <p className="text-green-600 text-[13px] font-bold mt-2">
                Đã áp dụng mã {appliedVoucher} — giảm {formatVND(discountAmount)}
              </p>
            )}
          </div>

          <div className="bg-[#F0F9FF] rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">{formatVND(price)} x {participants} người</span>
              <span className="text-gray-800 font-bold">{formatVND(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600">
                <span className="font-medium">Giảm giá voucher</span>
                <span className="font-bold">-{formatVND(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[#38BDF8]/20">
              <span className="text-[#1E293B] font-extrabold text-lg">Tổng thanh toán</span>
              <span className="text-[#38BDF8] font-black text-2xl">{formatVND(totalPrice)}</span>
            </div>
            {!isFreeCheckout && totalPrice > 0 && (
              <div className="mt-4 pt-3 border-t border-[#38BDF8]/10 space-y-1.5 text-[13px]">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <Wallet size={16} className="text-[#38BDF8]" weight="fill" />
                  Số dư ví: {formatVND(walletBalance)}
                </div>
                <p>Trừ từ ví: <strong className="text-emerald-600">{formatVND(walletUsed)}</strong></p>
                {payosAmount > 0 ? (
                  <p>Qua PayOS: <strong className="text-[#38BDF8]">{formatVND(payosAmount)}</strong></p>
                ) : (
                  <p className="text-emerald-600 font-medium">Đủ số dư ví — không cần PayOS</p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleBooking}
            disabled={loading}
            className={`w-full text-white py-4 rounded-full font-bold text-[18px] flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
              isFreeCheckout
                ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
                : "bg-[#38BDF8] hover:bg-[#32AADB] shadow-[#38BDF8]/20"
            }`}
          >
            <CreditCard size={24} weight="bold" />
            {isFreeCheckout
              ? "Xác nhận đặt tour miễn phí"
              : paysFullyByWallet
                ? "Thanh toán bằng ví"
                : "Tiến hành thanh toán"}
            <ArrowRight size={20} weight="bold" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-gray-400 font-medium italic">
            <ShieldCheck size={18} className="text-green-500" />
            {isFreeCheckout
              ? "Đơn hàng được xác nhận ngay, không qua cổng PayOS"
              : paysFullyByWallet
                ? "Thanh toán ưu tiên từ ví — 90% vào ví chủ tour, 10% phí sàn"
                : "Ưu tiên trừ ví trước, phần còn lại qua PayOS (tài khoản admin)"}
          </div>
        </div>
      </div>
    </div>
  );
}
