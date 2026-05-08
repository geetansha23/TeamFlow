# Team Task Manager — Full Stack

A full-stack role-based task manager where users can create projects, manage teams, assign tasks, and track progress through a clean dashboard.

## Features

- Signup/Login with JWT authentication
- First registered user becomes Admin automatically
- Admin can create projects, add team members, create tasks, assign tasks, and delete records
- Members can view assigned projects/tasks and update their own task status
- Dashboard with total tasks, completed tasks, overdue tasks, and status breakdown
- REST APIs + MongoDB relationships
- Validations and role-based access control
- Responsive recruiter-friendly UI
- Railway deployment ready

## Tech Stack

Frontend: React + Vite + Axios  
Backend: Node.js + Express.js  
Database: MongoDB Atlas  
Auth: JWT + bcrypt  
Deployment: Railway

## Local Setup

```bash
git clone <your-repo-url>
cd team-task-manager-fullstack
npm install
cp .env.example .env
```

Add your MongoDB Atlas URI and JWT secret in `.env`.

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Railway Deployment

1. Push this project to GitHub.
2. Create a MongoDB Atlas database and copy the connection URI.
3. Go to Railway → New Project → Deploy from GitHub Repo.
4. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Railway will run:
   - Build: `npm run build`
   - Start: `npm start`
6. Open the generated Railway URL.

## Demo Flow

1. Signup with first account. This account becomes Admin.
2. Create a project.
3. Signup with another account. This user becomes Member.
4. Admin adds the member email to the project.
5. Admin creates a task and assigns it to the member.
6. Member logs in and changes task status.
7. Dashboard updates task progress and overdue count.

## API Overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:id/members`
- `DELETE /api/projects/:id`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Dashboard
- `GET /api/dashboard/stats`


