import './AuthShowcase.css';

const AuthBrand = ({ className = '' }) => (
  <span className={`auth-brand-lockup ${className}`.trim()} aria-label="ElderlyCare">
    <img src="/favicon.png" alt="" />
    <strong>Elderly<span>Care</span></strong>
  </span>
);

export default AuthBrand;
