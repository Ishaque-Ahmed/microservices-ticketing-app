import { TicketUpdatedEvent } from '@ishaque-ahmed/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../NatsWrapper';
import { TicketUpdatedListener } from '../ticketUpdatedListener';

const setup = async () => {
  // Create a listener

  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and Save a ticket

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test-title',
    price: 99,
  });
  await ticket.save();

  // Create a fake data object

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'test-update-title',
    price: 66,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake msg object

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return listener, ticket,  data, msg

  return { listener, ticket, data, msg };
};

it('finds, updates and saves a ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});
it("ack's the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Does not call ack if event has a skipped version number', async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
