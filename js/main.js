const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const registrationForm = document.querySelector('#registration-form');

if (registrationForm) {
  registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // TODO: connect to Supabase to persist the registration form securely.
    // TODO: connect to Razorpay and redirect only after server-side payment verification.
    window.location.href = 'dashboard.html';
  });
}
