# BudgetWise

A simple full-stack budgeting app with a **Node.js/Express** backend and a **React** frontend.

## Features

* Track budgets and expenses by category
* REST API (Express) with MongoDB
* Modern React frontend (Vite or CRA)
* Ready for CI/CD and cloud hosting

## Tech Stack

* **Backend:** Node.js v18, Express, Mongoose, Serverless Framework
* **Frontend:** React (Vite/CRA)
* **Database:** MongoDB (Atlas or self-hosted)

## Project Structure

```
BudgetWise/
├─ backend/                 # Node.js + Express API
│  ├─ src/                  # controllers, models, routes, middleware
│  ├─ package.json
│  └─ .env                  # server secrets (create locally)
└─ frontend/                # React app (Vite/CRA)
   ├─ src/
   ├─ package.json
   └─ .env                  # client env (create locally)
```

## Prerequisites

* **Node.js** v18 and **npm** (We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions)
* **Git** - A **MongoDB** connection string (e.g., from a free MongoDB Atlas account)

## Local Development Setup

### 1. Clone the Repository

```
git clone https://github.com/vdnnguyen94/BudgetWise.git
cd BudgetWise
```

### 2. Backend Setup

Follow these steps in a terminal to get the backend server running.

\`\`\`
# Navigate to the backend directory
cd backend

# Set the correct Node.js version
# This ensures your local environment matches the deployment environment.
nvm install 18 # Installs Node.js v18 if you don't have it
nvm use 18     # Switches your current terminal session to use v18

# Install dependencies
npm install

# Create the environment file
# Create a new file named .env in the \`backend\` directory and add your secret keys:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_super_secret_jwt_key
# PORT=5000

# Start the local serverless environment
npx serverless offline
\`\`\`

The backend API will now be running on \`http://localhost:5000\`. Keep this terminal open.

### 3. Frontend Setup

Open a **second terminal** to set up and run the frontend.

\`\`\`
# Navigate to the frontend directory from the project root
cd frontend

# Install dependencies
npm install

# Create the environment file
# Create a new file named .env in the \`frontend\` directory for your client-side variables.
# Example:
# REACT_APP_API_URL=http://localhost:5000

# Start the frontend development server
npm start
\`\`\`

Your frontend application should now be running, typically on \`http://localhost:3000\`, and will be able to communicate with your local backend.


## 🚨 Important Note on Core Backend Files

The following files are critical for the serverless configuration and database connection.  
Do **not** modify them unless you are an administrator or are familiar with the serverless architecture:

- `serverless.yml`
- `handler.js`
- `db.js`
- `.github/workflows//deploy.yml`
When working with `app.js`, please only add new API routes. Avoid changing the existing middleware or configuration.

---

## 🌐 Production URL

[https://budgetwise-mu.vercel.app/](https://budgetwise-mu.vercel.app/)

## Recommended Git Feature Branch Workflow

This workflow is designed to ensure you always start new work from the most up-to-date version of the \`main\` branch, which helps prevent merge conflicts and keeps the project history clean.

### 1. Check Your Current Status

\`\`\`
git status
\`\`\`

* **Comment:** A safety check to see if you have uncommitted changes.

### 2. Fetch Remote Updates

\`\`\`
git fetch
\`\`\`

* **Comment:** Downloads the latest information from the remote repository without changing your local files.

### 3. Switch to the Main Branch

\`\`\`
git switch main
\`\`\`

* **Comment:** Ensures you are on the \`main\` branch before updating it.

### 4. Update Your Local Main Branch

\`\`\`
git pull --rebase origin main
\`\`\`

* **Comment:** Pulls the latest changes from the remote \`main\` branch and reapplies your local commits on top, keeping a clean history.

### 5. Create and Switch to a New Feature Branch

\`\`\`
git switch -c feat/<task>
\`\`\`

* **Comment:** Creates a new branch for your task and switches to it.

### 6. Do Your Work & Stage Changes

\`\`\`
# ... do your coding and make changes to files ...
git add -A
\`\`\`

* **Comment:** Stages all your changes, preparing them for a commit.

### 7. Commit Your Changes

\`\`\`
git commit -m "feat: something"
\`\`\`

* **Comment:** Saves your staged changes to your local branch's history.

### 8. Push Your New Branch to the Remote

\`\`\`
git push -u origin feat/<task>
\`\`\`

* **Comment:** Uploads your new branch and its commits to the remote repository.
