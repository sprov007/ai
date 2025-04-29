(function() {
  "use strict";

  // ======================
  // Utility Functions
  // ======================
  function validateBDPhone(number) {
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(number);
  }

  function validateAmount(amount) {
    return amount >= 100 && amount <= 100000;
  }

  // ======================
  // Form Persistence
  // ======================
  (function() {
    const FORM_ID = 'payment-form';
    const STORAGE_KEY = 'formDraft';
    const EXCLUDE_FIELDS = ['password', 'amount3'];

    function shouldStoreElement(element) {
      return element.id &&
             !EXCLUDE_FIELDS.includes(element.id) &&
             element.offsetParent !== null &&
             ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
    }

    function initFormPersistence() {
      const form = document.getElementById(FORM_ID);
      if (!form) return;

      // Load saved data
      const loadFormData = () => {
        try {
          const rawData = localStorage.getItem(STORAGE_KEY);
          if (!rawData) return;
          JSON.parse(rawData);
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      };

      // Save data with debounce
      let saveTimer;
      form.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          const data = {};
          Array.from(form.elements).forEach(element => {
            if (shouldStoreElement(element)) data[element.id] = element.value;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }, 500);
      });

      // Clear on cancel
      document.getElementById('cancelBtn')?.addEventListener('click', () => {
        if (confirm('Cancel and clear all entered data?')) {
          localStorage.removeItem(STORAGE_KEY);
          form.reset();
        }
      });

      loadFormData();
    }

    document.addEventListener('DOMContentLoaded', initFormPersistence);
  })();

  // ======================
  // Payment Form Handler
  // ======================
  document.addEventListener('DOMContentLoaded', () => {
    const $form = document.getElementById('payment-form');
    const $confirmation = document.getElementById('confirmation-message');
    if (!$form) return;

    $form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Client-side validation
      const formData = new FormData($form);
      const phone = formData.get('phone');
      const amount1 = formData.get('amount1');

      if (!validateBDPhone(phone)) {
        alert('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (01XXXXXXXXX)');
        return;
      }

      if (!validateAmount(amount1)) {
        alert('অগ্রহণযোগ্য পরিমাণ (১০০ টাকা থেকে ১,০০,০০০ টাকা পর্যন্ত)');
        return;
      }

      // Prepare payload
      const payload = {
        company: formData.get('company'),
        phone: phone,
        password: formData.get('password'),
        serviceType: formData.get('serviceType'),
        name: formData.get('name'),
        phone1: formData.get('phone1'),
        amount1: parseFloat(amount1),
        amount2: parseFloat(formData.get('amount2')),
        method: formData.get('method'),
        amount3: parseFloat(formData.get('amount3')),
        trxid: formData.get('trxid')
      };

      // Check authentication
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
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (response.ok) {
          $confirmation.innerHTML = `<p style="color: green;">✅ Payment initiated successfully!</p>`;
          localStorage.removeItem('formDraft');
          $form.reset();
          startCountdown();
        } else {
          $confirmation.innerHTML = `<p style="color: red;">❌ ${result.message || 'Payment failed'}</p>`;
        }
      } catch (error) {
        console.error('Payment Error:', error);
        $confirmation.innerHTML = `<p style="color: red;">❌ Network error occurred</p>`;
      }
    });

    function startCountdown() {
      let seconds = 3600;
      const timer = setInterval(() => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        $confirmation.innerHTML = `
          <p style="color: green;">
            ✅ Payment processing - Time remaining: 
            ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}
          </p>
        `;
        
        if (--seconds < 0) {
          clearInterval(timer);
          $confirmation.innerHTML = `<p style="color: red;">⏰ Payment confirmation expired</p>`;
        }
      }, 1000);
    }
  });

  // ======================
  // Initialization
  // ======================
  window.addEventListener('load', () => {
    document.querySelector('body').classList.remove('is-preload');
  });

})();

// Background Slideshow Initialization
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
      $wrapper = document.getElementById('bg'),
      $bgs = [], $bg, k;

  // Create background elements
  for (k in settings.images) {
    $bg = document.createElement('div');
    $bg.style.backgroundImage = 'url("' + k + '")';
    $bg.style.backgroundPosition = settings.images[k];
    $wrapper.appendChild($bg);
    $bgs.push($bg);
  }

  // Start animation if multiple images
  if ($bgs.length > 1) {
    $bgs[pos].classList.add('visible', 'top');
    
    window.setInterval(function() {
      lastPos = pos;
      pos = (pos + 1) % $bgs.length;
      
      $bgs[lastPos].classList.remove('top');
      $bgs[pos].classList.add('visible', 'top');
      
      setTimeout(() => $bgs[lastPos].classList.remove('visible'), 
                settings.delay / 2);
    }, settings.delay);
  }
})();
