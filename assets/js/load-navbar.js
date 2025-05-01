// =============================================
// NAVBAR LOADER FOR GITHUB PAGES
// Combines both loading and navbar content
// =============================================
  // Function to load the navbar
  function loadNavbar() {
    try {
      // Insert navbar HTML
      document.body.insertAdjacentHTML('afterbegin', navbarHTML);
      
      // Highlight current page
      highlightCurrentPage();
      
      // Adjust body padding
      document.body.style.paddingTop = '6em';
      
      // Mobile adjustments
      if (window.innerWidth <= 736) {
        document.querySelectorAll('.nav-links a span, .nav-user button span').forEach(el => {
          el.style.display = 'none';
        });
        document.body.style.paddingTop = '5em';
      }
    } catch (error) {
      console.error('Navbar loading error:', error);
      loadFallbackNavbar();
    }
  }

  // Fallback navbar if main loading fails
  function loadFallbackNavbar() {
    const fallbackHTML = `
    <nav style="position:fixed;top:0;width:100%;background:#000;padding:1em;z-index:1000;">
      <a href="./dashboard.html" style="color:#1cb495;margin-right:1em;">Dashboard</a>
      <a href="./otpgen.html" style="color:#1cb495;">OTP Generator</a>
      <button onclick="logout()" style="float:right;background:none;border:none;color:#fff;">Logout</button>
    </nav>
    <div style="height:4em;"></div>`;
    document.body.insertAdjacentHTML('afterbegin', fallbackHTML);
  }

  // Highlight current page in navigation
  function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  // Logout function
  window.logout = function() {
    localStorage.removeItem('token');
    window.location.href = "./index.html";
  };

  // Load navbar when DOM is ready
  if (document.readyState !== 'loading') {
    loadNavbar();
  } else {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  }

  // Handle window resize for mobile
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 736) {
      document.querySelectorAll('.nav-links a span, .nav-user button span').forEach(el => {
        el.style.display = 'none';
      });
    } else {
      document.querySelectorAll('.nav-links a span, .nav-user button span').forEach(el => {
        el.style.display = 'inline';
      });
    }
  });
})();
// Add this to your existing JS
window.applyForFreeService = function() {
  const lastRequest = localStorage.getItem('lastFreeRequest');
  const today = new Date().toDateString();

  if (confirm(`প্রতিদিন ১টি ফ্রি সার্ভিস পেতে WhatsApp এ "ফ্রি সার্ভিস" লিখে পাঠান 01568760780\nSend "FREE SERVICE" to 01568760780 on WhatsApp to claim`)) {
    window.open('https://wa.me/8801568760780?text=FREE%20SERVICE%20REQUEST', '_blank');
    localStorage.setItem('lastFreeRequest', today);
  }
};
// Add in the applyForFreeService function
const remaining = 50 - parseInt(localStorage.getItem('usedFreeServices') || 0;
if (remaining <= 0) {
  alert('দুঃখিত! আজকের সমস্ত ফ্রি সার্ভিস শেষ হয়েছে।\nSorry! All free services for today are exhausted.');
  return;
}
