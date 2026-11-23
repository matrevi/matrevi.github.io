const chapterLinks = [...document.querySelectorAll('.toc a')];
const chapters = chapterLinks.map(link => document.querySelector(link.hash));
let scheduled = false;

function markChapter() {
  const top = document.querySelector('header').offsetHeight + 32;
  const current = chapters.filter(section => section.getBoundingClientRect().top <= top).pop();
  const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  chapterLinks.forEach((link, index) => {
    if (chapters[index] === (atEnd ? chapters.at(-1) : current)) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  scheduled = false;
}

function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(markChapter);
}
window.addEventListener('scroll', scheduleUpdate, {passive:true});
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('load', scheduleUpdate);
markChapter();
