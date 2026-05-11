// "use client" – component hiển thị một ngày trong Itinerary
"use client";

import Image from "next/image";
import { Clock } from "@phosphor-icons/react";

type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

interface ItineraryItemProps {
  dest: Destination;
  idx: number; // chỉ số ngày (bắt đầu từ 0)
}

export default function ItineraryItem({ dest, idx }: ItineraryItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#E5E7EB]/70 rounded-xl">
      <div className="w-[70px] h-[52px] rounded-lg overflow-hidden flex-shrink-0">
        <Image src={dest.image} alt={dest.name} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-[#1C2B38] text-[15px]">Day {idx + 1}: {dest.name}</h4>
        <p className="text-gray-500 text-[12px] flex items-center gap-1.5 mt-1">
          <Clock size={12} weight="bold" />
          Duration 1 day 1 night
        </p>
      </div>
    </div>
  );
}
