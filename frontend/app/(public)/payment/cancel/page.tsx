"use client";

import { XCircle, ArrowLeft, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CancelContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  // Ghi chú: Với cơ chế mới (chỉ lưu khi thành công), khi người dùng hủy thanh toán, 
  // chúng ta không cần gọi API để hủy đơn trong DB vì đơn hàng đó vốn chưa được lưu.
  // Đơn hàng tạm thời sẽ tự động bị xóa khỏi Cache của Backend sau một khoảng thời gian.

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-[500px] w-full bg-white rounded-[40px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-50 text-center animate-fade-in">
        {/* Biểu tượng thông báo hủy giao dịch */}
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <XCircle size={60} weight="fill" className="text-red-500" />
        </div>

        <h1 className="text-[32px] font-black text-[#1A2434] mb-4">Thanh toán đã bị hủy</h1>
        <p className="text-gray-500 font-medium text-[16px] mb-8 leading-relaxed">
          Giao dịch của bạn (Mã đơn: <span className="font-bold text-black">{orderCode || "N/A"}</span>) đã được dừng lại theo yêu cầu. Đừng lo lắng, dữ liệu của bạn chưa bị trừ và bạn có thể đặt lại bất cứ lúc nào.
        </p>

        {/* Nút quay lại để tiếp tục khám phá tour */}
        <div className="space-y-4">
          <Link 
            href="/profile" 
            className="flex items-center justify-center gap-2 w-full bg-[#1A2434] hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-xl hover:-translate-y-1"
          >
            <ArrowLeft size={20} weight="bold" /> Quay lại trang cá nhân (Dashboard)
          </Link>
          
          <div className="flex items-center justify-center gap-2 text-[14px] text-gray-400 font-medium bg-gray-50 py-3 rounded-xl">
            <WarningCircle size={18} className="text-amber-500" />
            Cần hỗ trợ? Liên hệ Hotline: 1900 xxxx
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
