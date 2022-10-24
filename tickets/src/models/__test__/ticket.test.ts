import request from 'supertest';
import { Ticket } from '../tickets';

it('Implements Optimistic Concurrency Control', async () => {
  // Create an instance of a ticket

  const ticket = Ticket.build({
    title: 'test-title',
    price: 10,
    userId: '12sdtf234',
  });

  // save the ticket to DB

  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the fetched ticket
  firstInstance!.set({ price: 20 });
  secondInstance!.set({ price: 30 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
});

it('Increments the version number on multiple saves', async () => {
  // Create an instance of a ticket

  const ticket = Ticket.build({
    title: 'test-title',
    price: 10,
    userId: '12sdtf234',
  });
  // save the ticket to DB

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
