"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlass, 
  Funnel, 
  DotsThreeVertical,
  UserCircle,
  Envelope,
  IdentificationCard,
  Trash,
  Lock
} from "@phosphor-icons/react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${apiUrl}/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleLock = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem("token");
    const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${apiUrl}/users/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-500 font-medium">Xem và quản lý tất cả tài khoản trong hệ thống của bạn.</p>
        </div>
        <button className="bg-[#38BDF8] hover:bg-[#32AADB] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#38BDF8]/20 flex items-center gap-2">
           Thêm quản trị viên
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none text-[15px]"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#F8F9FA] rounded-xl text-gray-600 font-bold text-[14px] hover:bg-gray-100 transition-colors">
            <Funnel size={18} /> Lọc theo Vai trò
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-100">
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Người dùng</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Liên hệ</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Vai trò</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider">Ngày đăng ký</th>
                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#38BDF8] flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#1E293B]">{user.name}</div>
                        <div className="text-[12px] text-gray-400 italic">ID: {user._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[14px] text-gray-600"><Envelope size={16} /> {user.email}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-8 py-6 text-gray-500 text-[14px]">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleLock(user._id, (user as any).status || 'active')}
                        className={`p-2 transition-colors ${ (user as any).status === 'locked' ? 'text-red-500' : 'text-gray-400 hover:text-[#38BDF8]'}`}
                        title={(user as any).status === 'locked' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      >
                        <Lock size={20} weight={(user as any).status === 'locked' ? "fill" : "regular"} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash size={20} /></button>
                      <button className="p-2 text-gray-400 hover:text-[#1E293B] transition-colors"><DotsThreeVertical size={20} weight="bold" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const configs: any = {
    admin: { color: "text-purple-600 bg-purple-50", text: "Quản trị viên" },
    tour_owner: { color: "text-amber-600 bg-amber-50", text: "Chủ tour" },
    customer: { color: "text-[#38BDF8] bg-blue-50", text: "Khách hàng" },
  };
  const config = configs[role] || { color: "text-gray-600 bg-gray-50", text: "Người dùng" };
  return <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${config.color}`}>{config.text}</span>;
}
