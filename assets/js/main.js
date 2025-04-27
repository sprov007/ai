(function() {
  "use strict";

  var $body = document.querySelector('body');
  var $form = document.querySelector('#signup-form');
  var $submit = document.querySelector('#signup-form input[type="submit"]');
  var $message;

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
