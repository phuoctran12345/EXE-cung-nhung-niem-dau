"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Compass, 
  Layout, 
  PlusCircle, 
  Users, 
  ArrowLeft,
  SignOut,
  Bell,
  ChartLineUp,
  Ticket,
  MapTrifold,
  Wallet
} from "@phosphor-icons/react";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");

  // Kiểm tra quyền Tour Owner
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "tour_owner") {
      router.push("/");
    } else {
      setOwnerName(user.name);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar cố định cho Owner */}
      <aside className="w-[280px] bg-[#1A2434] text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/20">
            <Compass size={24} weight="bold" />
          </div>
          <span className="text-xl font-black tracking-tight uppercase">Đối tác Hub</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <OwnerSidebarLink href="/owner/dashboard" icon={<Layout size={22} />} label="Tổng quan" />
          <OwnerSidebarLink href="/owner/create-tour" icon={<PlusCircle size={22} />} label="Đăng Tour mới" />
          <OwnerSidebarLink href="/owner/tours" icon={<ChartLineUp size={22} />} label="Quản lý Tour của tôi" />
          <OwnerSidebarLink href="/owner/vouchers" icon={<Ticket size={22} />} label="Quản lý Voucher" />
          <OwnerSidebarLink href="/owner/bookings" icon={<Users size={22} />} label="Danh sách Khách hàng" />
          <OwnerSidebarLink href="/owner/private-tours" icon={<MapTrifold size={22} />} label="Tour Cá Nhân" />
          <OwnerSidebarLink href="/owner/wallet" icon={<Wallet size={22} />} label="Ví của tôi" />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors font-medium">
            <ArrowLeft size={20} /> Quay lại Website
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
        {/* Thanh công cụ Dashboard */}
        <header className="h-20 bg-white border-b border-gray-100 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 font-medium text-[14px]">
            <span>Đối tác</span> / <span className="text-[#1A2434] font-bold uppercase tracking-tight">Cổng thông tin</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-[#1A2434] transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden md:block">
                <div className="text-[14px] font-bold text-[#1A2434]">{ownerName}</div>
                <div className="text-[12px] text-[#F5A524] font-bold uppercase tracking-wider">Chủ tour</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#38BDF8] text-white flex items-center justify-center font-bold shadow-md">
                {ownerName?.charAt(0) || "O"}
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung trang */}
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}

function OwnerSidebarLink({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-bold text-[15px]">{label}</span>
    </Link>
  );
}
