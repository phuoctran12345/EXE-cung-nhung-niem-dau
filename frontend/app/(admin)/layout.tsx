"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Buildings,
  Compass,
  TrendUp, 
  MapPin, 
  UserGear, 
  ArrowLeft,
  SignOut,
  Bell
} from "@phosphor-icons/react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");

  // Kiểm tra quyền Admin trước khi cho phép xem nội dung
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/");
    } else {
      setAdminName(user.name);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar cố định bên trái */}
      <aside className="w-[280px] bg-[#0F172A] text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/20">
            <ShieldCheck size={24} weight="bold" />
          </div>
          <span className="text-xl font-black tracking-tight">TRAVEL MATCH</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <AdminSidebarLink href="/admin/dashboard" icon={<TrendUp size={22} />} label="Bảng điều khiển" />
          <AdminSidebarLink href="/admin/tours" icon={<MapPin size={22} />} label="Kiểm duyệt Tour" />
          <AdminSidebarLink href="/admin/destinations" icon={<Compass size={22} />} label="Tour Cá nhân" />
          <AdminSidebarLink href="/admin/partners" icon={<Buildings size={22} />} label="Duyệt đối tác" />
          <AdminSidebarLink href="/admin/users" icon={<UserGear size={22} />} label="Quản lý Người dùng" />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-medium">
            <ArrowLeft size={20} /> Quay lại Trang chủ
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
          >
            <SignOut size={22} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Khu vực nội dung chính */}
      <div className="flex-1 ml-[280px]">
        {/* Thanh công cụ phía trên trong Dashboard */}
        <header className="h-20 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <span>Quản trị</span> / <span className="text-[#0F172A]">Hệ thống</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-[#0F172A] transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden md:block">
                <div className="text-[14px] font-bold text-[#0F172A]">{adminName}</div>
                <div className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Quản trị viên</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold">
                {adminName?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung trang */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function AdminSidebarLink({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-bold text-[15px]">{label}</span>
    </Link>
  );
}
