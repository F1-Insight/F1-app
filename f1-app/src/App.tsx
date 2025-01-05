import React, { useState } from "react";
import Dropdown from "./components/Dropdowns";
import Chart from "./components/Chart";

const App: React.FC = () => {
  const [selections, setSelections] = useState<{
    session_key: string;
    driver_number: string;
    team_colour: string;
  }>({ session_key: "", driver_number: "", team_colour: "" });

  const handleSelectionsChange = (newSelections: {
    session_key: string;
    driver_number: string;
    team_colour: string;
  }) => {
    console.log("New Selections Received:", newSelections);
    // Map keys to match the expected structure
    setSelections({
      session_key: newSelections.session_key,
      driver_number: newSelections.driver_number,
      team_colour: newSelections.team_colour,
    });
  };
  console.log("Current Selections:", selections);
  return (
    <div className="App">
      <h1>F1 Insight</h1>
      <Dropdown onSelectionsChange={handleSelectionsChange} />
      {selections.session_key && selections.driver_number ? (
        <Chart
          sessionKey={selections.session_key}
          driverNumber={selections.driver_number}
          team_colour={selections.team_colour}
        />
      ) : (
        <p className="no-data">
          Please select a year, race, session, and driver to view the data.
        </p>
      )}
    </div>
  );
};

export default App;
