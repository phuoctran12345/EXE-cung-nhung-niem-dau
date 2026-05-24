"use client";

import { useState, useEffect } from "react";
import { Buildings, Envelope, UserCircle, CheckCircle } from "@phosphor-icons/react";

interface PartnerUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      const token = localStorage.getItem("token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
        const res = await fetch(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPartners(data.filter((u: PartnerUser) => u.role === "tour_owner"));
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đối tác:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

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
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Duyệt đối tác</h1>
        <p className="text-gray-500 font-medium">
          Danh sách nhà cung cấp tour (tour owner) trên hệ thống.
        </p>
      </div>

      {partners.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100">
          <Buildings size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Chưa có đối tác</h3>
          <p className="text-gray-500">Chưa có tài khoản tour owner nào.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {partners.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F0F9FF] flex items-center justify-center text-[#38BDF8]">
                  <UserCircle size={28} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E293B]">{p.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Envelope size={14} /> {p.email}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                <CheckCircle size={14} weight="fill" />
                {p.status === "active" ? "Đang hoạt động" : p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
