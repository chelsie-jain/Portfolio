
  const LINKEDIN_URL = 'https://www.linkedin.com/in/your-profile';
  document.querySelectorAll('#linkedinLink, #linkedinMobile').forEach(el => {
    if(el) el.setAttribute('href', LINKEDIN_URL);
  });


  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    try{ localStorage.setItem('cj-portfolio-theme', theme); }catch(e){}
  }
  function toggleTheme(){
    const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(current);
  }
  if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if(mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);


  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

  const navLinks = document.querySelectorAll('.nlink');
  const navSections = Array.from(navLinks).map(l => document.querySelector(l.getAttribute('href')));
  const spyIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  navSections.forEach(s => { if(s) spyIO.observe(s); });

  const progressBar = document.getElementById('progressBar');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive:true });
  updateProgress();

  const revealEls = document.querySelectorAll('.reveal');
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealIO.observe(el));


  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1100;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterIO.observe(el));


  const timeline = document.getElementById('timeline');
  const tlFill = document.getElementById('tlFill');
  function updateTimeline(){
    if(!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = Math.min(Math.max(vh - rect.top, 0), rect.height);
    const pct = Math.min(Math.max((visible / rect.height) * 100, 0), 100);
    tlFill.style.height = pct + '%';
  }
  window.addEventListener('scroll', updateTimeline, { passive:true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();


  const tiltCards = document.querySelectorAll('.proj-card');
  if(window.matchMedia('(pointer:fine)').matches){
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateY(0)';
      });
    });
  }


  const projScroller = document.getElementById('projScroller');
  const projPrev = document.getElementById('projPrev');
  const projNext = document.getElementById('projNext');
  let projIndex = 0;
  const PROJ_GROUP = 2;

  function projCards(){ return Array.from(projScroller.querySelectorAll('.proj-card')); }
  function cardLeftInScroller(card){
    return card.getBoundingClientRect().left - projScroller.getBoundingClientRect().left + projScroller.scrollLeft;
  }
  function lastPageStart(total){
    if(total <= 0) return 0;
    const rem = total % PROJ_GROUP;
    return Math.max(0, total - (rem === 0 ? PROJ_GROUP : rem));
  }
  function syncProjIndexFromScroll(){
    const cards = projCards();
    if(!cards.length) return;
    let closest = 0, closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(cardLeftInScroller(card) - projScroller.scrollLeft);
      if(dist < closestDist){ closestDist = dist; closest = i; }
    });

    projIndex = Math.min(Math.round(closest / PROJ_GROUP) * PROJ_GROUP, lastPageStart(cards.length));
  }
  function updateProjNavState(){
    if(!projScroller || !projPrev || !projNext) return;
    const cards = projCards();
    projPrev.disabled = projIndex <= 0;
    projNext.disabled = projIndex >= lastPageStart(cards.length);
  }
  function goToProjIndex(i){
    const cards = projCards();
    if(!cards.length) return;
    const maxStart = lastPageStart(cards.length);
    projIndex = Math.max(0, Math.min(i, maxStart));
    projScroller.scrollTo({ left: cardLeftInScroller(cards[projIndex]), behavior: 'smooth' });
    updateProjNavState();
  }
  let projScrollTimer;
  if(projPrev && projNext && projScroller){
    projPrev.addEventListener('click', () => goToProjIndex(projIndex - PROJ_GROUP));
    projNext.addEventListener('click', () => goToProjIndex(projIndex + PROJ_GROUP));
    projScroller.addEventListener('scroll', () => {
      clearTimeout(projScrollTimer);
      projScrollTimer = setTimeout(() => {
        syncProjIndexFromScroll();
        updateProjNavState();
      }, 120);
    }, { passive:true });
    window.addEventListener('resize', () => { syncProjIndexFromScroll(); updateProjNavState(); });
    updateProjNavState();
  }