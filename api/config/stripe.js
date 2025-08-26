const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51RaGoQ2VkcltvotRpOimE7KbFF8RQkbNlHF4jFJ4UVljkJNSXKSdQ0Uwqka22wwH32u8yPrX7GjNlGbQMduTLVRI00pgoIbsb6';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51RaGoQ2VkcltvotRkmS6xRfLm6jY4IzkM5enRuRK6OE0SnpxW8ESD8hHEToJrdQnEEp3o8DEaOdifTTFd3NiF7Rb00QOkZagkm';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest stable version
  typescript: true,
});

module.exports = {
  stripe,
  STRIPE_PUBLISHABLE_KEY,
};
