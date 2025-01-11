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

interface Driver {
  driver_number: string;
  team_colour: string;
}

interface ChartProps {
  sessionKey: string;
  drivers: Driver[];
}

const Chart: React.FC<ChartProps> = ({ sessionKey, drivers }) => {
  const [lapsData, setLapsData] = useState<{
    [key: string]: { lap_number: number; lap_duration: number }[];
  }>({});
  const [stintsData, setStintsData] = useState<{
    [key: string]: {
      stint_number: number;
      compound: string;
      lap_start: number;
      lap_end: number;
    }[];
  }>({});
  const [pitsData, setPitsData] = useState<{
    [key: string]: { lap_number: number; pit_duration: number }[];
  }>({});
  const [showOutliers, setShowOutliers] = useState(false);

  const tireCompoundColors: { [key: string]: string } = {
    SOFT: "rgba(255, 0, 0, 0.6)", // Red
    MEDIUM: "rgba(255, 255, 0, 0.6)", // Yellow
    HARD: "rgba(255, 255, 255, 0.6)", // White
    INTERMEDIATE: "rgba(0, 255, 0, 0.6)", // Green
    WET: "rgba(0, 0, 255, 0.6)", // Blue
  };

  // Fetch data for all drivers
  useEffect(() => {
    if (sessionKey && drivers.length > 0) {
      const fetchData = async () => {
        const driverLaps: { [key: string]: any[] } = { ...lapsData };
        const driverStints: { [key: string]: any[] } = { ...stintsData };
        const driverPits: { [key: string]: any[] } = { ...pitsData };

        await Promise.all(
          drivers
            .filter((driver) => !lapsData[driver.driver_number]) // Only fetch for drivers without data
            .map(async (driver) => {
              // Fetch laps
              const lapsResponse = await fetch(
                `http://localhost:5001/api/laps?session_key=${sessionKey}&driver_number=${driver.driver_number}`
              );
              const laps = await lapsResponse.json();
              driverLaps[driver.driver_number] = laps.filter(
                (lap: any) => lap.lap_duration > 0
              );

              // Fetch stints
              const stintsResponse = await fetch(
                `http://localhost:5001/api/stints?session_key=${sessionKey}&driver_number=${driver.driver_number}`
              );
              const stints = await stintsResponse.json();
              driverStints[driver.driver_number] = stints;

              // Fetch pits
              const pitsResponse = await fetch(
                `http://localhost:5001/api/pit?session_key=${sessionKey}&driver_number=${driver.driver_number}`
              );
              const pits = await pitsResponse.json();
              driverPits[driver.driver_number] = pits;
            })
        );

        setLapsData(driverLaps);
        setStintsData(driverStints);
        setPitsData(driverPits);
      };

      fetchData().catch((error) =>
        console.error("Error fetching data:", error)
      );
    }
  }, [sessionKey, drivers, lapsData, stintsData, pitsData]);

  // Determine the maximum lap count across all drivers
  const maxLapNumber = Math.max(
    ...Object.values(lapsData)
      .flat()
      .map((lap) => lap.lap_number),
    0
  );

  // Generate x-axis labels based on max lap count
  const lapLabels = Array.from(
    { length: maxLapNumber },
    (_, i) => `Lap ${i + 1}`
  );

  // Prepare datasets
  const datasets = drivers.map((driver) => {
    const laps = lapsData[driver.driver_number] || [];
    const stints = stintsData[driver.driver_number] || [];
    const pits = pitsData[driver.driver_number] || [];

    // Align lap data with maxLapNumber by padding missing laps with null
    const lapDurations = Array(maxLapNumber).fill(null);
    laps.forEach((lap) => {
      lapDurations[lap.lap_number - 1] = lap.lap_duration;
    });

    const pointColors = lapDurations.map((_, index) => {
      const stint = stints.find(
        (stint) => index + 1 >= stint.lap_start && index + 1 <= stint.lap_end
      );
      return tireCompoundColors[stint?.compound || ""] || "rgba(0, 0, 0, 0.6)";
    });

    const pointStyles = lapDurations.map((_, index) => {
      const isPitLap = pits.some((pit) => pit.lap_number === index + 1);
      return isPitLap ? "triangle" : "circle"; // Triangle marker for pit stop laps
    });

    return {
      label: `Driver ${driver.driver_number}`,
      data: lapDurations,
      borderColor: driver.team_colour,
      borderWidth: 2,
      pointBackgroundColor: pointColors,
      pointBorderWidth: 1,
      pointStyle: pointStyles,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0,
    };
  });

  const chartData = {
    labels: lapLabels,
    datasets: datasets,
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 5, // Disable animations
    },
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
            const driverNumber =
              drivers[tooltipItem.datasetIndex].driver_number;
            const lapIndex = tooltipItem.dataIndex;
            const lap = lapsData[driverNumber]?.find(
              (lap) => lap.lap_number === lapIndex + 1
            );
            const stint = stintsData[driverNumber]?.find(
              (stint) =>
                lap?.lap_number >= stint.lap_start &&
                lap?.lap_number <= stint.lap_end
            );
            const pit = pitsData[driverNumber]?.find(
              (pit) => pit.lap_number === lap?.lap_number
            );
            const formattedTime = lap
              ? `${Math.floor(lap.lap_duration / 60)}:${(
                  lap.lap_duration % 60
                ).toFixed(3)}`
              : "No Data";
            return `${formattedTime} (${
              stint?.compound || "Unknown Compound"
            })${pit ? ` - Pit Stop` : ""}`;
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
        },
        title: {
          display: true,
          text: "Lap Time (s)",
          color: "#FFFFFF",
        },
      },
    },
  };

  return (
    <div className="chart-container">
      {drivers.length > 0 ? (
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
