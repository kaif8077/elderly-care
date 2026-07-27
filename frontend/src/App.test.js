import { useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

test('main navigation uses Ant Design without the legacy hard CSS', () => {
  const source = fs.readFileSync(path.join(__dirname, 'components', 'Navbar.js'), 'utf8');
  expect(source).toContain('Header');
  expect(source).toContain('Drawer');
  expect(source).toContain('Dropdown');
  expect(source).toContain('Menu');
  expect(source).not.toContain("Navbar.css");
  expect(fs.existsSync(path.join(__dirname, 'components', 'Navbar.css'))).toBe(false);
});

test('home page uses responsive Ant Design sections without legacy CSS', () => {
  const source = fs.readFileSync(path.join(__dirname, 'pages', 'Home.js'), 'utf8');
  expect(source).toContain('THE PROBLEM WE SOLVE');
  expect(source).toContain('How ElderlyCare helps');
  expect(source).toContain('<Collapse');
  expect(source).toContain('<Row');
  expect(source).not.toContain("Home.css");
  expect(fs.existsSync(path.join(__dirname, 'pages', 'Home.css'))).toBe(false);
});

test('public information pages use Ant Design without legacy page CSS', () => {
  const pages = ['About', 'Services', 'Contact'];
  pages.forEach((page) => {
    const source = fs.readFileSync(path.join(__dirname, 'pages', `${page}.js`), 'utf8');
    expect(source).toContain("from 'antd'");
    expect(source).not.toContain(`${page}.css`);
    expect(fs.existsSync(path.join(__dirname, 'pages', `${page}.css`))).toBe(false);
  });
  const contact = fs.readFileSync(path.join(__dirname, 'pages', 'Contact.js'), 'utf8');
  expect(contact).toContain('submitContactForm');
  expect(contact).toContain('submitFeedbackForm');
  expect(contact).toContain('<Rate />');
});

test('public pages share the three-image carousel and dark footer', () => {
  const hero = fs.readFileSync(path.join(__dirname, 'components', 'PublicPageHero.js'), 'utf8');
  const footer = fs.readFileSync(path.join(__dirname, 'components', 'PublicFooter.js'), 'utf8');
  expect(hero).toContain("banner1.jpg");
  expect(hero).toContain("banner2.jpg");
  expect(hero).toContain("banner3.jpg");
  expect(hero).toContain('<Carousel autoplay');
  expect(footer).toContain("background: '#1f2937'");
  ['Home', 'About', 'Services', 'Contact'].forEach((page) => {
    const source = fs.readFileSync(path.join(__dirname, 'pages', `${page}.js`), 'utf8');
    expect(source).toContain('<PublicPageHero');
    expect(source).toContain('<PublicFooter');
  });
});

test('secondary public pages use the single about hero and About omits the team section', () => {
  ['About', 'Services', 'Contact'].forEach((page) => {
    const source = fs.readFileSync(path.join(__dirname, 'pages', `${page}.js`), 'utf8');
    expect(source).toContain("about-hero.jpg");
    expect(source).toContain('image={aboutHero}');
  });
  const about = fs.readFileSync(path.join(__dirname, 'pages', 'About.js'), 'utf8');
  expect(about).not.toContain('THE PROJECT TEAM');
  expect(about).not.toContain('People behind ElderlyCare');
  const services = fs.readFileSync(path.join(__dirname, 'pages', 'Services.js'), 'utf8');
  expect(services).toContain('title="All services"');
  expect(services).toContain('selectedKeys={[activeId]}');
  expect(services).toContain('activeService.image');
});

test('admin navigation exposes only the requested five modules', () => {
  const sidebar = fs.readFileSync(path.join(__dirname, 'admin', 'components', 'AdminSidebar.js'), 'utf8');
  ['Dashboard', 'Users', 'Audit Logs', 'Feedback', 'Contact Us'].forEach((label) => expect(sidebar).toContain(`label: '${label}'`));
  ['Medical Profiles', 'Reports', 'ID Cards', 'QR Management', 'Emergency Alerts', 'Documents'].forEach((label) => expect(sidebar).not.toContain(`label: '${label}'`));
  const app = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
  expect(app).toContain('path="contacts"');
  expect(app).toContain('path="feedback"');
  ['AdminUsers', 'AdminAuditLogs'].forEach((page) => {
    const source = fs.readFileSync(path.join(__dirname, 'admin', 'pages', `${page}.js`), 'utf8');
    expect(source).toContain('<Table');
    expect(source).toContain("from 'antd'");
    expect(source).not.toContain('<table');
  });
});
