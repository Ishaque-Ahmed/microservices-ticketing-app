import { natsWrapper } from '../../../NatsWrapper';
import { TicketCreatedListener } from '../ticketCreatedListener';
import { TicketCreatedEvent } from '@ishaque-ahmed/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener

  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event

  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test-title',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    msg,
  };
};
it('Creates and Saves a Ticket', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with data Object and msg Object

  await listener.onMessage(data, msg);

  // Write assertions to make sure a ticket was created

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("Ack' ths message", async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function with data Object and msg Object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
});
