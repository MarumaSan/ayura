# 🌿 Ayura — Smart Meal Planning Platform

A full-stack web application for personalized healthy meal planning, built with **Next.js 16**, **MongoDB**, and **TypeScript**.

Ayura connects health-conscious consumers with local organic producers through AI-driven meal recommendations, automated nutrition tracking, and a streamlined box subscription model.

---

## ✨ Features

### 👤 User Side
- **Health Assessment & BMI Calculator** — personalized size recommendations (M/L/XL)
- **Meal Set Selection** — browse curated meal plans with nutrition breakdowns
- **AI Daily Menu** — dynamic breakfast/lunch/dinner suggestions from your box ingredients
- **Dashboard** — order tracking, nutrition stats, daily menu, and delivery countdown
- **Checkout** — PromptPay QR or Wallet payment with real-time stock validation
- **Wallet System** — top-up balance and track transactions
- **Pre-order Support** — queue next box delivery before current plan expires

### 🛠️ Admin Side
- **Orders Management** — approve, ship, deliver orders with status pipeline
- **Inventory Management** — full CRUD for ingredients with producer community tracking
- **Meal Set Builder** — create meal sets with ingredient builder, live nutrition/price calculator
- **User Management** — view all registered users
- **Revenue Dashboard** — total revenue, wallet balances, order stats

### 🔒 Security
- Password hashing with **bcrypt** (salt rounds 12)
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Password field excluded from API responses
- Input validation on all API endpoints

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Styling | Tailwind CSS 4 + Custom CSS Variables |
| Auth | bcryptjs (password hashing) |
| Payment | PromptPay QR (`promptpay-qr` + `qrcode.react`) |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Auth (login/register)
│   ├── onboarding/           # Health profile setup
│   ├── dashboard/            # User dashboard + daily menu
│   ├── meal-plan/            # Meal set selection + ordering
│   ├── checkout/             # Payment flow
│   ├── admin/                # Admin dashboard
│   │   ├── inventory/        # Ingredient management
│   │   ├── mealsets/         # Meal set builder
│   │   └── orders/           # Order management
│   └── api/
│       ├── auth/             # Login & Register
│       ├── admin/            # Admin CRUD APIs
│       ├── user/             # User-facing APIs
│       ├── meal-sets/        # Public meal set API
│       ├── ingredients/      # Public ingredient API
│       ├── orders/           # Public order API
│       └── wallet/           # Wallet top-up API
├── components/               # Navbar, Footer, AdminGuard
├── lib/                      # MongoDB connection, BMI/TDEE calculator, meal recommender
└── models/                   # Mongoose schemas
```

---

## 🧠 Algorithms & AI Logic

### 1. BMI / BMR / TDEE Calculation (`lib/bmiCalculator.ts`)

| Metric | Formula |
|--------|---------|
| **BMI** | `weight(kg) / height(m)²` |
| **BMR (Men)** | `66.5 + 13.75w + 5.003h − 6.755a` (Harris-Benedict) |
| **BMR (Women)** | `655.1 + 9.563w + 1.850h − 4.676a` |
| **TDEE** | `BMR × 1.55` (moderate activity factor) |

### 2. Calorie & Macro Targets (`lib/bmiCalculator.ts`)

Targets are adjusted dynamically based on the user's **health goals** from onboarding:

| Health Goal | TDEE Multiplier | Protein | Carbs | Fat |
|-------------|-----------------|---------|-------|-----|
| ลดน้ำหนัก | ×0.80 (deficit) | 30% | 40% | 30% |
| สร้างกล้ามเนื้อ | ×1.10 (surplus) | 35% | 45% | 20% |
| รักษาสุขภาพ / อื่นๆ | ×1.00 | 25% | 50% | 25% |

Macro grams: Protein & Carbs = `(cal × pct) / 4`, Fat = `(cal × pct) / 9`

### 3. Meal Set Recommendation Scoring (`lib/mealRecommender.ts`)

Each meal set is scored out of **100 points** across 4 criteria:

| Criteria | Max Score | Logic |
|----------|-----------|-------|
| **BMI Match** | 30 | `targetBmi` matches user's BMI category → 30, 1 step away → 10, 2 → 0 |
| **Calorie Fit** | 30 | % deviation of set calories vs. calorie target: ≤5% → 30, ≤15% → 20, ≤30% → 10 |
| **Macro Balance** | 20 | Average deviation of protein/carbs/fat vs. targets: ≤10% → 20, ≤25% → 15, ≤40% → 8 |
| **Goal Alignment** | 20 | Goal-specific checks (e.g. ลดน้ำหนัก → low cal, สร้างกล้ามเนื้อ → high protein) |

Sets are sorted by score, displayed with progress bar + human-readable Thai reasons.

### 4. Box Size Recommendation (`lib/bmiCalculator.ts`)

| TDEE Range | Recommended Size | Multiplier |
|------------|-----------------|------------|
| ≤ 1,800 kcal | M (ปกติ) | ×1.0 |
| 1,801 – 2,200 kcal | L (ใหญ่) | ×1.3 |
| > 2,200 kcal | XL (พิเศษ) | ×1.6 |

The multiplier scales both the ingredient quantities and the price.

### 5. AI Daily Menu (`api/user/daily-menu`)

- Filters recipes whose ingredients are all available in the user's meal set box
- Uses a **deterministic date-based seed** (hash of `YYYY-MM-DD + mealType + mealSetId`)
- Ensures **no repeat** from yesterday's menu
- Provides separate picks for breakfast (เช้า), lunch (กลางวัน), dinner (เย็น)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)

### Setup

```bash
# Clone the repository
git clone https://github.com/MarumaSan/ayura.git
cd ayura

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
NEXT_PUBLIC_PROMPTPAY_NUMBER=<your-promptpay-number>
```

### Seed Database

```bash
npx tsx scripts/seed-data.ts
```

This populates 40+ ingredients and 30+ Thai recipes into your database.

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Models

| Model | Description |
|-------|-------------|
| `User` | Profile, health data, wallet balance, role |
| `Order` | Subscription orders with status pipeline |
| `MealSet` | Curated meal boxes with ingredients and nutrition |
| `Ingredient` | Raw ingredients with nutrition per 100g and pricing |
| `Recipe` | Dishes made from ingredients for daily menu |
| `Community` | Producer communities supplying ingredients |

---

## 📝 License

This project is for educational and demonstration purposes.
