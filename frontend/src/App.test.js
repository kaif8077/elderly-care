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
  expect(cardSource).toContain('Download ID card PDF');
  expect(cardSource).not.toContain('backRef');
  expect(cardSource).not.toContain('pdf.addPage');
  expect(cardSource).toContain('width: 856');
  expect(cardSource).toContain("pdf.output('blob')");
  expect(cardSource).toContain("classList.add('pdf-capture')");
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
  expect(source).not.toContain('Open my profile');
  const qrSource = fs.readFileSync(path.join(__dirname, 'components', 'QRCodeDisplay.js'), 'utf8');
  expect(qrSource).not.toContain('The QR contains a secure access link, not your complete medical record.');
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
  expect(contact).toContain('name="phone"');
  expect(contact).not.toContain('submitFeedbackForm');
  expect(contact).not.toContain('Do not use this page for an active medical emergency');
});

test('home uses two restored banners while secondary pages keep a single image', () => {
  const hero = fs.readFileSync(path.join(__dirname, 'components', 'PublicPageHero.js'), 'utf8');
  const footer = fs.readFileSync(path.join(__dirname, 'components', 'PublicFooter.js'), 'utf8');
  expect(hero).toContain("banner1.jpg");
  expect(hero).toContain("banner2.jpg");
  expect(hero).not.toContain("banner3.jpg");
  expect(hero).toContain('Carousel');
  expect(hero).toContain('const homeBanners = [banner1, banner2]');
  expect(hero).not.toContain('linear-gradient');
  expect(footer).toContain("background: '#1f2937'");
  expect(footer).not.toContain("logo.png");
  expect(footer).toContain('fontWeight: 800');
  expect(footer).toContain('© 2025 ElderlyCare');
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
  expect(about).toContain("about-care.jpg");
  expect(about).toContain('<Card hoverable');
  expect(about).toContain('minHeight: 500');
  expect(about).not.toContain('THE PROJECT TEAM');
  expect(about).not.toContain('People behind ElderlyCare');
  const services = fs.readFileSync(path.join(__dirname, 'pages', 'Services.js'), 'utf8');
  expect(services).toContain('title="All services"');
  expect(services).toContain('selectedKeys={[activeId]}');
  expect(services).toContain("about-hero.jpg");
  expect(services).toContain('image={aboutHero}');
  expect(services).toContain('activeService.image');
  expect(services).toContain('Secure Medical Documents');
  expect(services).toContain('service-secure-documents.jpg');
  expect(services).toContain('activeService.detail');
  expect(services).not.toContain('Create an account');
  expect(services).not.toContain('>Contact us</Button>');
  const home = fs.readFileSync(path.join(__dirname, 'pages', 'Home.js'), 'utf8');
  expect(home).toContain("why-choose-us-v2.jpg");
});

test('admin navigation retains requested modules and emergency alert monitoring', () => {
  const sidebar = fs.readFileSync(path.join(__dirname, 'admin', 'components', 'AdminSidebar.js'), 'utf8');
  ['Dashboard', 'Users', 'Emergency Alerts', 'Audit Logs', 'Contact Us'].forEach((label) => expect(sidebar).toContain(`label: '${label}'`));
  ['Feedback', 'Medical Profiles', 'Reports', 'ID Cards', 'QR Management', 'Documents'].forEach((label) => expect(sidebar).not.toContain(`label: '${label}'`));
  const app = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
  expect(app).toContain('path="contacts"');
  expect(app).toContain('path="emergency-alerts"');
  expect(app).not.toContain('path="feedback"');
  ['AdminUsers', 'AdminEmergencyAlerts', 'AdminAuditLogs'].forEach((page) => {
    const source = fs.readFileSync(path.join(__dirname, 'admin', 'pages', `${page}.js`), 'utf8');
    expect(source).toContain('<Table');
    expect(source).toContain("from 'antd'");
    expect(source).not.toContain('<table');
  });
});

test('public section eyebrow labels use h2 and descriptive titles use h6', () => {
  ['Home', 'About', 'Services', 'Contact'].forEach((page) => {
    const source = fs.readFileSync(path.join(__dirname, 'pages', `${page}.js`), 'utf8');
    expect(source).not.toContain('<Text className="care-eyebrow">');
    expect(source).toContain('<Title level={2} className="care-eyebrow">');
  });

  const contact = fs.readFileSync(path.join(__dirname, 'pages', 'Contact.js'), 'utf8');
  expect(contact).toContain('<h6 className="care-section-heading care-secondary-heading">Talk to the ElderlyCare team</h6>');
  expect(contact).not.toContain('level={6}');
});

test('reports are hidden from the member profile and admin routes', () => {
  const app = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
  const profile = fs.readFileSync(path.join(__dirname, 'pages', 'Profile.js'), 'utf8');
  const adminUser = fs.readFileSync(path.join(__dirname, 'admin', 'pages', 'AdminUserDetail.js'), 'utf8');

  expect(profile).not.toContain('Latest medical report');
  expect(profile).not.toContain('/api/medical-reports/latest');
  expect(app).not.toContain('path="reports" element={<AdminReports');
  expect(adminUser).not.toContain("'Reports'");
  expect(adminUser).not.toContain('Saved reports');
});

test('public emergency profile uses a mobile safe view with location alerts and first-aid safety', () => {
  const source = fs.readFileSync(path.join(__dirname, 'pages', 'EmergencyProfile.js'), 'utf8');
  expect(source).toContain('Fetching Data');
  expect(source).toContain('Retrieving secure information');
  expect(source).toContain('>Verified</Tag>');
  expect(source).not.toContain('ElderlyCare safe view');
  expect(source).not.toContain('Only emergency-safe information is shown');
  expect(source).toContain('Emergency Help');
  expect(source).toContain('Generate First Aid & Medication Guidance');
  expect(source).toContain('navigator.geolocation.getCurrentPosition');
  expect(source).toContain('locationAccuracy');
  expect(source).toContain('Send Emergency Email Alert');
  expect(source).not.toContain('Situation type');
  expect(source).not.toContain('Your name (optional)');
  expect(source).not.toContain('Situation message (optional)');
  expect(source).not.toContain('Current location is ready to share');
  expect(source).toContain('Name (optional)');
  expect(source).toContain('Phone (optional)');
  expect(source).toContain('Message (optional)');
  expect(source).toContain('loadingProgress');
  expect(source).not.toContain('percent={75}');
  expect(source).not.toContain('Show this list and available medicine packaging');
  expect(source).not.toContain('This guidance does not replace emergency services');
  expect(source).toContain("responseType: 'blob'");
  expect(source).toContain('URL.createObjectURL');
});

test('member profile uses a responsive Ant Design desktop summary without removing core modules', () => {
  const source = fs.readFileSync(path.join(__dirname, 'pages', 'Profile.js'), 'utf8');
  expect(source).toContain('<Row gutter={[20, 20]}');
  expect(source).toContain('Health information');
  expect(source).toContain('Emergency contact');
  expect(source).toContain('Profile resources');
  expect(source).toContain('<Collapse items={detailItems}');
  expect(source).toContain('<Recommendations />');
  expect(source).toContain('<UserIdCard');
  expect(source).toContain('<MedicalDocuments />');
});
