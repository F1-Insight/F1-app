# WELCOME TO F1 APP
- For the lack of better sentences, just know that this app is an attempt to visualize F1 race and telemetry data from the ([OpenF1-API](https://openf1.org/#introduction))
- The project uses React, TypeScript, and Vite as its core technologies.
  
## FEATURES
- The app allows users to select a year, race, session, and drivers to view the data.
- The app fetches data from the OpenF1-API and displays it in a chart.
- The app has a dropdown menu for selecting drivers, and the chart updates dynamically based on the selected drivers.
- The app has a button to show or hide outliers in the chart.
- TBA - TELEMETRY DATA

## PRE-REQUISITES
- Ensure Node.js and npm are installed.
- [Node.js](https://nodejs.org/en/download)
- [Npm Installation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## STEPS
- Clone the repository.
- Navigate to the `f1-app (Frontend)` directory.
- Run `npm install` to install dependencies.
- Navigate to the server directory.
- Run `npm install` to install dependencies.

## RUNNING THE SERVER
- At both locations, frontend and backend locations, use `npm run dev` to start the services.

## FRONTEND
- The project uses Vite as the development server and build tool.
- The project uses TypeScript as the programming language.
- The project uses React as the front-end framework.
- The project uses Chart.js to create the chart.
- The project uses Axios to make API calls to the server.

## BACKEND
- Developed with Node.js
- This is the server-side component of an F1 application that provides APIs to fetch Formula 1 data such as race years, races, sessions, drivers, laps, stints, and pit data.
- **PORT:** The port on which the server runs (default: 5001).

### API ENDPOINTS
- GET /api/years: Fetches all available years for F1 races.
- GET /api/races: Fetches all races for a specific year.
  - Query Parameters:
    - year: The year for which races are to be fetched.
- GET /api/sessions: Fetches sessions for a specific race.
  - Query Parameters:
    - meeting_key: The key of the meeting (race).
    - year: The year of the meeting.
- GET /api/drivers: Fetches drivers for a specific session.
  - Query Parameters:
    - session_key: The key of the session.
- GET /api/laps: Fetches lap data for a specific driver in a session.
  - Query Parameters:
    - session_key: The key of the session.
    - driver_number: The number of the driver.
- GET /api/stints: Fetches stint data for a specific driver in a session.
  - Query Parameters:
    - session_key: The key of the session.
    - driver_number: The number of the driver.
- GET /api/pit: Fetches pit data for a specific driver in a session.
  - Query Parameters:
    - session_key: The key of the session.
    - driver_number: The number of the driver.


## LICENSE
 - **ISC License:** This project is open-source and available under the ISC License.