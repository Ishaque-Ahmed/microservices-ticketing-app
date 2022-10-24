import axios from 'axios';
import React from 'react';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server
    // That's how we create a preconfigured version of Axios.
    // Once we return this thing, it will be like a normal Axios client, but it will have some base URL or domain wired up to it, and we'll also have some headers wired up to it as well.
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // We are on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
// We are on the server
// request should be made to http://ingress-nginx-controller.ingress-nginx.svc.cluster.local
// http://SERVICENAME.NAMESPACE.svc.cluster.local
