"use client";

import { useEffect } from "react";
import Image from "next/image";

// Khai báo kiểu dữ liệu cho Component LoginModal
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // Ngăn cuộn trang phía sau khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Nếu modal không mở, không render gì cả
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Lớp nền mờ (Backdrop) với hiệu ứng làm mờ kính và chuyển động mượt mà */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Khung Modal chính */}
      <div className="relative w-full max-w-[500px] bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-all duration-300 scale-100 flex flex-col animate-fade-in">
        
        {/* Nút đóng modal nằm ở góc trên bên phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Đóng"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Phần Header chứa ưu đãi và hình minh họa */}
        <div className="relative bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-white p-8 pb-6 flex items-center justify-between border-b border-slate-50 overflow-hidden">
          {/* Lớp trang trí màu xanh mờ phía sau */}
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-1 pr-4 z-10">
            <h2 className="text-[#0F172A] text-[22px] md:text-[24px] font-extrabold leading-tight tracking-tight">
              Chúng tôi có một ưu đãi vô cùng hấp dẫn!
            </h2>
          </div>
          
          {/* Hình minh họa 3D đẹp mắt */}
          <div className="relative w-[130px] h-[130px] md:w-[140px] md:h-[140px] flex-shrink-0 z-10 transform hover:scale-105 hover:rotate-2 transition-transform duration-300">
            <Image
              src="/login_illustration.png"
              alt="Travelmatch Offer Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Phần Body chứa các lựa chọn đăng nhập */}
        <div className="px-8 pb-8 pt-6 flex flex-col">
          {/* Nút đăng nhập bằng Apple */}
          <button className="w-full bg-white hover:bg-slate-50 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] rounded-full py-3.5 px-6 flex items-center transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 active:translate-y-0">
            {/* Logo Apple dạng SVG */}
            <div className="flex items-center justify-center w-6 h-6 mr-3">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" className="hidden" /> {/* Đây là mẫu dự phòng, dưới đây là SVG Apple thật chuẩn xác */}
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08 2.16.88 2.82-1.33z" />
              </svg>
            </div>
            {/* Đường gạch đứng chia tách */}
            <div className="w-[1px] h-5 bg-slate-200 mr-4" />
            {/* Văn bản của nút */}
            <span className="text-slate-800 text-[15px] font-bold text-center flex-1 pr-9 group-hover:text-black transition-colors">
              Apple
            </span>
          </button>

          {/* Khung chứa Google và Facebook chạy ngang */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Nút đăng nhập Google */}
            <button className="bg-white hover:bg-slate-50 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] rounded-full py-3.5 px-4 flex items-center transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 active:translate-y-0">
              {/* Logo Google đa sắc SVG */}
              <div className="flex items-center justify-center w-6 h-6 mr-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div className="w-[1px] h-5 bg-slate-200 mr-3" />
              <span className="text-slate-800 text-[15px] font-bold text-center flex-1 pr-6 group-hover:text-black transition-colors">
                Google
              </span>
            </button>

            {/* Nút đăng nhập Facebook */}
            <button className="bg-white hover:bg-slate-50 border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] rounded-full py-3.5 px-4 flex items-center transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 active:translate-y-0">
              {/* Logo Facebook SVG */}
              <div className="flex items-center justify-center w-6 h-6 mr-3">
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="w-[1px] h-5 bg-slate-200 mr-3" />
              <span className="text-slate-800 text-[15px] font-bold text-center flex-1 pr-6 group-hover:text-black transition-colors">
                Facebook
              </span>
            </button>
          </div>

          {/* Phần "Các lựa chọn khác" */}
          <div className="mt-8 text-center">
            <button className="text-[#38BDF8] hover:text-[#0284C7] font-extrabold text-[16px] cursor-pointer hover:underline transition-colors focus:outline-none">
              Các lựa chọn khác
            </button>
            <p className="text-slate-500 text-[13.5px] leading-relaxed mt-2.5 max-w-[340px] mx-auto">
              Giá thấp hơn và nhiều phần thưởng đang chờ bạn. Mở khóa ưu đãi bằng cách đăng nhập!
            </p>
          </div>

          {/* Điều khoản sử dụng và chính sách */}
          <p className="text-slate-400 text-[11px] leading-relaxed text-center mt-8 max-w-[420px] mx-auto">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="text-[#38BDF8] hover:underline font-semibold transition-all">
              Điều khoản và Điều kiện
            </a>{" "}
            này và bạn đã được thông báo về{" "}
            <a href="#" className="text-[#38BDF8] hover:underline font-semibold transition-all">
              Chính sách bảo vệ dữ liệu
            </a>{" "}
            của chúng tôi.
          </p>

          {/* Khách hàng truy cập không cần đăng nhập */}
          <div className="border-t border-slate-100 mt-6 pt-5 text-center">
            <button
              onClick={onClose}
              className="text-[#38BDF8] hover:text-[#0284C7] font-extrabold text-[16px] cursor-pointer hover:underline transition-colors focus:outline-none"
            >
              Tìm kiếm với tư cách là khách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
