import { Publisher, Subjects, TicketUpdatedEvent } from '@ishaque-ahmed/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
