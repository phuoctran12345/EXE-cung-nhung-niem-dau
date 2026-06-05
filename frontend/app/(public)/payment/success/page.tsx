"use client";

import { CheckCircle, CalendarCheck, ArrowRight, Sparkle, CircleNotch, ShieldCheck } from "@phosphor-icons/react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get("orderCode");
  const isFreeOrder = searchParams.get("free") === "1";
  const paymentType = searchParams.get("type");
  const paidByWallet = searchParams.get("wallet") === "1";

  const [isVerifying, setIsVerifying] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderCode) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        await new Promise(resolve => setTimeout(resolve, isFreeOrder ? 800 : 2000));

        const confirmUrl = paymentType === "private"
          ? `${apiUrl}/private-tour-requests/confirm-payment?orderCode=${orderCode}`
          : `${apiUrl}/bookings/confirm-payment?orderCode=${orderCode}`;
        const res = await fetch(confirmUrl, { method: "POST" });
        const data = await res.json();
        console.log(">>> [FRONTEND] Đã xác nhận đơn hàng:", data);
        setIsVerifying(false);
      } catch (error) {
        console.error(">>> [FRONTEND] Lỗi xác thực:", error);
        setIsVerifying(false); // Vẫn tắt màn hình chờ để hiện nội dung (có thể xử lý lỗi riêng)
      }
    };

    confirmPayment();
  }, [orderCode, isFreeOrder, paymentType]);

  // Tự động đếm ngược và điều hướng về trang cá nhân sau khi thành công
  useEffect(() => {
    if (!isVerifying) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(paymentType === "private" ? "/my-private-tours" : "/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isVerifying, router]);

  if (isVerifying) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="relative mb-8">
          <CircleNotch size={100} weight="bold" className="text-[#38BDF8] animate-spin" />
          <ShieldCheck size={40} weight="fill" className="text-[#38BDF8] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-[24px] font-black text-[#1A2434] mb-2">
          {isFreeOrder ? "Đang xác nhận đơn hàng..." : "Đang xác thực giao dịch..."}
        </h2>
        <p className="text-gray-400 font-medium italic">
          {isFreeOrder ? "Tour miễn phí (voucher 100%)" : "Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra với PayOS"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-[550px] w-full bg-white rounded-[40px] p-10 shadow-[0_30px_80px_rgba(56,189,248,0.1)] border border-blue-50 text-center animate-scale-up relative overflow-hidden">
        {/* Hiệu ứng trang trí rạng rỡ */}
        <div className="absolute top-10 left-10 animate-pulse text-amber-400"><Sparkle size={24} weight="fill" /></div>
        <div className="absolute bottom-10 right-10 animate-pulse text-[#38BDF8]"><Sparkle size={32} weight="fill" /></div>

        <div className="w-28 h-28 bg-[#F0F9FF] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white">
          <CheckCircle size={70} weight="fill" className="text-[#38BDF8]" />
        </div>

        <h1 className="text-[36px] font-black text-[#1A2434] mb-4">
          {paidByWallet
            ? "Thanh toán bằng ví thành công!"
            : isFreeOrder
              ? "Đặt tour thành công!"
              : "Thanh toán thành công!"}
        </h1>
        <p className="text-gray-500 font-medium text-[17px] mb-10 leading-relaxed">
          {isFreeOrder ? (
            <>
              Đơn hàng <span className="font-bold text-green-600">miễn phí</span> mã{" "}
              <span className="font-bold text-[#38BDF8]">#{orderCode}</span> đã được xác nhận.
              Bạn sẽ được chuyển đến lịch sử đơn hàng sau{" "}
              <span className="font-black text-[#38BDF8]">{countdown}s</span>.
            </>
          ) : (
            <>
              Giao dịch mã <span className="font-bold text-[#38BDF8]">#{orderCode}</span> đã hoàn tất.
              Bạn sẽ được tự động chuyển đến trang lịch sử đơn hàng sau{" "}
              <span className="font-black text-[#38BDF8]">{countdown}s</span>.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/profile" className="flex items-center justify-center gap-2 bg-[#1A2434] hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-xl hover:-translate-y-1">
            <CalendarCheck size={22} weight="bold" /> Xem đơn hàng
          </Link>
          <Link href="/tours" className="flex items-center justify-center gap-2 bg-[#38BDF8] hover:bg-[#32AADB] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#38BDF8]/20 hover:-translate-y-1">
            Khám phá thêm <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>}>
      <SuccessContent />
    </Suspense>
  );
}
