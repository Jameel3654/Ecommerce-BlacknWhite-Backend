import Stripe from 'stripe';
import { env } from '../../../config/env.js';
import { ApiError } from '../../../utils/ApiError.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const MIN_CARD_AMOUNT_PKR = 150;

export class StripeProvider {
  async createPaymentIntent(order) {
    if (!stripe) {
      throw new ApiError(500, 'Stripe is not configured');
    }

    if (order.currency?.toUpperCase() === 'PKR' && Number(order.totalAmount) < MIN_CARD_AMOUNT_PKR) {
      throw new ApiError(400, `Card payment requires a minimum order total of PKR ${MIN_CARD_AMOUNT_PKR}. Please use Cash on Delivery for smaller orders.`);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: String(order.id || ''),
        customerEmail: order.customerEmail,
      },
      automatic_payment_methods: { enabled: true },
    });

    return {
      provider: 'stripe',
      status: paymentIntent.status,
      amount: order.totalAmount,
      currency: order.currency,
      clientSecret: paymentIntent.client_secret,
      metadata: paymentIntent.metadata,
    };
  }
}
