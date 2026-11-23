// Home page: scroll header, reveal-on-scroll, card glow.
// The `js` class is set by an inline script in <head> so revealed sections never flash.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Show the header once the cover has scrolled out of view.
const bar = document.querySelector('.home-bar');
const cover = document.querySelector('.cover');
if (bar && cover) {
  const syncBar = () => {
    bar.dataset.state = scrollY > cover.offsetHeight * .6 ? 'shown' : 'hidden';
  };
  syncBar();
  addEventListener('scroll', syncBar, { passive: true });

  // Highlight the nav link (or the contact button) of the section in view.
  const links = [...bar.querySelectorAll('.navlinks a, .contact-link')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  const syncCurrent = () => {
    const line = innerHeight * .4;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
    }
    // At the very bottom the last section is too short to reach the line.
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    for (const link of links) link.toggleAttribute('aria-current', !!current && link.hash === '#' + current.id);
  };
  syncCurrent();
  addEventListener('scroll', syncCurrent, { passive: true });
  addEventListener('resize', syncCurrent);
}

// In-page links (cover CTA, scroll hint, nav bar, mobile drawer): land with the
// section's eyebrow line (e.g. "WHAT WE DO") 20px below the fixed bar.
// Without this, scroll-padding-top and .band's scroll-margin-top stack up and
// leave a large gap that shows the bottom of the previous section.
if (bar) document.querySelectorAll('.cover a[href^="#"], .home-bar a[href^="#"]:not(.brand)').forEach(link => {
  const eyebrow = document.querySelector(link.hash + ' .eyebrow');
  if (!eyebrow) return;
  link.addEventListener('click', event => {
    event.preventDefault();
    // offsetTop ignores the reveal transform, so this is the eyebrow's resting position.
    let top = 0;
    for (let el = eyebrow; el; el = el.offsetParent) top += el.offsetTop;
    scrollTo({ top: Math.max(0, top - bar.offsetHeight - 20), behavior: reduce ? 'auto' : 'smooth' });
    history.pushState(null, '', link.hash);
  });
});

const revealer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealer.unobserve(entry.target);
  }
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

// Amber glow that follows the pointer across cards.
if (matchMedia('(hover: hover) and (pointer: fine)').matches) document.querySelectorAll('.glow-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
  }, { passive: true });
});

// Close the mobile drawer after a link is chosen.
document.querySelectorAll('.drawer-panel a').forEach(link => {
  link.addEventListener('click', () => link.closest('details').removeAttribute('open'));
});
