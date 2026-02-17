import { getUncachableStripeClient } from './stripeClient';

async function seedStripeProducts() {
  const stripe = await getUncachableStripeClient();

  const existing = await stripe.products.list({ limit: 100 });
  if (existing.data.length > 0) {
    console.log(`Found ${existing.data.length} existing products, skipping seed.`);
    return;
  }

  console.log('Creating Stripe products...');

  const goPlus = await stripe.products.create({
    name: 'Go+',
    description: 'See more, connect more. Unlimited interactions, see who viewed your profile, 1 free Boost per month, and advanced filters.',
    metadata: { tier: 'go-plus', type: 'subscription' },
  });
  await stripe.prices.create({ product: goPlus.id, unit_amount: 299, currency: 'usd', recurring: { interval: 'week' }, metadata: { period: 'weekly' } });
  await stripe.prices.create({ product: goPlus.id, unit_amount: 799, currency: 'usd', recurring: { interval: 'month' }, metadata: { period: 'monthly' } });
  await stripe.prices.create({ product: goPlus.id, unit_amount: 1999, currency: 'usd', recurring: { interval: 'month', interval_count: 6 }, metadata: { period: '6month' } });
  console.log('Created Go+ with prices');

  const goPremium = await stripe.products.create({
    name: 'Go Premium',
    description: 'The ultimate Social Go experience. Everything in Go+ plus priority profile, message anyone nearby, see who is interested, 3 free Boosts per month, and 5 Shoutouts per week.',
    metadata: { tier: 'go-premium', type: 'subscription', popular: 'true' },
  });
  await stripe.prices.create({ product: goPremium.id, unit_amount: 499, currency: 'usd', recurring: { interval: 'week' }, metadata: { period: 'weekly' } });
  await stripe.prices.create({ product: goPremium.id, unit_amount: 1299, currency: 'usd', recurring: { interval: 'month' }, metadata: { period: 'monthly' } });
  await stripe.prices.create({ product: goPremium.id, unit_amount: 3999, currency: 'usd', recurring: { interval: 'month', interval_count: 6 }, metadata: { period: '6month' } });
  console.log('Created Go Premium with prices');

  const boost1 = await stripe.products.create({ name: '1 Boost', description: '30 min of visibility', metadata: { type: 'boost', quantity: '1' } });
  await stripe.prices.create({ product: boost1.id, unit_amount: 249, currency: 'usd', metadata: { type: 'boost' } });

  const boost5 = await stripe.products.create({ name: '5 Boosts', description: 'Best for a night out', metadata: { type: 'boost', quantity: '5', popular: 'true' } });
  await stripe.prices.create({ product: boost5.id, unit_amount: 749, currency: 'usd', metadata: { type: 'boost' } });

  const boost10 = await stripe.products.create({ name: '10 Boosts', description: 'Stay visible all week', metadata: { type: 'boost', quantity: '10' } });
  await stripe.prices.create({ product: boost10.id, unit_amount: 1249, currency: 'usd', metadata: { type: 'boost' } });
  console.log('Created Boost products');

  const shoutout1 = await stripe.products.create({ name: '1 Shoutout', metadata: { type: 'shoutout', quantity: '1' } });
  await stripe.prices.create({ product: shoutout1.id, unit_amount: 199, currency: 'usd', metadata: { type: 'shoutout' } });

  const shoutout3 = await stripe.products.create({ name: '3 Shoutouts', metadata: { type: 'shoutout', quantity: '3' } });
  await stripe.prices.create({ product: shoutout3.id, unit_amount: 499, currency: 'usd', metadata: { type: 'shoutout' } });

  const shoutout5 = await stripe.products.create({ name: '5 Shoutouts', metadata: { type: 'shoutout', quantity: '5', popular: 'true' } });
  await stripe.prices.create({ product: shoutout5.id, unit_amount: 749, currency: 'usd', metadata: { type: 'shoutout' } });

  const shoutout15 = await stripe.products.create({ name: '15 Shoutouts', metadata: { type: 'shoutout', quantity: '15' } });
  await stripe.prices.create({ product: shoutout15.id, unit_amount: 1749, currency: 'usd', metadata: { type: 'shoutout' } });
  console.log('Created Shoutout products');

  const tokens50 = await stripe.products.create({ name: '50 Tokens', metadata: { type: 'tokens', quantity: '50' } });
  await stripe.prices.create({ product: tokens50.id, unit_amount: 249, currency: 'usd', metadata: { type: 'tokens' } });

  const tokens150 = await stripe.products.create({ name: '150 Tokens', description: '+25 free', metadata: { type: 'tokens', quantity: '150', bonus: '25' } });
  await stripe.prices.create({ product: tokens150.id, unit_amount: 599, currency: 'usd', metadata: { type: 'tokens' } });

  const tokens500 = await stripe.products.create({ name: '500 Tokens', description: '+100 free', metadata: { type: 'tokens', quantity: '500', bonus: '100', popular: 'true' } });
  await stripe.prices.create({ product: tokens500.id, unit_amount: 1499, currency: 'usd', metadata: { type: 'tokens' } });

  const tokens1200 = await stripe.products.create({ name: '1200 Tokens', description: '+300 free', metadata: { type: 'tokens', quantity: '1200', bonus: '300' } });
  await stripe.prices.create({ product: tokens1200.id, unit_amount: 2999, currency: 'usd', metadata: { type: 'tokens' } });
  console.log('Created Token products');

  console.log('All Stripe products created successfully!');
}

seedStripeProducts().catch(console.error);
