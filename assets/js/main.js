	// Play initial animations on page load.
		window.addEventListener('load', function() {
			window.setTimeout(function() {
				$body.classList.remove('is-preload');
			}, 100);
		});

// Slideshow Background.
		(function() {

			// Settings.
				var settings = {

					// Images (in the format of 'url': 'alignment').
						images: {
							'images/bg01.jpg': 'center',
							'images/bg02.jpg': 'center',
							'images/bg03.jpg': 'center'
						},

					// Delay.
						delay: 6000

				};

			// Vars.
				var	pos = 0, lastPos = 0,
					$wrapper, $bgs = [], $bg,
					k, v;

			// Create BG wrapper, BGs.
				$wrapper = document.createElement('div');
					$wrapper.id = 'bg';
					$body.appendChild($wrapper);

				for (k in settings.images) {

					// Create BG.
						$bg = document.createElement('div');
							$bg.style.backgroundImage = 'url("' + k + '")';
							$bg.style.backgroundPosition = settings.images[k];
							$wrapper.appendChild($bg);

					// Add it to array.
						$bgs.push($bg);

				}

			// Main loop.
				$bgs[pos].classList.add('visible');
				$bgs[pos].classList.add('top');

				// Bail if we only have a single BG or the client doesn't support transitions.
					if ($bgs.length == 1
					||	!canUse('transition'))
						return;

				window.setInterval(function() {

					lastPos = pos;
					pos++;

					// Wrap to beginning if necessary.
						if (pos >= $bgs.length)
							pos = 0;

					// Swap top images.
						$bgs[lastPos].classList.remove('top');
						$bgs[pos].classList.add('visible');
						$bgs[pos].classList.add('top');

					// Hide last image after a short delay.
						window.setTimeout(function() {
							$bgs[lastPos].classList.remove('visible');
						}, settings.delay / 2);

				}, settings.delay);

		})();

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
