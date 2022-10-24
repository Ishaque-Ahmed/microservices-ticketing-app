import { OrderCreatedEvent, Publisher, Subjects } from '@ishaque-ahmed/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
