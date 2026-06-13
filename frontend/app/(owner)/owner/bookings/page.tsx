"use client";

import { useState, useEffect } from "react";
import { Users, Envelope, CalendarCheck, MapPin } from "@phosphor-icons/react";

interface Booking {
  _id: string;
  totalPrice: number;
  numberOfParticipants: number;
  createdAt: string;
  tourId?: { title?: string; location?: string };
  customerId?: { name?: string; email?: string };
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${apiUrl}/bookings/owner/all-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách booking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Danh sách Khách hàng</h1>
        <p className="text-gray-500 font-medium">Các đơn đặt tour đã thanh toán thuộc tour của bạn.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Chưa có đơn hàng</h3>
          <p className="text-gray-500">Chưa có khách hàng nào đặt tour của bạn.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-[#1E293B] mb-1">
                  {b.customerId?.name || "Khách hàng"}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                  <Envelope size={14} /> {b.customerId?.email || "—"}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> {b.tourId?.title || "Tour"} · {b.numberOfParticipants} người
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <CalendarCheck size={14} />
                  {b.createdAt ? new Date(b.createdAt).toLocaleString("vi-VN") : "—"}
                </p>
              </div>
              <span className="font-black text-[#38BDF8] text-lg">{formatVND(b.totalPrice)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
