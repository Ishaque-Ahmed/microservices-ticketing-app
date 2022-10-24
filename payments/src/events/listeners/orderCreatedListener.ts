import { Listener, OrderCreatedEvent, Subjects } from '@ishaque-ahmed/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
    });
    await order.save();

    msg.ack();
  }
}
