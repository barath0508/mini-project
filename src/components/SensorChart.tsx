import { useEffect, useRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorData {
  gas: number;
  flame: number;
  temperature: number;
  humidity: number;
  prediction: number;
  timestamp: number;
}

interface SensorChartProps {
  data: SensorData[];
}

export default function SensorChart({ data }: SensorChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map((d, i) => {
      if (data.length < 10) return `${i + 1}`;
      return i % 3 === 0 ? `${i + 1}` : '';
    });

    if (!chartInstanceRef.current) {
      // Create chart only once
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Gas (ppm)',
              data: data.map((d) => d.gas),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Temperature (°C)',
              data: data.map((d) => d.temperature),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Humidity (%)',
              data: data.map((d) => d.humidity),
              borderColor: 'rgb(6, 182, 212)',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Flame',
              data: data.map((d) => d.flame),
              borderColor: 'rgb(251, 146, 60)',
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 750,
            easing: 'easeInOutQuart',
          },
          transitions: {
            active: {
              animation: {
                duration: 400,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: 'rgb(209, 213, 219)',
                font: {
                  size: 12,
                },
                usePointStyle: true,
                padding: 15,
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: 'rgb(209, 213, 219)',
              bodyColor: 'rgb(209, 213, 219)',
              borderColor: 'rgb(75, 85, 99)',
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              display: true,
              grid: {
                color: 'rgba(75, 85, 99, 0.3)',
              },
              ticks: {
                color: 'rgb(156, 163, 175)',
                font: {
                  size: 11,
                },
              },
            },
            y: {
              display: true,
              grid: {
                color: 'rgba(75, 85, 99, 0.3)',
              },
              ticks: {
                color: 'rgb(156, 163, 175)',
                font: {
                  size: 11,
                },
              },
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
        },
      });
    } else {
      // Update existing chart smoothly
      const chart = chartInstanceRef.current;
      chart.data.labels = labels;
      chart.data.datasets[0].data = data.map((d) => d.gas);
      chart.data.datasets[1].data = data.map((d) => d.temperature);
      chart.data.datasets[2].data = data.map((d) => d.humidity);
      chart.data.datasets[3].data = data.map((d) => d.flame);
      chart.update('active');
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="relative h-80 w-full">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Waiting for sensor data...</p>
        </div>
      ) : (
        <canvas ref={chartRef}></canvas>
      )}
    </div>
  );
}
