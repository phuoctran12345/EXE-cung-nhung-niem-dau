"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CloudArrowUp, 
  Plus, 
  Trash, 
  CalendarBlank, 
  MapPin, 
  CurrencyDollar, 
  Users,
  Image as ImageIcon,
  CheckCircle,
  ArrowLeft
} from "@phosphor-icons/react";
import Link from "next/link";

export default function CreateTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State quản lý form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    location: "",
    slots: 10,
    itinerary: [""], // Mảng lịch trình (mỗi ngày 1 dòng)
    dates: [new Date().toISOString().split('T')[0]], // Mảng ngày khởi hành
    images: [] as string[],
  });

  // Kiểm tra quyền (Chỉ cho phép tour_owner)
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "tour_owner") {
      alert("Bạn không có quyền truy cập trang này.");
      router.push("/");
    }
  }, [router]);

  // Xử lý thay đổi input cơ bản
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "price" || name === "slots" ? Number(value) : value }));
  };

  // Xử lý thêm/xóa/sửa Lịch trình (Itinerary)
  // Đây là kỹ thuật xử lý mảng trong State của React
  const handleItineraryChange = (index: number, value: string) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = value;
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const addItineraryStep = () => {
    setFormData({ ...formData, itinerary: [...formData.itinerary, ""] });
  };

  const removeItineraryStep = (index: number) => {
    if (formData.itinerary.length === 1) return;
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    setFormData({ ...formData, itinerary: newItinerary });
  };

  // Xử lý upload ảnh lên Backend (Cloudinary)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadFormData = new FormData();
    files.forEach(file => uploadFormData.append("files", file));

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
      const res = await fetch(`${apiUrl}/uploads/images`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: uploadFormData
      });
      const result = await res.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...result.data] }));
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Không thể upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  // Gửi form đăng tour
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Vui lòng upload ít nhất 1 tấm ảnh cho tour.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
      const res = await fetch(`${apiUrl}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result._id) {
        alert("Đăng tour thành công! Đang chờ Admin duyệt.");
        router.push("/owner/dashboard");
      }
    } catch (error) {
      console.error("Lỗi đăng tour:", error);
      alert("Đã có lỗi xảy ra khi đăng tour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header đơn giản */}
      <div className="bg-white border-b border-gray-100 py-6 px-6 mb-10">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-gray-500 font-bold hover:text-[#38BDF8] transition-colors">
            <ArrowLeft size={20} /> Quay lại Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1E293B]">Đăng Tour Mới</h1>
          <div className="w-[120px]"></div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Thông tin cơ bản */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <CheckCircle size={24} weight="fill" className="text-[#38BDF8]" /> Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Tên Tour</label>
                <input 
                  type="text" name="title" required 
                  value={formData.title} onChange={handleChange}
                  placeholder="Ví dụ: Khám phá Vịnh Hạ Long 2 ngày 1 đêm"
                  className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Mô tả Tour</label>
                <textarea 
                  name="description" required rows={4}
                  value={formData.description} onChange={handleChange}
                  placeholder="Mô tả chi tiết về trải nghiệm của khách..."
                  className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Giá (USD)</label>
                <div className="relative">
                  <CurrencyDollar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="number" name="price" required 
                    value={formData.price} onChange={handleChange}
                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Số lượng khách (Slots)</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="number" name="slots" required 
                    value={formData.slots} onChange={handleChange}
                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Địa điểm khởi hành</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" name="location" required 
                    value={formData.location} onChange={handleChange}
                    placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh"
                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Hình ảnh */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <ImageIcon size={24} weight="fill" className="text-[#38BDF8]" /> Hình ảnh Tour
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {formData.images.map((url, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                  <img src={url} alt="Tour" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              
              {/* Nút Upload */}
              <label className="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F0F9FF] hover:border-[#38BDF8] transition-all">
                {uploading ? (
                  <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CloudArrowUp size={32} className="text-[#38BDF8] mb-2" />
                    <span className="text-[12px] font-bold text-gray-400">Tải ảnh lên</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Section 3: Lịch trình */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
                <CalendarBlank size={24} weight="fill" className="text-[#38BDF8]" /> Lịch trình từng ngày
              </h2>
              <button 
                type="button" onClick={addItineraryStep}
                className="flex items-center gap-2 text-[#38BDF8] font-bold text-[14px] hover:underline"
              >
                <Plus weight="bold" /> Thêm ngày
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.itinerary.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F9FF] text-[#38BDF8] flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 relative">
                    <textarea 
                      required
                      value={step} 
                      onChange={(e) => handleItineraryChange(idx, e.target.value)}
                      placeholder={`Mô tả hoạt động của ngày thứ ${idx + 1}...`}
                      className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                    />
                    {formData.itinerary.length > 1 && (
                      <button 
                        type="button" onClick={() => removeItineraryStep(idx)}
                        className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút Submit */}
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={loading || uploading}
              className="px-10 py-4 bg-[#1A2434] hover:bg-black text-white rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng Tour & Gửi Duyệt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
