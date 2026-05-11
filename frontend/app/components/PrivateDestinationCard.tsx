// "use client" – component hiển thị một destination trong Private Tour
"use client";

import Image from "next/image";
import type { FC } from "react";

type Destination = {
  id: number;
  name: string;
  location: string;
  image: string;
};

interface PrivateDestinationCardProps {
  dest: Destination;
  onSelect?: (dest: Destination) => void;
}

const PrivateDestinationCard: FC<PrivateDestinationCardProps> = ({ dest, onSelect }) => {
  return (
    <div
      className="bg-[#F3F4F6] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB]/50 group cursor-pointer"
      onClick={() => onSelect && onSelect(dest)}
    >
      <div className="relative h-[100px] w-full overflow-hidden">
        <Image src={dest.image} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-2 bg-[#F3F4F6]">
        <h3 className="font-bold text-[#1C2B38] text-[14px] mb-1">{dest.name}</h3>
        <p className="text-gray-500 text-[12px]">{dest.location}</p>
      </div>
    </div>
  );
};

export default PrivateDestinationCard;
