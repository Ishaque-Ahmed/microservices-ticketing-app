import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: () => string[];
}
jest.mock('../NatsWrapper');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'for_testing';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});
beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = () => {
  // Build a JSONWEBTOKEN payload. {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JSONWEBTOKEN
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build Session Object. {jwt: myjwt}
  const session = { jwt: token };

  // Turn that Session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it to base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return a string - cookie and with the encoded data
  return [`session=${base64}`];
};
