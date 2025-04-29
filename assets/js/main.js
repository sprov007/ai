(function() {
  "use strict";

  var $body = document.querySelector('body');

  // Polyfills for old browsers (keep safe)
  !function() {
    function t(t) {
      this.el = t;
      for (var n = t.className.replace(/^\s+|\s+$/g, "").split(/\s+/), i = 0; i < n.length; i++) e.call(this, n[i]);
    }
    function n(t, n, i) {
      Object.defineProperty ? Object.defineProperty(t, n, { get: i }) : t.__defineGetter__(n, i);
    }
    if (!("undefined" == typeof window.Element || "classList" in document.documentElement)) {
      var i = Array.prototype, e = i.push, s = i.splice, o = i.join;
      t.prototype = {
        add: function(t) {
          this.contains(t) || (e.call(this, t), this.el.className = this.toString());
        },
        contains: function(t) {
          return -1 != this.el.className.indexOf(t);
        },
        item: function(t) {
          return this[t] || null;
        },
        remove: function(t) {
          if (this.contains(t)) {
            for (var n = 0; n < this.length && this[n] != t; n++);
            s.call(this, n, 1), this.el.className = this.toString();
          }
        },
        toString: function() {
          return o.call(this, " ");
        },
        toggle: function(t) {
          return this.contains(t) ? this.remove(t) : this.add(t), this.contains(t);
        }
      };
      window.DOMTokenList = t;
      n(Element.prototype, "classList", function() {
        return new t(this);
      });
    }
  }();

  window.canUse = function(p) {
    if (!window._canUse) window._canUse = document.createElement("div");
    var e = window._canUse.style, up = p.charAt(0).toUpperCase() + p.slice(1);
    return p in e || "Moz" + up in e || "Webkit" + up in e || "O" + up in e || "ms" + up in e;
  };

  // Polyfill for addEventListener
  (function() {
    if ("addEventListener" in window) return;
    window.addEventListener = function(type, f) {
      window.attachEvent("on" + type, f);
    };
  })();

  // Play initial animations on page load
  window.addEventListener('load', function() {
    window.setTimeout(function() {
      $body.classList.remove('is-preload');
    }, 100);
  });

  // Background Slideshow
  (function() {
    var settings = {
      images: {
        'images/bg01.jpg': 'center',
        'images/bg02.jpg': 'center',
        'images/bg03.jpg': 'center'
      },
      delay: 6000
    };

    var pos = 0, lastPos = 0,
        $wrapper, $bgs = [], $bg,
        k;

    $wrapper = document.createElement('div');
    $wrapper.id = 'bg';
    $body.appendChild($wrapper);

    for (k in settings.images) {
      $bg = document.createElement('div');
      $bg.style.backgroundImage = 'url("' + k + '")';
      $bg.style.backgroundPosition = settings.images[k];
      $wrapper.appendChild($bg);
      $bgs.push($bg);
    }

    if ($bgs.length == 1 || !canUse('transition')) return;

    $bgs[pos].classList.add('visible');
    $bgs[pos].classList.add('top');

    window.setInterval(function() {
      lastPos = pos;
      pos++;
      if (pos >= $bgs.length) pos = 0;

      $bgs[lastPos].classList.remove('top');
      $bgs[pos].classList.add('visible');
      $bgs[pos].classList.add('top');

      window.setTimeout(function() {
        $bgs[lastPos].classList.remove('visible');
      }, settings.delay / 2);
    }, settings.delay);
  })();

  // Signup Form Handler (Connected to Backend)
  (function() {
    var $form = document.querySelector('#signup-form'),
        $submit = document.querySelector('#signup-form input[type="submit"]'),
        $message;

    if (!('addEventListener' in $form))
      return;

    $message = document.createElement('span');
    $message.classList.add('message');
    $form.appendChild($message);

    $message._show = function(type, text) {
      $message.innerHTML = text;
      $message.classList.add(type);
      $message.classList.add('visible');
      window.setTimeout(function() {
        $message._hide();
      }, 3000);
    };

    $message._hide = function() {
      $message.classList.remove('visible');
      $message.classList.remove('success');
      $message.classList.remove('failure');
    };

    $form.addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();

      $message._hide();
      $submit.disabled = true;

      const formData = new FormData($form);
      const username = formData.get('username');
      const email = formData.get('email');
      const password = formData.get('password');

      fetch('https://otpgen-84pg.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Registration successful!') {
          $message._show('success', 'Registration successful!');
          $form.reset();
        } else {
          $message._show('failure', data.message || 'Something went wrong.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        $message._show('failure', 'Network error!');
      })
      .finally(() => {
        $submit.disabled = false;
      });
    });

  })();

})();
(function() {
  "use strict";

  document.addEventListener('DOMContentLoaded', function() {
    const $form = document.getElementById('payment-form');
    const $confirmation = document.getElementById('confirmation-message');

    if (!$form) return;

    $form.addEventListener('submit', async function(event) {
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData($form);

      const data = {
        company: formData.get('company'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        serviceType: formData.get('serviceType'),
        name: formData.get('name'),
        phone1: formData.get('phone1'),
        amount1: formData.get('amount1'),
        amount2: formData.get('amount2'),
        method: formData.get('method'),
        amount3: formData.get('amount3'),
        trxid: formData.get('trxid')
      };

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first!');
        return;
      }

      try {
        const response = await fetch('https://otpgen-84pg.onrender.com/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          $confirmation.innerHTML = `<p style="color: green;">✅ Payment initiated successfully! 1-hour confirmation started.</p>`;
          startCountdown();
          $form.reset();
        } else {
          $confirmation.innerHTML = `<p style="color: red;">❌ ${result.message || 'Payment failed!'}</p>`;
        }
      } catch (error) {
        console.error(error);
        $confirmation.innerHTML = `<p style="color: red;">❌ Network error!</p>`;
      }
    });

    function startCountdown() {
      let timeLeft = 3600;
      const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        $confirmation.innerHTML = `<p style="color: green;">✅ Payment initiated! Time left: ${minutes}m ${seconds}s ⏳</p>`;

        timeLeft--;

        if (timeLeft < 0) {
          clearInterval(timer);
          $confirmation.innerHTML = `<p style="color: red;">⏰ Payment confirmation time expired!</p>`;
        }
      }, 1000);
    }
  });

})();
// Phone number validation
function validateBDPhone(number) {
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(number);
}

// Amount validation
function validateAmount(amount) {
  return amount >= 100 && amount <= 100000;
}
// In main.js - PERSIST UNTIL SUBMIT/CANCEL
(function() {
  const FORM_ID = 'payment-form';
  const STORAGE_KEY = 'formDraft';
  const EXCLUDE_FIELDS = ['password', 'amount3']; // Add amount3 here

  // Initialize form persistence
  function initFormPersistence() {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    // 1. Load saved data on page load
    loadFormData();

    // 2. Auto-save with 500ms debounce
    let saveTimer;
    form.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveFormData, 500);
    });

    // 3. Clear only on successful submit
    form.addEventListener('submit', async (e) => {
      if (form.checkValidity()) {
        try {
          // Your existing submission logic
          await handleFormSubmit(); 
          clearFormData();
        } catch (error) {
          console.error('Submission failed:', error);
          // Keep data on failure
        }
      }
    });

    // 4. Cancel button handler
    document.getElementById('cancelBtn')?.addEventListener('click', () => {
      if (confirm('Cancel and clear all entered data?')) {
        clearFormData();
        form.reset();
      }
    });
  }

  // Save current form state
  function saveFormData() {
    const data = {};
    Array.from(document.getElementById(FORM_ID).elements).forEach(element => {
      if (shouldStoreElement(element)) {
        data[element.id] = element.value;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Load saved data
  function loadFormData() {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) return;

      const data = JSON.parse(rawData);
      Object.entries(data).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && shouldStoreElement(element)) {
          element.value = value;
        }
      });
    } catch (e) {
      console.error('Error loading draft:', e);
      clearFormData();
    }
  }

  // Clear stored data
  function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Element validation
  function shouldStoreElement(element) {
    return element.id &&
           !EXCLUDE_FIELDS.includes(element.id) &&
           element.offsetParent !== null && // Visible check
           (element.tagName === 'INPUT' || 
            element.tagName === 'SELECT' || 
            element.tagName === 'TEXTAREA');
  }

  // Initialize when ready
  document.addEventListener('DOMContentLoaded', initFormPersistence);
})();
