import { ExpirationCompleteEvent, OrderStatus } from '@ishaque-ahmed/common';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../NatsWrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expirationCompleteListener';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test-title',
    price: 99,
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    ticket,
    order,
    data,
    msg,
  };
};

it('Updates the order status to Cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updateOrder = await Order.findById(order.id);

  expect(updateOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an OrderCancelled Event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("Ack's the Message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
