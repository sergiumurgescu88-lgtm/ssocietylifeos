// Mock data generators that simulate API responses

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: "Sunny" | "Partly Cloudy" | "Cloudy" | "Rainy" | "Stormy" | "Snowy";
  humidity: number;
  windSpeed: number;
  location: string;
  forecast: { day: string; temp: number; condition: string }[];
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

export interface HealthData {
  steps: { current: number; goal: number };
  water: { current: number; goal: number; unit: string };
  sleep: { hours: number; quality: number };
  heartRate: number;
  calories: { burned: number; goal: number };
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  url: string;
}

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

function randomSparkline(base: number, points = 24): number[] {
  const data: number[] = [];
  let val = base;
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.5) * base * 0.02;
    data.push(Math.round(val * 100) / 100);
  }
  return data;
}

export async function fetchWeatherMock(): Promise<WeatherData> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    temp: 22 + Math.round((Math.random() - 0.5) * 6),
    feelsLike: 20 + Math.round((Math.random() - 0.5) * 4),
    condition: "Partly Cloudy",
    humidity: 55 + Math.round(Math.random() * 20),
    windSpeed: 8 + Math.round(Math.random() * 10),
    location: "Bucharest, RO",
    forecast: [
      { day: "Mâine", temp: 24, condition: "☀️" },
      { day: "Joi", temp: 19, condition: "🌧️" },
      { day: "Vineri", temp: 21, condition: "⛅" },
    ],
  };
}

export async function fetchCryptoMock(): Promise<CryptoAsset[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 67234 + Math.round((Math.random() - 0.5) * 2000),
      change24h: +(2.3 + (Math.random() - 0.5) * 3).toFixed(2),
      sparkline: randomSparkline(67234),
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 3421 + Math.round((Math.random() - 0.5) * 200),
      change24h: +(-1.1 + (Math.random() - 0.5) * 4).toFixed(2),
      sparkline: randomSparkline(3421),
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 148 + Math.round((Math.random() - 0.5) * 20),
      change24h: +(5.7 + (Math.random() - 0.5) * 5).toFixed(2),
      sparkline: randomSparkline(148),
    },
  ];
}

export async function fetchHealthMock(): Promise<HealthData> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    steps: { current: 6847 + Math.round(Math.random() * 1000), goal: 10000 },
    water: { current: 1.5 + Math.round(Math.random() * 5) / 10, goal: 2.5, unit: "L" },
    sleep: { hours: 7.3, quality: 82 + Math.round(Math.random() * 10) },
    heartRate: 68 + Math.round(Math.random() * 12),
    calories: { burned: 1850 + Math.round(Math.random() * 300), goal: 2200 },
  };
}

export async function fetchNewsMock(): Promise<NewsItem[]> {
  await new Promise((r) => setTimeout(r, 700));
  return [
    {
      id: "1",
      title: "AI Revolution: New Models Surpass Human Performance in Complex Reasoning",
      source: "TechCrunch",
      timeAgo: "2h ago",
      category: "Tech",
      url: "#",
    },
    {
      id: "2",
      title: "Bitcoin ETF Inflows Reach Record $1.2B as Institutional Interest Surges",
      source: "CoinDesk",
      timeAgo: "4h ago",
      category: "Crypto",
      url: "#",
    },
    {
      id: "3",
      title: "Remote Work Study: 73% of Companies Plan Permanent Hybrid Models",
      source: "Bloomberg",
      timeAgo: "5h ago",
      category: "Business",
      url: "#",
    },
    {
      id: "4",
      title: "EU Passes Landmark Digital Health Data Regulation for Citizens",
      source: "Reuters",
      timeAgo: "8h ago",
      category: "Health",
      url: "#",
    },
  ];
}

const TASKS_STORAGE_KEY = "lifeos_tasks";

export function getTasksFromStorage(): TaskItem[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: "t1", title: "Review AI strategy document", done: false, priority: "high", createdAt: new Date().toISOString() },
    { id: "t2", title: "Morning workout routine", done: true, priority: "medium", createdAt: new Date().toISOString() },
    { id: "t3", title: "Team standup at 10 AM", done: false, priority: "high", createdAt: new Date().toISOString() },
    { id: "t4", title: "Update portfolio tracker", done: false, priority: "low", createdAt: new Date().toISOString() },
    { id: "t5", title: "Read 30 min before bed", done: false, priority: "medium", createdAt: new Date().toISOString() },
  ];
}

export function saveTasksToStorage(tasks: TaskItem[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export async function fetchTasksMock(): Promise<TaskItem[]> {
  await new Promise((r) => setTimeout(r, 200));
  return getTasksFromStorage();
}
