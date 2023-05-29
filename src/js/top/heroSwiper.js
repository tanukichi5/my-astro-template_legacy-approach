import Swiper, { Pagination, Autoplay, EffectFade, Navigation } from 'swiper';

const swiper = new Swiper('.js-heroImage', {
  modules: [Navigation, Pagination, Autoplay, EffectFade],
  // Optional parameters
  // direction: 'vertical',
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false, //autoplayが手動操作後止まらないようにする
  },
  speed: 2000, //フェード速度
  effect: 'fade',
  fadeEffect: {
    crossFade: true,
  },

  // If we need pagination
  // pagination: {
  //   el: '.swiper-pagination',
  // },

  // Navigation arrows
  // navigation: {
  //   nextEl: '.swiper-button-next',
  //   prevEl: '.swiper-button-prev',
  // },

  // And if we need scrollbar
  // scrollbar: {
  //   el: '.swiper-scrollbar',
  // },
});