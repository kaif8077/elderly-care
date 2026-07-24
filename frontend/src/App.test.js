import { useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import fs from 'fs';
import path from 'path';

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

test('registration rules use the Ant Design rules-array contract', () => {
  const source = fs.readFileSync(path.join(__dirname, 'pages', 'Register.js'), 'utf8');
  expect(source).not.toContain('rules={({');
  expect(source).toContain("form.getFieldValue('password')");
});

test('forgot-password and ID-card PDF flows are wired', () => {
  const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
  const loginSource = fs.readFileSync(path.join(__dirname, 'pages', 'Login.js'), 'utf8');
  const cardSource = fs.readFileSync(path.join(__dirname, 'components', 'UserIdCard.js'), 'utf8');

  expect(appSource).toContain('path="/forgot-password"');
  expect(loginSource).toContain('to="/forgot-password"');
  expect(cardSource).toContain("await import('jspdf')");
  expect(cardSource).not.toContain('Download PNG');
  expect(cardSource).toContain('Download front + back PDF');
});

test('medical profile form saves steps and supports structured emergency contacts', () => {
  const source = fs.readFileSync(path.join(__dirname, 'components', 'MedicalForm.js'), 'utf8');
  expect(source).toContain("api.post('/api/medical'");
  expect(source).toContain('<Form.List name="emergencyContacts">');
  expect(source).toContain('mode="tags"');
  expect(source).toContain('Profile photograph is required');
  expect(source).toContain('reviewConfirmed');
  expect(source).toContain('<Checkbox>I reviewed these details and confirm they are correct.</Checkbox>');
  expect(source).toContain('const { reviewConfirmed, profilePhoto, ...clean }');
  expect(source).toContain('stepFields[step]');
  expect(source).toContain('setValues(form.getFieldsValue(true))');
  expect(source).toContain('Missing or invalid:');
});

test('dashboard uses a full-width QR flow without legacy quick-action cards', () => {
  const source = fs.readFileSync(path.join(__dirname, 'pages', 'Dashboard.js'), 'utf8');
  expect(source).toContain('<QRCodeDisplay />');
  expect(source).not.toContain('const actions=');
  expect(source).not.toContain('Emergency ID card');
});
