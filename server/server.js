const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5001;

// Enable CORS
app.use(cors());

// API endpoints
app.get("/api/years", async (req, res) => {
  try {
    const response = await axios.get("https://api.openf1.org/v1/meetings");
    const years = [...new Set(response.data.map((meeting) => meeting.year))];
    res.json(years);
  } catch (error) {
    console.error("Error fetching years:", error.message);
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

app.get("/api/races", async (req, res) => {
  const { year } = req.query;
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/meetings?year=${year}`
    );
    const races = response.data.map((meeting) => ({
      meeting_name: meeting.meeting_name,
      meeting_key: meeting.meeting_key,
    }));
    res.json(races);
  } catch (error) {
    console.error("Error fetching races:", error.message);
    res.status(500).json({ error: "Failed to fetch races" });
  }
});

app.get("/api/sessions", async (req, res) => {
  const { meeting_key, year } = req.query;
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/sessions?meeting_key=${meeting_key}&year=${year}`
    );
    const sessions = response.data.map((session) => ({
      session_name: session.session_name,
      session_key: session.session_key,
    }));
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

app.get("/api/drivers", async (req, res) => {
  const { session_key } = req.query;
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/drivers?session_key=${session_key}`
    );
    const drivers = response.data.map((driver) => ({
      driver_name: driver.full_name,
      driver_number: driver.driver_number,
      team_colour: driver.team_colour,
    }));
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error.message);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

app.get("/api/laps", async (req, res) => {
  const { session_key, driver_number } = req.query;
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/laps?session_key=${session_key}&driver_number=${driver_number}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching laps:", error.message);
    res.status(500).json({ error: "Failed to fetch lap data" });
  }
});

app.get("/api/stints", async (req, res) => {
  const { session_key, driver_number } = req.query;
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/stints?session_key=${session_key}&driver_number=${driver_number}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stints:", error.message);
    res.status(500).json({ error: "Failed to fetch stints data" });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
