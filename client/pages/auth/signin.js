import React, { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

const signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    await doRequest();
  };

  return (
    <div className="container">
      <form className="p-3" onSubmit={onSubmit}>
        <h1 className="p-3">Sign in</h1>
        <div className="form-group p-3">
          <label>Email Address</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group p-3">
          <label>Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errors}
        <div className="p-3">
          <button className="btn btn-primary">Signin</button>
        </div>
      </form>
    </div>
  );
};

export default signup;
