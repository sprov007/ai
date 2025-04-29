(function() {
  "use strict";

  // ======================
  // Polyfills & Utilities
  // ======================
  !function() {
    // ClassList polyfill
    if (!("classList" in document.documentElement)) {
      function ClassList(t) {
        this.el = t;
        this.classes = t.className.replace(/^\s+|\s+$/g, "").split(/\s+/);
      }
      ClassList.prototype = {
        add: function(t) {
          this.contains(t) || (this.classes.push(t), this.el.className = this.classes.join(" "));
        },
        // ... other classList methods ...
      };
      window.DOMTokenList = ClassList;
      Object.defineProperty(Element.prototype, "classList", {
        get: function() {
          return new ClassList(this);
        }
      });
    }

    // addEventListener polyfill
    if (!("addEventListener" in window)) {
      window.addEventListener = function(t, n) {
        window.attachEvent("on" + t, n);
      };
    }
  }();

  // ======================
  // Core Functionality
  // ======================
  (function() {
    const $body = document.querySelector('body');

    // Initialize background slideshow
    !function() {
      const settings = {
        images: {
          'images/bg01.jpg': 'center',
          'images/bg02.jpg': 'center',
          'images/bg03.jpg': 'center'
        },
        delay: 6000
      };

      const $wrapper = document.createElement('div');
      $wrapper.id = 'bg';
      $body.appendChild($wrapper);

      const $bgs = Object.entries(settings.images).map(([url, pos]) => {
        const $bg = document.createElement('div');
        $bg.style.backgroundImage = `url("${url}")`;
        $bg.style.backgroundPosition = pos;
        $wrapper.appendChild($bg);
        return $bg;
      });

      if ($bgs.length > 1) {
        let pos = 0;
        $bgs[pos].classList.add('visible', 'top');
        
        setInterval(() => {
          const lastPos = pos;
          pos = (pos + 1) % $bgs.length;
          
          $bgs[lastPos].classList.remove('top');
          $bgs[pos].classList.add('visible', 'top');
          
          setTimeout(() => $bgs[lastPos].classList.remove('visible'), settings.delay / 2);
        }, settings.delay);
      }
    }();

    // Remove preload class
    window.addEventListener('load', () => {
      setTimeout(() => $body.classList.remove('is-preload'), 100);
    });
  })();

  // ======================
  // Form Handlers
  // ======================
  (function() {
    // Shared validation functions
    const validateBDPhone = number => /^(?:\+?88)?01[3-9]\d{8}$/.test(number);
    const validateAmount = amount => amount >= 100 && amount <= 100000;

    // Payment Form Handling
    !function() {
      const FORM_ID = 'payment-form';
      const STORAGE_KEY = 'formDraft';
      const EXCLUDE_FIELDS = ['password', 'amount3'];

      function initPaymentForm() {
        const $form = document.getElementById(FORM_ID);
        const $confirmation = document.getElementById('confirmation-message');
        if (!$form) return;

        // Form persistence logic
        const shouldStoreElement = element => 
          element.id &&
          !EXCLUDE_FIELDS.includes(element.id) &&
          element.offsetParent !== null &&
          ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);

        // ... rest of form persistence logic from example ...

        // Form submission handler
        $form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData($form);
          
          // Validation
          if (!validateBDPhone(formData.get('phone')) {
            alert('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)');
            return;
          }
          
          if (!validateAmount(formData.get('amount1'))) {
            alert('অগ্রহণযোগ্য পরিমাণ (১০০ টাকা থেকে ১,০০,০০০ টাকা পর্যন্ত)');
            return;
          }

          // Submission logic
          try {
            const response = await fetch('https://otpgen-84pg.onrender.com/payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(Object.fromEntries(formData))
            });

            // Handle response
            if (response.ok) {
              localStorage.removeItem(STORAGE_KEY);
              $form.reset();
              startCountdown($confirmation);
            }
          } catch (error) {
            console.error('Payment Error:', error);
            $confirmation.innerHTML = `<p style="color: red;">❌ Network error occurred</p>`;
          }
        });
      }

      document.addEventListener('DOMContentLoaded', initPaymentForm);
    }();

    // Signup Form Handling
    !function() {
      const $form = document.getElementById('signup-form');
      if (!$form) return;

      const $message = document.createElement('span');
      $message.className = 'message';
      $form.appendChild($message);

      $form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData($form);
        
        try {
          const response = await fetch('https://otpgen-84pg.onrender.com/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
          });

          const data = await response.json();
          $message.textContent = data.message;
          $message.className = `message visible ${response.ok ? 'success' : 'failure'}`;
          
          if (response.ok) {
            setTimeout(() => $message.classList.remove('visible'), 3000);
            $form.reset();
          }
        } catch (error) {
          console.error('Signup Error:', error);
          $message.textContent = 'Network error!';
          $message.className = 'message visible failure';
        }
      });
    }();
  })();

  // ======================
  // Helper Functions
  // ======================
  function startCountdown($element) {
    let seconds = 3600;
    const timer = setInterval(() => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      $element.innerHTML = `
        <p style="color: green;">
          ✅ Payment processing - Time remaining: 
          ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}
        </p>`;
      
      if (--seconds < 0) {
        clearInterval(timer);
        $element.innerHTML = `<p style="color: red;">⏰ Payment confirmation expired</p>`;
      }
    }, 1000);
  }

})();
