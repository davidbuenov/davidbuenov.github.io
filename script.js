/* ==========================================================================
   PARTICLE BACKGROUND EFFECT
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 65;
const connectionDistance = 110;

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Class
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = Math.random() * 2.5 + 1;
    this.color = Math.random() > 0.5 ? '#f7a22b' : '#00d2ff'; // Orange or Cyan
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// Mouse tracking for slight repulsion/attraction
let mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// Animation Loop
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  particles.forEach(p => {
    p.update();
    p.draw();

    // Mouse influence
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x -= dx * 0.01;
        p.y -= dy * 0.01;
      }
    }
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        const alpha = (1 - dist / connectionDistance) * 0.15;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================================================
   MOBILE NAVIGATION
   ========================================================================== */
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const glassNav = document.querySelector('.glass-nav');
const navLinks = document.querySelectorAll('.nav-links a');

mobileNavToggle.addEventListener('click', () => {
  glassNav.classList.toggle('nav-expanded');
  const icon = mobileNavToggle.querySelector('i');
  if (glassNav.classList.contains('nav-expanded')) {
    icon.className = 'fa-solid fa-xmark';
  } else {
    icon.className = 'fa-solid fa-bars';
  }
});

// Close mobile nav on click link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    glassNav.classList.remove('nav-expanded');
    mobileNavToggle.querySelector('i').className = 'fa-solid fa-bars';
    
    // Set active link class
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Active link on scroll
window.addEventListener('scroll', () => {
  let current = "";
  const sections = document.querySelectorAll('section');
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPos >= top && scrollPos < top + height) {
      current = section.getAttribute('id');
    }
  });

  if (current) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
});

/* ==========================================================================
   BILINGUAL ENGINE (TRANSLATION SYSTEM)
   ========================================================================== */
function getBrowserLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  if (userLang && userLang.toLowerCase().startsWith('es')) {
    return 'es';
  }
  return 'en';
}

let currentLang = localStorage.getItem('portfolio-lang') || getBrowserLanguage();

function updateUIStrings() {
  // Update all elements with data-es / data-en
  const translatableElements = document.querySelectorAll('[data-es], [data-en]');
  translatableElements.forEach(el => {
    const translation = el.getAttribute(`data-${currentLang}`);
    if (translation) {
      el.innerHTML = translation;
    }
  });

  // Update form inputs placeholders
  const inputs = document.querySelectorAll('input[data-placeholder-es], textarea[data-placeholder-es]');
  inputs.forEach(input => {
    const placeholder = input.getAttribute(`data-placeholder-${currentLang}`);
    if (placeholder) {
      input.placeholder = placeholder;
    }
  });

  // Update filter buttons inner counts correctly by referencing inner elements
  updateFilterCounts();
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('portfolio-lang', lang);
  
  // Toggle active class on lang switcher buttons
  document.querySelectorAll('.lang-btn-visual').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Trigger HTML text swaps
  updateUIStrings();
  
  // Re-render project cards in the selected language
  const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter') || 'all';
  renderProjects(activeFilter);
}

// Bind language switcher buttons
document.querySelectorAll('.lang-btn-visual').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.getAttribute('data-lang'));
  });
});

/* ==========================================================================
   PROJECTS RENDER & FILTERING
   ========================================================================== */
const projectsGrid = document.getElementById('projects-grid-container');
const filterBtns = document.querySelectorAll('.filter-btn');

// Language color mapping
const langColors = {
  "JavaScript": "#f1e05a",
  "Python": "#3572A5",
  "C++": "#f34b7d",
  "TypeScript": "#3178c6",
  "VBA": "#867db1",
  "Batchfile": "#c1f12e",
  "Markdown": "#083fa1",
  "TeX": "#3d6117",
  "Jupyter Notebook": "#DA5B0B",
  "default": "#8b949e"
};

// Render project counts
function updateFilterCounts() {
  const counts = { all: 0, ai: 0, unreal: 0, tools: 0 };
  projectsData.forEach(p => {
    counts.all++;
    if (counts[p.category] !== undefined) {
      counts[p.category]++;
    }
  });
  
  // Set counts inside active spans (support both ES and EN nodes)
  const allSpanEs = document.getElementById('count-all');
  if (allSpanEs) allSpanEs.textContent = counts.all;
  const allSpanEn = document.getElementById('count-all-en');
  if (allSpanEn) allSpanEn.textContent = counts.all;

  const aiSpanEs = document.getElementById('count-ai');
  if (aiSpanEs) aiSpanEs.textContent = counts.ai;
  const aiSpanEn = document.getElementById('count-ai-en');
  if (aiSpanEn) aiSpanEn.textContent = counts.ai;

  const unrealSpanEs = document.getElementById('count-unreal');
  if (unrealSpanEs) unrealSpanEs.textContent = counts.unreal;
  const unrealSpanEn = document.getElementById('count-unreal-en');
  if (unrealSpanEn) unrealSpanEn.textContent = counts.unreal;

  const toolsSpanEs = document.getElementById('count-tools');
  if (toolsSpanEs) toolsSpanEs.textContent = counts.tools;
  const toolsSpanEn = document.getElementById('count-tools-en');
  if (toolsSpanEn) toolsSpanEn.textContent = counts.tools;
}

// Generate project card HTML
function createProjectCard(proj) {
  const langColor = langColors[proj.lang] || langColors.default;
  const tagsHtml = proj.tags.map(t => `<span class="project-tag-item">${t}</span>`).join('');
  
  // Select title and description based on current active language
  const title = currentLang === 'es' ? proj.title_es : proj.title_en;
  const desc = currentLang === 'es' ? proj.description_es : proj.description_en;

  const starBadge = proj.stars > 0 ? `
    <div class="project-stars">
      <i class="fa-solid fa-star"></i> ${proj.stars}
    </div>
  ` : '';
  
  const demoLink = proj.demo ? `
    <a href="${proj.demo}" target="_blank" class="project-link-btn" title="Live Demo">
      <i class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>
  ` : '';

  const iconClass = proj.category === 'ai' ? 'fa-solid fa-robot' :
                    proj.category === 'unreal' ? 'fa-solid fa-gamepad' :
                    'fa-solid fa-wrench';

  return `
    <div class="project-card glass-card" data-category="${proj.category}">
      <div class="project-header">
        <div class="project-icon-box">
          <i class="${iconClass}"></i>
        </div>
        ${starBadge}
      </div>
      <h3>${title}</h3>
      <p class="project-desc">${desc}</p>
      <div class="project-tags">
        ${tagsHtml}
      </div>
      <div class="project-footer">
        <div class="project-lang">
          <span class="lang-color-dot" style="background-color: ${langColor};"></span>
          ${proj.lang || 'N/A'}
        </div>
        <div class="project-links">
          ${demoLink}
          <a href="${proj.github}" target="_blank" class="project-link-btn" title="Código en GitHub">
            <i class="fa-brands fa-github"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

let currentSort = 'recent';

// Render all projects
function renderProjects(filterValue = 'all') {
  projectsGrid.innerHTML = '';
  
  // 1. Filter
  let filtered = projectsData.filter(p => filterValue === 'all' || p.category === filterValue);
  
  // 2. Sort
  if (currentSort === 'recent') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === 'stars') {
    filtered.sort((a, b) => {
      if (b.stars !== a.stars) {
        return b.stars - a.stars;
      }
      return new Date(b.date) - new Date(a.date);
    });
  }
  
  // 3. Render
  filtered.forEach(p => {
    projectsGrid.innerHTML += createProjectCard(p);
  });
}

// Filter button events
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.getAttribute('data-filter'));
  });
});

// Sorter button events
const sorterBtns = document.querySelectorAll('.sorter-btn');
sorterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sorterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.getAttribute('data-sort');
    
    // Get currently active filter to keep it
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    renderProjects(activeFilter);
  });
});

/* ==========================================================================
   CONTACT FORM SUBMIT (FORMSPREE INTEGRATION)
   ========================================================================== */
const contactForm = document.getElementById('portfolio-contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('form-submit-btn');
    const originalBtnHtml = submitBtn.innerHTML;
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = currentLang === 'es' 
      ? 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>' 
      : 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
      
    const data = new FormData(contactForm);
    
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const successMsg = currentLang === 'es'
          ? '¡Gracias! Tu mensaje ha sido enviado con éxito. Me pondré en contacto contigo lo antes posible.'
          : 'Thank you! Your message has been sent successfully. I will get back to you as soon as possible.';
        alert(successMsg);
        contactForm.reset();
      } else {
        const errorData = await response.json();
        const errorMsg = currentLang === 'es'
          ? `Error al enviar el mensaje: ${errorData.errors ? errorData.errors.map(err => err.message).join(', ') : 'Inténtalo de nuevo.'}`
          : `Error sending message: ${errorData.errors ? errorData.errors.map(err => err.message).join(', ') : 'Please try again.'}`;
        alert(errorMsg);
      }
    } catch (error) {
      const errorMsg = currentLang === 'es'
        ? 'Error de red. Por favor, comprueba tu conexión a internet.'
        : 'Network error. Please check your internet connection.';
      alert(errorMsg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
// Load language from storage on init
setLanguage(currentLang);
