"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, CalendarBlank, Receipt, CheckCircle, WarningCircle, Ticket } from "@phosphor-icons/react";

interface BookingHistory {
  _id: string;
  totalPrice: number;
  originalPrice: number;
  discountAmount: number;
  voucherCode?: string;
  numberOfParticipants: number;
  status: string;
  orderCode: number;
  createdAt: string;
  tourId: {
    _id: string;
    title: string;
    location: string;
    images: string[];
    price: number;
  };
}

export default function MyTripsPage() {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem lịch sử chuyến đi của bạn.");
          setLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${apiUrl}/bookings/my-history`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            setError("Không thể tải dữ liệu lịch sử đặt tour.");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử chuyến đi:", err);
        setError("Có lỗi xảy ra khi kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTrips();
  }, []);

  const formatVND = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải dữ liệu chuyến đi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col pb-20 pt-10">
      <div className="max-w-[1000px] mx-auto w-full px-6">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-[36px] font-bold text-[#1E293B] mb-2">
            Chuyến Đi <span className="text-[#38BDF8]">Của Tôi</span>
          </h1>
          <p className="text-gray-500 text-[16px]">
            Quản lý và xem lại lịch sử các chuyến đi tuyệt vời mà bạn đã đặt trên TravelMatch.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <WarningCircle size={48} className="text-red-400 mb-4" weight="fill" />
            <h3 className="text-red-800 font-bold text-xl mb-2">Oops! Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.dispatchEvent(new Event("open-login-modal"))}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold transition-colors"
            >
              Đăng nhập lại
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 shadow-sm text-center border border-gray-50">
            <div className="w-24 h-24 bg-[#F0F9FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt size={48} className="text-[#38BDF8]" weight="fill" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E293B] mb-3">Bạn chưa có chuyến đi nào</h3>
            <p className="text-gray-500 mb-8 max-w-[400px] mx-auto">
              Hãy bắt đầu hành trình khám phá thế giới cùng TravelMatch ngay hôm nay! Rất nhiều điểm đến hấp dẫn đang chờ bạn.
            </p>
            <Link href="/tours" className="inline-flex bg-[#38BDF8] hover:bg-[#32AADB] text-white px-8 py-3.5 rounded-full font-bold text-[16px] transition-all shadow-lg shadow-[#38BDF8]/20 hover:-translate-y-1">
              Khám phá Tour ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col md:flex-row">
                {/* Hình ảnh Tour */}
                <div className="relative w-full md:w-[280px] h-[200px] md:h-auto flex-shrink-0">
                  <Image 
                    src={booking.tourId?.images?.[0] || "https://picsum.photos/seed/travel/600/400"} 
                    alt={booking.tourId?.title || "Tour image"} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                    <span className="text-[12px] font-bold text-green-700 uppercase tracking-wide">Đã thanh toán</span>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/tour/${booking.tourId?._id}`} className="hover:text-[#38BDF8] transition-colors">
                      <h2 className="text-[20px] font-bold text-[#1E293B] line-clamp-2">
                        {booking.tourId?.title || "Tour không xác định"}
                      </h2>
                    </Link>
                    <span className="text-[13px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg shrink-0">
                      #{booking.orderCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 text-[14px] font-medium mb-6">
                    <MapPin size={16} className="text-[#38BDF8]" weight="fill" /> {booking.tourId?.location || "Không rõ địa điểm"}
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F0F9FF] flex items-center justify-center text-[#38BDF8]">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="text-[12px] text-gray-400 font-bold uppercase">Số người</div>
                        <div className="text-[15px] text-[#1E293B] font-bold">{booking.numberOfParticipants} người</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F5A524]">
                        <CalendarBlank size={20} />
                      </div>
                      <div>
                        <div className="text-[12px] text-gray-400 font-bold uppercase">Ngày đặt</div>
                        <div className="text-[15px] text-[#1E293B] font-bold">{formatDate(booking.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Voucher Info */}
                    {booking.voucherCode ? (
                      <div className="flex items-center gap-2 text-[13px] text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 w-fit">
                        <Ticket size={16} weight="fill" />
                        <span className="font-bold">Voucher: {booking.voucherCode}</span>
                        <span>(-{formatVND(booking.discountAmount)})</span>
                      </div>
                    ) : (
                      <div className="text-[13px] text-gray-400 italic">Không sử dụng voucher</div>
                    )}
                    
                    {/* Total Price */}
                    <div className="text-right">
                      <div className="text-[12px] text-gray-400 font-bold uppercase">Tổng thanh toán</div>
                      <div className="text-[22px] font-black text-[#38BDF8] leading-none">
                        {formatVND(booking.totalPrice)}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
