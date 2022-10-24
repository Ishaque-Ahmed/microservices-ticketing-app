import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from '@ishaque-ahmed/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
