"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react"; // Nhập hook useState để quản lý trạng thái đóng/mở popup
import LoginModal from "./LoginModal"; // Import component LoginModal mới tạo
import ProfileDropdown from "./ProfileDropdown"; // Import component ProfileDropdown vừa tạo

interface StoredUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

type AuthState =
  | { status: "loading" }
  | { status: "ready"; user: StoredUser | null };

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user");
    if (!stored || stored === "undefined") return null;
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPrivateTour = pathname === "/privateTour" || pathname?.startsWith("/privateTour");
  const isBePartner = pathname === "/be-partner" || pathname?.startsWith("/be-partner");
  const isTransparent = isHome || isPrivateTour;
  
  // Trạng thái điều khiển việc ẩn/hiển thị của Popup Đăng nhập
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Gộp user + trạng thái đọc auth vào 1 state — tránh flash giữa các lần render
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = auth.status === "ready" ? auth.user : null;
  const authChecked = auth.status === "ready";
  const isPartnerOrAdmin = user?.role === "tour_owner" || user?.role === "admin";
  const showPartnerLink = authChecked && !isPartnerOrAdmin;

  // useLayoutEffect chạy trước khi browser paint → không bị nháy UI
  useLayoutEffect(() => {
    setAuth({ status: "ready", user: readStoredUser() });
  }, []);

  // Lắng nghe event mở popup login từ các component khác
  useEffect(() => {
    const handleOpenLogin = () => setIsLoginOpen(true);
    window.addEventListener("open-login-modal", handleOpenLogin);
    return () => window.removeEventListener("open-login-modal", handleOpenLogin);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ status: "ready", user: null });
    setIsProfileOpen(false);
    window.location.reload();
  };

  return (
    <>
      <header className={`${isTransparent ? 'absolute top-0 w-full z-50 pt-6' : 'relative z-50 bg-[#1A2434] py-4'}`}>
        <div className={`max-w-[1400px] mx-auto px-6 lg:px-12 ${isTransparent ? 'h-16' : 'h-20'} flex items-center justify-between text-white`}>

          {/* Logo */}
          <Link href="/" className="relative w-[180px] h-[45px] flex-shrink-0 cursor-pointer">
            <Image src="/logo.png" alt="TravelMatch Logo" fill className="object-contain object-left" priority />
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium">
            <Link href="/" className={`text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] ${isHome ? 'after:bg-white' : 'after:bg-transparent hover:after:bg-[#38BDF8]'} after:-bottom-2 after:left-0 transition-all`}>Trang chủ</Link>
            <Link href="/tours" className={`text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] ${pathname === '/tours' || pathname?.startsWith('/tour/') ? 'after:bg-[#38BDF8]' : 'after:bg-transparent hover:after:bg-[#38BDF8]'} after:-bottom-2 after:left-0 transition-all`}>Danh sách Tour</Link>
            <Link href="/privateTour" className={`text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] ${isPrivateTour ? 'after:bg-white' : 'after:bg-transparent hover:after:bg-[#38BDF8]'} after:-bottom-2 after:left-0 transition-all`}>Tour Cá nhân</Link>
            {showPartnerLink && (
              <Link href="/be-partner" className={`text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] ${isPrivateTour ? 'after:bg-white' : 'after:bg-transparent hover:after:bg-[#38BDF8]'} after:-bottom-2 after:left-0 transition-all`}>Hợp tác với chúng tôi</Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-[15px] font-medium">
            {!authChecked ? null : user ? (
              // Hiển thị Profile khi đã đăng nhập
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white/20 overflow-hidden flex items-center justify-center text-lg font-bold cursor-pointer hover:scale-105 transition-transform"
                >
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name} width={40} height={40} className="object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </button>
                
                {isProfileOpen && (
                  <ProfileDropdown 
                    user={user} 
                    onLogout={handleLogout} 
                    onClose={() => setIsProfileOpen(false)} 
                  />
                )}
              </div>
            ) : (
              // Hiển thị nút Đăng nhập/Đăng ký khi chưa đăng nhập
              <>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="text-white hover:text-[#F5A524] transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-[#F5A524] hover:bg-[#D98C1C] px-6 py-2.5 rounded-full transition-colors font-bold shadow-lg shadow-[#F5A524]/20 text-white cursor-pointer"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Render LoginModal và truyền các props cần thiết để đóng mở */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

