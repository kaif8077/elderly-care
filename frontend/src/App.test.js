import { useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from './context/AuthContext';

const Consumer = () => {
  const { user, login, logout } = useContext(AuthContext);
  return <div>
    <span>{user?.name || 'signed out'}</span>
    <button onClick={() => login({ name: 'Test User' })}>Login</button>
    <button onClick={logout}>Logout</button>
  </div>;
};

test('normal-user authentication state can log in and out', () => {
  render(<AuthProvider><Consumer /></AuthProvider>);
  expect(screen.getByText('signed out')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByText('Test User')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
  expect(screen.getByText('signed out')).toBeInTheDocument();
});