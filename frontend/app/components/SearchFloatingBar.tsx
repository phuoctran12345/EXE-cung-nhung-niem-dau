"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarBlank,
  Users,
  MagnifyingGlass,
  ListDashes,
  CaretDown,
} from "@phosphor-icons/react";
import { destinations } from "../data/mockData";

export default function SearchFloatingBar() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (slug?: string) => {
    setIsDropdownOpen(false);
    if (slug) {
      router.push(`/tours/${slug}`);
    } else if (destination.trim()) {
      // Convert to URL slug format: "Da Nang" -> "da-nang"
      const searchSlug = destination.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/tours/${searchSlug}`);
    } else {
      // Default to the main tours page if empty
      router.push('/tours');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-3 px-4 flex flex-col md:flex-row items-center justify-between border border-gray-100 relative">
      
      {/* Destination Input */}
      <div className="flex-1 flex items-center gap-3 px-6 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0 relative" ref={dropdownRef}>
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
            <MapPin size={20} weight="fill" /> Destination
          </div>
          <div className="flex items-center w-full relative">
            <input 
              type="text" 
              placeholder="Search For A Destination" 
              className="text-[14px] text-[#1E293B] font-medium w-full outline-none bg-transparent placeholder-gray-400"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+24px)] left-0 w-full md:w-[380px] bg-white rounded-[20px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden">
              <div className="p-4">
                <div className="text-[15px] font-bold text-[#1E293B] mb-3 px-2 flex items-center justify-between">
                  Điểm đến phổ biến
                </div>
                <div className="flex flex-col">
                  {destinations.map((dest) => (
                    <div 
                      key={dest.id}
                      onClick={() => {
                        setDestination(dest.name);
                        handleSearch(dest.slug);
                      }}
                      className="flex flex-col py-3 px-3 hover:bg-[#F8F9FA] cursor-pointer rounded-[12px] border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1E293B] text-[15px]">{dest.name}</span>
                        <span className="bg-[#E0F2FE] text-[#0284C7] text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide">Thành Phố</span>
                      </div>
                      <span className="text-[13px] text-gray-500 font-medium">{dest.toursCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Select (Mock) */}
      <div className="flex-1 flex items-center gap-3 px-6 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0 cursor-pointer">
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
            <ListDashes size={20} weight="bold" /> All Activities
          </div>
          <div className="flex items-center justify-between text-[14px] text-gray-400 font-medium w-full">
            <span>Choose Activity</span>
            <CaretDown size={12} weight="bold" />
          </div>
        </div>
      </div>

      {/* Date Select (Mock) */}
      <div className="flex-1 flex items-center gap-3 px-6 border-b md:border-b-0 md:border-r border-gray-200 py-2 md:py-0 cursor-pointer">
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
            <CalendarBlank size={20} weight="bold" /> Departure Date
          </div>
          <div className="flex items-center justify-between text-[14px] text-gray-400 font-medium w-full">
            <span>Date from</span>
            <CaretDown size={12} weight="bold" />
          </div>
        </div>
      </div>

      {/* Guests Select (Mock) */}
      <div className="flex-1 flex items-center gap-3 px-6 py-2 md:py-0 cursor-pointer">
        <div className="flex-col w-full">
          <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-[15px] mb-0.5">
            <Users size={20} weight="fill" /> Guests
          </div>
          <div className="flex items-center justify-between text-[14px] text-gray-400 font-medium w-full">
            <span>How many guests?</span>
            <CaretDown size={12} weight="bold" />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button 
        onClick={handleSearch}
        className="bg-[#F5A524] hover:bg-[#D98C1C] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors ml-2 mt-4 md:mt-0 w-full md:w-auto"
      >
        Search <MagnifyingGlass size={18} weight="bold" />
      </button>
    </div>
  );
}
