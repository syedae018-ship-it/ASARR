const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

document.querySelectorAll('[data-delay]').forEach((item) => {
  item.style.setProperty('--delay', `${item.dataset.delay}ms`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

const diagnostic = document.querySelector('#agency-diagnostic');
const steps = [...document.querySelectorAll('.diagnostic-step')];
const nextButton = document.querySelector('.next-button');
const backButton = document.querySelector('.back-button');
const progressBar = document.querySelector('#progress-bar');
const progressLabel = document.querySelector('#progress-label');
const result = document.querySelector('#diagnostic-result');
let currentStep = 0;

const recommendations = {
  sales: {
    title: 'Revenue control system',
    copy: 'Your first configuration should make every opportunity visible, owned, and actionable before expanding delivery complexity.',
    modules: ['Sales pipeline', 'Follow-up rules', 'Client CRM', 'Proposal workflow']
  },
  delivery: {
    title: 'Delivery control system',
    copy: 'Your first configuration should protect scope and make responsibility, deadlines, client decisions, and approvals unambiguous.',
    modules: ['Project templates', 'Milestones and owners', 'Client approvals', 'Change requests']
  },
  finance: {
    title: 'Profit control system',
    copy: 'Your first configuration should connect delivery effort to invoicing, payment collection, cost, and real project margin.',
    modules: ['Complete invoicing', 'Payment reminders', 'Cost tracking', 'Profit reporting']
  }
};

function showStep(index) {
  currentStep = index;
  steps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
  backButton.disabled = index === 0;
  nextButton.innerHTML = index === steps.length - 1 ? 'See my setup <span>→</span>' : 'Continue <span>→</span>';
  progressLabel.textContent = `Step ${index + 1} of ${steps.length}`;
  progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
}

function selectedForCurrentStep() {
  return steps[currentStep].querySelector('input:checked');
}

diagnostic?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!selectedForCurrentStep()) {
    steps[currentStep].animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }
    ], { duration: 240 });
    return;
  }

  if (currentStep < steps.length - 1) {
    showStep(currentStep + 1);
    return;
  }

  const data = new FormData(diagnostic);
  const profile = recommendations[data.get('pain')] || recommendations.delivery;
  const team = data.get('team');
  const tools = data.get('tools');
  const context = team === 'growth'
    ? ' Because several people share delivery, role controls and workload visibility should be included from the start.'
    : tools === 'sheets'
      ? ' Begin with a controlled migration from your existing sheets rather than reproducing every old column.'
      : ' Consolidate the highest-risk handoffs first instead of replacing every tool at once.';

  document.querySelector('#result-title').textContent = profile.title;
  document.querySelector('#result-copy').textContent = profile.copy + context;
  document.querySelector('#result-modules').innerHTML = profile.modules.map((module) => `<span>${module}</span>`).join('');
  diagnostic.style.display = 'none';
  document.querySelector('.diagnostic-progress').style.display = 'none';
  result.classList.add('active');
});

backButton?.addEventListener('click', () => {
  if (currentStep > 0) showStep(currentStep - 1);
});

document.querySelector('.restart-diagnostic')?.addEventListener('click', () => {
  diagnostic.reset();
  diagnostic.style.display = '';
  document.querySelector('.diagnostic-progress').style.display = '';
  result.classList.remove('active');
  showStep(0);
});

const agencyName = document.querySelector('#agency-name');
const previewName = document.querySelector('#preview-name');
const previewLogo = document.querySelector('.preview-logo');
const customPreview = document.querySelector('#custom-preview');

agencyName?.addEventListener('input', (event) => {
  const name = event.target.value.trim() || 'Your Agency';
  previewName.textContent = name;
  previewLogo.textContent = name.charAt(0).toUpperCase();
});

document.querySelectorAll('.color-row button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.color-row button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    customPreview.style.setProperty('--brand-color', button.dataset.color);
  });
});

document.querySelector('#demo-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.querySelector('.form-success').classList.add('active');
});

document.querySelector('#year').textContent = new Date().getFullYear();
