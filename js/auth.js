(function () {
  'use strict';

  const SUPABASE_URL =
    'https://davymhoailcabfwyjhmd.supabase.co';

  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdnltaG9haWxjYWJmd3lqaG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MzA3ODYsImV4cCI6MjEwMjMwNjc4Nn0.j2rzzWWxzEv-Y-ysaJuFDGXUbhCv3SMipzQKYVRJjQ4';

  let supabasePromise = null;
  let supabaseClient = null;

  function loadSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return Promise.resolve(window.supabase);
    }
    if (supabasePromise) {
      return supabasePromise;
    }
    supabasePromise = new Promise(function (resolve, reject) {
      const existingScript = document.querySelector('script[data-prepulse-supabase]');
      if (existingScript) {
        existingScript.addEventListener('load', function () {
          if (window.supabase && typeof window.supabase.createClient === 'function') {
            resolve(window.supabase);
          } else {
            reject(new Error('Supabase client is unavailable.'));
          }
        });
        existingScript.addEventListener('error', function () {
          reject(new Error('Failed to load Supabase.'));
        });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.dataset.prepulseSupabase = 'true';
      script.onload = function () {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
          resolve(window.supabase);
        } else {
          reject(new Error('Supabase client is unavailable.'));
        }
      };
      script.onerror = function () {
        reject(new Error('Failed to load Supabase.'));
      };
      document.head.appendChild(script);
    });
    return supabasePromise;
  }

  async function getClient() {
    if (supabaseClient) {
      return supabaseClient;
    }
    const supabase = await loadSupabase();
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  }

  async function signUp(email, password) {
    const client = await getClient();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter a password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const { data: authData, error: authError } = await client.auth.signUp({
      email: cleanEmail,
      password: password
    });
    if (authError) {
      throw authError;
    }
    if (!authData || !authData.user) {
      throw new Error('Account could not be created.');
    }
    const user = authData.user;
    const { error: profileError } = await client.from('users').insert({
      id: user.id,
      email: cleanEmail,
      has_paid: false
    });
    if (profileError) {
      throw profileError;
    }
    return user;
  }

  async function signIn(email, password) {
    const client = await getClient();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });
    if (error) {
      throw error;
    }
    return data.user;
  }

  async function signOut() {
    const client = await getClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async function getCurrentUser() {
    const client = await getClient();
    const { data, error } = await client.auth.getSession();
    if (error || !data || !data.session) {
      return null;
    }
    return data.session.user || null;
  }

  function getPostAuthRedirect() {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (!redirect) {
      return 'index.html';
    }

    try {
      const destination = new URL(redirect, window.location.origin);
      const destinationPage = destination.pathname.split('/').pop();
      if (destination.origin !== window.location.origin || destinationPage === 'login.html' || destinationPage === 'register.html') {
        return 'index.html';
      }
      return destination.pathname + destination.search + destination.hash;
    } catch (error) {
      return 'index.html';
    }
  }

  function preserveRedirectWhenSwitchingAuthPages(event) {
    const link = event.target.closest('[data-auth-page-switch]');
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (!link || !redirect) {
      return;
    }
    const destination = new URL(link.getAttribute('href'), window.location.href);
    destination.searchParams.set('redirect', redirect);
    link.href = destination.pathname.split('/').pop() + destination.search + destination.hash;
  }

  document.addEventListener('click', preserveRedirectWhenSwitchingAuthPages);

  window.PrePulseAuth = {
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    getCurrentUser: getCurrentUser,
    getPostAuthRedirect: getPostAuthRedirect
  };
})();
