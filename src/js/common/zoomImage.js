/**
 * 
 * 画像を拡大表示する
 * 
 */

import PhotoSwipeLightbox from 'photoswipe/lightbox';

const lightbox = new PhotoSwipeLightbox({
  gallery: '.js-zoomImage',
  children: 'a',
  pswpModule: () => import('photoswipe')
});
lightbox.init();