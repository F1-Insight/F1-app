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
  const [stints, setStints] = useState<
    {
      stint_number: number;
      compound: string;
      lap_start: number;
      lap_end: number;
    }[]
  >([]);
  const [pits, setPits] = useState<{ lap_number: number }[]>([]);
  const [showOutliers, setShowOutliers] = useState(false);

  // Fetch laps data
  useEffect(() => {
    if (sessionKey && driverNumber) {
      fetch(
        `http://localhost:5001/api/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
      )
        .then((response) => response.json())
        .then((data) => {
          const validLaps = data.filter((lap: any) => lap.lap_duration > 0);
          setLaps(validLaps);
        })
        .catch((error) => console.error("Error fetching laps:", error));
    }
  }, [sessionKey, driverNumber]);

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

  // Fetch pit stop data
  useEffect(() => {
    if (sessionKey && driverNumber) {
      fetch(
        `http://localhost:5001/api/pit?session_key=${sessionKey}&driver_number=${driverNumber}`
      )
        .then((response) => response.json())
        .then((data) => setPits(data))
        .catch((error) => console.error("Error fetching pit stops:", error));
    }
  }, [sessionKey, driverNumber]);

  const tireCompoundColors: { [key: string]: string } = {
    SOFT: "rgba(255, 0, 0, 0.6)", // Red
    MEDIUM: "rgba(255, 255, 0, 0.6)", // Yellow
    HARD: "rgba(255, 255, 255, 0.6)", // White
    INTER: "rgba(0, 255, 0, 0.6)", // Green
    WET: "rgba(0, 0, 255, 0.6)", // Blue
  };

  const filteredLaps = laps.filter(
    (lap) => !pits.some((pit) => pit.lap_number + 1 === lap.lap_number)
  );

  const displayedLaps = showOutliers ? laps : filteredLaps;

  const pointColors = displayedLaps.map((lap) => {
    const stint = stints.find(
      (stint) =>
        lap.lap_number >= stint.lap_start && lap.lap_number <= stint.lap_end
    );
    return tireCompoundColors[stint?.compound || ""] || "rgba(0, 0, 0, 0.6)";
  });

  const pointStyles = displayedLaps.map((lap) => {
    const isPitLap = pits.some((pit) => pit.lap_number === lap.lap_number);
    return isPitLap ? "triangle" : "circle"; // Triangle marker for pit stop laps
  });

  const formatLapTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = (remainingSeconds % 1).toFixed(3).substring(2);
    const formattedSeconds = Math.floor(remainingSeconds)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${formattedSeconds}.${milliseconds}`;
  };

  const chartData = {
    labels: displayedLaps.map((lap) => `Lap ${lap.lap_number}`),
    datasets: [
      {
        label: "Lap Times",
        data: displayedLaps.map((lap) => lap.lap_duration),
        borderColor: team_colour,
        borderWidth: 2,
        pointBackgroundColor: pointColors,
        pointBorderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointStyle: pointStyles,
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
            const lap = displayedLaps[lapIndex];
            const stint = stints.find(
              (stint) =>
                lap.lap_number >= stint.lap_start &&
                lap.lap_number <= stint.lap_end
            );
            const formattedTime = formatLapTime(lap.lap_duration);
            const compound = stint ? stint.compound : "Unknown Compound";
            const isPitLap = pits.some(
              (pit) => pit.lap_number === lap.lap_number
            );
            const pit = pits.find((pit) => pit.lap_number === lap.lap_number);
            const pitDuration = pit
              ? `Pit Duration: ${pit.pit_duration.toFixed(1)}s`
              : "";
            return `Lap ${lap.lap_number}: ${formattedTime} (${compound})${
              isPitLap ? ` - Pit Stop\n${pitDuration}` : ""
            }`;
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
        <>
          <Line data={chartData} options={chartOptions} />
          <button
            className="outliers-button"
            onClick={() => setShowOutliers((prev) => !prev)}
          >
            {showOutliers ? "Hide Outliers" : "Show Outliers"}
          </button>
        </>
      ) : (
        <p className="no-data">No lap data available.</p>
      )}
    </div>
  );
};

export default Chart;
