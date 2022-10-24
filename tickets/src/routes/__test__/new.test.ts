import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../NatsWrapper';

it('Has a route handler listening to /api/tickets for post requests', async () => {
  const res = await request(app).post('/api/tickets').send({});
  expect(res.status).not.toEqual(404);
});

it('Can be accessed if user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('Returns a status other than 401 if user is signed in', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .send({})
    .set('Cookie', global.signin());
  expect(res.status).not.toEqual(401);
});

it('Returns an error if an invalid title is provide', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});
it('Returns an error if an invalid price is provide', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
      price: -10,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'title',
    })
    .expect(400);
});
it('Creates a ticket with valid inputs', async () => {
  // Add in a check to make sure a ticket was saved

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'test-ticket';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 100,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(100);
  expect(tickets[0].title).toEqual('test-ticket');
});

it('Publishes an Event', async () => {
  const title = 'test-ticket';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 100,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
