import { useState } from 'react';
import type { WardWeather, HourlyWeather } from '../../hooks/useWardWeather';

interface Props {
  wards: WardWeather[];
}

function formatInterval(time: string): string {
  const start = new Date(`${time}:00Z`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const format = (date: Date) =>
    date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: true,
    });

  return `${format(start)} – ${format(end)}`;
}

function ForecastValue({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div
      style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '8px',
        padding: '12px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        {label}
      </div>

      <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '7px' }}>
        {value === null ? '—' : value.toFixed(1)}
        {value === null ? '' : ` ${unit}`}
      </div>
    </div>
  );
}

function HourCard({ hour }: { hour: HourlyWeather }) {
  return (
    <div
      style={{
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <strong style={{ fontSize: '13px' }}>
        {formatInterval(hour.time)}
      </strong>

      <ForecastValue
        label="Rainfall"
        value={hour.precipitationMm}
        unit="mm"
      />

      <ForecastValue
        label="Wind speed"
        value={hour.windSpeedKmh}
        unit="km/h"
      />

      <ForecastValue
        label="Temperature"
        value={hour.temperatureC}
        unit="°C"
      />
    </div>
  );
}

export function WardForecastPanel({ wards }: Props) {
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  return (
    <section
      style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>
          3-Hour Ward Weather Forecast
        </h3>

        <p
          style={{
            margin: '5px 0 0',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          Select a monitored location to view its hourly forecast.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {wards.map((ward) => {
          const isSelected = selectedWardId === ward.id;

          return (
            <div
              key={ward.id}
              style={{
                border: '1px solid var(--border, #e5e7eb)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedWardId(isSelected ? null : ward.id)
                }
                aria-expanded={isSelected}
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  border: 0,
                  background: isSelected
                    ? 'var(--surface-secondary, #f3f4f6)'
                    : 'transparent',
                  color: 'var(--text, inherit)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <span>{ward.name}</span>
                <span aria-hidden="true">{isSelected ? '−' : '+'}</span>
              </button>

              {isSelected && (
                <div style={{ padding: '12px' }}>
                  {ward.forecast.length !== 3 ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Forecast data is currently unavailable for this
                      location.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '8px',
                      }}
                    >
                      {ward.forecast.map((hour) => (
                        <HourCard key={hour.time} hour={hour} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p
        style={{
          margin: '12px 0 0',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        Hourly model estimates from Open-Meteo. Times shown in IST.
      </p>
    </section>
  );
}