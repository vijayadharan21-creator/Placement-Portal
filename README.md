# 🎓 Campus Placement Portal & MIS

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3%20Storage-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://aws.amazon.com/s3/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A full-stack **Placement Management Information System (MIS) and CRM** designed for university placement cells, placement officers, and students. The platform centralizes student profiles, resume storage on AWS S3, recruitment drive postings, student applications, automated eligibility filtering, and visual analytics for institutional placement performance.

---

## 📌 Table of Contents

- [Key Features](#-key-features)
  - [For Placement Officers & Admins](#-for-placement-officers--admins)
  - [For Students](#-for-students)
- [Tech Stack](#-tech-stack)
- [Architecture Workflow](#-architecture-workflow)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Default Administrator Account](#-default-administrator-account)
- [Production Deployment](#-production-deployment)
- [License](#-license)

---

## ✨ Key Features

### 🏢 For Placement Officers & Admins

- **Interactive Analytics Dashboard**:
  - Real-time **Placed vs. Unplaced** student ratio breakdown.
  - Department-wise placement rate comparisons via Recharts.
  - Salary analytics: Highest, Lowest, and Average CTC (in LPA).
  - Hiring partner distribution & top recruiters leaderboard.
  - Drive status tracking (Upcoming, Ongoing, Completed).
- **Drive & Job Posting Management**:
  - Create and schedule campus drives with company profiles, eligibility cutoffs (min CGPA), CTC packages, and target skillsets.
  - Edit or remove postings and monitor applicant counts in real-time.
- **Applicant & Pipeline Tracking**:
  - Inspect students applied to each recruitment drive.
  - Update candidate stages seamlessly: `Applied` ➔ `Shortlisted` ➔ `Selected` ➔ `Rejected`.
- **Student Directory & Secure Resume Access**:
  - Filter and review students by department, CGPA, and placement status.
  - View resumes on-demand using secure, time-limited **AWS S3 Presigned URLs**.

### 🎓 For Students

- **Profile & Resume Management**:
  - Manage personal details, university roll number, department, and current CGPA.
  - Add technical competencies and key skills.
  - Upload PDF resumes directly streamed to AWS S3 storage.
- **Drive Discovery & Application**:
  - Browse available company drives with explicit eligibility checks based on student CGPA.
  - Single-click job application workflow with automated duplicate submission prevention.
- **Live Application Status**:
  - Track progress for every applied drive in real-time (`Applied`, `Shortlisted`, `Selected`, `Rejected`).
  - View placement offer details (Company & Package).

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Recharts, Lucide Icons, Axios, Modern Dark CSS |
| **Backend** | Node.js, Express.js, Multer (Memory Storage) |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt password hashing |
| **Cloud Storage** | AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) |

---

## 🔄 Architecture Workflow

```mermaid
graph TD
    subgraph Client [React + Vite Frontend]
        AuthUI[Login / Registration]
        AdminUI[Admin / PO Dashboard]
        StudentUI[Student Portal]
    end

    subgraph API [Express.js REST API]
        AuthRouter[/api/auth]
        StudentRouter[/api/students]
        DriveRouter[/api/drives]
        AppRouter[/api/applications]
        AnalyticsRouter[/api/analytics]
    end

    subgraph Database [MongoDB]
        Users[(Users Collection)]
        Profiles[(StudentProfiles Collection)]
        Drives[(Drives Collection)]
        Applications[(Applications Collection)]
    end

    subgraph Storage [AWS S3]
        S3Bucket[(Resume S3 Bucket)]
    end

    Client -->|Axios with JWT Bearer Token| API
    API -->|Mongoose Queries & Aggregations| Database
    StudentRouter -->|Stream PDF & Generate Presigned URLs| Storage
```

---

## 📁 Project Directory Structure

```text
placement-portal-prototype/
├── client/                     # Frontend application (React + Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── assets/             # Images and SVG icons
│   │   ├── components/         # Shared UI components (Sidebar, etc.)
│   │   ├── context/            # AuthContext (state & session management)
│   │   ├── pages/              # View pages
│   │   │   ├── AdminDashboard.jsx    # Analytics, Drive & Applicant Management
│   │   │   ├── Dashboard.jsx         # Role-based dashboard router
│   │   │   ├── LoginReg.jsx          # Authentication portal
│   │   │   └── StudentDashboard.jsx  # Student profile & job application views
│   │   ├── services/           # Axios HTTP client configuration
│   │   ├── App.jsx             # Main router and root layout
│   │   ├── index.css           # Global design system & theme tokens
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML entry point
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy
│
├── server/                     # Backend API (Node.js + Express)
│   ├── config/
│   │   └── db.js               # MongoDB connection & admin seeder
│   ├── controllers/            # Controller logic
│   │   ├── analyticsController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── driveController.js
│   │   └── studentController.js
│   ├── models/                 # Mongoose schemas
│   │   ├── Application.js
│   │   ├── Drive.js
│   │   ├── StudentProfile.js
│   │   └── User.js
│   ├── routers/                # Express routes
│   │   ├── analyticsRoutes.js
│   │   ├── api.js              # Aggregated API router
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── driveRoutes.js
│   │   └── studentRoutes.js
│   ├── utils/
│   │   ├── jwt.js              # Token signing & verification
│   │   └── s3.js               # AWS S3 file upload & presigned URL generator
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Express application entry point
│
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or later ([Download](https://nodejs.org/))
- **npm**: `v9.x` or later
- **MongoDB**: Either a local instance running on `localhost:27017` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **AWS S3 Bucket**: (Optional for local testing, required for resume uploads)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/placement
   JWT_KEY=your_secret_key_here
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your_bucket_name
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open another terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Access the client application in your browser at `http://localhost:5173`.

---

## 🔐 Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port number for Express server | `5000` |
| `MONGODB_URI` | MongoDB connection URI (Atlas or Local) | `mongodb://127.0.0.1:27017/placement` |
| `JWT_KEY` | Secret token string for signing JSON Web Tokens | `your_secret_jwt_key` |
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key ID for S3 bucket access | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | `wJalr...` |
| `AWS_REGION` | AWS S3 region | `us-east-1` |
| `AWS_BUCKET_NAME` | AWS S3 bucket name for storing resumes | `placement-portal-resumes` |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`student` or `po`).
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET /api/auth/me` - Fetch currently authenticated user session.

### Student Management (`/api/students`)
- `GET /api/students/profile` - Fetch current student's profile & resume link.
- `POST /api/students/profile` - Create or update student profile details.
- `POST /api/students/resume` - Upload resume (Multipart form file, saved to AWS S3).
- `GET /api/students` - List all students (Admin / Placement Officer only).

### Campus Drives (`/api/drives`)
- `GET /api/drives` - Fetch all scheduled drives.
- `GET /api/drives/:id` - Fetch details for a specific drive.
- `POST /api/drives` - Create a new drive (Admin / PO only).
- `PUT /api/drives/:id` - Update drive details or status.
- `DELETE /api/drives/:id` - Remove drive.

### Drive Applications (`/api/applications`)
- `POST /api/applications/apply` - Submit an application for a drive (Student).
- `GET /api/applications/my-applications` - List all drives applied by the logged-in student.
- `GET /api/applications/drive/:driveId` - Fetch all candidates applied to a specific drive (Admin / PO).
- `PUT /api/applications/:id/status` - Update an applicant's stage (`Applied`, `Shortlisted`, `Selected`, `Rejected`).

### Analytics & Insights (`/api/analytics`)
- `GET /api/analytics/dashboard` - Return institutional aggregate stats, department breakdown, salary metrics, and top hiring partners.

---

## 👤 Default Administrator Account

Upon connecting to MongoDB for the first time, the system automatically seeds a default Placement Officer / Admin account:

- **Email:** `vijayadharan21@gmail.com`
- **Password:** `12345678`
- **Role:** `admin`

> **Note:** Remember to change this password or configure custom administrator accounts in production environments.

---

## 📦 Production Deployment

To bundle the frontend for production and serve it directly from Express:

1. Build the frontend distribution bundle:
   ```bash
   cd client
   npm run build
   ```

2. Copy the resulting `client/dist` directory to `server/dist`:
   ```bash
   cp -r client/dist server/dist
   ```

3. Launch the production server:
   ```bash
   cd server
   npm start
   ```
   Express is configured to serve static assets from `dist/` and handle client-side routing fallback automatically.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
