"use client";

import { useState } from "react";
import { 
  FileText, 
  PencilSimpleLine, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  DownloadSimple
} from "@phosphor-icons/react";

export default function PartnerContractPage() {
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState("");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-12 pb-24 px-4">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Tiêu đề trang */}
        <div className="text-center mb-16">
          <h1 className="text-[40px] font-black text-[#1E293B] mb-4">Hợp đồng Đối tác Chiến lược</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Vui lòng đọc kỹ các điều khoản và thực hiện ký kết điện tử để chính thức trở thành đối tác của chúng tôi.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-16 gap-4">
          <StepItem number={1} label="Thông tin" completed />
          <div className="w-16 h-[2px] bg-[#38BDF8]" />
          <StepItem number={2} label="Ký hợp đồng" active />
          <div className="w-16 h-[2px] bg-gray-200" />
          <StepItem number={3} label="Xác thực" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột trái: Nội dung hợp đồng */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 h-[600px] overflow-y-auto custom-scrollbar relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#38BDF8] rounded-xl flex items-center justify-center">
                    <FileText size={24} weight="bold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#1E293B]">HỢP ĐỒNG HỢP TÁC</h2>
                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Số: TM-2024-001</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[14px] font-bold text-[#38BDF8] hover:underline">
                  <DownloadSimple size={20} /> Tải PDF
                </button>
              </div>

              <div className="prose prose-slate max-w-none text-gray-600 font-medium leading-relaxed space-y-6">
                <p className="font-bold text-[#1E293B]">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</p>
                <p>Travel Match cung cấp nền tảng công nghệ giúp Đối tác tiếp cận khách hàng và quản lý tour du lịch trực tuyến.</p>
                
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-l-4 border-l-[#38BDF8]">
                  <p className="font-bold text-[#1E293B] mb-2 text-[16px]">ĐIỀU 2: PHÍ DỊCH VỤ & CHIẾT KHẤU</p>
                  <p className="text-[#1E293B]">
                    Đối tác đồng ý chi trả mức phí hoa hồng là <span className="text-[#38BDF8] font-black text-lg">10%</span> trên tổng giá trị mỗi đơn đặt tour thành công thông qua hệ thống Travel Match.
                  </p>
                </div>

                <p className="font-bold text-[#1E293B]">ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ</p>
                <p>Đối tác có trách nhiệm cung cấp thông tin tour chính xác, đảm bảo chất lượng dịch vụ như đã cam kết với khách hàng.</p>
                
                <p>...</p>
                <p className="text-sm italic text-gray-400">(Nội dung hợp đồng được giản lược để minh họa giao diện)</p>
              </div>
            </div>
          </div>

          {/* Cột phải: Khu vực ký tên */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center gap-2">
                <PencilSimpleLine size={24} className="text-[#38BDF8]" />
                Ký tên tại đây
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-400 uppercase ml-1">Họ và tên người đại diện</label>
                  <input 
                    type="text" 
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none text-[15px] font-bold"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>

                <div className="h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group">
                  {signature ? (
                    <span className="text-3xl font-signature text-[#1E293B] rotate-[-2deg] select-none">{signature}</span>
                  ) : (
                    <p className="text-gray-400 text-[13px] font-medium">Nhập tên để tạo chữ ký</p>
                  )}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShieldCheck size={20} className="text-green-500" weight="fill" />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group mt-6">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded text-[#38BDF8] focus:ring-[#38BDF8]"
                    checked={signed}
                    onChange={(e) => setSigned(e.target.checked)}
                  />
                  <span className="text-[13px] text-gray-500 font-medium leading-tight">
                    Tôi đại diện cho doanh nghiệp cam kết các thông tin trên là chính xác và đồng ý ký kết hợp đồng này.
                  </span>
                </label>

                <div className="pt-4 space-y-3">
                  <button 
                    disabled={!signed || !signature}
                    onClick={() => window.location.href = '/be-partner/success'}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${signed && signature ? 'bg-[#38BDF8] text-white shadow-[#38BDF8]/20 hover:bg-[#32AADB] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Xác nhận & Ký kết <ArrowRight size={20} weight="bold" />
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="w-full py-4 rounded-2xl font-bold text-[#1E293B] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} /> Quay lại
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                <ShieldCheck size={20} weight="fill" /> An toàn & Bảo mật
              </h4>
              <p className="text-[12px] text-green-700 leading-relaxed font-medium">
                Hợp đồng này có giá trị pháp lý tương đương hợp đồng giấy theo Luật Giao dịch điện tử. Dữ liệu của bạn được mã hóa 256-bit.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StepItem({ number, label, active, completed }: { number: number, label: string, active?: boolean, completed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${active ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/30 scale-110' : completed ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border-2 border-gray-100'}`}>
        {completed ? <ShieldCheck size={20} weight="bold" /> : number}
      </div>
      <span className={`font-bold text-[15px] ${active || completed ? 'text-[#1E293B]' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}
