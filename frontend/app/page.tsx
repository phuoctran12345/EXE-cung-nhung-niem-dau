"use client";

import Image from "next/image";
import Link from "next/link";
import SearchFloatingBar from "./components/SearchFloatingBar";
import TourCard from "./components/TourCard";
import DestinationCard from "./components/DestinationCard";
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9] text-[#1E293B] font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full min-h-[900px] flex flex-col">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/hero-bg.png"
            alt="Golden Bridge, Ba Na Hills"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
          {/* Bottom gradient fade for smooth transition */}
          <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#F9F9F9] to-transparent"></div>
        </div>


        {/* Hero Content Area */}
        <div className="relative z-40 max-w-[1400px] mx-auto px-6 lg:px-12 mt-32 flex flex-col lg:flex-row justify-between items-start w-full">

          {/* Left Text */}
          <div className="max-w-[500px] text-white">
            <div className="flex items-center gap-2 text-[15px] font-medium mb-4">
              <MapPin size={20} className="text-[#F5A524]" weight="fill" />
              Da Nang, Viet Nam
            </div>
            <h1 className="flex flex-col mb-4">
              <span className="font-serif text-[100px] font-bold leading-[0.9] uppercase tracking-tight">BA NA</span>
              <span className="script-font text-[90px] font-normal leading-[0.5] tracking-wide ml-2 text-white">Hill</span>
            </h1>
            <p className="text-white/90 text-[16px] mb-8 leading-relaxed max-w-[400px] mt-8">
              Ba Na Hills is a famous mountaintop resort in Da Nang, renowned for its iconic Golden Bridge and scenic cable car.
            </p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 border border-white rounded-full px-6 py-3 hover:bg-white/10 transition-colors text-[15px] font-medium">
                <ArrowUpRight size={18} /> Explore more
              </button>
              <button className="w-12 h-12 rounded-full bg-[#F5A524] flex items-center justify-center hover:bg-[#D98C1C] transition-colors">
                <BookmarkSimple size={20} weight="fill" className="text-white" />
              </button>
            </div>
          </div>

          {/* Right Carousel Cards */}
          <div className="hidden lg:flex flex-col items-end gap-6 mt-10">
            <div className="flex gap-4">
              {[
                { title: "Wat Phra Kaew", loc: "Bangkok, Thailand", img: "temple" },
                { title: "Mount Fuji", loc: "Honshu, Tokyo", img: "mountain" },
                { title: "Nam San Tower", loc: "Seoul, Korea", img: "tower" },
                { title: "Sentosa Island", loc: "Singapore", img: "island" },
              ].map((item, i) => (
                <div key={i} className="relative w-[180px] h-[280px] rounded-[24px] overflow-hidden">
                  <Image src={`https://picsum.photos/seed/${item.img}/300/400`} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/90 mb-1">
                      <MapPin size={12} weight="fill" className="text-[#F5A524]" /> {item.loc}
                    </div>
                    <div className="text-white font-bold text-[15px] leading-tight">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 w-full max-w-[780px] mt-2">
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <CaretLeft size={20} />
                </button>
                <button className="w-10 h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <CaretRight size={20} />
                </button>
              </div>
              <div className="flex-1 h-[2px] bg-white/30 relative">
                <div className="absolute top-0 left-0 h-full w-1/4 bg-white"></div>
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
            Discover Viet Nam's Treasures With <span className="text-[#38BDF8] relative inline-block">
              Travel Match
              <svg className="absolute w-full h-[6px] -bottom-1 left-0 text-[#F5A524]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C45.5 -1.5 140.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-gray-600 text-[16px] mb-12 font-medium">
            Discover <span className="bg-[#F5A524] text-white px-3 py-1 rounded-full font-bold mx-1">34,200+</span> unique adventures tailored just for you
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {['New York', 'Viet Nam', 'New York', 'New York', 'New York', 'New York', 'New York', 'New York'].map((tag, i) => (
              <button key={i} className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors border ${i === 1 ? 'bg-[#38BDF8] text-white border-[#38BDF8]' : 'bg-transparent text-[#38BDF8] border-[#38BDF8]/40 hover:bg-[#38BDF8]/10'
                }`}>
                {tag}
              </button>
            ))}
          </div>

          {/* Carousel Area */}
          <div className="relative">
            <button className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-[#38BDF8] text-[#38BDF8] flex items-center justify-center hover:bg-[#38BDF8]/10 z-10 bg-white">
              <CaretLeft size={20} weight="bold" />
            </button>
            <button className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-[#38BDF8] text-[#38BDF8] flex items-center justify-center hover:bg-[#38BDF8]/10 z-10 bg-white">
              <CaretRight size={20} weight="bold" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
              {[
                { id: 1, title: "Ha Long Bay", loc: "Quang Ninh", price: "$150.00", img: "https://picsum.photos/seed/halongbay/600/400", duration: "2 days 1 night" },
                { id: 2, title: "Hoi An Acient Town", loc: "Da Nang", price: "$45.00", img: "https://picsum.photos/seed/hoian/600/400", duration: "1 day" },
                { id: 3, title: "Lung Cu Flag Tower", loc: "Ha Giang", price: "$35.00", img: "https://picsum.photos/seed/lungcu/600/400", duration: "2 hours" },
                { id: 4, title: "Phu Quoc Island", loc: "Phu Quoc", price: "$210.00", img: "https://picsum.photos/seed/phuquoc/600/400", duration: "3 days 2 night" }
              ].map((item) => (
                <TourCard key={item.id} {...item} />
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-colors text-[15px]">
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <ArrowUpRight size={12} weight="bold" />
                </div>
                View more
              </button>
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
            Explore Popular <span className="relative inline-block">
              Destination
              <svg className="absolute w-[110%] h-[6px] -bottom-1 left-[-5%] text-[#F5A524]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C45.5 -1.5 140.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-gray-600 text-[16px] mb-12 font-medium">
            Discover <span className="bg-[#F5A524] text-white px-3 py-1 rounded-full font-bold mx-1">34,200+</span> unique adventures tailored just for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Hue, Viet Nam", tours: "385+ tours & 250+ Activities", img: "/8.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "hue" },
              { title: "Ha Giang, Viet Nam", tours: "385+ tours & 250+ Activities", img: "/9.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "ha-giang" },
              { title: "Hoi An, Da Nang", tours: "385+ tours & 250+ Activities", img: "/10.png", span: "col-span-1 md:col-span-2 lg:col-span-2", slug: "da-nang" },
              { title: "Da Lat, Viet Nam", tours: "385+ tours & 250+ Activities", img: "/12.png", span: "col-span-1 md:col-span-2 lg:col-span-2", slug: "da-lat" },
              { title: "Ha Noi, Viet Nam", tours: "385+ tours & 250+ Activities", img: "/13.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "ha-noi" },
              { title: "Nha Trang, Viet Nam", tours: "385+ tours & 250+ Activities", img: "/14.png", span: "col-span-1 md:col-span-1 lg:col-span-1", slug: "nha-trang" }
            ].map((item, i) => (
              <DestinationCard key={i} {...item} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 text-[13px] font-bold text-gray-500 mb-10">
            <div className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"></div>
              <span className="text-[#1E293B]">1</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
              <div className="w-2.5 h-2.5 rounded-full border border-gray-400 group-hover:border-[#F5A524] transition-colors"></div>
              <span>2</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
              <div className="w-2.5 h-2.5 rounded-full border border-gray-400 group-hover:border-[#F5A524] transition-colors"></div>
              <span>3</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
              <div className="w-2.5 h-2.5 rounded-full border border-gray-400 group-hover:border-[#F5A524] transition-colors"></div>
              <span>4</span>
            </div>
            <div className="flex flex-col items-center gap-2 -mt-4">
              <span className="text-[#F5A524] text-[20px] font-light leading-none">-</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#F5A524] transition-colors -mt-1">
                <CaretRight size={14} weight="bold" />
              </div>
              <span></span>
            </div>
          </div>
        </section>


        {/* Service Section */}
        <section className="max-w-[1400px] mx-auto px-6 mt-16 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="w-full lg:w-1/3 pr-4">
              <div className="mb-4 flex flex-col gap-2">
                <span className="block w-8 h-[2px] bg-[#F5A524]"></span>
                <span className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase">SERVICE</span>
              </div>
              <h2 className="text-[42px] font-serif font-bold text-[#1E293B] leading-[1.1] mb-6">
                Our top value<br />categories for you
              </h2>
              <p className="text-[#64748B] text-[15px] font-medium leading-relaxed max-w-[320px]">
                Connecting you with top-rated local experts and unique travel experiences worldwide.
              </p>
            </div>

            {/* Right Cards */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Best Tour Guide",
                  desc: "Expert local guides for authentic journeys."
                },
                {
                  title: "Best Smart Matching",
                  desc: "Perfect trips tailored to your interests."
                },
                {
                  title: "Best Local Experiences",
                  desc: "Uncover hidden gems and unique cultures."
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
                {/* Composite Image provided by User */}
                <Image src="/group472.png" alt="Mobile App UI with Decorative Circles" fill className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" priority />
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full lg:w-1/2 text-white pb-16 pt-10 lg:py-24 lg:pl-16 flex flex-col justify-center">
              <h2 className="text-[34px] md:text-[42px] lg:text-[46px] font-bold leading-[1.25] mb-6 max-w-[600px]">
                We Are <span className="text-[#F5A524]">Available</span> On The Store Get Our Mobile Apps <br className="hidden lg:block" />
                <span className="text-[#38BDF8]">Very Easily</span>
              </h2>
              <p className="text-white/90 text-[15px] leading-relaxed mb-10 max-w-[520px] font-medium">
                TravelMatch connects travelers with local guides and authentic experiences based on their personal interests. Discover trips that truly match your personality and travel style.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 mb-10 text-[14px] md:text-[15px] font-medium">
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Smart Travel Matching</div>
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Authentic Local Experiences</div>
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Verified Local Guides</div>
                <div className="flex items-center gap-3"><CheckCircle size={22} weight="fill" className="text-[#F5A524] flex-shrink-0" /> Personalized Trip Planning</div>
              </div>

              <div className="flex flex-wrap gap-5">
                <button className="bg-gradient-to-r from-[#F5A524] to-[#F19305] shadow-[0_8px_20px_rgba(245,165,36,0.3)] hover:shadow-[0_12px_25px_rgba(245,165,36,0.5)] text-[#1E293B] px-7 py-3.5 rounded-[12px] font-bold flex items-center gap-3 transition-all hover:-translate-y-1 text-[15px]">
                  <AppleLogo size={24} weight="fill" /> Download For iOS
                </button>
                <button className="bg-gradient-to-r from-[#F5A524] to-[#F19305] shadow-[0_8px_20px_rgba(245,165,36,0.3)] hover:shadow-[0_12px_25px_rgba(245,165,36,0.5)] text-[#1E293B] px-7 py-3.5 rounded-[12px] font-bold flex items-center gap-3 transition-all hover:-translate-y-1 text-[15px]">
                  <AndroidLogo size={24} weight="fill" /> Download For Android
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Travel Insights Section */}
        <section className="max-w-[1400px] mx-auto px-6 mt-32 mb-32 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">

            {/* Left Content */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center pr-4">
              <div className="mb-4 flex flex-col gap-2">
                <span className="block w-8 h-[2px] bg-[#F5A524]"></span>
                <span className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase">TRAVEL INSIGHTS</span>
              </div>
              <h2 className="text-[44px] font-serif font-bold text-[#1E293B] leading-[1.2] mb-6">
                Travel Stories & Ideas
              </h2>
              <p className="text-[#64748B] text-[15px] font-medium leading-relaxed mb-10 max-w-[320px]">
                Explore travel tips, hidden destinations, and authentic local stories shared by experienced travelers and local guides.
              </p>

              <div className="flex items-center gap-6">
                <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-colors text-[15px]">
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <ArrowUpRight size={12} weight="bold" />
                  </div>
                  View more
                </button>

                <div className="flex items-center gap-4 ml-auto lg:ml-0">
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
              {/* Hidden scrollbar, snap scrolling */}
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style dangerouslySetInnerHTML={{
                  __html: `
                    ::-webkit-scrollbar { display: none; }
                  `}} />
                {[
                  { title: "5 Hidden Local Experiences You Should Try in Vietnam", img: "city" },
                  { title: "How to Plan a Trip That Truly Matches Your Personality", img: "travel" },
                  { title: "Why Traveling With Local Guides Creates Better Experiences", img: "desert" },
                  { title: "Top 10 Food Destinations for Authentic Asian Cuisine", img: "food" }
                ].map((post, i) => (
                  <div key={i} className="w-[300px] md:w-[320px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex-shrink-0 snap-center hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-shadow">
                    <div className="relative w-full h-[240px]">
                      <Image src={`https://picsum.photos/seed/${post.img}/600/400`} alt={post.title} fill className="object-cover" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                          <Image src="https://picsum.photos/seed/avatar/100/100" alt="Jackie Moncada" fill className="object-cover" />
                        </div>
                        <span className="text-[13px] font-semibold text-gray-500">Jackie Moncada</span>
                      </div>
                      <h3 className="text-[17px] font-bold text-[#1E293B] leading-snug line-clamp-2">{post.title}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-4 text-[13px] font-bold text-gray-500 mt-2">
                <div className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"></div>
                  <span className="text-[#1E293B]">1</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
                  <div className="w-2.5 h-2.5 rounded-full border border-gray-400 group-hover:border-[#F5A524] transition-colors"></div>
                  <span>2</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
                  <div className="w-2.5 h-2.5 rounded-full border border-gray-400 group-hover:border-[#F5A524] transition-colors"></div>
                  <span>3</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
                  <div className="w-2.5 h-2.5 rounded-full border border-gray-400 group-hover:border-[#F5A524] transition-colors"></div>
                  <span>4</span>
                </div>
                <div className="flex flex-col items-center gap-2 -mt-4">
                  <span className="text-[#F5A524] text-[20px] font-light leading-none">-</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer group hover:text-[#F5A524]">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#F5A524] transition-colors -mt-1">
                    <CaretRight size={14} weight="bold" />
                  </div>
                  <span></span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
