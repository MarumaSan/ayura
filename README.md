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
├── lib/                      # MongoDB connection, BMI calculator
└── models/                   # Mongoose schemas
```

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
