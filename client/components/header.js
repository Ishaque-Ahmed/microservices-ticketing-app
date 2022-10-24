import React from 'react';
import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && {
      label: 'SignUp',
      href: '/auth/signup',
    },
    !currentUser && {
      label: 'SignIn',
      href: '/auth/signin',
    },
    currentUser && {
      label: 'SignOut',
      href: '/auth/signout',
    },
    currentUser && {
      label: 'Sell Ticket',
      href: '/tickets/new',
    },
    currentUser && {
      label: 'My Orders',
      href: '/orders',
    },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      return (
        <li key={href} className="nav-item">
          <Link href={href}>
            <a className="nav-link">{label}</a>
          </Link>
        </li>
      );
    });

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <Link href="/">
          <a className="navbar-brand">Ticketing</a>
        </Link>

        <div className="d-flex justify-content-end text-white">
          <ul className="nav d-flex align-items-center">{links}</ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
