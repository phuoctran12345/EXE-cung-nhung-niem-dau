"use client";

import Image from "next/image";
import {
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  PinterestLogo,
  CaretDown
} from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="relative bg-[#151E2E] text-[#B0B7C3] pt-24 mt-auto">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#151E2E] via-[#151E2E]/95 to-[#151E2E]/80"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between pb-16 border-b border-white/10 gap-12 lg:gap-0">
          
          {/* Top Left */}
          <div className="w-full lg:w-[45%]">
            {/* Logo */}
            <div className="relative w-[220px] h-[55px] mb-6 cursor-pointer">
              <Image src="/logo.png" alt="TravelMatch Logo" fill className="object-contain object-left" />
            </div>
            <p className="text-[15px] leading-relaxed mb-8 max-w-[480px] text-white/80 font-medium">
              TravelMatch is a smart platform that connects travelers with local guides and unique experiences through intelligent matching technology. We help travelers explore destinations more authentically while empowering local communities.
            </p>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-full bg-[#3B5998] flex items-center justify-center text-white hover:scale-110 transition-transform"><FacebookLogo weight="fill" size={20} /></button>
              <button className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform"><TwitterLogo weight="fill" size={20} /></button>
              <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white hover:scale-110 transition-transform"><InstagramLogo weight="fill" size={20} /></button>
              <button className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center text-white hover:scale-110 transition-transform"><PinterestLogo weight="fill" size={20} /></button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] h-[180px] bg-white/20"></div>

          {/* Top Right */}
          <div className="w-full lg:w-[45%] lg:pl-10">
            <h3 className="text-white text-3xl font-bold mb-3">Join the <span className="text-[#38BDF8]">Travel</span><span className="text-[#F5A524]">Match</span> Community</h3>
            <p className="text-white/90 text-[17px] mb-8 font-medium">Local stories. Personalized ideas. Unlimited inspiration</p>
            
            <div className="relative max-w-[500px]">
              <input type="email" placeholder="Email Address" className="w-full bg-white rounded-full py-4 pl-6 pr-36 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#38BDF8]" />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white px-8 rounded-full font-bold transition-colors text-[15px]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Middle Grid */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1 */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-white/90 font-semibold mb-3 text-[15px]">Language</label>
              <button className="w-full bg-[#1F2C41] border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between text-white hover:bg-[#283852] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-3.5 bg-[url('https://flagcdn.com/w40/gb.png')] bg-cover bg-center rounded-sm"></div>
                  <span className="text-[14px]">English (UK)</span>
                </div>
                <CaretDown weight="bold" />
              </button>
            </div>
            <div>
              <label className="block text-white/90 font-semibold mb-3 text-[15px]">Currency</label>
              <button className="w-full bg-[#1F2C41] border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between text-white hover:bg-[#283852] transition-colors">
                <span className="text-[14px]">U.S. Dollar ($)</span>
                <CaretDown weight="bold" />
              </button>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-[15px] text-white/70 font-medium">
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Press Room</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Help</h4>
            <ul className="flex flex-col gap-4 text-[15px] text-white/70 font-medium">
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Contact us</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Terms and conditions</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Privacy policy</a></li>
              <li><a href="#" className="hover:text-[#F5A524] transition-colors">Sitemap</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold text-[16px] mb-6">Payment methods possible</h4>
            <div className="grid grid-cols-5 gap-2 mb-8">
              {[22,23,24,25,26,27,28,29,30,31].map((num) => (
                <div key={num} className="bg-white rounded p-[3px] flex items-center justify-center">
                  <div className="relative w-full aspect-[4/2.5]">
                    <Image src={`/payments/${num}.png`} alt={`Payment ${num}`} fill className="object-contain" />
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-white font-bold text-[16px] mb-4">Company</h4>
            <a href="#" className="text-white/70 hover:text-[#F5A524] transition-colors text-[14px] font-medium">Become a Tour guide for Us</a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-[#111827] relative z-10 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-[14px] font-medium">Copyright 2024 TravelMatch. All Rights Reserved</p>
          <div className="flex gap-3">
            <button className="w-9 h-9 rounded-full bg-[#3B5998] flex items-center justify-center text-white hover:scale-110 transition-transform"><FacebookLogo weight="fill" size={18} /></button>
            <button className="w-9 h-9 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:scale-110 transition-transform"><TwitterLogo weight="fill" size={18} /></button>
            <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white hover:scale-110 transition-transform"><InstagramLogo weight="fill" size={18} /></button>
            <button className="w-9 h-9 rounded-full bg-[#E60023] flex items-center justify-center text-white hover:scale-110 transition-transform"><PinterestLogo weight="fill" size={18} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
