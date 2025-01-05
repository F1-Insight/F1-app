import React, { useState, useEffect } from "react";
import "../styles/Dropdowns.css";

const Dropdowns: React.FC<{
  onSelectionsChange: (selections: {
    year: string;
    meeting_key: string;
    session_key: string;
    driver_number: string;
    team_colour: string;
  }) => void;
}> = ({ onSelectionsChange }) => {
  const [years, setYears] = useState<string[]>([]);
  const [races, setRaces] = useState<
    { meeting_name: string; meeting_key: string }[]
  >([]);
  const [sessions, setSessions] = useState<
    { session_name: string; session_key: string }[]
  >([]);
  const [drivers, setDrivers] = useState<
    { full_name: string; driver_number: string; team_colour: string }[]
  >([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");

  // Fetch years from backend when component mounts
  useEffect(() => {
    fetch("http://localhost:5001/api/years")
      .then((res) => res.json())
      .then((data) => setYears(data))
      .catch((err) => console.error("Error fetching years:", err));
  }, []);

  // Fetch races for the selected year from backend
  useEffect(() => {
    if (selectedYear) {
      fetch(`http://localhost:5001/api/races?year=${selectedYear}`)
        .then((res) => res.json())
        .then((data) => setRaces(data))
        .catch((err) => console.error("Error fetching races:", err));
    } else {
      setRaces([]);
    }
  }, [selectedYear]);

  // Fetch sessions for the selected race and year from backend
  useEffect(() => {
    if (selectedRace) {
      fetch(
        `http://localhost:5001/api/sessions?meeting_key=${selectedRace}&year=${selectedYear}`
      )
        .then((res) => res.json())
        .then((data) => setSessions(data))
        .catch((err) => console.error("Error fetching sessions:", err));
    } else {
      setSessions([]);
    }
  }, [selectedRace, selectedYear]);

  // Fetch drivers for the selected session from backend
  useEffect(() => {
    if (selectedSession) {
      console.log("Selected Session Key:", selectedSession);
      fetch(`http://localhost:5001/api/drivers?session_key=${selectedSession}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched Drivers:", data);
          setDrivers(data);
        })
        .catch((err) => console.error("Error fetching drivers:", err));
    } else {
      setDrivers([]);
    }
  }, [selectedSession, selectedRace]);

  // Pass selections to parent when all dropdowns have valid selections
  useEffect(() => {
    if (selectedYear && selectedRace && selectedSession && selectedDriver) {
      const selectedDriverDetails = drivers.find(
        (driver) => driver.driver_number === selectedDriver
      );
      console.log(
        "Selected Driver Team Colour:",
        drivers,
        selectedDriverDetails,
        selectedDriverDetails?.team_colour
      );
      onSelectionsChange({
        year: selectedYear,
        meeting_key: selectedRace,
        session_key: selectedSession,
        driver_number: selectedDriver,
        team_colour: selectedDriverDetails?.team_colour || "#00D1B2",
      });
    }
  }, [selectedYear, selectedRace, selectedSession, selectedDriver, drivers]);

  return (
    <div className="dropdowns">
      {/* Year Dropdown */}
      <select
        className="dropdown"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Race Dropdown */}
      <select
        className="dropdown"
        value={selectedRace}
        onChange={(e) => setSelectedRace(e.target.value)}
        disabled={!races.length}
      >
        <option value="">Select Race</option>
        {races.map((race) => (
          <option key={race.meeting_key} value={race.meeting_key}>
            {race.meeting_name}
          </option>
        ))}
      </select>

      {/* Session Dropdown */}
      <select
        className="dropdown"
        value={selectedSession}
        onChange={(e) => setSelectedSession(e.target.value)}
        disabled={!sessions.length}
      >
        <option value="">Select Session</option>
        {sessions.map((session) => (
          <option key={session.session_key} value={session.session_key}>
            {session.session_name}
          </option>
        ))}
      </select>

      {/* Driver Dropdown */}
      {/* Driver Dropdown */}
      <select
        className="dropdown"
        value={selectedDriver}
        onChange={(e) => setSelectedDriver(e.target.value)}
        disabled={!drivers.length}
      >
        <option value="">Select Driver</option>
        {drivers.map((driver) => (
          <option
            key={driver.driver_number}
            value={driver.driver_number}
            style={{
              backgroundColor: driver.team_colour || "#FFFFFF",
              color: "#000000",
            }}
          >
            {driver.driver_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdowns;
