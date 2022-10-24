import request from 'supertest';
import { app } from '../../app';

it('respond with details about current user', async () => {
  // const authResponse = await request(app)
  //   .post('/api/users/signup')
  //   .send({
  //     email: 'test2@test.com',
  //     password: 'password',
  //   })
  //   .expect(201);

  // const cookie = authResponse.get('Set-Cookie');
  const cookie = await global.signin();

  const res = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(res.body.currentUser.email).toEqual('test@test.com');
});

it('responds currentUser as null if not authenticated,', async () => {
  const res = await request(app)
    .get('/api/users/currentUser')
    .send()
    .expect(200);

  expect(res.body.currentUser).toEqual(null);
});
