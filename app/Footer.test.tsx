import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import React from 'react';

describe('Test Footer Component', () => {
  it('renders the current year', () => {
    render(<Footer />);
    expect(screen.getByText(`© ${new Date().getFullYear()} Sui`)).toBeInTheDocument();
  });
});
