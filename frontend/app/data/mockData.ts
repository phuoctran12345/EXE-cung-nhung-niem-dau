export interface Destination {
  id: string;
  name: string;
  slug: string;
  toursCount: string;
  img: string;
}

export interface Tour {
  id: string;
  citySlug: string;
  title: string;
  location: string;
  rating: number;
  reviews: string;
  price: number;
  originalPrice: number;
  duration: string;
  durationLabel: string;
  plan: string;
  transport: string;
  shopping: boolean;
  img: string;
  description: string;
  isPopular: boolean;
  isNewest: boolean;
  isHighestRated: boolean;
}

export const destinations: Destination[] = [
  { id: "1", name: "Da Nang", slug: "da-nang", toursCount: "100+ Tours", img: "https://picsum.photos/seed/danang-dest/600/800" },
  { id: "2", name: "Ha Noi", slug: "ha-noi", toursCount: "150+ Tours", img: "https://picsum.photos/seed/hanoi-dest/600/800" },
  { id: "3", name: "Ho Chi Minh", slug: "ho-chi-minh", toursCount: "200+ Tours", img: "https://picsum.photos/seed/hcm-dest/600/800" },
  { id: "4", name: "Nha Trang", slug: "nha-trang", toursCount: "80+ Tours", img: "https://picsum.photos/seed/nhatrang-dest/600/800" },
  { id: "5", name: "Da Lat", slug: "da-lat", toursCount: "120+ Tours", img: "https://picsum.photos/seed/dalat-dest/600/800" },
  { id: "6", name: "Phu Quoc", slug: "phu-quoc", toursCount: "90+ Tours", img: "https://picsum.photos/seed/phuquoc-dest/600/800" },
  { id: "7", name: "Sa Pa", slug: "sa-pa", toursCount: "60+ Tours", img: "https://picsum.photos/seed/sapa-dest/600/800" },
];

export const tours: Tour[] = [
  // --- DA NANG TOURS ---
  {
    id: "dn-1",
    citySlug: "da-nang",
    title: "The Elite Central Journey: Ba Na Hills & Vinpearl Nam Hoi An - 2D1N",
    location: "Da Nang, Viet Nam",
    rating: 4.8,
    reviews: "1.2k",
    price: 45.00,
    originalPrice: 55.00,
    duration: "2D1N",
    durationLabel: "2 Days 1 Night (2D1N)",
    plan: "Family Plan",
    transport: "Transport Facility",
    shopping: false,
    img: "https://picsum.photos/seed/dn1/800/600",
    description: "Embark on an extraordinary journey from the romantic European vibes of Ba Na Hills to the vibrant cultural soul of Nam Hoi An. It is a perfect harmony of mountain peaks and coastal wonders, crafted into one seamless escape.",
    isPopular: true,
    isNewest: true,
    isHighestRated: false,
  },
  {
    id: "dn-2",
    citySlug: "da-nang",
    title: "Da Nang Discovery: Marble Mountains & Hoi An Ancient Town - Full Day",
    location: "Da Nang, Viet Nam",
    rating: 4.9,
    reviews: "2.1k",
    price: 35.00,
    originalPrice: 40.00,
    duration: "Full Day",
    durationLabel: "Full Day",
    plan: "Group Tour",
    transport: "Bus Included",
    shopping: true,
    img: "https://picsum.photos/seed/dn2/800/600",
    description: "Explore the mysterious caves of Marble Mountains before wandering through the lantern-lit streets of Hoi An Ancient Town. A perfect blend of nature and history in a single day.",
    isPopular: true,
    isNewest: false,
    isHighestRated: true,
  },
  {
    id: "dn-3",
    citySlug: "da-nang",
    title: "Luxury Beach Escape: My Khe Beach & Son Tra Peninsula - 3D2N",
    location: "Da Nang, Viet Nam",
    rating: 4.7,
    reviews: "850",
    price: 120.00,
    originalPrice: 150.00,
    duration: "3D2N",
    durationLabel: "3 Days 2 Night (3D2N)",
    plan: "Private Tour",
    transport: "Private Car",
    shopping: false,
    img: "https://picsum.photos/seed/dn3/800/600",
    description: "Relax at one of the world's most beautiful beaches, My Khe, and explore the lush jungles of Son Tra Peninsula. See the giant Lady Buddha statue overlooking the ocean.",
    isPopular: false,
    isNewest: true,
    isHighestRated: false,
  },
  
  // --- HA NOI TOURS ---
  {
    id: "hn-1",
    citySlug: "ha-noi",
    title: "Hanoi Old Quarter Food Tour & Water Puppet Show",
    location: "Ha Noi, Viet Nam",
    rating: 4.9,
    reviews: "3.5k",
    price: 25.00,
    originalPrice: 30.00,
    duration: "Half Day",
    durationLabel: "Up to 1 Day",
    plan: "Small Group",
    transport: "Walking",
    shopping: false,
    img: "https://picsum.photos/seed/hn1/800/600",
    description: "Taste the best street food Hanoi has to offer in the bustling Old Quarter, followed by a traditional Water Puppet show telling stories of Vietnamese folklore.",
    isPopular: true,
    isNewest: false,
    isHighestRated: true,
  },
  {
    id: "hn-2",
    citySlug: "ha-noi",
    title: "Ha Long Bay 2D1N Cruise from Hanoi - 5 Star",
    location: "Quang Ninh, Viet Nam", // Starting from Hanoi
    rating: 4.8,
    reviews: "5.2k",
    price: 150.00,
    originalPrice: 180.00,
    duration: "2D1N",
    durationLabel: "2 Days 1 Night (2D1N)",
    plan: "Family Plan",
    transport: "Limousine Transfer",
    shopping: false,
    img: "https://picsum.photos/seed/hn2/800/600",
    description: "Sail through the majestic limestone karsts of Ha Long Bay on a luxury 5-star cruise. Enjoy kayaking, squid fishing, and Tai Chi on the sundeck at dawn.",
    isPopular: true,
    isNewest: false,
    isHighestRated: true,
  },

  // --- PHU QUOC TOURS ---
  {
    id: "pq-1",
    citySlug: "phu-quoc",
    title: "Phu Quoc 3 Islands Snorkeling & Sunset BBQ",
    location: "Phu Quoc, Viet Nam",
    rating: 4.7,
    reviews: "1.8k",
    price: 55.00,
    originalPrice: 65.00,
    duration: "Full Day",
    durationLabel: "Full Day",
    plan: "Group Tour",
    transport: "Speedboat",
    shopping: false,
    img: "https://picsum.photos/seed/pq1/800/600",
    description: "Hop on a speedboat to explore the pristine coral reefs of 3 remote islands in Southern Phu Quoc. End the day with a delicious seafood BBQ while watching the sunset.",
    isPopular: true,
    isNewest: true,
    isHighestRated: false,
  },
  
  // --- DA LAT TOURS ---
  {
    id: "dl-1",
    citySlug: "da-lat",
    title: "Romantic Da Lat: Pine Forests & Waterfalls - 3D2N",
    location: "Da Lat, Viet Nam",
    rating: 4.6,
    reviews: "920",
    price: 85.00,
    originalPrice: 100.00,
    duration: "3D2N",
    durationLabel: "3 Days 2 Night (3D2N)",
    plan: "Couples Plan",
    transport: "Private Car",
    shopping: true,
    img: "https://picsum.photos/seed/dl1/800/600",
    description: "Immerse yourself in the cool climate of Da Lat. Visit the roaring Datanla Waterfall, the vibrant flower gardens, and take memorable photos at the Valley of Love.",
    isPopular: false,
    isNewest: true,
    isHighestRated: false,
  }
];

export const getToursByCity = (slug: string) => {
  return tours.filter(tour => tour.citySlug === slug);
};

export const getTourById = (id: string) => {
  return tours.find(tour => tour.id === id);
};

export const getPopularTours = () => tours.filter(t => t.isPopular);
export const getNewestTours = () => tours.filter(t => t.isNewest);
export const getHighestRatedTours = () => tours.filter(t => t.isHighestRated);
