# Data‑Ready Dashboard

## Overview

**Data‑Ready** is a lightweight, interactive web dashboard that lets you explore, clean, profile, and assess the readiness of tabular datasets.  It was built as part of a data‑pipeline sandbox that demonstrates how to:

1. **Upload** CSV/Excel files.
2. **Profile** the dataset (column stats, data types, missing values, etc.).
3. **Remediate** data quality issues (duplicate rows, invalid values, etc.).
4. **Generate a readiness score** with a configurable weighted model.
5. **Export** the cleaned data as CSV or a PDF report.

The UI is powered by **React**, styled with **Tailwind CSS**, and uses **GSAP** for a smooth, modern animation on the floating **BubbleMenu** component.

---

## Key Features

- **Dynamic BubbleMenu** (top‑right) with animated hover effects.
- **Page navigation** between a landing page and the main app view.
- **Dataset list** with upload and demo‑load capabilities.
- **Profile tab** showing column statistics, data types, and a preview table.
- **Remediation tab** for fixing issues (e.g., removing duplicates, standardising values).
- **Readiness report** that visualises a weighted score and provides a downloadable PDF.
- **Settings modal** to store an API key and adjust the weighting factors used for the score.
- **Responsive design** – works on desktop and tablets.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Front‑end | React (TypeScript), Vite, Tailwind CSS, Lucide‑react icons |
| Animation | GSAP |
| Back‑end | FastAPI (Python) – serves dataset CRUD endpoints |
| State management | React `useState`/`useEffect` hooks |
| Styling | Custom CSS + Tailwind utilities |
| Build tool | Vite (with `npm run dev` for development) |

---

## Project Structure

```
Data-pipeline/
├─ backend/                     # FastAPI service
│   └─ app/
│       └─ services/scorer.py   # Scoring logic (weights, calculations)
│
├─ frontend/                    # React app (Vite)
│   ├─ src/
│   │   ├─ components/          # Re‑usable UI components
│   │   │   ├─ BubbleMenu.tsx    # Floating menu with GSAP animations
│   │   │   ├─ ProfilerTab.tsx   # Profile view
│   │   │   ├─ RemediatorTab.tsx # Data‑cleaning UI
│   │   │   ├─ ReadinessReportTab.tsx
│   │   │   └─ SettingsModal.tsx
│   │   ├─ pages/               # Page level components
│   │   │   ├─ LandingPage.tsx   # Intro page with "Get Started"
│   │   │   └─ Dashboard.tsx    # Main dashboard layout
│   │   ├─ App.tsx               # Root component (routing & state)
│   │   └─ index.tsx
│   ├─ public/                  # Static assets (favicon, images)
│   └─ vite.config.ts
│
├─ README.md                    # **You are reading it now**
└─ package.json                  # npm scripts, dependencies
```

---

## Setup & Development

### Prerequisites

- **Node ≥ 18** (for the frontend)
- **Python ≥ 3.10** and **pip** (for the backend API)
- **Git** (to clone the repo)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repo‑url>
   cd Data-pipeline
   ```

2. **Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # on Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload   # API runs on http://localhost:8000
   ```
   The backend exposes endpoints used by the React app (`/api/datasets`, `/api/upload`, etc.).

3. **Frontend**
   ```bash
   cd ../frontend
   npm install               # installs React, Vite, GSAP, Tailwind, etc.
   npm run dev               # starts Vite dev server (http://localhost:5173)
   ```
   The app expects the backend at `http://localhost:8000` (see `API_BASE` constant in `src/App.tsx`).

4. **Environment variables** (optional) – create a `.env` file in `/frontend` with:
   ```env
   VITE_API_BASE=http://localhost:8000
   ```
   This lets you point the UI to a different backend address.

---

## Usage

1. Open `http://localhost:5173` in your browser.
2. The **Landing page** explains the purpose and offers a **"Get Started"** button.
3. Click **Upload** to add a CSV/Excel file or use **Load Demo** to load a sample dataset.
4. After a dataset loads you can:
   - View the **Profile** tab (statistics, schema).
   - Navigate to **Remediation** to fix issues.
   - See the **Readiness Report** (score, weighted breakdown).
5. Use the **Settings** modal (gear icon) to store your Gemini API key and tweak the weighting factors for the score.
6. Export cleaned data via **CSV** or generate a **PDF** report.

---

## Screenshots

*(Screenshots are stored in the Gemini artifact folder; you can view them directly in the UI.)*

- **Landing page** – a clean welcome screen.
- **Dashboard with BubbleMenu** – shows the floating menu on the top‑right.
- **Profile tab** – column stats and preview table.
- **Readiness report** – visual score and download button.

---

## Design & Architecture Notes

- **Conditional rendering** – The root `App` component uses `currentPage === "app" && (…)` to render the full UI only after a dataset is selected.
- **BubbleMenu** – Implemented with GSAP for smooth rotation & hover colour transitions. The component receives a `logo`, `items` array, and an optional `useFixedPosition` flag.
- **State flow** – All major UI state (`datasets`, `selectedDatasetId`, `datasetDetails`, `tableData`, `activeTab`, etc.) lives in `App.tsx` and is passed down as props to child components.
- **Weight configuration** – Stored in `localStorage` so the user’s preferences persist across sessions.
- **Type safety** – Types are defined in `App.tsx` (e.g., `useState<"landing" | "app">`). Redundant comparisons have been removed to keep the TypeScript compiler happy.

---

## Future Improvements

- **Routing** – Replace the manual `currentPage` state with React Router for cleaner URL‑based navigation.
- **Authentication** – Secure the API with OAuth/JWT and hide the Gemini key on the server side.
- **Unit & integration tests** – Add Jest/React‑Testing‑Library tests for each component.
- **Dockerisation** – Provide `Dockerfile`s for the frontend and backend to simplify deployment.
- **Additional data sources** – Support reading from databases (PostgreSQL, MySQL) and cloud storage (S3, GCS).

---

## License

This project is licensed under the **MIT License** – feel free to fork, modify, and use it in your own projects.

---

## Contact

Developed by **hp** (GitHub: `@hp`). For questions or contributions, open an issue or submit a pull request on the repository.
