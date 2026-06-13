"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  PencilSimpleLine, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  DownloadSimple
} from "@phosphor-icons/react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { STORAGE_KEY } from "../page";

interface DraftData {
  companyName: string;
  taxCode: string;
  address: string;
  website?: string;
  licenseUrl?: string;
}

export default function PartnerContractPage() {
  const router = useRouter();
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState("");
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tempSignature, setTempSignature] = useState<string | null>(null);

  // Refs và State cho tính năng vẽ chữ ký
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

  // Khởi tạo cấu hình canvas
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/be-partner");
      return;
    }
    try {
      setDraft(JSON.parse(raw));
    } catch {
      router.replace("/be-partner");
    }
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Đặt kích thước canvas bằng kích thước hiển thị thực tế
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Cấu hình nét vẽ
    ctx.strokeStyle = '#1E293B'; // Màu mực tối
    ctx.lineWidth = 4; // Tăng độ dày nét vẽ để nhìn rõ hơn (zoom)
    ctx.lineCap = 'round'; // Đầu nét vẽ tròn
    ctx.lineJoin = 'round'; // Khớp nối tròn
  }, []);

  // Hàm bắt đầu vẽ
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    // Xử lý cho cả chuột và cảm ứng
    if ('touches' in e) {
      e.preventDefault(); // Ngăn cuộn trang trên mobile
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsCanvasEmpty(false);
  };

  // Hàm đang vẽ
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Hàm dừng vẽ
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Hàm xóa chữ ký
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Xóa toàn bộ nội dung trong canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsCanvasEmpty(true);
  };

  const handleSubmit = async () => {
    if (!draft || !signed || !signature || isCanvasEmpty) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập để gửi hồ sơ.");
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas?.toDataURL("image/png");

    setSubmitting(true);
    setError("");

    try {
      // 1. Gắn tạm chữ ký vào DOM để render ra PDF
      setTempSignature(signatureDataUrl || null);
      // Đợi React render xong ảnh chữ ký
      await new Promise(resolve => setTimeout(resolve, 200));

      const contractElement = document.getElementById("contract-content");
      if (!contractElement) throw new Error("Không tìm thấy nội dung hợp đồng");

      // Xóa giới hạn chiều cao để capture toàn bộ hợp đồng
      const originalHeight = contractElement.style.height;
      const originalOverflow = contractElement.style.overflow;
      contractElement.style.height = 'auto';
      contractElement.style.overflow = 'visible';

      // 2. Chụp ảnh HTML bằng html-to-image (hỗ trợ tốt hơn Tailwind v4 oklch)
      const imgData = await htmlToImage.toPng(contractElement, { pixelRatio: 2 });
      
      // Khôi phục giao diện
      contractElement.style.height = originalHeight;
      contractElement.style.overflow = originalOverflow;
      setTempSignature(null);

      // 3. Tạo file PDF bằng jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Lấy kích thước thật của ảnh để tính chiều cao
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], "hop-dong.pdf", { type: "application/pdf" });

      // 4. Upload PDF lên Cloudinary qua backend
      const formData = new FormData();
      formData.append("files", pdfFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const uploadRes = await fetch(`${apiUrl}/uploads/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadResult = await uploadRes.json();
      
      if (!uploadRes.ok || !uploadResult.success || !uploadResult.data?.[0]) {
        throw new Error("Không thể upload PDF hợp đồng lên máy chủ.");
      }
      
      const contractUrl = uploadResult.data[0];

      // 5. Gửi dữ liệu đăng ký cùng contractUrl
      const res = await fetch(`${apiUrl}/partner-applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: draft.companyName,
          taxCode: draft.taxCode,
          address: draft.address,
          website: draft.website || undefined,
          licenseUrl: draft.licenseUrl || undefined,
          contractUrl: contractUrl,
          representativeName: signature,
          signatureDataUrl,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Không thể gửi hồ sơ. Vui lòng thử lại.";
        throw new Error(msg);
      }
      sessionStorage.removeItem(STORAGE_KEY);
      router.push("/be-partner/success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi kết nối máy chủ.");
      setTempSignature(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <div id="contract-content" className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 h-[600px] overflow-y-auto custom-scrollbar relative">
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
                <button className="flex items-center gap-2 text-[14px] font-bold text-[#38BDF8] hover:underline" data-html2canvas-ignore="true">
                  <DownloadSimple size={20} /> Tải PDF
                </button>
              </div>

              <div className="prose prose-slate max-w-none text-gray-600 font-medium leading-relaxed space-y-6">
                <p className="font-bold text-[#1E293B]">BÊN ĐỐI TÁC: {draft.companyName}</p>
                <p className="text-sm">MST: {draft.taxCode} · {draft.address}</p>
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

              {/* Phần hiển thị chữ ký khi in PDF */}
              {tempSignature && (
                <div className="mt-12 flex justify-between px-10 border-t border-gray-100 pt-8">
                  <div className="text-center">
                    <p className="font-bold text-[#1E293B] mb-2">ĐẠI DIỆN TRAVEL MATCH</p>
                    <p className="italic text-gray-400 text-sm mb-16">(Chữ ký điện tử)</p>
                    <p className="font-bold text-[#1E293B]">Trần Hồng Phước</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#1E293B] mb-2">ĐẠI DIỆN ĐỐI TÁC</p>
                    <img src={tempSignature} alt="Chữ ký" className="h-16 object-contain mx-auto mb-2" />
                    <p className="font-bold text-[#1E293B]">{signature}</p>
                  </div>
                </div>
              )}
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

                <div className="relative">
                  <div className="h-60 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 relative group overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseOut={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {isCanvasEmpty && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-400 text-[13px] font-medium">Vẽ chữ ký của bạn tại đây</p>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <ShieldCheck size={20} className="text-green-500" weight="fill" />
                    </div>
                  </div>
                  {!isCanvasEmpty && (
                    <button 
                      type="button"
                      onClick={clearCanvas}
                      className="absolute top-2 right-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-white/80 px-2 py-1 rounded-md"
                    >
                      Xóa
                    </button>
                  )}
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
                  {error && (
                    <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-3 rounded-xl">
                      {error}
                    </p>
                  )}
                  <button 
                    disabled={!signed || !signature || isCanvasEmpty || submitting}
                    onClick={handleSubmit}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${signed && signature && !isCanvasEmpty && !submitting ? 'bg-[#38BDF8] text-white shadow-[#38BDF8]/20 hover:bg-[#32AADB] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    {submitting ? "Đang gửi hồ sơ..." : "Xác nhận & Gửi duyệt"} <ArrowRight size={20} weight="bold" />
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
