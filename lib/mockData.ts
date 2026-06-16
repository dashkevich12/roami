import type { GeneratedRoute, Booking } from './types';

export const MOCK_ROUTES: GeneratedRoute[] = [
  {
    id: '1',
    destination: 'Бангкок',
    country: 'Таиланд',
    coverImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    dateFrom: '2026-07-15',
    dateTo: '2026-07-22',
    status: 'upcoming',
    budget: 'средний',
    totalCost: '95 000 ₽',
    transfer: {
      toAirport: 'Такси от дома до Шереметьево ~45 мин',
      cost: '1 200 ₽',
    },
    flight: {
      from: 'Москва (SVO)',
      to: 'Бангкок (BKK)',
      airline: 'Thai Airways',
      departure: '23:30',
      arrival: '12:40 +1',
      price: '38 000 ₽',
      aviasalesUrl: 'https://aviasales.ru',
    },
    hotel: {
      name: 'Avani+ Riverside Bangkok Hotel',
      stars: 5,
      address: 'Riverside, Бангкок',
      price: '5 200 ₽/ночь',
      bookingUrl: 'https://booking.com',
    },
    weather: '☀️ +32°C, влажно, дождей не ожидается',
    days: [
      {
        date: '2026-07-15',
        dayNumber: 1,
        activities: [
          { time: '14:00', title: 'Заселение в отель', description: 'Avani+ Riverside', type: 'hotel' },
          { time: '16:00', title: 'Ват Пхо', description: 'Храм лежащего Будды — 10 мин пешком', type: 'attraction', price: '300 ₽' },
          { time: '19:00', title: 'Ужин на рынке Ор Тор Кор', description: 'Лучший фуд-маркет Бангкока', type: 'food', price: '800 ₽' },
        ],
      },
      {
        date: '2026-07-16',
        dayNumber: 2,
        activities: [
          { time: '08:00', title: 'Завтрак в кафе', description: 'Mango Tango на Кхао Сан', type: 'food', price: '400 ₽' },
          { time: '10:00', title: 'Гранд Палас', description: 'Главная достопримечательность Бангкока', type: 'attraction', price: '1 200 ₽' },
          { time: '14:00', title: 'Чатучак', description: 'Крупнейший рынок в мире', type: 'attraction' },
          { time: '20:00', title: 'Крыша Vertigo', description: 'Ужин на 61 этаже с видом на город', type: 'food', price: '4 000 ₽' },
        ],
      },
      {
        date: '2026-07-17',
        dayNumber: 3,
        activities: [
          { time: '09:00', title: 'СПА-процедуры', description: 'Тайский массаж 2 часа в Divana', type: 'attraction', price: '3 500 ₽' },
          { time: '13:00', title: 'Обед в Nahm', description: 'Тайская кухня Michelin', type: 'food', price: '3 000 ₽' },
          { time: '16:00', title: 'ТЦ Siam Paragon', description: 'Шопинг и аквариум', type: 'attraction' },
          { time: '21:00', title: 'Khao San Road', description: 'Ночная жизнь', type: 'attraction' },
        ],
      },
    ],
    createdAt: '2026-06-10T10:00:00Z',
  },
  {
    id: '2',
    destination: 'Барселона',
    country: 'Испания',
    coverImage: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
    dateFrom: '2026-05-01',
    dateTo: '2026-05-08',
    status: 'completed',
    budget: 'средний',
    totalCost: '120 000 ₽',
    transfer: { toAirport: 'Экспресс Аэроэкспресс', cost: '500 ₽' },
    flight: {
      from: 'Москва (SVO)',
      to: 'Барселона (BCN)',
      airline: 'Iberia',
      departure: '09:15',
      arrival: '12:30',
      price: '42 000 ₽',
      aviasalesUrl: 'https://aviasales.ru',
    },
    hotel: {
      name: 'Hotel Arts Barcelona',
      stars: 5,
      address: 'Barceloneta, Барселона',
      price: '12 000 ₽/ночь',
      bookingUrl: 'https://booking.com',
    },
    days: [],
    createdAt: '2026-04-01T10:00:00Z',
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    type: 'flight',
    name: 'Москва → Бангкок · Thai Airways',
    dateFrom: '2026-07-15',
    confirmationNumber: 'TG-4821947',
    externalUrl: 'https://aviasales.ru',
    status: 'upcoming',
  },
  {
    id: 'b2',
    type: 'hotel',
    name: 'Avani+ Riverside Bangkok Hotel',
    dateFrom: '2026-07-15',
    dateTo: '2026-07-22',
    confirmationNumber: 'BK-9234561',
    externalUrl: 'https://booking.com',
    status: 'upcoming',
  },
  {
    id: 'b3',
    type: 'flight',
    name: 'Москва → Барселона · Iberia',
    dateFrom: '2026-05-01',
    confirmationNumber: 'IB-5512883',
    externalUrl: 'https://aviasales.ru',
    status: 'completed',
  },
];

export const POPULAR_DESTINATIONS = [
  { name: 'Бангкок', country: 'Таиланд', emoji: '🇹🇭', temp: '+32°' },
  { name: 'Дубай', country: 'ОАЭ', emoji: '🇦🇪', temp: '+38°' },
  { name: 'Стамбул', country: 'Турция', emoji: '🇹🇷', temp: '+28°' },
  { name: 'Бали', country: 'Индонезия', emoji: '🇮🇩', temp: '+30°' },
  { name: 'Барселона', country: 'Испания', emoji: '🇪🇸', temp: '+26°' },
  { name: 'Токио', country: 'Япония', emoji: '🇯🇵', temp: '+22°' },
];
