import React, { useEffect, useState } from "react";
import Select from "react-select";
import "../styles/Dropdowns.css";

const Dropdowns: React.FC<{
  onSelectionsChange: (selections: {
    year: string;
    meeting_key: string;
    session_key: string;
    drivers: { driver_number: string; team_colour: string }[];
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
  const [selectedDrivers, setSelectedDrivers] = useState<
    { value: string; label: string; color: string }[]
  >([]);

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

  // Fetch sessions for the selected race from backend
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
      fetch(`http://localhost:5001/api/drivers?session_key=${selectedSession}`)
        .then((res) => res.json())
        .then((data) =>
          setDrivers(
            data.map((driver: any) => ({
              full_name: driver.driver_name,
              driver_number: driver.driver_number,
              team_colour: driver.team_colour,
            }))
          )
        )
        .catch((err) => console.error("Error fetching drivers:", err));
    } else {
      setDrivers([]);
    }
  }, [selectedSession]);

  // Pass selections to parent
  useEffect(() => {
    if (selectedYear && selectedRace && selectedSession && selectedDrivers) {
      onSelectionsChange({
        year: selectedYear,
        meeting_key: selectedRace,
        session_key: selectedSession,
        drivers: selectedDrivers.map((driver) => ({
          driver_number: driver.value,
          team_colour: driver.color,
        })),
      });
    }
  }, [selectedYear, selectedRace, selectedSession, selectedDrivers]);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_number,
    label: driver.full_name,
    color: `#${driver.team_colour}`,
  }));

  return (
    <div className="dropdowns">
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

      <Select
        isMulti
        options={driverOptions}
        value={selectedDrivers}
        onChange={(selected) => setSelectedDrivers(selected || [])}
        className="driver-dropdown"
        placeholder="Select Drivers"
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#000",
            color: "#fff",
            borderColor: "#fff",
          }),
          option: (base, { data }) => ({
            ...base,
            backgroundColor: data.color,
            color: "#fff",
          }),
          multiValue: (base, { data }) => ({
            ...base,
            backgroundColor: data.color,
            color: "#fff",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#fff",
          }),
        }}
      />
    </div>
  );
};

export default Dropdowns;
