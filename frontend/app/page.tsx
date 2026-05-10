"use client";

import Image from "next/image";
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
  ArrowUpRight
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

        {/* Navbar */}
        <nav className="relative z-50 pt-6">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <GlobeHemisphereWest size={28} className="text-[#38BDF8]" weight="fill" />
              <span className="font-bold text-[22px] tracking-tight">
                TRAVEL <span className="text-[#F5A524]">MATCH</span>
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium">
              <a href="#" className="text-white relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-white after:-bottom-1 after:left-0">Home</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">About us</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Available Tours</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Private Tour</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Local Tour</a>
            </div>
            <div className="flex items-center gap-4 text-[15px] font-medium">
              <button className="px-6 py-2 rounded-full border border-white/40 hover:bg-white/10 transition-colors">
                Sign in
              </button>
              <button className="bg-[#F5A524] hover:bg-[#D98C1C] px-6 py-2 rounded-full transition-colors text-white">
                Sign up
              </button>
            </div>
          </div>
        </nav>

        {/* Top Search Bar */}
        <div className="relative z-40 mt-12 flex justify-center w-full px-6">
          <div className="relative w-full max-w-[600px]">
            <input 
              type="text" 
              placeholder="Search Tourist spots" 
              className="w-full bg-white/10 backdrop-blur-md border border-white/40 text-white placeholder-white/70 rounded-full py-3.5 px-6 outline-none text-[15px]"
            />
            <MagnifyingGlass size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70" />
          </div>
        </div>

        {/* Hero Content Area */}
        <div className="relative z-40 max-w-[1400px] mx-auto px-6 lg:px-12 mt-20 flex flex-col lg:flex-row justify-between items-start w-full">
          
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
      <main className="relative z-30 flex-1 w-full">
        <div className="max-w-[1200px] mx-auto px-6 relative -top-12">
          <div className="bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-3 px-4 flex flex-col md:flex-row items-center justify-between border border-gray-100">
            
            <div className="flex-1 flex items-center gap-3 px-6 border-r border-gray-200 cursor-pointer">
              <div className="flex-col w-full">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
                  <MapPin size={20} weight="fill" /> Destination
                </div>
                <div className="flex items-center justify-between text-[13px] text-gray-400 font-medium w-full">
                  <span>Search For A Destination</span>
                  <CaretDown size={12} weight="bold" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex items-center gap-3 px-6 border-r border-gray-200 cursor-pointer">
              <div className="flex-col w-full">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
                  <ListDashes size={20} weight="bold" /> All Activities
                </div>
                <div className="flex items-center justify-between text-[13px] text-gray-400 font-medium w-full">
                  <span>Choose Activity</span>
                  <CaretDown size={12} weight="bold" />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 px-6 border-r border-gray-200 cursor-pointer">
              <div className="flex-col w-full">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
                  <CalendarBlank size={20} weight="bold" /> Departure Date
                </div>
                <div className="flex items-center justify-between text-[13px] text-gray-400 font-medium w-full">
                  <span>Date from</span>
                  <CaretDown size={12} weight="bold" />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 px-6 cursor-pointer">
              <div className="flex-col w-full">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
                  <Users size={20} weight="fill" /> Guests
                </div>
                <div className="flex items-center justify-between text-[13px] text-gray-400 font-medium w-full">
                  <span>How many guests?</span>
                  <CaretDown size={12} weight="bold" />
                </div>
              </div>
            </div>

            <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-colors ml-2">
              Search <MagnifyingGlass size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Discover Treasures Section */}
        <section className="max-w-[1200px] mx-auto px-6 mt-16 text-center">
          <h2 className="text-[40px] font-bold mb-4 text-[#1E293B]">
            Discover Viet Nam's Treasures With <span className="text-[#38BDF8] relative inline-block">
              Travel Match
              <svg className="absolute w-full h-[6px] -bottom-1 left-0 text-[#F5A524]" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C45.5 -1.5 140.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="text-gray-600 text-[16px] mb-12 font-medium">
            Discover <span className="bg-[#F5A524] text-white px-3 py-1 rounded-full font-bold mx-1">34,200+</span> unique adventures tailored just for you
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {['New York', 'Viet Nam', 'New York', 'New York', 'New York', 'New York', 'New York', 'New York'].map((tag, i) => (
              <button key={i} className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors border ${
                i === 1 ? 'bg-[#38BDF8] text-white border-[#38BDF8]' : 'bg-transparent text-[#38BDF8] border-[#38BDF8]/40 hover:bg-[#38BDF8]/10'
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
                { title: "Ha Long Bay", loc: "Quang Ninh", price: "$150.00", img: "halongbay", duration: "2 days 1 night" },
                { title: "Hoi An Acient Town", loc: "Da Nang", price: "$45.00", img: "hoian", duration: "1 day" },
                { title: "Lung Cu Flag Tower", loc: "Ha Giang", price: "$35.00", img: "lungcu", duration: "2 hours" },
                { title: "Phu Quoc Island", loc: "Phu Quoc", price: "$210.00", img: "phuquoc", duration: "3 days 2 night" }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col h-full text-left overflow-hidden">
                  {/* Image Container with Padding */}
                  <div className="p-3 pb-0">
                    <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden">
                      <Image src={`https://picsum.photos/seed/${item.img}/600/400`} alt={item.title} fill className="object-cover" />
                      
                      {/* Orange Rating Tag */}
                      <div className="absolute top-0 left-0 bg-[#F5A524] text-white text-[11px] font-bold px-2 py-1 rounded-br-[12px] flex items-center gap-1">
                        <Star weight="fill" size={12} /> 4.8
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-5 pb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                      <MapPin size={14} className="text-[#F5A524]" weight="fill" /> {item.loc}, Viet Nam
                    </div>
                    <h3 className="text-[18px] font-bold text-[#1E293B] mb-5 line-clamp-1">{item.title}</h3>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
                        <Clock size={16} /> Duration {item.duration}
                      </div>
                      <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
                        <Users size={16} /> Family Plan
                      </div>
                      <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
                        <Car size={16} /> Transport Facility
                      </div>
                    </div>
                  </div>
                  
                  {/* Gray Footer Area */}
                  <div className="bg-[#F8F9FA] pt-4 pb-4 px-5 flex items-center justify-between border-t border-gray-100">
                    <div>
                      <div className="text-[20px] font-bold text-[#38BDF8] leading-none">{item.price}</div>
                      <div className="text-[11px] text-gray-400 mt-1 font-medium">per person</div>
                    </div>
                    <button className="text-[13px] font-bold text-[#F5A524] flex items-center gap-1 hover:underline">
                      Book Now <CaretRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
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

        {/* Travel Point Section */}
        <section className="max-w-[1400px] mx-auto px-6 mt-32 mb-32 flex flex-col lg:flex-row items-center gap-0 relative">
          
          {/* Left Visual Area */}
          <div className="w-full lg:w-1/2 relative min-h-[700px] flex justify-center items-end">
            {/* The specific blue shape requested */}
            <div className="absolute bg-[#38BDF8] rounded-r-[150px] rounded-bl-[50px] -z-10" 
                 style={{ 
                   width: '379px', 
                   height: '594px',
                   left: '50px',
                   top: '10%'
                 }}>
            </div>
            
            {/* Colorful Dots */}
            <div className="absolute w-12 h-12 bg-[#F5A524] rounded-full top-[10%] left-[20%]"></div>
            <div className="absolute w-10 h-10 bg-[#2DD4BF] rounded-full top-[30%] left-[5%]"></div>
            <div className="absolute w-8 h-8 bg-[#FCD34D] rounded-full bottom-[20%] left-[10%]"></div>
            <div className="absolute w-8 h-8 bg-[#A855F7] rounded-full bottom-[15%] right-[20%]"></div>
            <div className="absolute w-20 h-20 bg-[#FCD34D] rounded-full top-[45%] right-[-20px] -z-10"></div>

            {/* Girl Image */}
            <div className="relative w-full h-[650px] flex justify-center items-end">
               <Image 
                 src="/traveler.png" 
                 alt="Traveler with luggage" 
                 fill
                 className="object-contain object-bottom drop-shadow-2xl z-10 scale-110 ml-[-50px]" 
                 priority
               />
            </div>
          </div>
          
          {/* Right Content */}
          <div className="w-full lg:w-1/2 relative lg:-ml-12 mt-12 lg:mt-0 z-20">
            {/* Big Thin Blue Border Box */}
            <div className="border-[2px] border-[#38BDF8] p-12 pr-6 rounded-sm bg-white/40 backdrop-blur-[2px]">
              <div className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase mb-4 flex items-center gap-4">
                <span className="w-8 h-[2px] bg-[#F5A524] inline-block"></span> TRAVEL POINT
              </div>
              
              <div className="relative mb-6">
                <h2 className="text-[48px] font-serif font-bold text-[#1E293B] leading-[1.1] max-w-[420px]">
                  We helping you find your dream location
                </h2>
                <AirplaneTilt size={60} className="text-[#F5A524] absolute right-[-20px] top-0 rotate-45" weight="fill" />
              </div>
              
              <p className="text-gray-500 mb-14 leading-relaxed text-[15px] font-medium max-w-[420px]">
                We connect you with unique journeys and the most stunning check-in locations. Let us help you turn your dream trip into reality with our dedication and professionalism.
              </p>

              {/* Stats Grid */}
              <div className="relative w-full max-w-[480px] h-[280px]">
                {/* Dashed Line SVG connecting the boxes */}
                <svg className="absolute inset-0 w-[110%] h-full -z-10 -ml-[5%]" viewBox="0 0 500 280" fill="none">
                  <path d="M 50,220 C 100,220 180,60 250,60 C 350,60 300,220 400,220" stroke="#F5A524" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round" />
                </svg>

                {/* Box 1 - Top Left */}
                <div className="absolute top-0 left-[20px] bg-[#F5A524] text-white rounded-[16px] w-[150px] h-[110px] flex flex-col justify-center items-center shadow-lg">
                  <div className="text-[32px] font-bold leading-none mb-2">500+</div>
                  <div className="text-[13px] font-medium">Interesting Tour</div>
                </div>

                {/* Box 2 - Top Right */}
                <div className="absolute top-0 right-[40px] bg-[#F9FAFB] border border-gray-200 rounded-[16px] w-[150px] h-[110px] flex flex-col justify-center items-center shadow-md">
                  <div className="text-[32px] font-bold leading-none mb-2 text-[#F5A524]">1000+</div>
                  <div className="text-[13px] font-medium text-gray-600">Tailored Trips</div>
                </div>

                {/* Box 3 - Bottom Left */}
                <div className="absolute bottom-0 left-[0px] bg-[#F9FAFB] border border-gray-200 rounded-[16px] w-[150px] h-[110px] flex flex-col justify-center items-center shadow-md">
                  <div className="text-[32px] font-bold leading-none mb-2 text-[#F5A524]">300+</div>
                  <div className="text-[13px] font-medium text-gray-600">Local Experts</div>
                </div>

                {/* Box 4 - Bottom Right */}
                <div className="absolute bottom-0 right-[20px] bg-[#F5A524] text-white rounded-[16px] w-[150px] h-[110px] flex flex-col justify-center items-center shadow-lg">
                  <div className="text-[32px] font-bold leading-none mb-2">5000+</div>
                  <div className="text-[13px] font-medium">Verified Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
