import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('Returns a 404 if a ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});
it('Returns a ticket if a ticket is found', async () => {
  const title = 'test-ticket';
  const price = 100;
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
