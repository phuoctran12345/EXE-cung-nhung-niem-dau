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

// --- ACTIVITIES (MAPPED TO DESTINATION IDs) ---
// Note: Destination IDs in PrivateTourPage are currently numbers (1: Thua Thien Hue, 2: Da Nang, 5: Da Lat mapped loosely)
// We will export a generic list of activities with destinationId relation for the Private Tour workflow.
export interface Activity {
  id: string;
  destinationId: string; // Đổi sang string để đồng bộ với DB (ObjectId)
  name: string;
  address: string;
  price: number;
  image: string;
  durationHours: number;
  category: 'Morning' | 'Afternoon' | 'Night' | 'Any';
}

export const activities: Activity[] = [
  // Thua Thien Hue (id: "1")
  { id: "act-1-1", destinationId: "1", name: "Breakfast: Bun Bo Ba Thuy", address: "120 Nguyen Hue Street, Hue", price: 2.00, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80", durationHours: 1.5, category: "Morning" },
  { id: "act-1-2", destinationId: "1", name: "Visit Imperial City", address: "Thuan Thanh, Hue", price: 10.00, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80", durationHours: 3, category: "Morning" },
  { id: "act-1-3", destinationId: "1", name: "Lunch: Nem Lui & Banh Khoai", address: "11 Phu Dong Thien Vuong, Hue", price: 4.00, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80", durationHours: 1, category: "Afternoon" },
  { id: "act-1-4", destinationId: "1", name: "Thien Mu Pagoda Tour", address: "Huong Hoa, Hue", price: 5.00, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80", durationHours: 2, category: "Afternoon" },
  { id: "act-1-5", destinationId: "1", name: "Perfume River Night Cruise", address: "Toa Kham Wharf, Hue", price: 15.00, image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80", durationHours: 2, category: "Night" },
  
  // Da Nang (id: "2")
  { id: "act-2-1", destinationId: "2", name: "Breakfast: Mi Quang Ba Mua", address: "19 Tran Binh Trong, Da Nang", price: 3.00, image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80", durationHours: 1, category: "Morning" },
  { id: "act-2-2", destinationId: "2", name: "Marble Mountains Trek", address: "Hoa Hai, Ngu Hanh Son", price: 6.00, image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80", durationHours: 3, category: "Morning" },
  { id: "act-2-3", destinationId: "2", name: "Lunch: Seafood at My Khe", address: "Vo Nguyen Giap St", price: 20.00, image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80", durationHours: 2, category: "Afternoon" },
  { id: "act-2-4", destinationId: "2", name: "Han Market Shopping", address: "119 Tran Phu, Da Nang", price: 0.00, image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80", durationHours: 2, category: "Afternoon" },
  { id: "act-2-5", destinationId: "2", name: "Dragon Bridge Fire Show", address: "Nguyen Van Linh St", price: 0.00, image: "https://images.unsplash.com/photo-1542017631-f1f3a3889078?w=800&q=80", durationHours: 1.5, category: "Night" },
  
  // Ha Giang (id: "3")
  { id: "act-3-1", destinationId: "3", name: "Ma Pi Leng Pass Ride", address: "Meo Vac, Ha Giang", price: 10.00, image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80", durationHours: 4, category: "Morning" },
  { id: "act-3-2", destinationId: "3", name: "Local Thang Co Lunch", address: "Dong Van Old Quarter", price: 5.00, image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80", durationHours: 1.5, category: "Afternoon" },
  { id: "act-3-3", destinationId: "3", name: "Lung Cu Flag Tower", address: "Lung Cu, Dong Van", price: 2.00, image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80", durationHours: 2, category: "Afternoon" },
  { id: "act-3-4", destinationId: "3", name: "Homestay BBQ Night", address: "Nam Dam Village", price: 12.00, image: "https://images.unsplash.com/photo-1620914691436-b51e041797c5?w=800&q=80", durationHours: 3, category: "Night" },
];

export const getActivitiesByDestinationId = (destinationId: string) => {
  return activities.filter(act => act.destinationId === destinationId);
};

// Định dạng và quy đổi toàn bộ đơn vị tiền tệ sang Việt Nam Đồng (VND)
export const formatVND = (usdAmount: number) => {
  // Nếu số tiền < 1000, quy đổi giả định tỉ giá 25,000đ/USD sang VND cho mockData
  const amountInVND = usdAmount < 1000 ? usdAmount * 25000 : usdAmount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amountInVND);
};
