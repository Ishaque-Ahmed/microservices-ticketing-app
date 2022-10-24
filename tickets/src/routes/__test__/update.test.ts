import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../NatsWrapper';
import { Ticket } from '../../models/tickets';

it('Returns a 404 if provided Id(ticket) does not exists!', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'test-update-title',
      price: 66,
    })
    .expect(404);
});

it('Returns a 401 if the user is not authenticated!', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'test-update-title',
      price: 66,
    })
    .expect(401);
});

it('Returns a 401 if the user does not own the Ticket!', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test-title',
      price: 100,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'test-update-title',
      price: 49,
    })
    .expect(401);
});

it('Returns a 400 if the user provides invalid ticket title and price!', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test-title',
      price: 100,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 49,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'test-update-title',
      price: -49,
    })
    .expect(400);
});

it('Update the ticket succesfully', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test-title',
      price: 100,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'test-update-title',
      price: 49,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('test-update-title');
  expect(ticketResponse.body.price).toEqual(49);
});

it('Publishes an Event', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test-title',
      price: 100,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'test-update-title',
      price: 49,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Rejects update if ticket is reserved', async () => {
  const cookie = global.signin();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test-title',
      price: 100,
    });

  const ticket = await Ticket.findById(res.body.id);
  ticket!.set({ orderId });

  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'test-update-title',
      price: 49,
    })
    .expect(400);
});
