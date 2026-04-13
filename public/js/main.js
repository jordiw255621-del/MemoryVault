const API_URL = '/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }
};

const toast = {
  show(message, type = 'success') {
    const container = document.querySelector('.toast-container') || this.createContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;
    toastEl.innerHTML = `
      <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' 
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'}
      </svg>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toastEl);
    setTimeout(() => toastEl.classList.add('show'), 10);
    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 300);
    }, 4000);
  },

  createContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
};

const modal = {
  show(options) {
    const overlay = document.querySelector('.modal-overlay') || this.create();
    const title = overlay.querySelector('h3');
    const message = overlay.querySelector('p');
    const confirmBtn = overlay.querySelector('.confirm-btn');
    const cancelBtn = overlay.querySelector('.cancel-btn');

    title.textContent = options.title;
    message.textContent = options.message;
    
    confirmBtn.onclick = () => {
      if (options.onConfirm) options.onConfirm();
      this.hide();
    };
    
    cancelBtn.onclick = () => this.hide();
    
    overlay.classList.add('active');
  },

  hide() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  create() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3>Confirm Action</h3>
        <p>Are you sure you want to proceed?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-danger confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });
    return overlay;
  }
};

function animateOnScroll() {
  const elements = document.querySelectorAll('.scroll-animate');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));
}

function initAnimations() {
  const elements = document.querySelectorAll('.animation-wrapper');
  setTimeout(() => {
    elements.forEach(el => el.classList.add('visible'));
  }, 100);
}

function checkAuth() {
  const token = localStorage.getItem('token');
  const protectedPages = ['dashboard.html', 'entries.html', 'entry-form.html', 'entry-view.html', 'trash.html', 'settings.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (protectedPages.includes(currentPage)) {
    if (!token) {
      window.location.href = 'login.html';
      return false;
    }
  }

  if ((currentPage === 'login.html' || currentPage === 'register.html') && token) {
    window.location.href = 'dashboard.html';
  }

  return true;
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

async function fetchStats() {
  try {
    return await api.request('/export/stats');
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return { totalEntries: 0, totalPhotos: 0, trashCount: 0, daysActive: 0 };
  }
}

function startTypingAnimation() {
  const el1 = document.getElementById('typingText1');
  const el2 = document.getElementById('typingText2');
  const el3 = document.getElementById('typingText3');
  const cursor1 = document.getElementById('cursor1');
  const cursor2 = document.getElementById('cursor2');
  const cursor3 = document.getElementById('cursor3');
  
  if (!el1 || !el2 || !el3) return;
  
  const text1 = "My Morning";
  const text2 = "Had a really productive day today.";
  const text3 = "Feeling grateful for everything.";
  
  let charIndex1 = 0;
  let charIndex2 = 0;
  let charIndex3 = 0;
  
  function typeLine1() {
    if (charIndex1 < text1.length) {
      el1.textContent += text1.charAt(charIndex1);
      charIndex1++;
      setTimeout(typeLine1, 180 + Math.random() * 150);
    } else {
      cursor1.style.display = 'none';
      cursor2.style.display = 'inline';
      setTimeout(typeLine2, 400);
    }
  }
  
  function typeLine2() {
    if (charIndex2 < text2.length) {
      el2.textContent += text2.charAt(charIndex2);
      charIndex2++;
      setTimeout(typeLine2, 120 + Math.random() * 100);
    } else {
      cursor2.style.display = 'none';
      cursor3.style.display = 'inline';
      setTimeout(typeLine3, 300);
    }
  }
  
  function typeLine3() {
    if (charIndex3 < text3.length) {
      el3.textContent += text3.charAt(charIndex3);
      charIndex3++;
      setTimeout(typeLine3, 130 + Math.random() * 110);
    } else {
      cursor3.style.display = 'none';
    }
  }
  
  setTimeout(typeLine1, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  initAnimations();
  animateOnScroll();
  startTypingAnimation();
});

window.addEventListener('beforeunload', () => {
  modal.hide();
});