"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  GlobeHemisphereWest, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle,
  XCircle,
  CaretRight,
  Heart,
  ShareNetwork,
  CalendarBlank,
  Users
} from "@phosphor-icons/react";

import { getTourById } from "../../../data/mockData";

export default function TourDetailPage() {
  const params = useParams();
  const tourId = params.id as string;
  const tour = getTourById(tourId);

  if (!tour) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Tour not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans">
      
      {/* Hero Banner */}
      <section className="relative w-full h-[500px]">
        <Image src={tour.img} alt={tour.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2434]/80 to-transparent"></div>
        
        <div className="absolute inset-0 max-w-[1400px] mx-auto px-[24px] lg:px-[48px] flex flex-col justify-end pb-[64px]">
          <div className="flex items-center gap-[8px] text-white/80 text-[14px] font-medium mb-[24px]">
            <Link href="/" className="hover:text-white">Home</Link>
            <CaretRight size={14} />
            <Link href={`/tours/${tour.citySlug}`} className="hover:text-white capitalize">{tour.citySlug.replace('-', ' ')}</Link>
            <CaretRight size={14} />
            <span className="text-[#38BDF8]">Tour Detail</span>
          </div>

          <div className="max-w-[800px]">
            <h1 className="text-[48px] md:text-[64px] font-bold text-white leading-tight uppercase font-serif drop-shadow-lg mb-[16px]">
              {tour.title}
            </h1>
            <div className="flex flex-wrap items-center gap-[24px] text-white text-[15px] font-medium">
              <div className="flex items-center gap-[8px]">
                <MapPin size={20} className="text-[#F5A524]" weight="fill" />
                {tour.location}
              </div>
              <div className="flex items-center gap-[8px]">
                <Clock size={20} className="text-[#F5A524]" weight="fill" />
                {tour.durationLabel}
              </div>
              <div className="flex items-center gap-[8px]">
                <Star size={20} className="text-[#F5A524]" weight="fill" />
                {tour.rating} ({tour.reviews} reviews)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-[24px] lg:px-[48px] py-[48px] flex flex-col lg:flex-row gap-[48px] relative">
        
        {/* Left Content - Tour Details */}
        <div className="flex-1">
          
          {/* Tabs */}
          <div className="flex items-center gap-[32px] border-b border-gray-200 mb-[40px] overflow-x-auto hide-scrollbar">
            {['Overview', 'Review', 'Photos', 'Itinerary', 'FAQs'].map((tab, i) => (
              <button key={i} className={`pb-[16px] text-[16px] font-bold whitespace-nowrap transition-colors relative ${i === 0 ? 'text-[#38BDF8]' : 'text-gray-500 hover:text-gray-800'}`}>
                {tab}
                {i === 0 && <div className="absolute bottom-[-1px] left-[0px] w-full h-[3px] bg-[#38BDF8] rounded-t-full"></div>}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="mb-[48px]">
            <h2 className="text-[24px] font-bold text-[#1E293B] mb-[24px]">Description</h2>
            <p className="text-gray-600 leading-relaxed mb-[24px]">
              Discover the enchanting beauty of Da Nang on this comprehensive 3-day, 2-night tour. Designed for travelers who want to experience the perfect blend of rich culture, breathtaking nature, and modern attractions. 
            </p>
            <p className="text-gray-600 leading-relaxed mb-[24px]">
              You will explore the iconic Golden Bridge at Ba Na Hills, stroll through the ancient, lantern-lit streets of Hoi An, and relax on the pristine white sands of My Khe Beach. Our knowledgeable local guides will ensure you uncover the hidden gems and authentic flavors of Central Vietnam.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mt-[32px]">
              {[1, 2, 3, 4].map((img) => (
                <div key={img} className="relative w-full aspect-square rounded-[16px] overflow-hidden">
                  <Image src={`https://picsum.photos/seed/gallery-${tourId}-${img}/400/400`} alt="Gallery" fill className="object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-[48px] bg-white rounded-[24px] p-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <h2 className="text-[24px] font-bold text-[#1E293B] mb-[24px]">Tour Highlights</h2>
            <ul className="space-y-[16px]">
              {[
                "Experience the breathtaking Golden Bridge supported by giant hands at Ba Na Hills.",
                "Wander through the UNESCO World Heritage site of Hoi An Ancient Town at sunset.",
                "Savor authentic Central Vietnamese cuisine including Mi Quang and Cao Lau.",
                "Enjoy convenient round-trip transportation and a professional English-speaking guide."
              ].map((highlight, i) => (
                <li key={i} className="flex items-start gap-[12px]">
                  <CheckCircle size={24} className="text-[#00E676] flex-shrink-0 mt-[2px]" weight="fill" />
                  <span className="text-gray-700 leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Included / Excluded */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] mb-[48px]">
            <div className="bg-[#F0FDF4] rounded-[24px] p-[32px] border border-[#BBF7D0]">
              <h3 className="text-[20px] font-bold text-[#166534] mb-[24px] flex items-center gap-[8px]">
                <CheckCircle size={24} weight="fill" /> What's Included
              </h3>
              <ul className="space-y-[12px]">
                {["Hotel pickup and drop-off", "English-speaking guide", "All entrance fees and tickets", "2 nights accommodation (4-star)", "Meals as per itinerary"].map((item, i) => (
                  <li key={i} className="flex items-center gap-[8px] text-[#166534]/80">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#166534]"></span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#FEF2F2] rounded-[24px] p-[32px] border border-[#FECACA]">
              <h3 className="text-[20px] font-bold text-[#991B1B] mb-[24px] flex items-center gap-[8px]">
                <XCircle size={24} weight="fill" /> What's Excluded
              </h3>
              <ul className="space-y-[12px]">
                {["Personal expenses", "Tips for guide and driver", "Travel insurance", "International flights"].map((item, i) => (
                  <li key={i} className="flex items-center gap-[8px] text-[#991B1B]/80">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#991B1B]"></span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Right Sidebar - Booking Card */}
        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-[24px] p-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 lg:sticky lg:top-[32px]">
            
            {/* Price Header */}
            <div className="flex items-center justify-between mb-[32px] pb-[24px] border-b border-gray-100">
              <div>
                <div className="text-[14px] text-gray-400 line-through mb-[4px]">$55.00 /person</div>
                <div className="flex items-baseline gap-[4px]">
                  <span className="text-[36px] font-bold text-[#38BDF8]">$35.00</span>
                  <span className="text-[14px] text-gray-500 font-medium">/person</span>
                </div>
              </div>
              <div className="w-[60px] h-[60px] rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#F5A524] font-bold text-[18px]">
                -36%
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-[20px] mb-[32px]">
              <div>
                <label className="block text-[14px] font-bold text-[#1E293B] mb-[8px]">Select Date</label>
                <div className="relative">
                  <input type="date" className="w-full bg-[#F8F9FA] border border-gray-200 rounded-[12px] py-[12px] px-[16px] text-gray-700 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]" defaultValue="2024-12-15" />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1E293B] mb-[8px]">Travelers</label>
                <div className="relative flex items-center bg-[#F8F9FA] border border-gray-200 rounded-[12px] p-[4px]">
                  <button className="w-[40px] h-[40px] flex items-center justify-center text-gray-500 hover:bg-white rounded-[8px] transition-colors">-</button>
                  <div className="flex-1 text-center font-bold text-[#1E293B]">2 Adults</div>
                  <button className="w-[40px] h-[40px] flex items-center justify-center text-gray-500 hover:bg-white rounded-[8px] transition-colors">+</button>
                </div>
              </div>
            </div>

            {/* Total & Submit */}
            <div className="flex items-center justify-between mb-[32px]">
              <span className="text-[16px] font-bold text-gray-600">Total</span>
              <span className="text-[28px] font-bold text-[#1E293B]">$70.00</span>
            </div>

            <button className="w-full bg-[#F5A524] hover:bg-[#D98C1C] text-white py-[16px] rounded-[16px] font-bold text-[18px] transition-colors shadow-lg shadow-[#F5A524]/30 mb-[16px]">
              Book this Activity
            </button>
            
            <button className="w-full bg-white border-2 border-gray-200 hover:border-[#38BDF8] text-gray-600 hover:text-[#38BDF8] py-[16px] rounded-[16px] font-bold text-[16px] transition-colors flex items-center justify-center gap-[8px]">
              <Heart size={20} weight="bold" /> Save to Wishlist
            </button>

            <div className="mt-[32px] pt-[24px] border-t border-gray-100 flex items-center justify-center gap-[8px] text-gray-500 cursor-pointer hover:text-[#38BDF8] transition-colors font-medium">
              <ShareNetwork size={18} weight="bold" /> Share this tour
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
