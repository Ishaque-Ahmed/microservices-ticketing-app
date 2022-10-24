import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from '@ishaque-ahmed/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
