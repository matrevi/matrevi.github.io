// Resolve bookmarks from the original single-page site.
const chapters = ['services', 'cases', 'delivery', 'acceptance', 'team', 'contact'];
function openBookmarkedChapter() {
  const chapter = location.hash.slice(1);
  // Skip anchors that exist on the home page itself, such as #team.
  if (document.body.classList.contains('home') && chapters.includes(chapter) &&
      !document.getElementById(chapter)) {
    location.replace(chapter + '.html');
  }
}
openBookmarkedChapter();
window.addEventListener('hashchange', openBookmarkedChapter);

document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey ||
      event.altKey || event.shiftKey || event.target.isContentEditable ||
      event.target.closest('input, textarea, select, [role="slider"]')) return;
  const relation = { ArrowLeft: 'prev', ArrowRight: 'next' }[event.key];
  if (!relation) return;
  const link = document.querySelector('a[rel="' + relation + '"]');
  if (link) {
    event.preventDefault();
    link.click();
  }
});
