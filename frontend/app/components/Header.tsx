"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // Nhập hook useState để quản lý trạng thái đóng/mở popup
import LoginModal from "./LoginModal"; // Import component LoginModal mới tạo

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  // Trạng thái điều khiển việc ẩn/hiển thị của Popup Đăng nhập
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className={`${isHome ? 'absolute top-0 w-full z-50 pt-6' : 'relative z-50 bg-[#1A2434] py-4'}`}>
        <div className={`max-w-[1400px] mx-auto px-6 lg:px-12 ${isHome ? 'h-16' : 'h-20'} flex items-center justify-between text-white`}>

          {/* Logo */}
          <Link href="/" className="relative w-[180px] h-[45px] flex-shrink-0 cursor-pointer">
            <Image src="/logo.png" alt="TravelMatch Logo" fill className="object-contain object-left" priority />
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium">
            <Link href="/" className={`text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] ${isHome ? 'after:bg-white' : 'after:bg-transparent hover:after:bg-[#38BDF8]'} after:-bottom-2 after:left-0 transition-all`}>Home</Link>
            <Link href="/tours" className={`text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] ${pathname?.startsWith('/tours') || pathname?.startsWith('/tour/') ? 'after:bg-[#38BDF8]' : 'after:bg-transparent hover:after:bg-[#38BDF8]'} after:-bottom-2 after:left-0 transition-all`}>Available Tours</Link>
            {/* Liên kết tới trang Private Tour */}
            <Link href="/privateTour" className="text-white/80 hover:text-white transition-colors">Private Tour</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-[15px] font-medium">
            {/* Khi click vào Log in sẽ mở modal đăng nhập */}
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="text-white hover:text-[#F5A524] transition-colors cursor-pointer"
            >
              Log in
            </button>
            {/* Khi click vào Sign up cũng mở modal đăng nhập */}
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#F5A524] hover:bg-[#D98C1C] px-6 py-2.5 rounded-full transition-colors font-bold shadow-lg shadow-[#F5A524]/20 text-white cursor-pointer"
            >
              Sign up
            </button>
          </div>

        </div>
      </header>

      {/* Render LoginModal và truyền các props cần thiết để đóng mở */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

