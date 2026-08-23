const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) { navToggle.addEventListener('click', () => { const isOpen = navLinks.classList.toggle('is-open'); navToggle.setAttribute('aria-expanded', String(isOpen)); }); }

const PRODUCTS = [
  { id:'starter-fitness', name:'Starter Fitness Program', price:399, billingPeriod:'one-time', category:'program', maxQuantity:5, label:'STARTER', features:['Structured workout plan','Basic nutrition guidance','Exercise instructions','30-day training structure','Sets, reps and rest guidance','Basic progression system'] },
  { id:'personalized-coaching', name:'Personalized Coaching', price:1499, billingPeriod:'monthly', category:'coaching', maxQuantity:1, label:'MOST POPULAR', features:['Personalized workout plan','Personalized nutrition plan','Calorie and protein targets','Indian food options and substitutions','Weekly check-in','Progress and workout adjustments','Exercise form feedback'] },
  { id:'elite-coaching', name:'Elite 1:1 Coaching', price:3999, billingPeriod:'monthly', category:'coaching', maxQuantity:1, label:'LIMITED SLOTS', features:['Everything in Personalized Coaching','Direct coach communication','Detailed exercise form analysis','Individual workout and nutrition modifications','Strength/performance programming','Plateau strategy','Frequent monitoring and priority support'] }
];
const CART_KEY = 'prepulse-cart-v1';
function readCart(){ try { const value=JSON.parse(localStorage.getItem(CART_KEY)||'[]'); return Array.isArray(value)?value:[]; } catch(e){ return []; } }
function writeCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCart(); }
function product(id){ return PRODUCTS.find(item=>item.id===id); }
function cartCount(cart=readCart()){ return cart.reduce((total,item)=>total+item.quantity,0); }
function cartSubtotal(cart=readCart()){ return cart.reduce((total,item)=>{const p=product(item.id);return total+(p?p.price*item.quantity:0)},0); }
function money(value){ return '₹'+value.toLocaleString('en-IN'); }
function showToast(message){ let toast=document.querySelector('.cart-toast'); if(!toast){toast=document.createElement('div');toast.className='cart-toast';document.body.appendChild(toast)} toast.textContent=message;toast.classList.add('is-visible');clearTimeout(window.__cartToast);window.__cartToast=setTimeout(()=>toast.classList.remove('is-visible'),2400); }
function addToCart(id){ const p=product(id); if(!p)return; const cart=readCart(); const existing=cart.find(item=>item.id===id); if(existing){ if(existing.quantity < p.maxQuantity) existing.quantity++; else { showToast(p.name+' is already in your cart.'); renderCart(); return; } } else cart.push({id,quantity:1}); writeCart(cart); showToast(p.name+' added to cart.'); }
function updateQuantity(id,delta){ const cart=readCart();const item=cart.find(entry=>entry.id===id);const p=product(id);if(!item||!p)return;item.quantity=Math.max(0,Math.min(p.maxQuantity,item.quantity+delta));writeCart(cart.filter(entry=>entry.quantity>0)); }
function removeFromCart(id){writeCart(readCart().filter(item=>item.id!==id));}
function renderCart(){ const cart=readCart(); document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=cartCount(cart)); const items=document.querySelector('[data-cart-items]'); const subtotal=document.querySelector('[data-cart-subtotal]'); if(items){ if(!cart.length) items.innerHTML='<div class="cart-empty">Your cart is empty.<br><a href="fitness.html#plans">Explore coaching plans</a></div>'; else items.innerHTML=cart.map(item=>{const p=product(item.id);return '<div class="cart-item"><div class="cart-item__top"><div><span class="cart-item__name">'+p.name+'</span><span class="cart-item__period">'+(p.billingPeriod==='monthly'?'/ month':'one-time')+'</span></div><strong class="cart-item__price">'+money(p.price*item.quantity)+'</strong></div><div class="cart-item__bottom"><div class="cart-item__controls"><button type="button" data-cart-minus="'+p.id+'" aria-label="Decrease '+p.name+' quantity">−</button><span>'+item.quantity+'</span><button type="button" data-cart-plus="'+p.id+'" aria-label="Increase '+p.name+' quantity">+</button></div><button class="cart-remove" type="button" data-cart-remove="'+p.id+'">Remove</button></div></div>'}).join(''); subtotal.textContent=money(cartSubtotal(cart)); } }
function openCart(){document.querySelector('.cart-drawer')?.classList.add('is-open');document.querySelector('.cart-drawer__panel')?.focus();}
function closeCart(){document.querySelector('.cart-drawer')?.classList.remove('is-open');}
function ensureCartUI(){ if(!document.querySelector('.cart-nav-item') && navLinks){navLinks.insertAdjacentHTML('beforeend','<li class="cart-nav-item"><a class="cart-nav-link" href="checkout.html" data-open-cart aria-label="Open shopping cart"><span aria-hidden="true">🛒</span> Cart <span class="cart-badge" data-cart-count>0</span></a></li>');} if(!document.querySelector('.cart-drawer')) document.body.insertAdjacentHTML('beforeend','<div class="cart-drawer" aria-hidden="true"><div class="cart-drawer__scrim" data-close-cart></div><aside class="cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1"><div class="cart-drawer__header"><h2 id="cart-title">Your Cart</h2><button class="cart-drawer__close" type="button" data-close-cart aria-label="Close cart">×</button></div><div class="cart-items" data-cart-items></div><div class="cart-drawer__footer"><div class="summary-line"><span>Subtotal</span><strong data-cart-subtotal>₹0</strong></div><a class="btn btn-primary" href="checkout.html">Proceed to Checkout</a><button class="btn btn-secondary" type="button" data-close-cart>Continue Shopping</button></div></aside></div>'); }
ensureCartUI();
function ensureAuthNav(){ if(!navLinks)return; function render(){window.PrePulseAuth.getCurrentUser().then(user=>{if(user&&!document.querySelector('[data-sign-out]'))navLinks.insertAdjacentHTML('beforeend','<li><a href="index.html" data-sign-out>Log Out</a></li>');}).catch(()=>{});} if(window.PrePulseAuth)render();else{const script=document.createElement('script');script.src='js/auth.js';script.onload=render;document.head.appendChild(script);}}
ensureAuthNav();
document.addEventListener('click',event=>{const signOut=event.target.closest('[data-sign-out]');if(signOut){event.preventDefault();window.PrePulseAuth.signOut().then(()=>window.location.href='index.html');}});
document.addEventListener('click',event=>{const add=event.target.closest('[data-add-to-cart]');if(add){addToCart(add.dataset.addToCart);const original=add.textContent;add.textContent='Added ✓';setTimeout(()=>add.textContent=original,1200)}if(event.target.closest('[data-open-cart]')){event.preventDefault();openCart()}if(event.target.closest('[data-close-cart]'))closeCart();const plus=event.target.closest('[data-cart-plus]');if(plus)updateQuantity(plus.dataset.cartPlus,1);const minus=event.target.closest('[data-cart-minus]');if(minus)updateQuantity(minus.dataset.cartMinus,-1);const remove=event.target.closest('[data-cart-remove]');if(remove)removeFromCart(remove.dataset.cartRemove);});
renderCart();

const fitnessTrack=document.querySelector('#fitness-carousel-track');
if(fitnessTrack){const plans=PRODUCTS;const viewport=fitnessTrack.parentElement;const dots=document.querySelector('.carousel-dots');const previous=document.querySelector('[data-carousel-prev]');const next=document.querySelector('[data-carousel-next]');let active=0,startX=0,dragging=false;fitnessTrack.innerHTML=plans.map((p,index)=>'<article class="fitness-carousel__slide" role="group" aria-roledescription="slide" aria-label="'+(index+1)+' of '+plans.length+'"><div class="course-card '+(index===1?'course-card--popular':'')+'"><span class="plan-label">'+p.label+'</span><h2>'+p.name+'</h2><div class="plan-price">'+money(p.price)+' <small>'+(p.billingPeriod==='monthly'?'/ month':'one-time')+'</small></div><ul class="plan-features">'+p.features.map(f=>'<li>'+f+'</li>').join('')+'</ul><button class="btn btn-primary" type="button" data-add-to-cart="'+p.id+'">Add to Cart</button></div></article>').join('');dots.innerHTML=plans.map(p=>'<button class="carousel-dot" type="button" role="tab" aria-label="Show '+p.name+'"></button>').join('');const dotButtons=Array.from(dots.children);function show(index){active=(index+plans.length)%plans.length;fitnessTrack.style.transform='translateX(-'+active*100+'%)';dotButtons.forEach((d,i)=>d.setAttribute('aria-selected',String(i===active)));}previous.addEventListener('click',()=>show(active-1));next.addEventListener('click',()=>show(active+1));dotButtons.forEach((d,i)=>d.addEventListener('click',()=>show(i)));viewport.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;viewport.setPointerCapture(e.pointerId)});viewport.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const distance=e.clientX-startX;if(Math.abs(distance)>45)show(active+(distance<0?1:-1))});viewport.addEventListener('pointercancel',()=>dragging=false);viewport.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(active-1);if(e.key==='ArrowRight')show(active+1)});show(0);}

const summary=document.querySelector('#checkout-summary-items');
if(summary){const cart=readCart();summary.innerHTML=cart.length?cart.map(item=>{const p=product(item.id);return '<div class="summary-line"><span>'+p.name+' × '+item.quantity+'<small>'+(p.billingPeriod==='monthly'?'Monthly coaching':'One-time program')+'</small></span><strong>'+money(p.price*item.quantity)+'</strong></div>'}).join(''):'<div class="empty-checkout">Your cart is empty. <a href="fitness.html#plans">Choose a plan</a></div>';const total=document.querySelector('#checkout-total');if(total)total.textContent=money(cartSubtotal(cart));}
const checkoutForm=document.querySelector('#checkout-form');if(checkoutForm)checkoutForm.addEventListener('submit',event=>{event.preventDefault();if(!readCart().length){showToast('Add a coaching plan before continuing.');return;}showToast('Development placeholder: payment gateway is not configured yet.');});


// Shared ₹99 paywall gate for Exam Prep, School, and Fitness.
(function () {
  var PAYWALL_PROTECTED_PAGES = ['exam-prep.html', 'school.html'];
  var SUPABASE_URL = 'https://davymhoailcabfwyjhmd.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdnltaG9haWxjYWJmd3lqaG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MzA3ODYsImV4cCI6MjEwMjMwNjc4Nn0.j2rzzWWxzEv-Y-ysaJuFDGXUbhCv3SMipzQKYVRJjQ4';
  var PAYMENT_PAGE = 'register.html';
  var supabaseClientPromise;
  function pageName(path) { return path.split('/').pop().split('?')[0].split('#')[0]; }
  function isProtectedPage(path) { return PAYWALL_PROTECTED_PAGES.indexOf(pageName(path)) !== -1; }
  function loadSupabase() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    if (supabaseClientPromise) return supabaseClientPromise;
    supabaseClientPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = function () { resolve(window.supabase); };
      script.onerror = function () { reject(new Error('The access check could not load.')); };
      document.head.appendChild(script);
    });
    return supabaseClientPromise;
  }
  function goToPayment() { window.location.href = PAYMENT_PAGE + '?reason=access&redirect=' + encodeURIComponent(window.location.pathname + window.location.hash); }
  async function hasPaidAccess() {
    try {
      var sdk = await loadSupabase();
      var client = sdk.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      var sessionResult = await client.auth.getSession();
      if (sessionResult.error || !sessionResult.data.session) return false;
      var userResult = await client.from('users').select('has_paid').eq('id', sessionResult.data.session.user.id).maybeSingle();
      return !userResult.error && !!userResult.data && userResult.data.has_paid === true;
    } catch (error) { return false; }
  }
  function protectPageUntilChecked() {
    if (!isProtectedPage(window.location.pathname)) return;
    document.documentElement.classList.add('paywall-checking');
    loadSupabase().then(hasPaidAccess).then(function (allowed) {
      if (allowed) { document.documentElement.classList.remove('paywall-checking'); return; }
      goToPayment();
    }).catch(goToPayment);
  }
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.indexOf('://') !== -1 || href.charAt(0) === '#') return;
    if (!isProtectedPage(href)) return;
    event.preventDefault();
    hasPaidAccess().then(function (allowed) { if (allowed) window.location.href = href; else goToPayment(); });
  });
  protectPageUntilChecked();
}());
