// Home page: scroll header, reveal-on-scroll, card glow.
// The `js` class is set by an inline script in <head> so revealed sections never flash.
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
  const links = [...bar.querySelectorAll('.navlinks a, .contact-link, .drawer-panel a[href^="#"]')];
  const sections = [...new Set(links.map(link => link.hash.length > 1 && document.getElementById(link.hash.slice(1))).filter(Boolean))];
  const syncCurrent = () => {
    const line = innerHeight * .4;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
    }
    // At the very bottom the last section is too short to reach the line.
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    for (const link of links) {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  syncCurrent();
  addEventListener('scroll', syncCurrent, { passive: true });
  addEventListener('resize', syncCurrent);
}

// In-page links (cover CTA, scroll hint, nav bar, mobile drawer, footer): land with
// the section's eyebrow line (e.g. "WHAT WE DO") 20px below the fixed bar.
// site.css gives the same landing without JS; this keeps it exact and corrects it
// when images or fonts that load during or just after the scroll shift the layout.
const sectionFor = hash => {
  if (hash.length < 2) return null;
  try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return null; }
};
const eyebrowIn = section => section && section.querySelector('.eyebrow');
const landingTop = eyebrow => {
  // offsetTop ignores the reveal transform, so this is the eyebrow's resting position.
  let top = 0;
  for (let el = eyebrow; el; el = el.offsetParent) top += el.offsetTop;
  const max = document.documentElement.scrollHeight - innerHeight;
  return Math.round(Math.max(0, Math.min(max, top - bar.offsetHeight - 20)));
};
let landing = null;
const stopLanding = () => {
  if (!landing) return;
  clearTimeout(landing.timer);
  clearTimeout(landing.end);
  landing = null;
};
const correctLanding = () => {
  const top = landingTop(landing.eyebrow);
  if (Math.abs(scrollY - top) > 2) scrollTo({ top, behavior: 'auto' });
};
// The scroll has ended: correct it, then keep watching for layout shifts for a moment.
const settleLanding = () => {
  if (!landing) return;
  clearTimeout(landing.timer);
  landing.moving = false;
  correctLanding();
  if (!landing.end) landing.end = setTimeout(stopLanding, 2500);
};
const land = (eyebrow, smooth) => {
  stopLanding();
  landing = { eyebrow, moving: true, timer: 0, end: 0 };
  const motion = smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  scrollTo({ top: landingTop(eyebrow), behavior: motion ? 'smooth' : 'auto' });
  // Fallback for browsers without `scrollend`, and for a scroll that never starts.
  landing.timer = setTimeout(settleLanding, 300);
};
if (bar) {
  addEventListener('scroll', () => {
    if (!landing || !landing.moving) return;
    clearTimeout(landing.timer);
    landing.timer = setTimeout(settleLanding, 200);
  }, { passive: true });
  addEventListener('scrollend', () => { if (landing && landing.moving) settleLanding(); });
  new ResizeObserver(() => { if (landing && !landing.moving) correctLanding(); }).observe(document.body);

  // The visitor took over the scroll: stop correcting.
  const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
  addEventListener('wheel', stopLanding, { passive: true });
  addEventListener('touchstart', stopLanding, { passive: true });
  addEventListener('keydown', event => { if (scrollKeys.includes(event.key)) stopLanding(); });

  document.querySelectorAll('a[href^="#"]:not(.brand):not(.skip)').forEach(link => {
    const section = sectionFor(link.hash);
    const eyebrow = eyebrowIn(section);
    if (!eyebrow) return;
    link.addEventListener('click', event => {
      // Let modified clicks (new tab, new window) through.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      link.closest('details')?.removeAttribute('open');
      land(eyebrow, true);
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      // Move keyboard focus to the section so Tab continues from there.
      if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    });
  });

  // Opened with a #hash, or the hash changed (typed, back/forward): same landing.
  const landOnHash = () => {
    const eyebrow = eyebrowIn(sectionFor(location.hash));
    if (eyebrow) land(eyebrow, false);
  };
  landOnHash();
  addEventListener('hashchange', landOnHash);
}

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
