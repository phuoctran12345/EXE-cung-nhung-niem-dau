"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  GlobeHemisphereWest, 
  MagnifyingGlass, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle,
  CaretRight,
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  PinterestLogo,
  CaretDown,
  Heart,
  FadersHorizontal,
  Check
} from "@phosphor-icons/react";

import { getToursByCity, Tour } from "../../../data/mockData";

// Helper to format city names (e.g. da-nang -> Da Nang)
const formatCityName = (slug: string) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function CityToursPage() {
  const params = useParams();
  const citySlug = (params.city as string) || "da-nang";
  const cityName = formatCityName(citySlug);
  const cityTours = getToursByCity(citySlug);

  // Filter States
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['No Shopping']);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(['2 Days 1 Night (2D1N)']);
  const [filteredTours, setFilteredTours] = useState<Tour[]>(cityTours);

  const handleCheckbox = (state: string[], setState: any, value: string) => {
    if (state.includes(value)) setState(state.filter(item => item !== value));
    else setState([...state, value]);
  };

  const applyFilters = () => {
    // Simple mock filter logic based on the mock data
    let result = cityTours;

    if (selectedDurations.length > 0) {
      result = result.filter(tour => {
        if (selectedDurations.includes("Full Day") && tour.duration === "Full Day") return true;
        if (selectedDurations.includes("2 Days 1 Night (2D1N)") && tour.duration === "2D1N") return true;
        if (selectedDurations.includes("3 Days 2 Night (3D2N)") && tour.duration === "3D2N") return true;
        if (selectedDurations.includes("Multi-day Trip") && tour.duration === "Multi-day Trip") return true;
        return false;
      });
    }

    if (selectedTypes.length > 0) {
      result = result.filter(tour => {
        if (selectedTypes.includes("Shopping included") && tour.shopping) return true;
        if (selectedTypes.includes("No Shopping") && !tour.shopping) return true;
        return false;
      });
    }

    // Price range
    if (selectedPrices.length > 0) {
       result = result.filter(tour => {
         if (selectedPrices.includes("Under $50") && tour.price < 50) return true;
         if (selectedPrices.includes("$50 - $100") && tour.price >= 50 && tour.price <= 100) return true;
         if (selectedPrices.includes("Over $100") && tour.price > 100) return true;
         return false;
       });
    }

    setFilteredTours(result);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans">
      


      {/* Hero Banner for City */}
      <section className="relative w-full h-[400px]">
        <Image src={`https://picsum.photos/seed/${citySlug}/1920/600`} alt={cityName} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2434]/80 to-transparent"></div>
        
        <div className="absolute inset-0 max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col justify-end pb-16">
          <div className="text-[#F5A524] font-bold tracking-widest text-[14px] uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#F5A524] inline-block"></span> EXPLORE DESTINATION
          </div>
          <h1 className="text-[64px] font-bold text-white leading-none uppercase tracking-wide font-serif drop-shadow-lg">
            {cityName}
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#38BDF8] sticky top-8">
            <div className="flex items-center gap-2 text-[18px] font-bold text-[#1E293B] mb-6">
              <FadersHorizontal size={20} className="text-[#38BDF8]" weight="bold" /> Filter
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Price Range</h3>
              <div className="flex flex-col gap-3">
                {['Under $50', '$50 - $100', 'Over $100'].map((price) => (
                  <label key={price} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleCheckbox(selectedPrices, setSelectedPrices, price); }}>
                    <div className={`w-5 h-5 rounded-[4px] border ${selectedPrices.includes(price) ? 'bg-[#38BDF8] border-[#38BDF8]' : 'border-gray-300'} flex items-center justify-center transition-colors`}>
                      {selectedPrices.includes(price) && <Check weight="bold" size={14} className="text-white" />}
                    </div>
                    <span className="text-[14px] text-gray-700">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tour Type */}
            <div className="mb-6">
              <h3 className="font-bold text-[15px] mb-3">Tour Type</h3>
              <div className="flex flex-col gap-3">
                {['Shopping included', 'No Shopping'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleCheckbox(selectedTypes, setSelectedTypes, type); }}>
                    <div className={`w-5 h-5 rounded-[4px] border ${selectedTypes.includes(type) ? 'bg-[#38BDF8] border-[#38BDF8]' : 'border-gray-300'} flex items-center justify-center transition-colors`}>
                      {selectedTypes.includes(type) && <Check weight="bold" size={14} className="text-white" />}
                    </div>
                    <span className="text-[14px] text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <h3 className="font-bold text-[15px] mb-3">Duration</h3>
              <div className="flex flex-col gap-3">
                {['Full Day', '2 Days 1 Night (2D1N)', '3 Days 2 Night (3D2N)', 'Multi-day Trip'].map((duration) => (
                  <label key={duration} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); handleCheckbox(selectedDurations, setSelectedDurations, duration); }}>
                    <div className={`w-5 h-5 rounded-[4px] border ${selectedDurations.includes(duration) ? 'bg-[#38BDF8] border-[#38BDF8]' : 'border-gray-300'} flex items-center justify-center transition-colors`}>
                      {selectedDurations.includes(duration) && <Check weight="bold" size={14} className="text-white" />}
                    </div>
                    <span className="text-[14px] text-gray-700">{duration}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={applyFilters}
              className="w-full max-w-[120px] mx-auto block bg-[#38BDF8] hover:bg-[#0284C7] text-white py-2.5 rounded-full font-bold transition-colors"
            >
              Search
            </button>
          </div>
        </aside>

        {/* Right Content - Tour List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[28px] font-bold text-[#1E293B]">
              <span className="text-[#F5A524]">{cityName}</span> Tour List
            </h2>
            <div className="text-[14px] text-gray-500 font-medium">
              Showing <span className="text-[#1E293B] font-bold">12</span> results
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {filteredTours.length > 0 ? filteredTours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all group relative">
                
                <button className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors z-10">
                  <Heart size={24} weight="regular" />
                </button>

                {/* Thumbnail */}
                <div className="relative w-full md:w-[320px] h-[220px] rounded-[16px] overflow-hidden flex-shrink-0 cursor-pointer">
                  <Image src={tour.img} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1 pr-4">
                  <div>
                    <Link href={`/tour/${tour.id}`} className="text-[20px] md:text-[22px] font-bold text-[#1E293B] leading-tight hover:text-[#38BDF8] transition-colors line-clamp-2 mb-3 max-w-[90%]">
                      {tour.title}
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-[#F5A524]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} weight="fill" size={16} />
                        ))}
                      </div>
                      <span className="text-[13px] font-bold text-[#1E293B]">{tour.rating}</span>
                      <span className="text-[13px] text-gray-500">({tour.reviews} Rates)</span>
                    </div>

                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 mb-6 max-w-[95%]">
                      Embark on an extraordinary journey from the romantic European vibes of Ba Na Hills to the vibrant cultural soul of Nam Hoi An. It is a perfect harmony of mountain peaks and coastal wonders, crafted into one seamless escape.
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <div className="text-[11px] text-gray-400 font-medium mb-0.5">From</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[24px] font-bold text-[#38BDF8]">${tour.price.toFixed(2)}</span>
                        <span className="text-[13px] text-gray-500 font-medium">/person</span>
                      </div>
                    </div>
                    <Link href={`/tour/${tour.id}`} className="border-2 border-[#F5A524] hover:bg-[#F5A524] hover:text-white text-[#F5A524] px-6 py-2 rounded-full font-bold text-[14px] transition-colors flex items-center gap-2">
                      View more
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-gray-500 font-medium text-[16px]">
                No tours match your selected filters. Please try another combination.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 text-[14px] font-bold text-gray-500 mt-12">
            <div className="w-10 h-10 rounded-full bg-[#F5A524] text-white flex items-center justify-center cursor-pointer shadow-lg shadow-[#F5A524]/30">1</div>
            <div className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">2</div>
            <div className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">3</div>
            <div className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">4</div>
            <div className="px-2">...</div>
            <div className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
              <CaretRight size={16} weight="bold" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
