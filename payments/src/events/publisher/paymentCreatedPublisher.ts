import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@ishaque-ahmed/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
