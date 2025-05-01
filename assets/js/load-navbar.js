function loadNavbar() {
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.body.insertAdjacentHTML('afterbegin', data);
      
      // Add active class to current page link
      const currentPage = location.pathname.split('/').pop();
      document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });
    })
    .catch(error => console.error('Error loading navbar:', error));
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = "index.html";
}

// Load navbar when DOM is ready
document.addEventListener('DOMContentLoaded', loadNavbar);
