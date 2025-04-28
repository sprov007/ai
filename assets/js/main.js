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
<script>
document.getElementById('payment-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const formData = new FormData(this);
  const company = formData.get('company');
  const phone = formData.get('phone');
  const trxid = formData.get('trxid');
  const password = formData.get('password');
  const amount = formData.get('amount');
  const method = formData.get('method');
  const metho = formData.get('metho');
  

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
      body: JSON.stringify({ company, phone, trxid, password, amount, method, metho })
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('confirmation-message').innerHTML = 
        `<p style="color: green;">Payment initiated successfully! Confirmation pending... ⏳ (1 hour countdown started)</p>`;
      startCountdown();
    } else {
      alert(result.message || 'Payment failed!');
    }
  } catch (error) {
    console.error(error);
    alert('Network error!');
  }
});

// Start 1 hour countdown timer
function startCountdown() {
  const countdownElement = document.getElementById('confirmation-message');
  let timeLeft = 3600; // 1 hour in seconds

  const timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    countdownElement.innerHTML = 
      `<p style="color: green;">Payment initiated successfully! Confirm within ${minutes}m ${seconds}s ⏳</p>`;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      countdownElement.innerHTML = `<p style="color: red;">⏰ Payment confirmation expired!</p>`;
    }
  }, 1000);
}
</script>
