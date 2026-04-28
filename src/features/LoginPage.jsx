import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LanguageMenu } from '../components/LanguageMenu.jsx';
import { useDemoStore } from '../demo/demoStore.js';
import { useI18n } from '../i18n/useI18n.js';

// Login defaults mirror the production screenshot so QA can test the happy path quickly.
// 登录页默认值按线上截图填充，方便 UI 测试时直接验证“正确账号”路径。
const LOGIN_DEFAULTS = {
  country: '+1 United States of America',
  email: 'inoxsmartadmin@unisonhardware.com',
  password: 'Unison5861!',
  partnerCode: 'PNCODE',
  rememberMe: true,
  agreementsAccepted: true,
};

// Local-only validation: keeps backend/API optional while preserving real login error branches.
// 前端 demo 的本地校验规则：暂不接后端，但保留与真实登录一致的错误分支。
const LOGIN_RULES = {
  email: 'inoxsmartadmin@unisonhardware.com',
  password: 'Unison5861!',
  partnerCode: 'PNCODE',
};

export function LoginPage() {
  const { t } = useI18n();
  const setAuthStatus = useDemoStore((state) => state.setAuthStatus);
  const [values, setValues] = useState(LOGIN_DEFAULTS);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validation is isolated so it can later be replaced by API response errors.
  // 表单校验独立成 memo，便于后续替换为真实接口返回的错误状态。
  const errors = useMemo(() => {
    const nextErrors = {};
    if (values.email.trim().toLowerCase() !== LOGIN_RULES.email) {
      nextErrors.email = t('Please enter the demo login email.');
    }
    if (values.password !== LOGIN_RULES.password) {
      nextErrors.password = t('Password does not match the demo account.');
    }
    if (values.partnerCode.trim().toUpperCase() !== LOGIN_RULES.partnerCode) {
      nextErrors.partnerCode = t('Partner Code must be PNCODE.');
    }
    if (!values.rememberMe || !values.agreementsAccepted) {
      nextErrors.agreements = t('Please check both login agreements.');
    }
    return nextErrors;
  }, [t, values]);

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!Object.keys(errors).length) {
      // Successful login only changes demo auth status; route and UI version remain stable.
      // 登录成功后仅切换 demo 登录态，当前路由和 UI 版本保持不变。
      setAuthStatus('loggedIn');
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label={t('Property preview')} />
      <section className="login-panel" aria-label={`INOX Smart ${t('Sign in')}`}>
        <LanguageMenu variant="light" />
        <form className="login-form" onSubmit={handleSubmit}>
          <img className="login-logo-image" src="/reference-assets/login/inox-smart-logo.png" alt="INOX Smart" />
          <h1>{t('Welcome')}</h1>
          <p className="login-contact">{t("Don't have an account?")} <a href="#contact">{t('Contact Us')}</a></p>

          <label className="login-field">
            <span>{t('Country/Region')}</span>
            <select value={values.country} onChange={(event) => updateValue('country', event.target.value)}>
              <option>+1 United States of America</option>
              <option>+86 China</option>
              <option>+1 Canada</option>
            </select>
          </label>

          <label className="login-field">
            <span>{t('Account Login Email')}</span>
            <input
              value={values.email}
              onChange={(event) => updateValue('email', event.target.value)}
              aria-invalid={Boolean(submitted && errors.email)}
            />
            {submitted && errors.email && <small>{errors.email}</small>}
          </label>

          <label className="login-field">
            <span>{t('Password')}</span>
            <div className="login-password">
              <input
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={(event) => updateValue('password', event.target.value)}
                aria-invalid={Boolean(submitted && errors.password)}
              />
              <button type="button" aria-label={t('Toggle password visibility')} onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <a className="forgot-link" href="#forgot">{t('Forgot Password?')}</a>
            {submitted && errors.password && <small>{errors.password}</small>}
          </label>

          <label className="login-field">
            <span>{t('Partner Code')}</span>
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
              <span>{t('Remember Me')}</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={values.agreementsAccepted}
                onChange={(event) => updateValue('agreementsAccepted', event.target.checked)}
              />
              <span>{t('Agree to')} <a href="#terms">{t('Terms of Service')}</a>, <a href="#legal">{t('Legal Statement')}</a>, <a href="#privacy">{t('Privacy Statement')}</a></span>
            </label>
            {submitted && errors.agreements && <small>{errors.agreements}</small>}
          </div>

          <button className="login-submit" type="submit">{t('Sign in')}</button>
          <p className="login-note">* {t('Please contact your account partner if you need to acquire or change your account login email.')}</p>
        </form>
      </section>
    </main>
  );
}
