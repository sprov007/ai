// =============================================
// NAVBAR LOADER FOR GITHUB PAGES
// Combines both loading and navbar content
// =============================================

(function() {
  // Navbar HTML content
  const navbarHTML = `
  <nav id="main-nav">
    <div class="nav-container">
      <div class="nav-brand">
        <a href="./dashboard.html">OTPGEN</a>
      </div>
      <div class="nav-links">
        <a href="./dashboard.html" class="icon solid fa-home"><span>Dashboard</span></a>
        <a href="./otpgen.html" class="icon solid fa-key"><span>OTP Generator</span></a>
        <button onclick="applyForFreeService()" class="icon solid fa-star" 
                style="color: #ffd700; border-left: 1px solid rgba(255,215,0,0.3); padding-left: 1em;">
          <span>Free Service</span>
        </button>
      </div>
      <div class="nav-user">
        <button onclick="logout()" class="icon solid fa-sign-out-alt"><span>Logout</span></button>
      </div>
    </div>
    <div class="notice-board">
      <div class="notice-content">
        <span class="icon solid fa-bullhorn"></span>
        <marquee behavior="scroll" direction="left">
          প্রতিটি এন আই ডি কার্ডের জন্য সর্বনিম্ন চার্জ ১০০০টাকা। সার্ভারচার্জ আগেই পরিশোধ করতে হবে। 
          Daily 50 free services available. Contact WhatsApp: 01568760780
        </marquee>
      </div>
    </div>
  </nav>`;

  // Function to load the navbar
  function loadNavbar() {
    try {
      document.body.insertAdjacentHTML('afterbegin', navbarHTML);
      highlightCurrentPage();
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

  // Fallback navbar
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

  // Highlight current page
  function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();
      if (linkPage === currentPage) link.classList.add('active');
    });
  }

  // Logout function
  window.logout = function() {
    localStorage.removeItem('token');
    window.location.href = "./index.html";
  };

  // Free service handler - Modified for 2 daily services
  window.applyForFreeService = function() {
    const today = new Date().toDateString();
    const lastRequest = localStorage.getItem('lastFreeRequest');
    let used = parseInt(localStorage.getItem('usedFreeServices') || 0);

    // Reset counter if new day
    if (lastRequest !== today) {
      used = 0;
      localStorage.setItem('lastFreeRequest', today);
      localStorage.setItem('usedFreeServices', used);
    }

    const remaining = 2 - used;

    if (remaining <= 0) {
      alert('দুঃখিত! আজকের ২টি ফ্রি সার্ভিস শেষ হয়েছে।\nSorry! All 2 free services for today are used.');
      return;
    }

    const confirmMessage = `প্রতিদিন ২টি ফ্রি সার্ভিস (বাকি ${remaining}টি)\n`
                         + `WhatsApp এ "ফ্রি সার্ভিস" লিখে পাঠান 01568760780\n`
                         + `Send "FREE SERVICE" to claim (${remaining} left today)`;

    if (confirm(confirmMessage)) {
      window.open('https://wa.me/8801568760780?text=FREE%20SERVICE%20REQUEST', '_blank');
      const newUsed = used + 1;
      localStorage.setItem('usedFreeServices', newUsed);
      
      if (newUsed === 2) {
        localStorage.setItem('lastFreeRequest', today);
      }
    }
  };


  // Initial load
  if (document.readyState !== 'loading') {
    loadNavbar();
  } else {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  }

  // Window resize handler
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
