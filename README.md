# BudgetWise  

A simple full-stack budgeting app with a Node.js/Express backend and a React frontend.  

## Features  
- Track budgets and expenses by category  
- REST API (Express) with MongoDB  
- Modern React frontend (Vite or CRA)  
- Ready for CI/CD and cloud hosting  

## Tech Stack  
- **Backend:** Node.js v18, Express, Mongoose, Serverless Framework  
- **Frontend:** React (Vite/CRA)  
- **Database:** MongoDB (Atlas or self-hosted)  

## Project Structure  
```text
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
- **Node.js** v18 and **npm** (We recommend using [nvm](https://github.com/nvm-sh/nvm))  
- **Git**  
- **MongoDB** connection string (e.g., MongoDB Atlas)  

## Local Development Setup  

### 1. Clone the Repository  
```bash
git clone https://github.com/vdnnguyen94/BudgetWise.git
cd BudgetWise
```  

### 2. Backend Setup  
```bash
cd backend
nvm install 18
nvm use 18
npm install
```

Create a `.env` file in `backend/` with:  
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

Start the local serverless environment:  
```bash
npx serverless offline
```
➡️ Backend runs at [http://localhost:5000](http://localhost:5000)  

### 3. Frontend Setup  
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:  
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend development server:  
```bash
npm start
```
➡️ Frontend runs at [http://localhost:3000](http://localhost:3000)  

---

## 🚨 Important Note on Core Backend Files  
Do not modify these unless you are familiar with the serverless architecture:  

- serverless.yml  
- handler.js  
- db.js  
- .github/workflows/deploy.yml  

When working with app.js, only add new API routes. Avoid changing existing middleware/config.  

---

## 🌐 Production URL  
[https://budgetwise-mu.vercel.app/](https://budgetwise-mu.vercel.app/)  

---

## Recommended Git Feature Branch Workflow  

1. Check your status  
```bash
git status
```  

2. Fetch remote updates  
```bash
git fetch
```  

3. Switch to the main branch  
```bash
git switch main
```  

4. Update your local main  
```bash
git pull --rebase origin main
```  

5. Create a new feature branch  
```bash
git switch -c feat/your-feature
```  

6. Stage changes  
```bash
git add -A
```  

7. Commit changes  
```bash
git commit -m "feat: description"
```  

8. Push branch to remote  
```bash
git push -u origin feat/your-feature
```  

