import React, { useState } from "react";
import Dropdown from "./components/Dropdowns";
import Chart from "./components/Chart";

const App: React.FC = () => {
  const [selections, setSelections] = useState<{
    session_key: string;
    drivers: { driver_number: string; team_colour: string }[];
  }>({
    session_key: "",
    drivers: [],
  });

  const handleSelectionsChange = (newSelections: {
    session_key: string;
    drivers: { driver_number: string; team_colour: string }[];
  }) => {
    console.log("New Selections Received:", newSelections);
    setSelections(newSelections);
  };

  console.log("Current Selections:", selections);

  return (
    <div className="App">
      <h1>F1 Insight</h1>
      <Dropdown onSelectionsChange={handleSelectionsChange} />
      {selections.session_key && selections.drivers.length > 0 ? (
        <Chart
          sessionKey={selections.session_key}
          drivers={selections.drivers}
        />
      ) : (
        <p className="no-data">
          Please select a year, race, session, and drivers to view the data.
        </p>
      )}
    </div>
  );
};

export default App;
