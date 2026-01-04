import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapProps {
  data?: { day: string; hour: number; value: number }[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Generate mock fraud activity data by day/hour
const generateMockData = () => {
  const data: { day: string; hour: number; value: number }[] = [];
  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      // Higher activity during business hours (9-17) on weekdays
      const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day);
      const isBusinessHour = hour >= 9 && hour <= 17;
      const isNightHour = hour >= 0 && hour <= 5;
      
      let baseValue = Math.random() * 30;
      if (isWeekday && isBusinessHour) {
        baseValue += 40 + Math.random() * 30;
      } else if (isNightHour) {
        baseValue += 20 + Math.random() * 25; // Fraudsters often work at night
      }
      
      data.push({ day, hour, value: Math.floor(baseValue) });
    });
  });
  return data;
};

const getColor = (value: number, max: number) => {
  const intensity = value / max;
  if (intensity < 0.2) return 'hsl(173, 80%, 45%, 0.1)';
  if (intensity < 0.4) return 'hsl(173, 80%, 45%, 0.3)';
  if (intensity < 0.6) return 'hsl(38, 92%, 50%, 0.5)';
  if (intensity < 0.8) return 'hsl(38, 92%, 50%, 0.7)';
  return 'hsl(0, 72%, 51%, 0.85)';
};

export function Heatmap({ data }: HeatmapProps) {
  const heatmapData = useMemo(() => data || generateMockData(), [data]);
  const maxValue = useMemo(() => Math.max(...heatmapData.map(d => d.value)), [heatmapData]);

  const getValueForCell = (day: string, hour: number) => {
    return heatmapData.find(d => d.day === day && d.hour === hour)?.value || 0;
  };

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-10" />
            {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
              <div 
                key={hour} 
                className="text-xs text-muted-foreground"
                style={{ width: `${100 / 8}%` }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {DAYS.map(day => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-10 text-xs text-muted-foreground font-medium">{day}</div>
              <div className="flex-1 flex gap-0.5">
                {HOURS.map(hour => {
                  const value = getValueForCell(day, hour);
                  return (
                    <Tooltip key={`${day}-${hour}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 h-6 rounded-sm cursor-pointer transition-transform hover:scale-110 hover:z-10"
                          style={{ backgroundColor: getColor(value, maxValue) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-background border-border">
                        <p className="text-sm">
                          <span className="font-medium">{day} {hour.toString().padStart(2, '0')}:00</span>
                          <br />
                          <span className="text-muted-foreground">{value} incidents</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Low</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.85].map((intensity, i) => (
                <div
                  key={i}
                  className="w-6 h-4 rounded-sm"
                  style={{ backgroundColor: getColor(intensity * maxValue, maxValue) }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}