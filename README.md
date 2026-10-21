# Deep Learning Health — Cardiovascular Risk Prediction & Health Recommendation System

A web-based health application designed to support cardiovascular risk assessment and personalized health recommendations. The system provides separate interfaces for patients, healthcare providers, and administrators.

## Overview

**Deep Learning Health** aims to make health risk assessment and health-related recommendations more accessible through a web-based platform.

The application includes patient health profiles, cardiovascular risk assessment, health recommendations, healthcare provider tools, and administrative dashboards.

> **Disclaimer:** This project is intended for educational and research purposes. It is not a substitute for professional medical advice, diagnosis, or treatment.

## Features

- **Patient Dashboard:** Access personal health information and available health tools.
- **Cardiovascular Risk Assessment:** Use the application's risk assessment workflow to evaluate cardiovascular risk factors.
- **Health Recommendations:** View health recommendations provided by the application.
- **Health Profile Management:** Maintain relevant health profile information.
- **Healthcare Provider Dashboard:** Access provider-facing tools and patient-related workflows.
- **Administration Dashboard:** Manage users and access administrative features.
- **Performance Monitoring:** View the application's administrative performance interface.
- **Model Retraining Interface:** Access the model retraining workflow provided by the application.
- **Authentication:** Sign-up, login, and protected routes.
- **Role-Based Interfaces:** Separate patient, provider, and administrator experiences.

## Technology Stack

- **Frontend:** React, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, CSS
- **Backend Services:** Supabase
- **Database:** Supabase-supported PostgreSQL
- **Routing and Access Control:** React application routes and protected route components
- **Code Quality:** ESLint

## Project Structure

```text
project/
├── src/
│   ├── components/
│   │   ├── DashboardLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── facilities.ts
│   │   ├── riskEngine.ts
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── admin/
│   │   ├── patient/
│   │   └── provider/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── migrations/
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

Before running the application, install:

- [Node.js](https://nodejs.org/) — preferably a current LTS version
- npm, included with Node.js
- A Supabase project, if you want to connect the application to your own backend

### 1. Clone the repository

```bash
git clone https://github.com/limanalkali02/deep-learning-health.git
cd deep-learning-health
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your own Supabase project credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the URL and publishable/anonymous key from your Supabase project settings. Never put a Supabase `service_role` key or `sb_secret_` key in frontend environment variables.

### 4. Configure the database

If you are using your own Supabase project:

1. Review the SQL migration in `supabase/migrations/`.
2. Apply the migration to your Supabase database using the appropriate Supabase workflow.
3. Configure and test Row Level Security (RLS) policies.
4. Configure any required authentication settings and environment variables.

Do not assume that applying the migration alone completes all security configuration.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 6. Build for production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Application Modules

| Module | Purpose |
|---|---|
| Patient | Health profile, dashboard, cardiovascular risk assessment, and recommendations |
| Healthcare Provider | Provider dashboard, patient workflows, and configuration |
| Administrator | User management, performance interface, and retraining interface |
| Authentication | Account access and protected routes |
| Risk Engine | Application logic related to cardiovascular risk assessment |
| Supabase Integration | Connection to configured backend services |

## Security Considerations

- Keep `.env` out of version control.
- Use Row Level Security to control access to sensitive health data.
- Never expose service-role or secret API keys in client-side code.
- Validate authorization on the backend, not only in the frontend.
- Use test data when demonstrating the application publicly.
- Do not upload real patient information or sensitive credentials to GitHub.

## Future Improvements

Potential areas for further development include:

- Further validation of cardiovascular risk predictions against appropriate clinical datasets.
- Model evaluation using documented metrics and reproducible experiments.
- Improved accessibility and mobile responsiveness.
- Automated testing for authentication, risk assessment, and role permissions.
- Enhanced monitoring, reporting, and deployment documentation.

## Project Status

The project source code is available in this repository. Features, database requirements, and deployment configuration may evolve as development continues.

## Author

**Alfa Liman Alkali**

Computer Science | Nigeria Army University, Biu

GitHub: [@limanalkali02](https://github.com/limanalkali02)

## License

No license has been specified yet. Unless a license is added, the default copyright rules apply and others should not assume they have permission to reuse or redistribute the code.
