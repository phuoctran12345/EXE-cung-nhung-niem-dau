/** Hằng số phí cố định cho private tour (VNĐ) */
export const PRIVATE_TOUR_FEES = {
  transportPerDay: 700_000,
  guidePerDay: 400_000,
  platformFee: 250_000,
  defaultStayPerNight: 650_000,
} as const;

export interface PrivateTourDestination {
  id: string;
  name: string;
  image: string;
  slug?: string;
  stayPricePerNight?: number;
}

export interface PrivateTourPriceBreakdown {
  totalDays: number;
  totalNights: number;
  transportCost: number;
  guideCost: number;
  platformFee: number;
  stayCost: number;
  activitiesUnitCost: number;
  activitiesTotal: number;
  groupFixedCost: number;
  total: number;
  pricePerPerson: number;
  equivalentGuests: number;
}

export function calcPrivateTourPrice(params: {
  destinations: PrivateTourDestination[];
  durations: Record<string, { days: number; nights: number }>;
  scheduledActs: { price: number }[];
  adults: number;
  children: number;
}): PrivateTourPriceBreakdown {
  const { destinations, durations, scheduledActs, adults, children } = params;
  const { transportPerDay, guidePerDay, platformFee, defaultStayPerNight } = PRIVATE_TOUR_FEES;

  const totalDays = Object.values(durations).reduce((sum, d) => sum + d.days, 0);
  const totalNights = Object.values(durations).reduce((sum, d) => sum + d.nights, 0);

  const transportCost = transportPerDay * totalDays;
  const guideCost = guidePerDay * totalDays;
  const groupFixedCost = transportCost + guideCost + platformFee;

  const stayCost = destinations.reduce((sum, dest) => {
    const nights = durations[dest.id]?.nights ?? 0;
    const pricePerNight = dest.stayPricePerNight ?? defaultStayPerNight;
    return sum + pricePerNight * nights;
  }, 0);

  const activitiesUnitCost = scheduledActs.reduce((sum, act) => sum + act.price, 0);
  const equivalentGuests = adults + children * 0.5;
  const activitiesTotal = Math.round(activitiesUnitCost * equivalentGuests);

  const total = Math.round(groupFixedCost + stayCost + activitiesTotal);
  const pricePerPerson = Math.round(total / Math.max(equivalentGuests, 1));

  return {
    totalDays,
    totalNights,
    transportCost,
    guideCost,
    platformFee,
    stayCost,
    activitiesUnitCost,
    activitiesTotal,
    groupFixedCost,
    total,
    pricePerPerson,
    equivalentGuests,
  };
}
