import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsProvider } from '../../state/SettingsContext';
import { AboutScreen } from './AboutScreen';

function renderAbout() {
  return render(
    <SettingsProvider>
      <AboutScreen />
    </SettingsProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('AboutScreen', () => {
  it('shows the Open Source section with the GitHub link', () => {
    renderAbout();
    expect(screen.getByRole('heading', { name: 'Open Source' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/jenslohmann/ShotokanKata',
    );
  });

  it('switches the UI language to Danish', () => {
    renderAbout();
    fireEvent.click(screen.getByRole('tab', { name: 'Dansk' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Om' })).toBeInTheDocument();
    expect(localStorage.getItem('sk.lang')).toBe('da');
    expect(document.documentElement.lang).toBe('da');
  });
});
