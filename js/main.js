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


// Fitness program carousel: swipe, drag, keyboard, arrows, and pagination.
const fitnessTrack = document.querySelector('#fitness-carousel-track');
if (fitnessTrack) {
  const programs = [
    { title: 'Fat Loss Program', description: 'Calorie-aware workouts and nutrition habits for sustainable fat loss.', button: 'View Details' },
    { title: 'Muscle Building Program', description: 'Progressive strength routines with protein and recovery guidance.', button: 'Enroll' },
    { title: 'General Fitness', description: 'Balanced mobility, strength, stamina, and everyday wellness habits.', button: 'View Details' }
  ];
  const viewport = fitnessTrack.parentElement;
  const dots = document.querySelector('.carousel-dots');
  const previous = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  let active = 0, startX = 0, dragging = false;
  fitnessTrack.innerHTML = programs.map((program, index) => 
    '<article class="fitness-carousel__slide" role="group" aria-roledescription="slide" aria-label="' + (index + 1) + ' of ' + programs.length + '"><div class="course-card" data-price="399"><h2>' + program.title + '</h2><p>' + program.description + '</p><strong class="price">₹399</strong><button class="btn btn-primary" type="button">' + program.button + '</button></div></article>'
  ).join('');
  dots.innerHTML = programs.map((program, index) => '<button class="carousel-dot" type="button" role="tab" aria-label="Show ' + program.title + '" aria-selected="' + (index === 0) + '"></button>').join('');
  const dotButtons = Array.from(dots.children);
  function show(index) {
    active = (index + programs.length) % programs.length;
    fitnessTrack.style.transform = 'translateX(-' + (active * 100) + '%)';
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === active)));
    fitnessTrack.querySelectorAll('.fitness-carousel__slide').forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== active)));
  }
  previous.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  dotButtons.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  viewport.addEventListener('pointerdown', event => { dragging = true; startX = event.clientX; viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener('pointerup', event => { if (!dragging) return; dragging = false; const distance = event.clientX - startX; if (Math.abs(distance) > 45) show(active + (distance < 0 ? 1 : -1)); });
  viewport.addEventListener('pointercancel', () => { dragging = false; });
  viewport.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') show(active - 1); if (event.key === 'ArrowRight') show(active + 1); });
  viewport.tabIndex = 0;
  show(0);
}
