import { getDocument, GlobalWorkerOptions } from './assets/pdfjs-4.10.38/pdf.min.mjs';
import { EventBus, PDFLinkService, PDFViewer } from './assets/pdfjs-4.10.38/pdf_viewer.mjs';

GlobalWorkerOptions.workerSrc = new URL('./assets/pdfjs-4.10.38/pdf.worker.min.mjs', import.meta.url).href;
const paper = document.getElementById('paper');
const pages = document.getElementById('pages');
const status = document.getElementById('status');
const bus = new EventBus();
const links = new PDFLinkService({ eventBus: bus });
const viewer = new PDFViewer({
  container: paper, viewer: paper.firstElementChild, eventBus: bus, linkService: links,
  removePageBorders: true
});
links.setViewer(viewer);

function openPageFromHash() {
  const page = Number(new URLSearchParams(location.hash.slice(1)).get('page'));
  if (Number.isInteger(page) && page >= 1 && page <= viewer.pagesCount) viewer.currentPageNumber = page;
}
function fitWidth() {
  viewer.currentScaleValue = 'page-width';
  if (viewer.currentScale > 1.35) viewer.currentScale = 1.35;
}
bus.on('pagesinit', () => {
  fitWidth();
  openPageFromHash();
  pages.textContent = viewer.currentPageNumber + ' / ' + viewer.pagesCount;
  window.addEventListener('resize', fitWidth);
  window.addEventListener('hashchange', openPageFromHash);
});
bus.on('pagechanging', ({ pageNumber }) => { pages.textContent = pageNumber + ' / ' + viewer.pagesCount; });
bus.on('pagerendered', ({error}) => { status.hidden = !error; });
try {
  const pdf = await getDocument({url: 'assets/brochure.pdf', isEvalSupported: false}).promise;
  links.setDocument(pdf);
  viewer.setDocument(pdf);
} catch {
  status.firstChild.textContent = '在线预览暂时无法打开。';
}
