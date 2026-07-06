import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { CodProvider } from './providers/cod.provider.js';
import { StripeProvider } from './providers/stripe.provider.js';

export const getPaymentProvider = (providerName = env.PAYMENT_PROVIDER) => {
  switch (providerName) {
    case 'cod':
      return new CodProvider();
    case 'stripe':
      return new StripeProvider();
    default:
      throw new ApiError(400, `Unsupported payment provider: ${providerName}`);
  }
};
