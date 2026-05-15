"use client";

import Link from "next/link";
import { 
  CheckCircle, 
  Clock, 
  House, 
  DeviceMobile,
  EnvelopeOpen
} from "@phosphor-icons/react";

export default function PartnerSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-[600px] w-full text-center">
        
        {/* Biểu tượng hoàn tất với hiệu ứng chuyển động nhẹ */}
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-pulse" />
          <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
            <CheckCircle size={80} weight="fill" className="text-white" />
          </div>
        </div>

        <h1 className="text-[32px] md:text-[40px] font-black text-[#1E293B] mb-6 leading-tight">
          Hồ sơ của bạn đã được gửi thành công!
        </h1>
        
        <p className="text-gray-500 text-lg mb-12 font-medium leading-relaxed px-4">
          Cảm ơn bạn đã tin tưởng Travel Match. Đội ngũ của chúng tôi sẽ xem xét hồ sơ và phản hồi trong vòng <span className="text-[#1E293B] font-bold">24 giờ làm việc</span> qua email.
        </p>

        {/* Các bước tiếp theo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <NextStepCard 
            icon={<EnvelopeOpen size={24} className="text-[#38BDF8]" />} 
            title="Kiểm tra Email" 
            desc="Chúng tôi sẽ gửi xác nhận và các hướng dẫn tiếp theo." 
          />
          <NextStepCard 
            icon={<Clock size={24} className="text-amber-500" />} 
            title="Đang phê duyệt" 
            desc="Tài khoản của bạn sẽ được nâng cấp lên 'Tour Owner' sau khi duyệt." 
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link 
            href="/" 
            className="w-full sm:w-auto bg-[#1E293B] hover:bg-[#0F172A] text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <House size={20} /> Về Trang chủ
          </Link>
          <button 
            className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 text-gray-600 px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-gray-200"
          >
            <DeviceMobile size={20} /> Hỗ trợ 24/7
          </button>
        </div>

      </div>
    </div>
  );
}

function NextStepCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 bg-[#F8FAFC] rounded-[24px] border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-[#1E293B] mb-2">{title}</h3>
      <p className="text-[14px] text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
