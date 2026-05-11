"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MagnifyingGlass, 
  MapPin, 
  Clock, 
  Users,
  Car,
  CaretRight,
  CaretLeft
} from "@phosphor-icons/react";

import availableBg from "../../assets/available.png";
import { getPopularTours, getNewestTours, getHighestRatedTours, Tour } from "../../data/mockData";
import SearchFloatingBar from "../../components/SearchFloatingBar";

export default function AvailableToursPage() {
  const router = useRouter();

  const popularityTours = getPopularTours();
  const newestTours = getNewestTours();
  const highestRatedTours = getHighestRatedTours();

  const TourCard = ({ tour }: { tour: any }) => (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all group">
      <div className="relative w-full h-[220px]">
        <Image src={tour.img} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* Top left flag tag */}
        <div className="absolute top-0 left-4 bg-red-500 text-white p-1 rounded-b-md shadow-md">
           <Image src="https://flagcdn.com/w20/vn.png" width={20} height={15} alt="VN" />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-[12px] text-gray-500 font-medium mb-1">
          <MapPin size={14} className="text-[#38BDF8]" weight="fill" />
          {tour.location}
        </div>
        <h3 className="font-bold text-[18px] text-[#1E293B] mb-4 leading-tight group-hover:text-[#38BDF8] transition-colors">{tour.title}</h3>
        
        <div className="flex flex-col gap-2 text-[13px] text-gray-500 font-medium mb-6">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#F5A524]" /> {tour.duration}
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#F5A524]" /> {tour.plan}
          </div>
          <div className="flex items-center gap-2">
            <Car size={16} className="text-[#F5A524]" /> {tour.transport}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <div className="text-[12px] text-gray-400 line-through mb-0.5">${tour.originalPrice.toFixed(2)}</div>
            <div className="text-[20px] font-bold text-[#38BDF8]">${tour.price.toFixed(2)} <span className="text-[12px] text-gray-500 font-medium">/per person</span></div>
          </div>
          <Link href={`/tour/${tour.id}`} className="text-[#F5A524] text-[13px] font-bold flex items-center gap-1 hover:underline">
            Book Now <CaretRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans">
      


      {/* Hero Banner */}
      <section className="relative w-full h-[400px]">
        <Image src={availableBg} alt="Available Tours" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] to-transparent"></div>
        
        <div className="absolute inset-0 max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col justify-center items-center pb-24 text-center">
          <div className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#F5A524] inline-block"></span> EXPLORE DESTINATION
          </div>
          <h1 className="text-[54px] md:text-[72px] font-bold text-white leading-none uppercase tracking-wide font-serif drop-shadow-lg">
            AVAILABLE TOURS
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full -mt-10 relative z-20">
        
        {/* Search Floating Bar */}
        <div className="w-full mx-auto mb-20 relative z-50">
          <SearchFloatingBar />
        </div>

        {/* Section: Popularity */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] font-bold text-[#F5A524]">Popularity</h2>
            <div className="flex gap-2 text-[#F5A524]">
               <button className="w-8 h-8 rounded-full border border-[#F5A524] flex items-center justify-center hover:bg-[#F5A524] hover:text-white transition-colors">
                 <CaretLeft size={16} weight="bold" />
               </button>
               <button className="w-8 h-8 rounded-full border border-[#F5A524] flex items-center justify-center hover:bg-[#F5A524] hover:text-white transition-colors">
                 <CaretRight size={16} weight="bold" />
               </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularityTours.map((tour, i) => <TourCard key={i} tour={tour} />)}
          </div>
          <div className="flex justify-center mt-10">
            <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold text-[15px] shadow-lg shadow-[#F5A524]/20 transition-colors">
              View more
            </button>
          </div>
        </div>

        {/* Section: Newest */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] font-bold text-[#F5A524]">Newest</h2>
            <div className="flex gap-2 text-[#F5A524]">
               <button className="w-8 h-8 rounded-full border border-[#F5A524] flex items-center justify-center hover:bg-[#F5A524] hover:text-white transition-colors">
                 <CaretLeft size={16} weight="bold" />
               </button>
               <button className="w-8 h-8 rounded-full border border-[#F5A524] flex items-center justify-center hover:bg-[#F5A524] hover:text-white transition-colors">
                 <CaretRight size={16} weight="bold" />
               </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newestTours.map((tour, i) => <TourCard key={i} tour={tour} />)}
          </div>
          <div className="flex justify-center mt-10">
            <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold text-[15px] shadow-lg shadow-[#F5A524]/20 transition-colors">
              View more
            </button>
          </div>
        </div>

        {/* Section: Highest Rated */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] font-bold text-[#F5A524]">Highest Rated</h2>
            <div className="flex gap-2 text-[#F5A524]">
               <button className="w-8 h-8 rounded-full border border-[#F5A524] flex items-center justify-center hover:bg-[#F5A524] hover:text-white transition-colors">
                 <CaretLeft size={16} weight="bold" />
               </button>
               <button className="w-8 h-8 rounded-full border border-[#F5A524] flex items-center justify-center hover:bg-[#F5A524] hover:text-white transition-colors">
                 <CaretRight size={16} weight="bold" />
               </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highestRatedTours.map((tour, i) => <TourCard key={i} tour={tour} />)}
          </div>
          <div className="flex justify-center mt-10">
            <button className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-3 rounded-full font-bold text-[15px] shadow-lg shadow-[#F5A524]/20 transition-colors">
              View more
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
