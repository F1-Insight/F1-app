import React, { useEffect, useRef, useState } from "react";
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
  const fetchedDriversRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (sessionKey && drivers.length > 0) {
      const fetchData = async () => {
        const driverLaps = { ...lapsData };
        const driverStints = { ...stintsData };
        const driverPits = { ...pitsData };

        await Promise.all(
          drivers
            .filter(
              (driver) => !fetchedDriversRef.current[driver.driver_number]
            )
            .map(async (driver) => {
              fetchedDriversRef.current[driver.driver_number] = true;

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
  }, [sessionKey, drivers]);

  const maxLapNumber = Math.max(
    ...Object.values(lapsData).flatMap((laps) =>
      laps.map((lap) => lap.lap_number)
    )
  );
  const allLaps = Array.from({ length: maxLapNumber }, (_, i) => i + 1);

  // Prepare datasets
  const datasets = drivers.map((driver) => {
    const laps = lapsData[driver.driver_number] || [];
    const stints = stintsData[driver.driver_number] || [];
    const pits = pitsData[driver.driver_number] || [];

    const filteredLaps = laps.filter(
      (lap) =>
        !pits.some((pit) => pit.lap_number + 1 === lap.lap_number) ||
        showOutliers
    );

    const paddedLaps = allLaps.map((lapNumber) => {
      const lapData = laps.find((lap) => lap.lap_number === lapNumber);
      return lapData ? lapData.lap_duration : null; // Fill missing laps with `null`
    });

    const pointColors = filteredLaps.map((lap) => {
      const stint = stints.find(
        (stint) =>
          lap.lap_number >= stint.lap_start && lap.lap_number <= stint.lap_end
      );
      return tireCompoundColors[stint?.compound || ""] || "rgba(0, 0, 0, 0.6)";
    });

    const pointStyles = filteredLaps.map((lap) => {
      const isPitLap = pits.some((pit) => pit.lap_number === lap.lap_number);
      return isPitLap ? "triangle" : "circle"; // Triangle marker for pit stop laps
    });

    return {
      label: `Driver ${driver.driver_number}`,
      data: paddedLaps,
      borderColor: driver.team_colour,
      borderWidth: 2,
      pointBackgroundColor: pointColors,
      pointBorderWidth: 1,
      pointStyle: pointStyles,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0.4,
    };
  });

  const chartData = {
    labels: allLaps.map((lapNumber) => `Lap ${lapNumber}`),
    datasets: datasets,
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
            const driverNumber =
              drivers[tooltipItem.datasetIndex].driver_number;
            const lapIndex = tooltipItem.dataIndex;
            const lap = lapsData[driverNumber][lapIndex];
            const stint = stintsData[driverNumber]?.find(
              (stint) =>
                lap.lap_number >= stint.lap_start &&
                lap.lap_number <= stint.lap_end
            );
            const pit = pitsData[driverNumber]?.find(
              (pit) => pit.lap_number === lap.lap_number
            );
            const formattedTime = formatLapTime(lap.lap_duration);
            const compound = stint ? stint.compound : "Unknown Compound";
            const pitDuration = pit
              ? `Pit Duration: ${pit.pit_duration.toFixed(1)}s`
              : "";
            return `${formattedTime} (${compound})${
              pit ? ` - Pit Stop\n${pitDuration}` : ""
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
        },
        title: {
          display: true,
          text: "Lap Time (s)",
          color: "#FFFFFF",
        },
      },
    },
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
