import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "../styles/Chart.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  sessionKey: string;
  driverNumber: string;
  team_colour: string;
}

const Chart: React.FC<ChartProps> = ({
  sessionKey,
  driverNumber,
  team_colour,
}) => {
  const [laps, setLaps] = useState<
    { lap_number: number; lap_duration: number; tire_compound: string }[]
  >([]);

  useEffect(() => {
    if (sessionKey && driverNumber) {
      fetch(
        `http://localhost:5001/api/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
      )
        .then((response) => response.json())
        .then((data) => {
          const validLaps = data.filter((lap: any) => lap.lap_duration > 0); // Filter out invalid laps
          setLaps(validLaps);
        })
        .catch((error) => console.error("Error fetching laps:", error));
    }
  }, [sessionKey, driverNumber]);

  const [stints, setStints] = useState<
    {
      stint_number: number;
      compound: string;
      lap_start: number;
      lap_end: number;
    }[]
  >([]);

  // Fetch stints data
  useEffect(() => {
    if (sessionKey && driverNumber) {
      fetch(
        `http://localhost:5001/api/stints?session_key=${sessionKey}&driver_number=${driverNumber}`
      )
        .then((response) => response.json())
        .then((data) => setStints(data))
        .catch((error) => console.error("Error fetching stints:", error));
    }
  }, [sessionKey, driverNumber]);

  const tireCompoundColors: { [key: string]: string } = {
    Soft: "rgba(255, 0, 0, 0.6)", // Red for Soft
    Medium: "rgba(255, 255, 0, 0.6)", // Yellow for Medium
    Hard: "rgba(255, 255, 255, 0.6)", // White for Hard
    Inter: "rgba(0, 128, 0, 0.6)", // Green for Intermediate
    Wet: "rgba(0, 0, 255, 0.6)", // Blue for Wet
  };

  const formatLapTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = (remainingSeconds % 1).toFixed(3).substring(2);
    const formattedSeconds = Math.floor(remainingSeconds)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${formattedSeconds}.${milliseconds}`;
  };
  console.log("Team Colour in Chart:", team_colour);

  const chartData = {
    labels: laps.map((lap) => `Lap ${lap.lap_number}`),
    datasets: [
      {
        label: "Lap Times",
        data: laps.map((lap) => lap.lap_duration),
        borderColor: team_colour,
        borderWidth: 2,
        pointBackgroundColor: laps.map((lap) => {
          const stint = stints.find(
            (stint) =>
              lap.lap_number >= stint.lap_start &&
              lap.lap_number <= stint.lap_end
          );
          return stint
            ? tireCompoundColors[stint.compound] || "rgba(200, 200, 200, 0.6)"
            : "rgba(200, 200, 200, 0.6)"; // Default gray if no stint found
        }),
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#FFFFFF",
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const lapIndex = tooltipItem.dataIndex;
            const lap = laps[lapIndex];
            const stint = stints.find(
              (stint) =>
                lap.lap_number >= stint.lap_start &&
                lap.lap_number <= stint.lap_end
            );
            const formattedTime = formatLapTime(lap.lap_duration);
            const compound = stint ? stint.compound : "Unknown Compound";
            return `Lap ${lap.lap_number}: ${formattedTime} (${compound})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#FFFFFF",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#FFFFFF",
          callback: (value: number) => formatLapTime(value), // Format Y-axis ticks
        },
        title: {
          display: true,
          text: "Lap Time (MM:SS.mmm)",
          color: "#FFFFFF",
        },
      },
    },
  };

  return (
    <div className="chart-container">
      {laps.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p className="no-data">No lap data available.</p>
      )}
    </div>
  );
};

export default Chart;
