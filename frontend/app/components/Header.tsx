"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react"; // Nhập hook useState để quản lý trạng thái đóng/mở popup
import LoginModal from "./LoginModal"; // Import component LoginModal mới tạo
import ProfileDropdown from "./ProfileDropdown"; // Import component ProfileDropdown vừa tạo

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPrivateTour = pathname === "/privateTour" || pathname?.startsWith("/privateTour");
  const isTransparent = isHome || isPrivateTour;
  
  // Trạng thái điều khiển việc ẩn/hiển thị của Popup Đăng nhập
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Trạng thái người dùng và dropdown profile
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi parse user từ localStorage", e);
      }
    }
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
    setUser(null);
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
            
            {/* Nút Trở thành đối tác */}
            {(!user || user.role === 'customer') && (
              <Link 
                href="/be-partner" 
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-all flex items-center gap-2 group"
              >
                <span className="text-[#38BDF8] group-hover:scale-110 transition-transform text-lg">★</span>
                <span>Hợp tác với chúng tôi</span>
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-[15px] font-medium">
            {user ? (
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

