import mongoose from 'mongoose';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../NatsWrapper';
import { OrderCancelledEvent, OrderStatus } from '@ishaque-ahmed/common';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../orderCancelledListener';

const setup = async () => {
  // Create an instance of the listener

  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'test-title',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId });
  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, orderId, data, msg };
};

it("Updates The event, Publishes an Event, Acks's the Msg", async () => {
  const { listener, ticket, orderId, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
