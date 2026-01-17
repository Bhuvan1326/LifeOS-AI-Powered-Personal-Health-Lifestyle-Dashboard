# 🚀 HM026 - Decision & Lifestyle Dashboard

> **Track Decisions. Optimize Life.**
> A modern personal dashboard built to help users track important life decisions, analyze trends, and manage daily productivity. Built with Next.js 15, Supabase, and Shadcn UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Bun](https://img.shields.io/badge/Bun-Runtime-fbf0df?style=flat-square&logo=bun)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Key Features

* **📊 Interactive Dashboard:** A central hub to view your daily activity and insights (`/dashboard`).
* **🤔 Decision Tracker:** Dedicated tools to log, view, and filter important life decisions (`/decisions`).
    * **Filter System:** Sort decisions by criteria to find what matters.
    * **Detailed Analysis:** Deep dive into individual decision metrics.
* **🔐 Secure Authentication:** Robust sign-up and login flow powered by Supabase Auth (`/auth`).
* **🎨 Modern UI:** Beautiful, responsive components built with Tailwind CSS and Shadcn UI.
* **📱 Responsive Design:** Fully optimized for seamless use on both desktop and mobile devices.

---

## 🛠️ Tech Stack

**Frontend & Core:**
* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Components:** Shadcn UI (Radix Primitives)
* **Icons:** Lucide React

**Backend & Data:**
* **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Authentication:** Supabase Auth
* **State Management:** React Hooks

---

## 📂 Project Structure

A quick look at the top-level files and directories:

```bash
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/            # Signin, Signup, and Auth Callbacks
│   │   ├── dashboard/       # Main user dashboard
│   │   ├── decisions/       # Decision tracking & filtering features
│   ├── components/          # Reusable UI components (Shadcn)
│   ├── lib/                 # Utilities and Supabase client setup
│   ├── hooks/               # Custom React hooks (e.g., use-mobile)
│   └── visual-edits/        # Visual editing tools configuration
├── public/                  # Static assets (images, fonts)
└── LifeOS/                  # (Reference/Legacy backend module)

🚀 Getting Started
Follow these steps to run the project locally on your machine.

1. Clone the Repository
Bash
git clone [https://github.com/Bhuvan1326/HM026_PythonCathers.git](https://github.com/Bhuvan1326/HM026_PythonCathers.git)
cd HM026_PythonCathers
2. Install Dependencies
Important: Use the legacy peer deps flag to avoid version conflicts with some libraries.

Bash
# Using NPM (Recommended)
npm install --legacy-peer-deps

# OR using Bun
bun install
3. Configure Environment Variables
Create a file named .env.local in the root directory (same level as package.json).

Add your Supabase credentials. (You can find these in your Supabase Dashboard under Settings > API).

Code snippet
Supabase Project URL: https://abdngjtrutlczevosdmg.supabase.co

Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZG5nanRydXRsY3pldm9zZG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MzY4ODAsImV4cCI6MjA4NDExMjg4MH0.ZcSCHBkHgtyk6X1_bFbeoWqD1ErPVSe13oJ6bVfqtSY

4. Run the Development Server
Bash
npm run dev
Open http://localhost:3000 with your browser to see the app.

Sign Up Page: http://localhost:3000/auth/signup

Dashboard: http://localhost:3000/dashboard

🤝 Contributing
We welcome contributions to improve the dashboard!

Fork the repository.

Create a feature branch (git checkout -b feature/NewFeature).

Commit your changes (git commit -m 'Add NewFeature').

Push to the branch.

Open a Pull Request.

📞 Team
Team HM026 - PythonCathers

Repository: https://github.com/Bhuvan1326/HM026_PythonCathers