
import { useEffect, useState } from 'react';
import type { Ward, RiskLevel } from '../types';
import { SAMPLE_WARDS } from '../data/sampleData';

export interface HourlyWeather {
  time: string;
  precipitationMm: number | null;
  precipitationProbability: number | null;
  thunderstormProbability: number | null;
  windSpeedKmh: number | null;
  temperatureC: number | null;
}

interface HourlyResponse {
  time?: string[];
  precipitation?: (number | null)[];
  precipitation_probability?: (number | null)[];
  thunderstorm_probability?: (number | null)[];
  wind_speed_10m?: (number | null)[];
  temperature_2m?: (number | null)[];
}

interface WeatherResponse {
  current?: {
    precipitation?: number | null;
    wind_speed_10m?: number | null;
  };
  hourly?: HourlyResponse;
}

export interface WardWeather extends Ward {
  rainfallMm: number;
  forecastRainfallMm?: number;
  currentPrecipitationMm?: number;
  currentWindSpeedKmh?: number;
  weatherAvailable: boolean;
  forecast: HourlyWeather[];
}

function riskFromRainfall(rainfall: number): RiskLevel {
  if (rainfall >= 115.6) return 'HIGH';
  if (rainfall >= 64.5) return 'MEDIUM_HIGH';
  if (rainfall >= 15.6) return 'MEDIUM';
  return 'LOW';
}

function parseUtcTime(value: string): number {
  return Date.parse(`${value}:00Z`);
}

async function fetchWardWeather(
  ward: Ward,
  signal: AbortSignal
): Promise<WardWeather> {
  const params = new URLSearchParams({
    latitude: String(ward.lat),
    longitude: String(ward.lng),
    current: 'precipitation,wind_speed_10m',
    hourly:
      'precipitation,precipitation_probability,thunderstorm_probability,wind_speed_10m,temperature_2m',
    past_days: '1',
    forecast_days: '2',
    timezone: 'UTC',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Weather request failed for ${ward.name}`);
  }

  const data = (await response.json()) as WeatherResponse;
  const hourly = data.hourly;

  if (!hourly?.time || !hourly.precipitation) {
    throw new Error(`Hourly weather unavailable for ${ward.name}`);
  }

  const now = Date.now();
    const next24Hours = hourly.time
    .map((time, index) => ({
      timestamp: parseUtcTime(time),
      precipitation: hourly.precipitation?.[index],
    }))
    .filter(
      (item) =>
        item.timestamp >= now &&
        item.timestamp < now + 24 * 60 * 60 * 1000
    );

  const validForecastReadings = next24Hours.filter(
    (item) => typeof item.precipitation === 'number'
  );

  const forecastRainfallMm =
    validForecastReadings.length >= 20
      ? validForecastReadings.reduce(
          (sum, item) => sum + item.precipitation!,
          0
        )
      : undefined;

  const past24h = hourly.time
    .map((time, index) => ({
      timestamp: parseUtcTime(time),
      precipitation: hourly.precipitation?.[index],
    }))
    .filter(
      (item) =>
        item.timestamp <= now &&
        item.timestamp > now - 24 * 60 * 60 * 1000
    );

  const validRainfallReadings = past24h.filter(
    (item) => typeof item.precipitation === 'number'
  );

  const weatherAvailable = validRainfallReadings.length >= 20;

  const rainfallMm = weatherAvailable
    ? validRainfallReadings.reduce(
        (sum, item) => sum + item.precipitation!,
        0
      )
    : ward.rainfallMm;

  const currentHourStart =
    Math.floor(now / (60 * 60 * 1000)) * 60 * 60 * 1000;

  const forecast = hourly.time
    .map((time, index): HourlyWeather => ({
      time,
      precipitationMm: hourly.precipitation?.[index] ?? null,
      precipitationProbability:
        hourly.precipitation_probability?.[index] ?? null,
      thunderstormProbability:
        hourly.thunderstorm_probability?.[index] ?? null,
      windSpeedKmh: hourly.wind_speed_10m?.[index] ?? null,
      temperatureC: hourly.temperature_2m?.[index] ?? null,
    }))
    .filter((item) => {
      const timestamp = parseUtcTime(item.time);

      return (
        timestamp >= currentHourStart &&
        timestamp < currentHourStart + 3 * 60 * 60 * 1000
      );
    });

  const currentPrecipitation = data.current?.precipitation;
  const currentWind = data.current?.wind_speed_10m;

  return {
    ...ward,
    rainfallMm,
    forecastRainfallMm,
    riskLevel: weatherAvailable
      ? riskFromRainfall(rainfallMm)
      : ward.riskLevel,
    currentPrecipitationMm:
      typeof currentPrecipitation === 'number'
        ? currentPrecipitation
        : undefined,
    currentWindSpeedKmh:
      typeof currentWind === 'number' ? currentWind : undefined,
    weatherAvailable,
    forecast,
    lastUpdated: new Date().toISOString(),
    dataSource: 'Open-Meteo weather estimate',
    weatherSource: 'Open-Meteo',
    weatherUpdatedAt: new Date().toISOString(),
  };
}


export function useWardWeather() {
  const [wards, setWards] = useState<WardWeather[]>(() =>
    SAMPLE_WARDS.map((ward) => ({
      ...ward,
      rainfallMm: 0,
      currentPrecipitationMm: undefined,
      currentWindSpeedKmh: undefined,
      forecastRainfallMm: undefined,
      weatherAvailable: false,
      forecast: [],
      dataSource: 'Weather unavailable',
      weatherSource: undefined,
      weatherUpdatedAt: undefined,
    }))
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let controller: AbortController | null = null;

    async function loadWeather() {
      controller?.abort();

      const requestController = new AbortController();
      controller = requestController;

      setError(null);

      try {
        const results = await Promise.allSettled(
          SAMPLE_WARDS.map((ward) =>
            fetchWardWeather(ward, requestController.signal)
          )
        );

        if (requestController.signal.aborted) return;

        const nextWards = results.map(
          (result, index): WardWeather => {
            if (result.status === 'fulfilled') {
              return result.value;
            }

            const ward = SAMPLE_WARDS[index];

            return {
              ...ward,
              rainfallMm: 0,
              currentPrecipitationMm: undefined,
              currentWindSpeedKmh: undefined,
              forecastRainfallMm: undefined,
              weatherAvailable: false,
              forecast: [],
              dataSource: 'Weather unavailable',
              weatherSource: undefined,
              weatherUpdatedAt: undefined,
            };
          }
        );

        setWards(nextWards);

        const failures = results.filter(
          (result) => result.status === 'rejected'
        ).length;

        if (failures === results.length) {
          setError('Weather data is currently unavailable.');
        } else if (failures > 0) {
          setError(
            `Weather data unavailable for ${failures} of ${results.length} monitored locations.`
          );
        }
      } catch {
        if (!requestController.signal.aborted) {
          setError('Weather data is currently unavailable.');
        }
      } finally {
        if (!requestController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadWeather();

    const refreshInterval = window.setInterval(() => {
      void loadWeather();
    }, 15 * 60 * 1000);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadWeather();
      }
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(refreshInterval);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      controller?.abort();
    };
  }, []);

  return { wards, loading, error };
}
