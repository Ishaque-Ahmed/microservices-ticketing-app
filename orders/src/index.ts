import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './NatsWrapper';
import { TicketCreatedListener } from './events/listeners/ticketCreatedListener';
import { TicketUpdatedListener } from './events/listeners/ticketUpdatedListener';
import { ExpirationCompleteListener } from './events/listeners/expirationCompleteListener';
import { PaymentCreatedListener } from './events/listeners/paymentCreatedListener';

const start = async () => {
  console.log('Starting......');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY not found!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not found!');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID not found!');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID not found!');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL not found!');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed.');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Orders: Connected To mongodb....');
  } catch (err) {
    console.log(err);
  }
  app.listen(4000, () => {
    console.log('Orders Server running on port 4000....!!!!');
  });
};

start();
