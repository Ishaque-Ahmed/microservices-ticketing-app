import { Listener, OrderCreatedEvent, Subjects } from '@ishaque-ahmed/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publisher/TicketUpdatedPublisher';
import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find Ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket , Throw Error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as reserved by adding OrderId Property
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      orderId: ticket.orderId,
      userId: ticket.userId,
    });

    // ack the msg
    msg.ack();
  }
}
