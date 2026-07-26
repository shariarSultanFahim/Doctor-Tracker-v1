'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface WeatherData {
  temp: number; // Celsius
  condition: string;
  description: string;
  icon: string;
  emoji: string;
  city: string;
}

const DEFAULT_COORDS = { lat: 23.8103, lon: 90.4125 }; // Dhaka fallback

export function getWeatherEmoji(condition: string = ''): string {
  const lower = condition.toLowerCase();
  if (lower.includes('clear')) return '☀️';
  if (lower.includes('cloud')) return '🌤️';
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
  if (lower.includes('thunder')) return '⛈️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return '🌫️';
  return '🌤️';
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY || '';
  if (!apiKey) {
    return {
      temp: 24,
      condition: 'Clear',
      description: 'sky is clear',
      icon: '01d',
      emoji: '🌤️',
      city: 'Dhaka',
    };
  }

  // Primary API endpoint specified (One Call 4.0 current)
  const url = `https://api.openweathermap.org/data/4.0/onecall/current?lat=${lat}&lon=${lon}&units=metric&lang=en&appid=${apiKey}`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    let temp = 24;
    let main = 'Clear';
    let description = 'sky is clear';
    let icon = '01d';

    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const current = data.data[0];
      temp = typeof current.temp === 'number' ? current.temp : 24;
      if (current.weather && current.weather[0]) {
        main = current.weather[0].main || main;
        description = current.weather[0].description || description;
        icon = current.weather[0].icon || icon;
      }
    } else if (data.current) {
      temp = typeof data.current.temp === 'number' ? data.current.temp : 24;
      if (data.current.weather && data.current.weather[0]) {
        main = data.current.weather[0].main || main;
        description = data.current.weather[0].description || description;
        icon = data.current.weather[0].icon || icon;
      }
    } else if (data.main) {
      temp = typeof data.main.temp === 'number' ? data.main.temp : 24;
      if (data.weather && data.weather[0]) {
        main = data.weather[0].main || main;
        description = data.weather[0].description || description;
        icon = data.weather[0].icon || icon;
      }
    }

    if (temp > 100) {
      temp = temp - 273.15;
    }

    return {
      temp: Math.round(temp),
      condition: main,
      description,
      icon,
      emoji: getWeatherEmoji(main),
      city: lat === DEFAULT_COORDS.lat ? 'Dhaka' : 'Local Weather',
    };
  } catch {
    // Fallback to 2.5 API if 4.0 returns error or requires sub
    try {
      const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const fallbackRes = await axios.get(fallbackUrl);
      const fbData = fallbackRes.data;
      const temp = Math.round(fbData.main?.temp ?? 24);
      const main = fbData.weather?.[0]?.main || 'Clear';
      const description = fbData.weather?.[0]?.description || 'clear';
      const icon = fbData.weather?.[0]?.icon || '01d';

      return {
        temp,
        condition: main,
        description,
        icon,
        emoji: getWeatherEmoji(main),
        city: fbData.name || 'Dhaka',
      };
    } catch {
      return {
        temp: 24,
        condition: 'Clear',
        description: 'sky is clear',
        icon: '01d',
        emoji: '🌤️',
        city: 'Dhaka',
      };
    }
  }
}

export function useWeather() {
  const [coords, setCoords] = useState<{ lat: number; lon: number }>(DEFAULT_COORDS);
  const [locationLoaded, setLocationLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationLoaded(true);
        },
        () => {
          // Permission denied or error -> fallback to Dhaka
          setCoords(DEFAULT_COORDS);
          setLocationLoaded(true);
        },
        { timeout: 5000 }
      );
    } else {
      setLocationLoaded(true);
    }
  }, []);

  return useQuery({
    queryKey: ['weather', coords.lat, coords.lon],
    queryFn: () => fetchWeather(coords.lat, coords.lon),
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    enabled: locationLoaded,
  });
}
