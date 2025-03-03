import React from "react";

interface TelemetryProps {
  selectedLaps: number[];
}

const Telemetry: React.FC<TelemetryProps> = ({ selectedLaps }) => {
  return (
    <div className="telemetry-container">
      <h2>Telemetry Data</h2>
      {selectedLaps.length === 0 ? (
        <p>No valid laps have been selected. Click a lap to add it.</p>
      ) : (
        <p>Selected Laps: {selectedLaps.join(", ")}</p>
      )}
    </div>
  );
};

export default Telemetry;
