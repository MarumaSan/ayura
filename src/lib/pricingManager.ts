import { SubscriptionTier, WeeklyBox } from './types';

/**
 * Handles the calculation of prices, discounts, and delivery fees for subscriptions.
 * It uses the actual total price of a weekly box to dynamically calculate subscription costs.
 */
export class PricingManager {
    private baseWeeklyPrice: number;
    private deliveryFee: number = 50;
    private monthlyDiscountRate: number = 0.1; // 10% discount

    constructor(weeklyBox: WeeklyBox | null | undefined) {
        // Fallback to a default price if no box is provided yet, though theoretically a box should always be calculated first
        this.baseWeeklyPrice = weeklyBox?.totalPrice || 280;
    }

    /**
     * Gets the price of the ingredients for a single week
     */
    getWeeklyPrice(): number {
        return this.baseWeeklyPrice;
    }

    /**
     * Gets the raw price for 4 weeks of ingredients
     */
    getMonthlyPrice(): number {
        return this.baseWeeklyPrice * 4;
    }

    /**
     * Gets the delivery fee per shipment/billing cycle
     */
    getDeliveryFee(): number {
        return this.deliveryFee;
    }

    /**
     * Calculates the discount amount based on the selected tier
     */
    getDiscountAmount(tier: SubscriptionTier): number {
        if (tier === 'monthly') {
            const totalBeforeDiscount = this.getMonthlyPrice() + this.getDeliveryFee();
            return Math.round(totalBeforeDiscount * this.monthlyDiscountRate);
        }
        return 0;
    }

    /**
     * Calculates the final total price to be paid, including delivery and discounts
     */
    getTotalPrice(tier: SubscriptionTier): number {
        if (tier === 'weekly') {
            return this.getWeeklyPrice() + this.getDeliveryFee();
        } else if (tier === 'monthly') {
            const totalBeforeDiscount = this.getMonthlyPrice() + this.getDeliveryFee();
            return totalBeforeDiscount - this.getDiscountAmount(tier);
        }
        return 0;
    }

    /**
     * Formats a given price with the currency symbol
     */
    static formatCurrency(amount: number): string {
        return `${amount.toLocaleString()} ฿`;
    }

    /**
     * Gets the formatted total price for a given tier
     */
    getFormattedTotalPrice(tier: SubscriptionTier): string {
        return PricingManager.formatCurrency(this.getTotalPrice(tier));
    }
}
