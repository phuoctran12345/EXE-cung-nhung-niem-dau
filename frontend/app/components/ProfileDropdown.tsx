"use client";

import Image from "next/image";
import { 
  User, 
  GoogleLogo, 
  ArrowsLeftRight, 
  SignOut, 
  MonitorPlay, 
  CurrencyDollar, 
  ShieldCheck, 
  Moon, 
  Translate, 
  WarningCircle, 
  Globe, 
  Keyboard, 
  Gear, 
  Question, 
  ChatTeardropText 
} from "@phosphor-icons/react";

interface ProfileDropdownProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  };
  onLogout: () => void;
  onClose: () => void;
}

export default function ProfileDropdown({ user, onLogout, onClose }: ProfileDropdownProps) {
  // Giao diện dropdown được thiết kế theo phong cách YouTube/Google
  // Bao gồm thông tin người dùng, các tùy chọn tài khoản và cài đặt hệ thống
  
  return (
    <div className="absolute top-14 right-0 w-[300px] bg-[#282828] text-[#F1F1F1] rounded-xl shadow-2xl py-2 z-[100] border border-white/10 animate-fade-in-down overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
      {/* Phần đầu: Hiển thị Avatar, Tên và Email của người dùng */}
      <div className="flex gap-4 px-4 py-4 border-b border-white/10">
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-600 flex items-center justify-center text-lg font-bold">
          {user?.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user?.name || 'User'} fill className="object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-medium text-[16px] truncate">{user?.name || 'Người dùng'}</span>
          <span className="text-[14px] text-[#AAAAAA] truncate">{user.email}</span>
          <button
            onClick={() => { window.location.href = '/profile'; onClose(); }}
            className="text-[#3EA6FF] text-[14px] mt-2 text-left hover:text-[#65B8FF] transition-colors"
          >
            Xem hồ sơ của bạn
          </button>
        </div>
      </div>

      {/* Menu items nhóm 1 */}
      <div className="py-2 border-b border-white/10">
        <MenuItem icon={<GoogleLogo size={22} />} label="Tài khoản Google" />
        <MenuItem icon={<ArrowsLeftRight size={22} />} label="Chuyển đổi tài khoản" hasArrow />
        {(!user.role || user.role === 'customer') && (
          <MenuItem 
            icon={<CurrencyDollar size={22} className="text-[#F5A524]" />} 
            label="Trở thành đối tác" 
            onClick={() => window.location.href = '/be-partner'}
          />
        )}
        <MenuItem icon={<SignOut size={22} />} label="Đăng xuất" onClick={onLogout} />
      </div>

      {/* Menu items nhóm 2 (Nghiệp vụ) */}
      <div className="py-2 border-b border-white/10">
        <MenuItem 
          icon={<MonitorPlay size={22} />} 
          label={user.role === 'tour_owner' ? 'Quản lý kinh doanh' : 'Chuyến đi của tôi'} 
          onClick={() => window.location.href = user.role === 'tour_owner' ? '/owner/dashboard' : '/my-trips'}
        />
        {(!user.role || user.role === 'customer') && (
          <MenuItem
            icon={<Globe size={22} />}
            label="Tour cá nhân của tôi"
            onClick={() => window.location.href = '/my-private-tours'}
          />
        )}
        {user.role === 'tour_owner' && (
          <MenuItem 
            icon={<ArrowsLeftRight size={22} />} 
            label="Đăng tour mới" 
            onClick={() => window.location.href = '/owner/create-tour'}
          />
        )}
        {user.role === 'admin' && (
          <MenuItem 
            icon={<ShieldCheck size={22} />} 
            label="Trang Quản trị Admin" 
            onClick={() => window.location.href = '/admin/dashboard'}
          />
        )}
        <MenuItem icon={<CurrencyDollar size={22} />} label="Giao dịch mua và gói thành viên" />
      </div>

      {/* Menu items nhóm 3 (Cài đặt hiển thị) */}
      <div className="py-2 border-b border-white/10">
        <MenuItem icon={<ShieldCheck size={22} />} label="Dữ liệu của bạn trong TravelMatch" />
        <MenuItem icon={<Moon size={22} />} label="Giao diện: Tối" hasArrow />
        <MenuItem icon={<Translate size={22} />} label="Ngôn ngữ: Tiếng Việt" hasArrow />
        <MenuItem icon={<WarningCircle size={22} />} label="Chế độ hạn chế: Đã tắt" hasArrow />
        <MenuItem icon={<Globe size={22} />} label="Địa điểm: Việt Nam" hasArrow />
        <MenuItem icon={<Keyboard size={22} />} label="Phím tắt" />
      </div>

      {/* Menu items nhóm cuối */}
      <div className="py-2">
        <MenuItem icon={<Gear size={22} />} label="Cài đặt" />
        <div className="border-t border-white/10 my-2" />
        <MenuItem icon={<Question size={22} />} label="Trợ giúp" />
        <MenuItem icon={<ChatTeardropText size={22} />} label="Gửi ý kiến phản hồi" />
      </div>
    </div>
  );
}

function MenuItem({ icon, label, hasArrow, onClick }: { icon: React.ReactNode, label: string, hasArrow?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
    >
      <span className="text-[#F1F1F1]">{icon}</span>
      <span className="flex-1 text-[14px]">{label}</span>
      {hasArrow && (
        <svg className="w-5 h-5 text-[#AAAAAA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
