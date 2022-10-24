import { Listener, OrderCancelledEvent, Subjects } from '@ishaque-ahmed/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../NatsWrapper';
import { TicketUpdatedPublisher } from '../publisher/TicketUpdatedPublisher';
import { queueGroupName } from './queueGroupName';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket Not Found!');
    }
    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
    });

    msg.ack();
  }
}
