import request from 'supertest';
import { app } from '../../app';

it('fails when provided email does not exists.', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test2@test.com',
      password: 'password',
    })
    .expect(400);
});
it('fails when provided password is incorrect.', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'passwor',
    })
    .expect(400);
});
it('response with a cookie when provided valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
  const res = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);
  expect(res.get('Set-Cookie')).toBeDefined();
});
