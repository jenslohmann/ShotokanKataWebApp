import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the title', () => {
  render(<App />);
  expect(screen.getByText('Shōtōkan Kata')).toBeInTheDocument();
});
