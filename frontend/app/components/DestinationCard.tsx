"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";

interface DestinationCardProps {
  title: string;
  tours: string;
  img: string;
  slug: string;
  span?: string;
}

export default function DestinationCard({ title, tours, img, slug, span = "col-span-1" }: DestinationCardProps) {
  return (
    <Link href={`/tours/${slug}`} className={`bg-[#F8F9FA] rounded-[24px] overflow-hidden group cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 relative ${span} flex flex-col border border-white block`}>
      <div className="p-3 pb-0">
        <div className="relative w-full h-[220px] rounded-[16px] overflow-hidden">
          <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col justify-center items-center relative flex-1">
        <h3 className="font-bold text-[17px] text-[#1E293B] mb-1">{title}</h3>
        <p className="text-[12px] text-gray-500 font-medium">{tours}</p>
        <CaretRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#F5A524] transition-colors" />
      </div>
    </Link>
  );
}
