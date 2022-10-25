import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log('Starting up Auth Service: ');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY not found!');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not found!');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Auth: Connected To mongodb....');
  } catch (err) {
    console.log(err);
  }
  app.listen(4000, () => {
    console.log('Auth Server running on port 4000....!!!!');
  });
};

start();
