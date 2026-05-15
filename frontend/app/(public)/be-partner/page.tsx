"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Buildings, 
  IdentificationCard, 
  MapPin, 
  UploadSimple, 
  ArrowRight,
  CheckCircle
} from "@phosphor-icons/react";

export default function BecomePartnerPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    taxCode: "",
    address: "",
    website: ""
  });

  // Kiến thức JS: Quản lý trạng thái form đồng bộ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-12 pb-24 px-4">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Tiêu đề trang */}
        <div className="text-center mb-16">
          <h1 className="text-[40px] font-black text-[#1E293B] mb-4">Trở thành Đối tác Travel Match</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Tham gia vào mạng lưới cung cấp dịch vụ du lịch hàng đầu và tiếp cận hàng triệu khách hàng tiềm năng.
          </p>
        </div>

        {/* Stepper - Chỉ báo quy trình 3 bước */}
        <div className="flex items-center justify-center mb-16 gap-4">
          <StepItem number={1} label="Thông tin" active />
          <div className="w-16 h-[2px] bg-gray-200" />
          <StepItem number={2} label="Ký hợp đồng" />
          <div className="w-16 h-[2px] bg-gray-200" />
          <StepItem number={3} label="Xác thực" />
        </div>

        {/* Form đăng ký chính */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row gap-12">
          
          {/* Cột trái: Form nhập liệu */}
          <div className="flex-1 space-y-8">
            <h2 className="text-2xl font-bold text-[#1E293B] flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#38BDF8] flex items-center justify-center text-sm">01</span>
              Thông tin doanh nghiệp
            </h2>

            <div className="space-y-6">
              <InputGroup 
                label="Tên công ty / Hộ kinh doanh" 
                name="companyName" 
                placeholder="VD: Công ty Du lịch Travel Match" 
                icon={<Buildings size={20} />} 
                value={formData.companyName}
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Mã số thuế" 
                  name="taxCode" 
                  placeholder="0123456789" 
                  icon={<IdentificationCard size={20} />} 
                  value={formData.taxCode}
                  onChange={handleInputChange}
                />
                <InputGroup 
                  label="Website (Không bắt buộc)" 
                  name="website" 
                  placeholder="www.yourcompany.com" 
                  icon={<ArrowRight size={20} />} 
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              <InputGroup 
                label="Địa chỉ trụ sở" 
                name="address" 
                placeholder="Số 123, Đường ABC, Quận XYZ..." 
                icon={<MapPin size={20} />} 
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Cột phải: Upload tài liệu & Nút submit */}
          <div className="w-full md:w-[350px] space-y-8">
            <div className="p-8 bg-blue-50/50 rounded-[32px] border-2 border-dashed border-blue-200 flex flex-col items-center text-center group hover:border-[#38BDF8] transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#38BDF8] mb-4 group-hover:scale-110 transition-transform">
                <UploadSimple size={32} weight="bold" />
              </div>
              <h3 className="font-bold text-[#1E293B] mb-2">Giấy phép kinh doanh</h3>
              <p className="text-[13px] text-gray-500 font-medium">Hỗ trợ: PDF, JPG, PNG (Tối đa 10MB)</p>
              <button className="mt-6 bg-white text-[#38BDF8] px-6 py-2 rounded-xl font-bold text-sm shadow-sm border border-blue-100">Chọn file</button>
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1.5 rounded text-[#38BDF8] focus:ring-[#38BDF8]" />
                <span className="text-[14px] text-gray-500 font-medium leading-relaxed group-hover:text-[#1E293B] transition-colors">
                  Tôi đồng ý với <span className="text-[#38BDF8] font-bold underline">Điều khoản dịch vụ</span> và <span className="text-[#38BDF8] font-bold underline">Chính sách bảo mật</span> của Travel Match.
                </span>
              </label>

              <button 
                onClick={() => window.location.href = '/be-partner/contract'}
                className="w-full bg-[#38BDF8] hover:bg-[#32AADB] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#38BDF8]/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Tiếp theo: Ký hợp đồng <ArrowRight size={20} weight="bold" />
              </button>
              
              <p className="text-center text-[12px] text-gray-400 font-medium">Bạn có thể lưu bản nháp và hoàn tất sau.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StepItem({ number, label, active }: { number: number, label: string, active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${active ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/30 scale-110' : 'bg-white text-gray-400 border-2 border-gray-100'}`}>
        {number}
      </div>
      <span className={`font-bold text-[15px] ${active ? 'text-[#1E293B]' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function InputGroup({ label, placeholder, icon, value, onChange, name }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[14px] font-bold text-[#1E293B] ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#38BDF8] transition-colors">
          {icon}
        </div>
        <input 
          type="text" 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-2 border-transparent focus:border-[#38BDF8] focus:bg-white rounded-2xl outline-none transition-all text-[15px] font-medium"
        />
      </div>
    </div>
  );
}
