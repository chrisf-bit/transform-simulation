# TRANSFORM™ - Change Leadership Simulation (Multiplayer)

**Built like Agency Leadership** - Facilitator-led multiplayer with Socket.IO

## 🎮 How It Works

1. **Facilitator creates game** → Gets game code (e.g., "ABC123")
2. **Players join** with that code
3. **Play together** through 6 rounds
4. **Real-time updates** via Socket.IO
5. **Final score** and debrief

---

## 🚀 Quick Deployment to Render

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/transform-multiplayer.git
git branch -M main
git push -u origin main
```

### 2. Deploy Server to Render

1. Go to render.com → **New + → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `transform-server`
   - **Root Directory**: `server`
   - **Build**: `npm install && npm run build`
   - **Start**: `npm start`
   - **Plan**: Free or Starter

4. Environment Variables:
   ```
   PORT = 3001
   CORS_ORIGIN = http://localhost:5173
   ```

5. Click **Create**

6. Once deployed, copy your URL: `https://transform-server-xyz.onrender.com`

### 3. Deploy Client to Vercel

1. Go to vercel.com/new
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Framework**: Vite

4. Environment Variable:
   ```
   VITE_API_URL = https://transform-server-xyz.onrender.com
   ```

5. Click **Deploy**

6. Once deployed, **update server CORS**:
   - Go back to Render → Your service → Environment
   - Edit `CORS_ORIGIN`:
   ```
   https://your-app.vercel.app,http://localhost:5173
   ```

---

## ✅ DONE!

Your app is live:
- **Players**: `https://your-app.vercel.app`
- **Facilitators**: Same URL → "Create New Game"

---

## 💻 Local Development

**Server:**
```bash
cd server
npm install
npm run dev  # Port 3001
```

**Client:**
```bash
cd client
npm install
npm run dev  # Port 5173
```

Visit http://localhost:5173

---

## 🎯 How to Demo Tomorrow

1. **Open app** → Create New Game
2. **Share game code** with prospect (6 characters)
3. **They join** on their device with their name
4. **You start game** as facilitator
5. **Play through** 1-2 rounds showing:
   - Decisions affect metrics
   - Stage transitions
   - Real-time updates
   - Outcomes and scoring

---

## 📊 Game Flow

**6 Rounds:**
1. The Case for Change
2. Letting Go
3. The Neutral Zone
4. Early Adoption
5. Embedding New Ways
6. Outcomes and Reflection

**7 Metrics tracked:**
- BP: Business Performance
- CA: Change Adoption
- EE: Employee Energy
- TR: Trust
- RS: Resistance (lower is better)
- LC: Leadership Credibility
- MO: Momentum

**Stages:**
- Bridges Transition Model
- Change Curve

---

## 💰 Cost

- **Server (Render)**: Free or $7/month
- **Client (Vercel)**: Free
- **Total**: $0-7/month

---

## 🔧 Tech Stack

**Server:**
- Express + Socket.IO
- TypeScript
- In-memory game storage

**Client:**
- React + Vite
- Socket.IO Client
- TypeScript

---

## ✨ Features

✅ Real-time multiplayer
✅ Facilitator-controlled progression
✅ 6 rounds with multiple decisions
✅ Stage-based difficulty modifiers
✅ Live metrics dashboard
✅ Final scoring and assessment
✅ Simple deployment

---

## 🎓 Based On

- William Bridges' Transition Model
- Change Curve (Kübler-Ross)

---

Ready for your demo! 🚀
