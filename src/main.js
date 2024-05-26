import { getPictures } from './js/pixabay-api.js';
import { updateGallery, showErrorMessage } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  overlay: true,
  close: true,
  className: 'custom-lightbox',
});

const refs = {
  searchFormEl: document.querySelector('.js-search'),
  searchInputEl: document.querySelector('.input-search'),
  loadMoreBtnEl: document.querySelector('.btn-load-more'),
  endTextEl: document.querySelector('.end-text'),
  galleryEl: document.querySelector('.gallery'),
  loaderEl: document.querySelector('.loader'),
};

const params = {
  currentPage: 1,
  per_page: 15,
};

const smoothScroll = () => {
  const cardHight =
    refs.galleryEl.firstElementChild.getBoundingClientRect().height;

  window.scrollBy({
    top: cardHight * 2,
    left: 0,
    behavior: 'smooth',
  });
};

const renderPictures = async searchStr => {
  refs.loaderEl.classList.toggle('is-hidden');
  try {
    const images = await getPictures(searchStr, params);

    if (!images.hits.length && params.currentPage === 1) {
      showErrorMessage(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      return;
    }

    updateGallery(images.hits);

    lightbox.refresh();

    if (
      images.hits.length < params.per_page ||
      params.currentPage * params.per_page >= images.totalHits
    ) {
      refs.loadMoreBtnEl.classList.add('is-hidden');
      refs.endTextEl.classList.remove('is-hidden');
      refs.loadMoreBtnEl.removeEventListener('click', onLoadMorePressed);
    }

    smoothScroll();

    refs.loaderEl.classList.toggle('is-hidden');
  } catch (error) {
    refs.loaderEl.classList.toggle('is-hidden');
    showErrorMessage('Unknown error. Please try again!');
    console.error(error);
  }
};

refs.searchFormEl.addEventListener('submit', event => {
  event.preventDefault();
  params.currentPage = 1;
  refs.galleryEl.innerHTML = '';

  const searchStr = refs.searchInputEl.value.trim();

  if (!searchStr) return;

  refs.loadMoreBtnEl.classList.remove('is-hidden');
  refs.endTextEl.classList.add('is-hidden');
  refs.loadMoreBtnEl.addEventListener('click', onLoadMorePressed);

  renderPictures(searchStr);
});

const onLoadMorePressed = async event => {
  params.currentPage += 1;
  const searchStr = refs.searchInputEl.value.trim();
  renderPictures(searchStr);
};
