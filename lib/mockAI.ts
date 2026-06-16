import type { GeneratedRoute, RouteDay } from './types';

interface TripParams {
  destination: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  adults: number;
  children: number;
  budget: 'economy' | 'medium' | 'business';
  interests: string[];
  preferences?: {
    restType?: string;
    hotelType?: string;
    dietary?: string;
    nightlife?: boolean;
  };
}

const CITY_IMAGES: Record<string, string> = {
  'Бангкок': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  'Дубай': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'Стамбул': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  'Бали': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'Барселона': 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
  'Токио': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'Париж': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Рим': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'Пхукет': 'https://images.unsplash.com/photo-1589394915835-964da2e37a37?w=800&q=80',
  'Амстердам': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
};

function getDaysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string, offsetDays: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function getBudgetLabel(b: string): string {
  if (b === 'economy') return 'эконом';
  if (b === 'business') return 'бизнес';
  return 'средний';
}

function generateDays(params: TripParams, numDays: number): RouteDay[] {
  const isActive = params.preferences?.restType === 'active';
  const hasNightlife = params.preferences?.nightlife;
  const days: RouteDay[] = [];

  for (let i = 0; i < Math.min(numDays - 1, 6); i++) {
    const date = formatDate(params.dateFrom, i + 1);

    if (i === 0) {
      days.push({
        date,
        dayNumber: i + 1,
        activities: [
          { time: '14:00', title: 'Заселение в отель', description: `Размещение и отдых после перелёта`, type: 'hotel' },
          { time: '16:00', title: 'Прогулка по центру', description: `Знакомство с ${params.destination}`, type: 'attraction' },
          { time: '19:00', title: 'Ужин в местном ресторане', description: `Попробуйте национальную кухню`, type: 'food', price: '1 500 ₽' },
        ],
      });
    } else if (isActive) {
      days.push({
        date,
        dayNumber: i + 1,
        activities: [
          { time: '08:00', title: 'Завтрак в кафе', description: 'Местные завтраки', type: 'food', price: '600 ₽' },
          { time: '10:00', title: `Экскурсия — День ${i + 1}`, description: `Активная прогулка по достопримечательностям`, type: 'attraction', price: '2 000 ₽' },
          { time: '14:00', title: 'Обед', description: 'Местная кухня', type: 'food', price: '1 000 ₽' },
          { time: '16:00', title: 'Поход / активность', description: 'Треккинг, велосипед или водные виды спорта', type: 'attraction', price: '1 500 ₽' },
          ...(hasNightlife ? [{ time: '21:00', title: 'Ночная жизнь', description: 'Бар или ночной рынок', type: 'food' as const, price: '2 000 ₽' }] : []),
        ],
      });
    } else {
      days.push({
        date,
        dayNumber: i + 1,
        activities: [
          { time: '09:00', title: 'Завтрак', description: 'Расслабленное начало дня', type: 'food', price: '700 ₽' },
          { time: '11:00', title: `Главная достопримечательность — День ${i + 1}`, description: `Осмотр знаковых мест ${params.destination}`, type: 'attraction', price: '1 500 ₽' },
          { time: '14:00', title: 'Обед', description: 'Кафе или ресторан', type: 'food', price: '1 200 ₽' },
          { time: '16:00', title: 'Пляж / Релакс', description: 'Отдых у воды или СПА', type: 'attraction' },
          { time: '20:00', title: 'Ужин', description: 'Вечерний ресторан', type: 'food', price: '2 000 ₽' },
        ],
      });
    }
  }

  return days;
}

export async function generateMockRoute(params: TripParams): Promise<GeneratedRoute> {
  await new Promise(r => setTimeout(r, 3000));

  const numDays = getDaysBetween(params.dateFrom, params.dateTo);
  const budgetMultiplier = params.budget === 'economy' ? 0.6 : params.budget === 'business' ? 2.5 : 1;
  const baseFlightPrice = Math.round(28000 * budgetMultiplier);
  const baseHotelPrice = Math.round(4500 * budgetMultiplier);
  const totalCost = Math.round((baseFlightPrice * 2 + baseHotelPrice * numDays + 15000) * budgetMultiplier / 1000) * 1000;

  const coverImage = CITY_IMAGES[params.destination] ||
    `https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80`;

  const hotelNames: Record<string, string> = {
    economy: 'Friendly Hostel & Apartments',
    medium: 'Grand City Hotel',
    business: 'Four Seasons',
  };

  return {
    id: Date.now().toString(),
    destination: params.destination,
    country: params.country,
    coverImage,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    status: 'upcoming',
    budget: getBudgetLabel(params.budget),
    totalCost: `${totalCost.toLocaleString('ru')} ₽`,
    transfer: {
      toAirport: 'Такси до аэропорта ~45–60 мин',
      cost: '1 200–1 800 ₽',
    },
    flight: {
      from: 'Москва (SVO)',
      to: `${params.destination}`,
      airline: 'Прямой рейс',
      departure: '10:30',
      arrival: '18:45',
      price: `${baseFlightPrice.toLocaleString('ru')} ₽`,
      aviasalesUrl: 'https://aviasales.ru',
    },
    hotel: {
      name: hotelNames[params.budget] || 'Grand City Hotel',
      stars: params.budget === 'economy' ? 3 : params.budget === 'business' ? 5 : 4,
      address: `Центр, ${params.destination}`,
      price: `${baseHotelPrice.toLocaleString('ru')} ₽/ночь`,
      bookingUrl: 'https://booking.com',
    },
    weather: `☀️ Ожидается хорошая погода, уточните прогноз за 3 дня до вылета`,
    days: generateDays(params, numDays),
    createdAt: new Date().toISOString(),
  };
}

export type { TripParams };
