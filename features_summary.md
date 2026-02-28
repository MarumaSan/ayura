# Ayura Project: Feature Summary Report
**Date:** March 2026
**Subject:** Overview of Implemented Features for Health Box & Meal Plan System

---

## 🍃 1. Core Platform & User Experience
*   **Modern Design System:** Developed using Vanilla CSS with a focus on premium aesthetics, including glassmorphism, vibrant color palettes, and smooth micro-animations.
*   **Responsive Layout:** Fully optimized for mobile and desktop experiences.
*   **Onboarding Flow:** Interactive health assessment to capture user metrics (height, weight, age, gender) for personalized health tracking.

## 📊 2. Personalized Health Intelligence
*   **BMI & TDEE Calculator:** Integrated Harris-Benedict formula and activity factor (1.55) to provide accurate health insights.
*   **Health Recommendations:** 
    *   **Meal Sets:** Smart badges identifying sets "Recommended for you" based on BMI category.
    *   **Box Sizes:** TDEE-based size recommendations (M, L, XL) to ensure users reach their nutritional goals.

## 📦 3. Advanced Meal Plan Subscription (3-Step Flow)
*   **Step 1: Meal Set Selection:** Curated sets like "Weight Loss", "Health Care", and "Muscle Gain" with transparent nutritional averages.
*   **Step 2: Box Size Customization:** Dynamic multipliers (1.0x, 1.3x, 1.6x) for ingredients and pricing.
*   **Step 3: Flexible Duration:** Toggle between Weekly and Monthly plans with auto-calculated discounts (up to 10%) for long-term commitments.

## ⚖️ 4. Dynamic Nutrition & Pricing Engine
*   **Scaling Logic:** Nutritional values (Calories, Protein, Carbs, Fats) and ingredient weights update in real-time as users modify their plan options.
*   **Standardized Database:** Uniform nutritional standards (per 100g) across all ingredients to ensure calculation accuracy.

## 🛒 5. Integrated Smart Checkout
*   **Real-time Synchronization:** Seamlessly links selection data (Set, Size, Duration) to the final payment page.
*   **Transparent Transparency:** Detailed breakdown of weekly box contents with exact weights adjusted by the size multiplier.
*   **Order Tracking:** Post-checkout success visualization with unique order identification.

## 🏠 6. Interactive Member Dashboard
*   **Subscription Persistence:** Dynamic UI changes based on active plan status.
*   **Box Content Viewer:** Real-time visibility into the current week's ingredients and their specific community origins.
*   **AI Recipe Integration:** Suggested recipes mapped directly to the ingredients currently in the user's box.

## 💎 7. Gamified Health Economy
*   **Ayura Points System:** Rewards earned through purchases and health achievements.
*   **Rewards Integration:** Real-time visibility of point history and available redemption options.

## 🛠️ 8. Technical Architecture
*   **Backend:** Robust API infrastructure using Next.js Server Actions and Routes.
*   **Database:** MongoDB integration for persistent user profiles, orders, meal sets, and ingredients.
*   **State Management:** Optimized use of LocalStorage for cross-page data persistence without sacrificing performance.

---
*Ayura — Embracing Nature, Enhancing Life.*
