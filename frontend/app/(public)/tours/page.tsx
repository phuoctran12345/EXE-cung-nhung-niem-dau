"use client";

import { useState, useEffect } from "react";
import TourCard from "../../components/TourCard";
import { MagnifyingGlass, Funnel, MapPin, CalendarBlank } from "@phosphor-icons/react";

// Giao diện cho dữ liệu Tour từ Backend
interface TourData {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  slots: number;
  images: string[];
  duration?: string;
}

export default function ToursPage() {
  const [tours, setTours] = useState<TourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Lấy danh sách tour từ Backend
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${apiUrl}/tours`);
        const data = await res.json();
        setTours(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Xử lý tìm kiếm tour theo từ khóa
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${apiUrl}/tours?search=${searchQuery}`);
      const data = await res.json();
      setTours(data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <main className="flex-1 pt-10 pb-20">
        {/* Banner tiêu đề trang danh sách */}
        <div className="max-w-[1200px] mx-auto px-6 mb-12">
          <h1 className="text-[42px] font-bold text-[#1E293B] mb-4">
            Danh Sách <span className="text-[#38BDF8]">Tour Hiện Có</span>
          </h1>
          <p className="text-gray-500 text-[16px] max-w-[600px]">
            Khám phá những hành trình tuyệt vời trên khắp Việt Nam. Chất lượng cao, hướng dẫn viên bản địa và những kỷ niệm khó quên.
          </p>
        </div>

        {/* Thanh công cụ Tìm kiếm & Lọc kết quả */}
        <div className="max-w-[1200px] mx-auto px-6 mb-10">
          <div className="bg-white p-4 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-4 items-center">
            {/* Input tìm kiếm */}
            <form onSubmit={handleSearch} className="relative flex-1 w-full">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm điểm đến, tên tour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-full border-none focus:ring-2 focus:ring-[#38BDF8] outline-none text-[15px]"
              />
            </form>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#F8F9FA] rounded-full text-gray-600 font-bold text-[14px] hover:bg-gray-100 transition-colors">
                <MapPin size={18} /> Địa điểm
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#F8F9FA] rounded-full text-gray-600 font-bold text-[14px] hover:bg-gray-100 transition-colors">
                <CalendarBlank size={18} /> Ngày khởi hành
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#38BDF8] text-white rounded-full font-bold text-[14px] hover:bg-[#32AADB] transition-colors shadow-lg shadow-[#38BDF8]/20">
                <Funnel size={18} /> Lọc kết quả
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách các Tour được render từ dữ liệu Backend */}
        <div className="max-w-[1200px] mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải danh sách tour...</p>
            </div>
          ) : tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <TourCard
                  key={tour._id}
                  id={tour._id}
                  title={tour.title}
                  location={tour.location}
                  price={tour.price || 0} // Truyền giá trị số (USD) - TourCard sẽ tự chuyển sang VNĐ
                  img={tour.images?.[0] || "https://picsum.photos/seed/travel/600/400"}
                  duration={tour.duration || "Liên hệ để biết thêm"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px] shadow-sm">
              <div className="text-[60px] mb-4">🏝️</div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-2">Không tìm thấy tour nào</h3>
              <p className="text-gray-500">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để tìm thấy tour bạn mong muốn.</p>
              <button 
                onClick={() => {setSearchQuery(""); window.location.reload();}}
                className="mt-6 text-[#38BDF8] font-bold hover:underline"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
