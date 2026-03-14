# EXCP Agent HR - MVP

Agent recruitment HR portal for managing jobs, candidates, and placements.

## Branding

The app uses the EXCP brand colors: **teal** (#00a59b) and **lime green** (#b0e32c). To use the full logo:
1. Place your logo image at `assets/logo.png`
2. Recommended size: ~120×120px (will display at 40px height in header)
3. If no logo is present, the text "EXCP Agent HR" is shown with brand styling

## Run locally

1. Open `index.html` in a browser, or
2. Use a local server, e.g.:
   - `npx serve .`
   - `python -m http.server 8080` (from project root)

## Implemented user stories

1. **Job management** – Create jobs (manual), list jobs, open job profile
2. **Candidate management** – Add candidates, list candidates, open candidate profile
3. **Kanban pipeline** – Move candidates between stages with drag-and-drop
4. **AI matches** – View recommended candidates for a job, one-click assign
5. **Dashboard & placements** – Metrics, placements table, reports with export buttons

## Features

- **Dashboard**: Active jobs, open positions, pipeline counts, recent jobs
- **Jobs**: List, create, job profile with Kanban (Sourcing → CV Submitted → Interview → Ticket → PDOS → For Deployment → Placed/Rejected)
- **Candidates**: List, add, candidate profile with assigned jobs
- **Matches**: AI-style recommendations and assign-to-job
- **Placements**: Table of placed candidates
- **Clients**, **Reports**, **Settings**

## Tech stack

- HTML5
- CSS3 (custom)
- Vanilla JavaScript
- Font Awesome icons
