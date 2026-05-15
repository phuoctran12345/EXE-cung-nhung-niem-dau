"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchFloatingBar from "../components/SearchFloatingBar";
import TourCard from "../components/TourCard";
import DestinationCard from "../components/DestinationCard";
import {
  MapPin,
  CalendarBlank,
  Users,
  MagnifyingGlass,
  ArrowRight,
  Clock,
  Car,
  Star,
  GlobeHemisphereWest,
  BookmarkSimple,
  CaretLeft,
  CaretRight,
  ListDashes,
  AirplaneTilt,
  CaretDown,
  ArrowUpRight,
  AppleLogo,
  AndroidLogo,
  CheckCircle,
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  PinterestLogo
} from "@phosphor-icons/react";

// Định nghĩa danh sách các địa điểm du lịch nổi tiếng tại Việt Nam cho banner chính
const destinations = [
  {
    title: "Bà Nà Hills",
    titlePart1: "BÀ NÀ",
    titlePart2: "Hills",
    location: "Đà Nẵng, Việt Nam",
    description: "Bà Nà Hills là khu nghỉ dưỡng trên đỉnh núi nổi tiếng tại Đà Nẵng, được biết đến với Cầu Vàng mang tính biểu tượng, Làng Pháp và hệ thống cáp treo ngắm cảnh tuyệt đẹp.",
    bgImage: "/hero-bg.png",
    cardImage: "/hero-bg.png"
  },
  {
    title: "Phố Cổ Hội An",
    titlePart1: "HỘI AN",
    titlePart2: "Town",
    location: "Quảng Nam, Việt Nam",
    description: "Phố cổ Hội An là một ví dụ bảo tồn đặc biệt về thương cảng Đông Nam Á, nổi tiếng với những đêm đèn lồng lung linh và di sản văn hóa độc nhất.",
    bgImage: "/10.png",
    cardImage: "/10.png"
  },
  {
    title: "Cao Nguyên Đá Hà Giang",
    titlePart1: "HÀ GIANG",
    titlePart2: "Karst",
    location: "Hà Giang, Việt Nam",
    description: "Hà Giang sở hữu những đỉnh núi đá vôi hùng vĩ, thung lũng sâu, những con đèo uốn lượn và di sản văn hóa phong phú của các dân tộc thiểu số địa phương.",
    bgImage: "/9.png",
    cardImage: "/9.png"
  },
  {
    title: "Cố Đô Huế",
    titlePart1: "HUẾ",
    titlePart2: "Citadel",
    location: "Thừa Thiên Huế, Việt Nam",
    description: "Huế từng là kinh đô của triều đại nhà Nguyễn, nổi tiếng toàn cầu với đại nội hùng vĩ, lăng tẩm hoàng gia cổ kính và phong cảnh thơ mộng.",
    bgImage: "/8.png",
    cardImage: "/8.png"
  },
  {
    title: "Vịnh Nha Trang",
    titlePart1: "NHA TRANG",
    titlePart2: "Bay",
    location: "Khánh Hòa, Việt Nam",
    description: "Nha Trang là thành phố biển xinh đẹp được biết đến with những bãi cát trắng nguyên sơ, đa dạng sinh học biển phong phú, lặn biển và các đảo nhiệt đới.",
    bgImage: "/14.png",
    cardImage: "/14.png"
  }
];

export default function Home() {
  // Chỉ số của địa điểm hiện tại đang được hiển thị trên banner chính
  const [activeIndex, setActiveIndex] = useState(0);
  // Trạng thái tạm dừng tự động chuyển ảnh khi rê chuột vào banner
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    console.log(">>> [Next.js] Trang chủ đã được tải/cập nhật thành công! <<<");
  }, []);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Hàm chuyển sang slide tiếp theo
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % destinations.length);
  };

  // Hàm quay lại slide trước đó
  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  // Thiết lập tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused]);

  // Lấy danh sách 4 thẻ bên phải (các địa điểm tiếp theo trong hàng đợi)
  const rightCards = Array.from({ length: 4 }).map((_, i) => {
    const index = (activeIndex + 1 + i) % destinations.length;
    return {
      ...destinations[index],
      originalIndex: index
    };
  });

  const currentDest = destinations[activeIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9] text-[#1E293B] font-sans overflow-x-hidden">

      {/* Hero Section - Banner chính chạy động chứa thông tin các địa điểm Việt Nam */}
      <section 
        className="relative w-full min-h-[900px] flex flex-col overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Các hình nền chồng lên nhau với hiệu ứng chuyển đổi mượt mà (Crossfade) */}
        <div className="absolute inset-0 w-full h-full z-0">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={dest.bgImage}
                alt={dest.title}
                fill
                className={`object-cover ${idx === activeIndex ? "animate-zoom-in" : ""}`}
                priority={idx === 0}
              />
            </div>
          ))}
          {/* Lớp phủ mờ giúp tăng độ tương phản để đọc chữ dễ dàng hơn */}
          <div className="absolute inset-0 bg-black/40 z-20"></div>
          {/* Hiệu ứng chuyển sắc mờ dần ở dưới chân để mượt mà khi chuyển phần */}
          <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#F9F9F9] to-transparent z-20"></div>
        </div>


        {/* Khu vực nội dung chính của Hero Banner */}
        <div className="relative z-40 max-w-[1400px] mx-auto px-6 lg:px-12 mt-32 flex flex-col lg:flex-row justify-between items-start w-full">

          {/* Phần thông tin văn bản bên trái */}
          <div key={activeIndex} className="max-w-[500px] text-white animate-fade-in-up">
            <div className="flex items-center gap-2 text-[15px] font-medium mb-4">
              <MapPin size={20} className="text-[#F5A524]" weight="fill" />
              {currentDest.location}
            </div>
            <h1 className="flex flex-col mb-4">
              <span className="font-serif text-[100px] font-bold leading-[0.9] uppercase tracking-tight">
                {currentDest.titlePart1}
              </span>
              <span className="script-font text-[90px] font-normal leading-[0.5] tracking-wide ml-2 text-white">
                {currentDest.titlePart2}
              </span>
            </h1>
            <p className="text-white/90 text-[16px] mb-8 leading-relaxed max-w-[400px] mt-8 min-h-[72px]">
              {currentDest.description}
            </p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 border border-white rounded-full px-6 py-3 hover:bg-white/10 transition-colors text-[15px] font-medium">
                <ArrowUpRight size={18} /> Khám phá ngay
              </button>
              <button className="w-12 h-12 rounded-full bg-[#F5A524] flex items-center justify-center hover:bg-[#D98C1C] transition-colors">
                <BookmarkSimple size={20} weight="fill" className="text-white" />
              </button>
            </div>
          </div>

          {/* Các thẻ danh sách địa điểm tiếp theo ở bên phải */}
          <div className="hidden lg:flex flex-col items-end gap-6 mt-10">
            <div className="flex gap-4">
              {rightCards.map((item) => (
                <div 
                  key={item.title} 
                  onClick={() => setActiveIndex(item.originalIndex)}
                  className="relative w-[180px] h-[280px] rounded-[24px] overflow-hidden cursor-pointer group hover:-translate-y-2 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                >
                  <Image 
                    src={item.cardImage} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 transition-opacity group-hover:from-black/90">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/90 mb-1">
                      <MapPin size={12} weight="fill" className="text-[#F5A524]" /> {item.location.split(',')[0]}
                    </div>
                    <div className="text-white font-bold text-[15px] leading-tight">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Thanh điều khiển chuyển slide và thanh tiến trình thời gian */}
            <div className="flex items-center gap-6 w-full max-w-[780px] mt-2">
              <div className="flex gap-3">
                <button 
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <CaretLeft size={20} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <CaretRight size={20} />
                </button>
              </div>
              
              {/* Thanh chạy tiến trình thời gian của slide hiện tại */}
              <div className="flex-1 h-[2px] bg-white/30 relative overflow-hidden">
                <div 
                  key={activeIndex} 
                  className={`absolute top-0 left-0 h-full bg-white ${isPaused ? "w-0" : "animate-progress-bar"}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Main Search Bar */}
      <main className="relative z-50 flex-1 w-full -mt-[50px]">
        <div className="max-w-[1200px] mx-auto px-6 relative -mt-24">
          <SearchFloatingBar />
        </div>

        {/* Discover Treasures Section */}
        <section className="max-w-[1200px] mx-auto px-6 mt-16 text-center">
          <h2 className="text-[40px] font-bold mb-4 text-[#1E293B]">
            Khám Phá Tinh Hoa Việt Nam Cùng <span className="text-[#38BDF8] relative inline-block">
              Travel Match
              <svg className="absolute w-full h-[6px] -bottom-1 left-0 text-[#F5A524]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C45.5 -1.5 140.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-gray-600 text-[16px] mb-12 font-medium">
            Khám phá hơn <span className="bg-[#F5A524] text-white px-3 py-1 rounded-full font-bold mx-1">34,200+</span> hành trình độc đáo được thiết kế riêng cho bạn
          </p>

          {/* Carousel Area */}
          <div className="relative">
            <button className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-[#38BDF8] text-[#38BDF8] flex items-center justify-center hover:bg-[#38BDF8]/10 z-10 bg-white shadow-sm">
              <CaretLeft size={20} weight="bold" />
            </button>
            <button className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-[#38BDF8] text-[#38BDF8] flex items-center justify-center hover:bg-[#38BDF8]/10 z-10 bg-white shadow-sm">
              <CaretRight size={20} weight="bold" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
              {[
                { id: "halong", title: "Vịnh Hạ Long", location: "Quảng Ninh", price: 150, img: "https://images.unsplash.com/photo-1559592442-7e18259f63eb?q=80&w=600", duration: "2 ngày 1 đêm" },
                { id: "hoian", title: "Phố Cổ Hội An", location: "Đà Nẵng", price: 45, img: "https://images.unsplash.com/photo-1555581938-2301101374c6?q=80&w=600", duration: "1 ngày" },
                { id: "hagiang", title: "Cột Cờ Lũng Cú", location: "Hà Giang", price: 35, img: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600", duration: "2 giờ" },
                { id: "phuquoc", title: "Đảo Ngọc Phú Quốc", location: "Phú Quốc", price: 210, img: "https://images.unsplash.com/photo-1589782182703-2aad67281b51?q=80&w=600", duration: "3 ngày 2 đêm" }
              ].map((item) => (
                <TourCard key={item.id} {...item} />
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link href="/tours" className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-colors text-[15px] shadow-lg shadow-[#F5A524]/20">
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <ArrowUpRight size={12} weight="bold" />
                </div>
                Xem thêm tất cả
              </Link>
            </div>
          </div>
        </section>


        <section className="max-w-[1400px] mx-auto px-6 py-20 mt-10 flex justify-center items-center">
          <Image 
            src="/traveler-composite.png" 
            alt="Travel Point - We helping you find your dream location" 
            width={1300} 
            height={650} 
            className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            priority 
          />
        </section>

        {/* Explore Popular Destination */}
        <section className="max-w-[1200px] mx-auto px-6 mt-32 text-center">
          <h2 className="text-[40px] font-bold mb-4 text-[#1E293B]">
            Khám Phá Các <span className="relative inline-block">
              Điểm Đến Phổ Biến
              <svg className="absolute w-[110%] h-[6px] -bottom-1 left-[-5%] text-[#F5A524]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C45.5 -1.5 140.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-gray-600 text-[16px] mb-12 font-medium">
            Khám phá hơn <span className="bg-[#F5A524] text-white px-3 py-1 rounded-full font-bold mx-1">34,200+</span> cuộc phiêu lưu độc đáo dành riêng cho bạn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Cố Đô Huế, Việt Nam", tours: "385+ tours & 250+ Hoạt động", img: "/8.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "hue" },
              { title: "Hà Giang, Việt Nam", tours: "385+ tours & 250+ Hoạt động", img: "/9.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "ha-giang" },
              { title: "Hội An, Đà Nẵng", tours: "385+ tours & 250+ Hoạt động", img: "/10.png", span: "col-span-1 md:col-span-2 lg:col-span-2", slug: "da-nang" },
              { title: "Đà Lạt, Việt Nam", tours: "385+ tours & 250+ Hoạt động", img: "/12.png", span: "col-span-1 md:col-span-2 lg:col-span-2", slug: "da-lat" },
              { title: "Hà Nội, Việt Nam", tours: "385+ tours & 250+ Hoạt động", img: "/13.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "ha-noi" },
              { title: "Nha Trang, Việt Nam", tours: "385+ tours & 250+ Hoạt động", img: "/14.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "nha-trang" }
            ].map((item, i) => (
              <DestinationCard key={i} {...item} />
            ))}
          </div>
        </section>


        {/* Service Section */}
        <section className="max-w-[1400px] mx-auto px-6 mt-16 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="w-full lg:w-1/3 pr-4 text-center lg:text-left">
              <div className="mb-4 flex flex-col gap-2 items-center lg:items-start">
                <span className="block w-8 h-[2px] bg-[#F5A524]"></span>
                <span className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase">DỊCH VỤ CỦA CHÚNG TÔI</span>
              </div>
              <h2 className="text-[42px] font-serif font-bold text-[#1E293B] leading-[1.1] mb-6">
                Những giá trị hàng đầu<br />dành cho bạn
              </h2>
              <p className="text-[#64748B] text-[15px] font-medium leading-relaxed max-w-[320px] mx-auto lg:mx-0">
                Kết nối bạn với những chuyên gia bản địa hàng đầu và những trải nghiệm du lịch độc đáo trên toàn cầu.
              </p>
            </div>

            {/* Right Cards */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Hướng dẫn viên tốt nhất",
                  desc: "Các chuyên gia bản địa cho những hành trình chân thực."
                },
                {
                  title: "Ghép đôi thông minh",
                  desc: "Những chuyến đi hoàn hảo được thiết kế theo sở thích của bạn."
                },
                {
                  title: "Trải nghiệm bản địa",
                  desc: "Khám phá những viên ngọc ẩn và văn hóa độc đáo."
                }
              ].map((service, i) => (
                <div key={i} className="bg-white rounded-[40px] py-12 px-6 flex flex-col items-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
                  <div className="w-[88px] h-[88px] bg-[#F5A524] rounded-full flex items-center justify-center mb-8">
                    <div className="relative w-12 h-12">
                      <Image src="/17.png" alt="Service Icon" fill className="object-contain" />
                    </div>
                  </div>
                  <h3 className="text-[19px] font-bold text-[#1E293B] mb-3">{service.title}</h3>
                  <p className="text-[#64748B] text-[14px] font-medium leading-relaxed max-w-[180px]">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Banner */}
        <section className="w-full relative mt-20 overflow-hidden bg-[#2D4A86]">
          {/* Background Image & Gradient */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#6A3093]/90 via-[#3171B6]/90 to-[#01B4A7]/90"></div>

          <div className="max-w-[1400px] mx-auto px-6 pt-16 lg:pt-0 flex flex-col lg:flex-row items-stretch relative z-10">
            {/* Left Phone Side (Group 472) */}
            <div className="w-full lg:w-1/2 relative flex justify-center items-center min-h-[550px] lg:min-h-[680px]">
              <div className="relative w-full max-w-[684px] aspect-[684/648] flex-shrink-0 mt-10 lg:mt-0">
                <Image src="/group472.png" alt="Mobile App UI" fill className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" priority />
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full lg:w-1/2 text-white pb-16 pt-10 lg:py-24 lg:pl-16 flex flex-col justify-center">
              <h2 className="text-[34px] md:text-[42px] lg:text-[46px] font-bold leading-[1.25] mb-6 max-w-[600px]">
                Ứng dụng đã có mặt trên <span className="text-[#F5A524]">Cửa hàng</span> Tải app Mobile của chúng tôi <br className="hidden lg:block" />
                <span className="text-[#38BDF8]">Dễ dàng hơn bao giờ hết</span>
              </h2>
              <p className="text-white/90 text-[15px] leading-relaxed mb-10 max-w-[520px] font-medium">
                TravelMatch kết nối du khách với các hướng dẫn viên địa phương và trải nghiệm chân thực dựa trên sở thích cá nhân của họ.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 mb-10 text-[14px] md:text-[15px] font-medium">
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Ghép đôi du lịch thông minh</div>
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Trải nghiệm bản địa chân thực</div>
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Hướng dẫn viên đã xác minh</div>
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Lên kế hoạch cá nhân hóa</div>
              </div>

              <div className="flex flex-wrap gap-5">
                <button className="bg-gradient-to-r from-[#F5A524] to-[#F19305] shadow-[0_8px_20px_rgba(245,165,36,0.3)] hover:shadow-[0_12px_25px_rgba(245,165,36,0.5)] text-[#1E293B] px-7 py-3.5 rounded-[12px] font-bold flex items-center gap-3 transition-all hover:-translate-y-1 text-[15px]">
                  <AppleLogo size={24} weight="fill" /> Tải về cho iOS
                </button>
                <button className="bg-gradient-to-r from-[#F5A524] to-[#F19305] shadow-[0_8px_20px_rgba(245,165,36,0.3)] hover:shadow-[0_12px_25px_rgba(245,165,36,0.5)] text-[#1E293B] px-7 py-3.5 rounded-[12px] font-bold flex items-center gap-3 transition-all hover:-translate-y-1 text-[15px]">
                  <AndroidLogo size={24} weight="fill" /> Tải về cho Android
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Travel Insights Section */}
        <section className="max-w-[1400px] mx-auto px-6 mt-32 mb-32 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">

            {/* Left Content */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center pr-4 text-center lg:text-left">
              <div className="mb-4 flex flex-col gap-2 items-center lg:items-start">
                <span className="block w-8 h-[2px] bg-[#F5A524]"></span>
                <span className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase">GÓC CẢM HỨNG</span>
              </div>
              <h2 className="text-[44px] font-serif font-bold text-[#1E293B] leading-[1.2] mb-6">
                Câu chuyện & Ý tưởng du lịch
              </h2>
              <p className="text-[#64748B] text-[15px] font-medium leading-relaxed mb-10 max-w-[320px] mx-auto lg:mx-0">
                Khám phá các mẹo du lịch, những điểm đến ẩn mình và những câu chuyện bản địa chân thực.
              </p>

              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-colors text-[15px] shadow-lg shadow-[#F5A524]/20">
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <ArrowUpRight size={12} weight="bold" />
                  </div>
                  Xem thêm bài viết
                </button>

                <div className="flex items-center gap-4">
                  <button className="w-12 h-12 rounded-full border-[2px] border-[#F5A524] text-[#F5A524] hover:bg-[#F5A524] hover:text-white flex items-center justify-center transition-colors">
                    <CaretLeft size={22} weight="bold" />
                  </button>
                  <button className="w-12 h-12 rounded-full border-[2px] border-[#F5A524] text-[#F5A524] hover:bg-[#F5A524] hover:text-white flex items-center justify-center transition-colors">
                    <CaretRight size={22} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Carousel */}
            <div className="w-full lg:w-2/3 relative">
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-10 scrollbar-hide">
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                  `}} />
                {[
                  { title: "5 Trải nghiệm bản địa ẩn mình bạn nên thử tại Việt Nam", img: "city" },
                  { title: "Làm thế nào để lên kế hoạch cho một chuyến đi thực sự phù hợp với tính cách của bạn", img: "travel" },
                  { title: "Tại sao du lịch cùng hướng dẫn viên địa phương mang lại trải nghiệm tốt hơn", img: "desert" },
                  { title: "Top 10 điểm đến ẩm thực cho những món ăn Châu Á chân thực nhất", img: "food" }
                ].map((post, i) => (
                  <div key={i} className="w-[300px] md:w-[320px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex-shrink-0 snap-center hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="relative w-full h-[240px]">
                      <Image src={`https://picsum.photos/seed/${post.img}/600/400`} alt={post.title} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100">
                          <Image src="https://picsum.photos/seed/avatar/100/100" alt="Jackie Moncada" fill className="object-cover" />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-500">Jackie Moncada</span>
                      </div>
                      <h3 className="text-[17px] font-bold text-[#1E293B] leading-snug line-clamp-2">{post.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
