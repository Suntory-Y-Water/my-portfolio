import React from 'react';

function Footer() {
  return (
    <footer className='pt-12 py-8 text-center'>
      <span>© {new Date().getFullYear()} Sui</span>
    </footer>
  );
}

export default Footer;
