import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@ishaque-ahmed/common';

import { body } from 'express-validator';
import { User } from '../models/user';
import { Password } from '../services/Password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Provide a valid email!'),
    body('password').trim().notEmpty().withMessage('Provide a valid password!'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // Store it in Session Object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
