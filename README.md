# BudgetWise

A full-stack budgeting app with a Node/Express backend and a React frontend.

## Table of Contents
- [Stack & Requirements](#stack--requirements)
- [Project Structure](#project-structure)
- [Setup (Backend & Frontend Together)](#setup-backend--frontend-together)
- [Environment Variables](#environment-variables)
- [Start the App](#start-the-app)
- [Run Unit Tests (Backend)](#run-unit-tests-backend)
- [Recommended Git Workflow](#recommended-git-workflow)
- [CI/CD (Preview)](#cicd-preview)
- [Troubleshooting](#troubleshooting)

---

## Stack & Requirements
- **Node.js** ≥ 18.x and **npm**
- **Git**
- (Optional) **MongoDB** connection string for production/deployment

## Project Structure
\`\`\`
BudgetWise/
├─ backend/       # Node.js + Express API
│  ├─ src/        # controllers, models, routes, etc.
│  ├─ tests/      # Jest tests
│  ├─ package.json
│  └─ .env        # server secrets (create locally)
└─ frontend/      # React app (Vite/CRA)
   ├─ src/
   ├─ package.json
   └─ .env        # client env (create locally)
\`\`\`

## Setup (Backend & Frontend Together)
\`\`\`bash
mkdir BudgetWise && cd BudgetWise
git clone https://github.com/vdnnguyen94/BudgetWise.git .
cd backend && npm install
cd ../frontend && npm install
\`\`\`

## Environment Variables

### backend/.env
\`\`\`env
MONGODB_URI=

\`\`\`

### frontend/.env 
\`\`\`env

\`\`\`


## Start the App
\`\`\`bash
cd backend && npm start
cd frontend && npm start
\`\`\`


## Recommended Git Feature Branch Workflow

This workflow is designed to ensure you always start new work from the most up-to-date version of the \`main\` branch, which helps prevent merge conflicts and keeps the project history clean.

---

## 1. Check Your Current Status
\`\`\`bash
git status
\`\`\`
* **Comment:** This is a safety check. Before doing anything, see if you have any uncommitted changes. You should ideally start this workflow from a "clean" state (no modifications). If you have changes, either commit them, stash them, or discard them.

---

## 2. Fetch Remote Updates
\`\`\`bash
git fetch
\`\`\`
* **Comment:** This command downloads all the latest information from the remote repository (e.g., GitHub), including new branches and commits. It **does not** change any of your local files or branches yet. It just updates your local Git's "map" of what the remote repository looks like.

---

## 3. Switch to the Main Branch
\`\`\`bash
git switch main
\`\`\`
* **Comment:** To update your local \`main\` branch, you first need to be on it. This command ensures you are actively on the \`main\` branch before you pull in the latest changes. (Note: \`git checkout main\` does the same thing).

---

## 4. Update Your Local Main Branch
\`\`\`bash
git pull --rebase origin main
\`\`\`
* **Comment:** This is a crucial step. It takes the changes you fetched from the remote \`origin\` and applies them to your local \`main\` branch.
    * The \`--rebase\` flag is important here. It prevents a "merge commit" if you happen to have local changes on \`main\` (which you shouldn't). It rewinds your local commits, pulls the remote changes, and then reapplies your commits on top, creating a clean, linear history. This ensures your local \`main\` is an exact, up-to-date copy of the remote.

---

## 5. Create and Switch to a New Feature Branch
\`\`\`bash
git switch -c feat/<task>
\`\`\`
* **Comment:** Now that your \`main\` branch is perfectly in sync with the remote, this command creates a new branch for your task. The \`-c\` flag both **c**reates the new branch and switches to it in one step. All your new work will be safely isolated here, leaving the \`main\` branch untouched. (Note: \`git checkout -b feat/<task>\` is the older equivalent).

---

## 6. Do Your Work & Stage Changes
\`\`\`bash
# ... do your coding and make changes to files ...
git add -A
\`\`\`
* **Comment:** After you have made some changes, this command stages them. \`add -A\` stages all new, modified, and deleted files, preparing them to be saved in a commit. You will run this command every time you are ready to save a snapshot of your work.

---

## 7. Commit Your Changes
\`\`\`bash
git commit -m "feat: something"
\`\`\`
* **Comment:** This command saves your staged changes to your local branch's history. The message (\`-m\`) should be a short, clear description of the work you did. The \`feat:\` prefix is part of a convention called "Conventional Commits," which helps keep commit history organized.

---

## 8. Push Your New Branch to the Remote
\`\`\`bash
git push -u origin feat/<task>
\`\`\`
* **Comment:** This command uploads your new branch and its commits to the remote repository (\`origin\`).
    * The \`-u\` (or \`--set-upstream\`) flag is used on the *first push* of a new branch. It links your local branch to the remote branch, so in the future, you can simply run \`git push\` from this branch without specifying the destination. This is how you share your work and create a Pull Request.
`

## CI/CD
- CI: \`npm ci\`, \`npm test\`
- CD: Render / Vercel / Oracle deployment

## Troubleshooting
- ENV not loaded → check file names
- CORS → ensure backend and frontend URLs match
- MongoDB → ensure access is whitelisted

