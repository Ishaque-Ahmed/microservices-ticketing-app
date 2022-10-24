import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  BadRequestError,
  validateRequest,
  OrderStatus,
} from '@ishaque-ahmed/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publisher/paymentCreatedPublisher';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

router.post(
  '/api/payments',

  requireAuth,

  [
    body('token')
      .not()
      .isEmpty()
      .withMessage('A Stripe token must be provided!'),
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('Provide OrderId to Payout the order'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order is Cancelled, Can not Pay!!');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({
      id: payment.id,
    });
  }
);

export { router as createChargeRouter };
