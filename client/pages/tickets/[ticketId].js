import Router from 'next/router';
import React from 'react';
import useRequest from '../../hooks/useRequest';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: `/api/orders`,
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div className="p-4" style={{ width: '50%' }}>
      <div className="card p-2">
        <p>
          Ticket Title: <strong>{ticket.title}</strong>
        </p>
        <p>
          Ticket Price: <strong>{ticket.price}</strong>
        </p>
        {errors}
        <button onClick={() => doRequest()} className="btn btn-success btn-sm">
          purchase
        </button>
      </div>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;

  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return {
    ticket: data,
  };
};

export default TicketShow;
