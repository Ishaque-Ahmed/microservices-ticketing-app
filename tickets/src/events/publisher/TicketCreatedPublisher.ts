import { Publisher, Subjects, TicketCreatedEvent } from '@ishaque-ahmed/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
