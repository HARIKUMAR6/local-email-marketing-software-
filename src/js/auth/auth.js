// Login portal behaviour: view switching, validation, password strength, show/hide password and
// simulated authentication. Nothing is sent to a server; accounts live in this browser only.
import { $, $$ } from '../core/dom.js';
import { icon } from '../components/icons.js';
import { accounts, hash, setSession } from '../core/session.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VIEWS = ['login', 'signup', 'forgot', 'reset'];
const TITLES = { login: 'Log in', signup: 'Create account', forgot: 'Reset password', reset: 'Choose a new password' };
const state = { resetEmail: '' };

/* ---------- Password strength ---------- */
export const checkPassword = (pw) => {
  const rules = { len: pw.length >= 8, case: /[a-z]/.test(pw) && /[A-Z]/.test(pw), num: /\d/.test(pw), sym: /[^A-Za-z0-9]/.test(pw) };
  const met = Object.values(rules).filter(Boolean).length;
  const level = pw ? Math.max(1, met) : 0;
  return { rules, level, label: ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'][level], valid: rules.len && rules.case && rules.num };
};

const paintStrength = (input) => {
  const box = $(`#${input.dataset.strength}`);
  if (!box) return;
  const s = checkPassword(input.value);
  box.dataset.level = String(s.level);
  $('[data-strength-label]', box).textContent = s.label;
  $$('[data-rule]', box).forEach((li) => li.classList.toggle('is-met', s.rules[li.dataset.rule]));
};

/* ---------- Validators (return an error message or '') ---------- */
const V = {
  email: (v) => (!v.trim() ? 'Enter your email address.' : EMAIL.test(v.trim()) ? '' : 'Enter a valid email address, like name@company.com.'),
  name: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name.'),
  loginPassword: (v) => (!v ? 'Enter your password.' : v.length < 8 ? 'Your password has at least 8 characters.' : ''),
  newPassword: (v) => (checkPassword(v).valid ? '' : 'Use 8+ characters with upper and lower case letters and a number.'),
  match: (v, el) => (!v ? 'Confirm your password.' : v === $(`#${el.dataset.match}`).value ? '' : 'Passwords do not match.'),
  terms: (_v, el) => (el.checked ? '' : 'Please accept the terms to continue.'),
};
const SCHEMA = {
  login: { email: V.email, password: V.loginPassword },
  signup: { name: V.name, email: V.email, password: V.newPassword, confirm: V.match, terms: V.terms },
  forgot: { email: V.email },
  reset: { password: V.newPassword, confirm: V.match },
};

const setError = (el, msg) => {
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  const err = $(`#${el.id}-err`);
  if (err) err.textContent = msg;
};
const check = (form, el) => {
  const msg = SCHEMA[form.dataset.form][el.name]?.(el.type === 'checkbox' ? '' : el.value, el) ?? '';
  setError(el, msg);
  return msg;
};

const fields = (form) => $$('input[name]', form).filter((el) => SCHEMA[form.dataset.form][el.name]);

/* ---------- Pending / feedback helpers ---------- */
const pending = (form, on, label) => {
  const btn = $('[type="submit"]', form);
  btn.disabled = on;
  if (on) { btn.dataset.html = btn.innerHTML; btn.innerHTML = `<span class="spin" aria-hidden="true"></span><span>${label}</span>`; }
  else if (btn.dataset.html) btn.innerHTML = btn.dataset.html;
};
const showAlert = (form, msg) => { const a = $('[data-alert]', form); a.textContent = msg; a.hidden = !msg; };
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const displayName = (email) => email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const workspaceFor = (email) => `${displayName(email.split('@')[1].split('.')[0])} workspace`;

const succeed = (view, text) => {
  const panel = $('[data-success]', view);
  const target = $('[data-form-wrap]', view) || $('form', view);
  target.hidden = true;
  panel.hidden = false;
  if (text) $('[data-success-text]', panel).textContent = text;
  return panel;
};
const resetView = (view) => {
  const panel = $('[data-success]', view);
  const target = $('[data-form-wrap]', view) || $('form', view);
  if (panel) panel.hidden = true;
  if (target) target.hidden = false;
};

const enterDashboard = (text, user, remember, view) => {
  setSession(user, remember);
  succeed(view, text);
  setTimeout(() => { location.href = 'dashboard/index.html'; }, 1100);
};

/* ---------- Submit handlers ---------- */
const HANDLERS = {
  async login(form, view) {
    const email = form.email.value.trim();
    pending(form, true, 'Signing in…');
    await delay(800);
    const acc = accounts.find(email);
    if (acc && (await hash(form.password.value)) !== acc.hash) {
      pending(form, false);
      setError(form.password, 'Incorrect email or password.');
      showAlert(form, 'We could not sign you in. Check your email and password and try again.');
      form.password.focus();
      return;
    }
    const user = { name: acc?.name || displayName(email), email, workspace: workspaceFor(email) };
    enterDashboard(`Welcome back, ${user.name.split(' ')[0]}. Opening your dashboard…`, user, form.remember.checked, view);
  },
  async signup(form, view) {
    const email = form.email.value.trim();
    pending(form, true, 'Creating account…');
    await delay(900);
    if (accounts.find(email)) {
      pending(form, false);
      setError(form.email, 'An account with this email already exists. Try logging in instead.');
      showAlert(form, 'That email is already registered.');
      form.email.focus();
      return;
    }
    const name = form.name.value.trim();
    accounts.add({ name, email, hash: await hash(form.password.value) });
    enterDashboard(`Account created. Welcome, ${name.split(' ')[0]}! Opening your dashboard…`, { name, email, workspace: workspaceFor(email) }, false, view);
  },
  async forgot(form, view) {
    pending(form, true, 'Sending…');
    await delay(800);
    pending(form, false);
    state.resetEmail = form.email.value.trim();
    succeed(view);
    $('[data-success-email]', view).textContent = state.resetEmail;
  },
  async reset(form, view) {
    pending(form, true, 'Updating…');
    await delay(800);
    pending(form, false);
    if (state.resetEmail && accounts.find(state.resetEmail)) accounts.update(state.resetEmail, { hash: await hash(form.password.value) });
    succeed(view);
  },
};

/* ---------- View switching ---------- */
const show = (name) => {
  const view = VIEWS.includes(name) ? name : 'login';
  $$('[data-view]').forEach((v) => { v.hidden = v.dataset.view !== view; });
  const el = $(`[data-view="${view}"]`);
  if (!(view === 'reset' && state.keepForm)) resetView(el);
  document.title = `${TITLES[view]} — VELORA`;
  $('h1', el)?.focus({ preventScroll: true });
};

export const initAuth = () => {
  // Navigation between views
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); state.keepForm = false; location.hash = go.dataset.go; }
  });
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));

  // Show / hide password
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-pw-toggle]');
    if (!t) return;
    const input = $(`#${t.dataset.pwToggle}`);
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    t.setAttribute('aria-pressed', String(reveal));
    t.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    t.innerHTML = icon(reveal ? 'eyeOff' : 'eye');
  });

  // Google option (visual only)
  $$('[data-google]').forEach((btn) => btn.addEventListener('click', () => {
    let note = btn.parentElement.querySelector('[data-google-note]');
    if (!note) {
      note = document.createElement('p');
      note.className = 'auth-note';
      note.dataset.googleNote = '';
      note.setAttribute('role', 'status');
      note.innerHTML = `${icon('info')}<span>Google sign-in is shown as a visual option and is not connected in this build. Use email and password instead.</span>`;
      btn.after(note);
    }
  }));

  // Forms
  $$('form[data-form]').forEach((form) => {
    const view = form.closest('[data-view]');
    fields(form).forEach((el) => {
      el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', () => check(form, el));
      el.addEventListener('input', () => {
        if (el.dataset.strength) {
          paintStrength(el);
          const confirm = $('[data-match="' + el.id + '"]', form);
          if (confirm?.value) check(form, confirm);
        }
        if (el.getAttribute('aria-invalid') === 'true') check(form, el);
      });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showAlert(form, '');
      const bad = fields(form).filter((el) => check(form, el));
      if (bad.length) {
        showAlert(form, `Please fix ${bad.length} ${bad.length === 1 ? 'field' : 'fields'} to continue.`);
        bad[0].focus();
        return;
      }
      HANDLERS[form.dataset.form](form, view);
    });
  });

  // "Open reset link" keeps the reset form fresh
  $('[data-view="forgot"] [data-go="reset"]')?.addEventListener('click', () => { state.keepForm = false; });
};
