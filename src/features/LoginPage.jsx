import { useMemo, useState } from 'react';
import { Eye, EyeOff, Globe2 } from 'lucide-react';
import { useDemoStore } from '../demo/demoStore.js';

// 登录页默认值按线上截图填充，方便 UI 测试时直接验证“正确账号”路径。
const LOGIN_DEFAULTS = {
  country: '+1 United States of America',
  email: 'inoxsmartadmin@unisonhardware.com',
  password: 'Unison5861!',
  partnerCode: 'PNCODE',
  rememberMe: true,
  agreementsAccepted: true,
};

// 前端 demo 的本地校验规则：暂不接后端，但保留与真实登录一致的错误分支。
const LOGIN_RULES = {
  email: 'inoxsmartadmin@unisonhardware.com',
  password: 'Unison5861!',
  partnerCode: 'PNCODE',
};

export function LoginPage() {
  const setAuthStatus = useDemoStore((state) => state.setAuthStatus);
  const [values, setValues] = useState(LOGIN_DEFAULTS);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 表单校验独立成 memo，便于后续替换为真实接口返回的错误状态。
  const errors = useMemo(() => {
    const nextErrors = {};
    if (values.email.trim().toLowerCase() !== LOGIN_RULES.email) {
      nextErrors.email = 'Please enter the demo login email.';
    }
    if (values.password !== LOGIN_RULES.password) {
      nextErrors.password = 'Password does not match the demo account.';
    }
    if (values.partnerCode.trim().toUpperCase() !== LOGIN_RULES.partnerCode) {
      nextErrors.partnerCode = 'Partner Code must be PNCODE.';
    }
    if (!values.rememberMe || !values.agreementsAccepted) {
      nextErrors.agreements = 'Please check both login agreements.';
    }
    return nextErrors;
  }, [values]);

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!Object.keys(errors).length) {
      // 登录成功后仅切换 demo 登录态，当前路由和 UI 版本保持不变。
      setAuthStatus('loggedIn');
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Property preview" />
      <section className="login-panel" aria-label="INOX Smart sign in">
        <button className="login-language" type="button" aria-label="Language">
          <Globe2 size={28} />
        </button>
        <form className="login-form" onSubmit={handleSubmit}>
          <img className="login-logo-image" src="/reference-assets/login/inox-smart-logo.png" alt="INOX Smart" />
          <h1>Welcome</h1>
          <p className="login-contact">Don't have an account? <a href="#contact">Contact Us</a></p>

          <label className="login-field">
            <span>Country/Region</span>
            <select value={values.country} onChange={(event) => updateValue('country', event.target.value)}>
              <option>+1 United States of America</option>
              <option>+86 China</option>
              <option>+1 Canada</option>
            </select>
          </label>

          <label className="login-field">
            <span>Account Login Email</span>
            <input
              value={values.email}
              onChange={(event) => updateValue('email', event.target.value)}
              aria-invalid={Boolean(submitted && errors.email)}
            />
            {submitted && errors.email && <small>{errors.email}</small>}
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-password">
              <input
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={(event) => updateValue('password', event.target.value)}
                aria-invalid={Boolean(submitted && errors.password)}
              />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <a className="forgot-link" href="#forgot">Forgot Password?</a>
            {submitted && errors.password && <small>{errors.password}</small>}
          </label>

          <label className="login-field">
            <span>Partner Code</span>
            <input
              value={values.partnerCode}
              onChange={(event) => updateValue('partnerCode', event.target.value)}
              aria-invalid={Boolean(submitted && errors.partnerCode)}
            />
            {submitted && errors.partnerCode && <small>{errors.partnerCode}</small>}
          </label>

          <div className="login-checks">
            <label>
              <input
                type="checkbox"
                checked={values.rememberMe}
                onChange={(event) => updateValue('rememberMe', event.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={values.agreementsAccepted}
                onChange={(event) => updateValue('agreementsAccepted', event.target.checked)}
              />
              <span>Agree to <a href="#terms">Terms of Service</a>, <a href="#legal">Legal Statement</a>, <a href="#privacy">Privacy Statement</a></span>
            </label>
            {submitted && errors.agreements && <small>{errors.agreements}</small>}
          </div>

          <button className="login-submit" type="submit">Sign in</button>
          <p className="login-note">* Please contact your account partner if you need to acquire or change your account login email.</p>
        </form>
      </section>
    </main>
  );
}
