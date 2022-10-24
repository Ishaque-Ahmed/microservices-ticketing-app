import mongoose from 'mongoose';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../NatsWrapper';
import { OrderCreatedListener } from '../orderCreatedListener';
import { OrderCreatedEvent, OrderStatus } from '@ishaque-ahmed/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener

  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket

  const ticket = Ticket.build({
    title: 'test-title',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'asdasd',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it('Sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updateTicket = await Ticket.findById(ticket.id);

  expect(updateTicket?.orderId).toEqual(data.id);
});

it("It ack's the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Publishes a Ticket Updated Event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // Accessing something inside the mock object!

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
