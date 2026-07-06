export class CodProvider {
  async createPaymentIntent(order) {
    return {
      provider: 'cod',
      status: 'pending_cash_collection',
      amount: order.totalAmount,
      currency: order.currency,
      clientSecret: null,
      metadata: {
        note: 'Cash will be collected on delivery.',
      },
    };
  }
}
