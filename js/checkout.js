(function () {
  'use strict';

  var SUPABASE_URL = 'https://davymhoailcabfwyjhmd.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdnltaG9haWxjYWJmd3lqaG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MzA3ODYsImV4cCI6MjEwMjMwNjc4Nn0.j2rzzWWxzEv-Y-ysaJuFDGXUbhCv3SMipzQKYVRJjQ4';
  var CART_KEY = 'prepulse-cart-v1';
  var PRODUCT_TO_PURPOSE = {
    'starter-fitness': 'starter_fitness',
    'personalized-coaching': 'personalized_coaching',
    'elite-coaching': 'elite_coaching'
  };
  var form = document.getElementById('coaching-checkout-form');
  var submitButton = document.getElementById('checkout-submit');

  if (!form || !submitButton) return;

  function setSubmitting(isSubmitting, label) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = label || 'Continue to Payment';
  }

  function showMessage(message) {
    if (typeof window.showToast === 'function') window.showToast(message);
    else window.alert(message);
  }

  function setFormAvailable(isAvailable) {
    form.hidden = !isAvailable;
    Array.prototype.forEach.call(form.elements, function (field) {
      field.disabled = !isAvailable;
    });
  }

  function readCart() {
    try {
      var cart = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  }

  async function postToFunction(name, token, body) {
    var response = await fetch(SUPABASE_URL + '/functions/v1/' + name, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || data.message || 'Unable to process your payment.');
    return data;
  }

  async function initializeCheckout() {
    setFormAvailable(false);

    if (!window.supabase) {
      showMessage('The payment service is unavailable. Please try again.');
      return;
    }

    try {
      var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      var sessionResult = await client.auth.getSession();
      var session = sessionResult.data && sessionResult.data.session;
      if (sessionResult.error || !session) {
        window.location.href = 'login.html?redirect=checkout.html';
        return;
      }
      setFormAvailable(true);
    } catch (error) {
      console.error('Checkout authentication error:', error);
      showMessage('Unable to confirm your login. Please try again.');
    }
  }

  initializeCheckout();

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var cart = readCart();
    if (!cart.length) {
      showMessage('Add a coaching plan before continuing.');
      return;
    }
    var purpose = PRODUCT_TO_PURPOSE[cart[0].id];
    if (!purpose) {
      showMessage('The selected plan cannot be processed. Please choose a valid coaching plan.');
      return;
    }
    if (!window.supabase || !window.Razorpay) {
      showMessage('The payment service is unavailable. Please try again.');
      return;
    }

    setSubmitting(true, 'Preparing secure payment...');
    try {
      var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      var sessionResult = await client.auth.getSession();
      var session = sessionResult.data && sessionResult.data.session;
      if (sessionResult.error || !session) {
        window.location.href = 'login.html?redirect=checkout.html';
        return;
      }

      var order = await postToFunction('create-razorpay-order', session.access_token, {
        purpose: purpose
      });
      var razorpay = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'PrePulse',
        description: order.label,
        order_id: order.order_id,
        handler: async function (payment) {
          setSubmitting(true, 'Verifying payment...');
          try {
            var verification = await postToFunction('verify-razorpay-payment', session.access_token, {
              order_id: payment.razorpay_order_id,
              payment_id: payment.razorpay_payment_id,
              signature: payment.razorpay_signature
            });
            if (!verification.has_paid) {
              throw new Error('We could not verify your payment. Please contact support if you were charged.');
            }
            window.localStorage.removeItem(CART_KEY);
            showMessage('Payment successful! Your Elite 1:1 Coaching plan is now active.');
            window.setTimeout(function () {
              window.location.href = 'client-dashboard.html?payment=success';
            }, 1200);
          } catch (error) {
            console.error('Payment verification error:', error);
            showMessage(error.message || 'Payment verification failed. Please contact support if you were charged.');
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          }
        },
        theme: { color: '#e8461c' }
      });
      razorpay.open();
      setSubmitting(false);
    } catch (error) {
      console.error('Checkout error:', error);
      showMessage(error.message || 'Unable to start payment. Please try again.');
      setSubmitting(false);
    }
  });
}());
