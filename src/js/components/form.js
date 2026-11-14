// Enquiry form validation and submission feedback.
// Markup contract: <form data-validate novalidate> with fields carrying data-rules="required|email|min:20|phone".
// There is no backend yet: a valid submit shows confirmation with a reference number.
import { $, $$ } from '../core/dom.js';

const RULES = {
  required: (v, el) => (el.type === 'checkbox' ? el.checked : v.trim() !== '') || el.dataset.requiredMsg || 'This field is required.',
  email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address, like name@company.com.',
  phone: (v) => !v.trim() || /^\+?[\d\s().-]{7,}$/.test(v.trim()) || 'Enter a valid phone number, for example +91 44 5550 0142.',
  min: (v, el, n) => !v.trim() || v.trim().length >= +n || `Please enter at least ${n} characters.`,
};

const check = (el) => {
  const value = el.value ?? '';
  for (const rule of (el.dataset.rules || '').split('|').filter(Boolean)) {
    const [name, arg] = rule.split(':');
    const res = RULES[name](value, el, arg);
    if (res !== true) return res;
  }
  return '';
};

const setError = (el, message) => {
  const err = $(`#${el.id}-err`);
  el.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (err) err.textContent = message;
};

const initForm = (form) => {
  const fields = $$('[data-rules]', form);
  const alertBox = $('[data-form-alert]', form);
  const body = $('[data-form-body]', form) || form;
  const success = $('[data-form-success]', form.parentElement);
  const submit = $('[type="submit"]', form);

  // Prefill the topic from ?topic=… (used by the pricing page's Enterprise buttons).
  const topic = new URLSearchParams(location.search).get('topic');
  const select = $('select[name="topic"]', form);
  if (topic && select && [...select.options].some((o) => o.value === topic)) select.value = topic;

  fields.forEach((el) => {
    const event = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'blur';
    el.addEventListener(event, () => setError(el, check(el)));
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setError(el, check(el)); });
  });

  const counter = $('[data-count]', form);
  const message = $('textarea', form);
  if (counter && message) {
    const update = () => { counter.textContent = `${message.value.trim().length} / 20 minimum`; };
    message.addEventListener('input', update); update();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = [];
    fields.forEach((el) => { const msg = check(el); setError(el, msg); if (msg) invalid.push(el); });
    if (invalid.length) {
      alertBox.hidden = false;
      alertBox.textContent = `Please fix ${invalid.length} ${invalid.length === 1 ? 'field' : 'fields'} before sending.`;
      invalid[0].focus();
      return;
    }
    alertBox.hidden = true;
    if ($('.hp-field input', form)?.value) return; // honeypot: silently ignore bots
    submit.disabled = true;
    submit.dataset.label = submit.textContent;
    submit.textContent = 'Sending…';
    setTimeout(() => {
      const name = ($('[name="name"]', form)?.value || '').trim().split(/\s+/)[0] || 'there';
      const email = ($('[name="email"]', form)?.value || '').trim();
      $('[data-ref]', success).textContent = `VEL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      $('[data-success-name]', success).textContent = name;
      $('[data-success-email]', success).textContent = email;
      body.hidden = true;
      success.hidden = false;
      $('[tabindex="-1"]', success)?.focus();
      submit.disabled = false;
      submit.textContent = submit.dataset.label;
    }, 900);
  });

  $('[data-form-reset]', success)?.addEventListener('click', () => {
    form.reset();
    fields.forEach((el) => setError(el, ''));
    if (counter) counter.textContent = '0 / 20 minimum';
    success.hidden = true;
    body.hidden = false;
    fields[0]?.focus();
  });
};

export const initForms = () => $$('form[data-validate]').forEach(initForm);
