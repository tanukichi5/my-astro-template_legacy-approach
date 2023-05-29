/**
 * 
 * スクロールの状態をbodyのclassとして付与するjs
 * 
 * 1pxでもスクロールしたらbodyにis-scrolledを付与
 * 下スクロール時はbodyにis-scrolled-downを付与
 * 上スクロール時はbodyにis-scrolled-upを付与
 * 
 * @see {@link https://firstlayout.net/scroll-down-and-scroll-up-with-javascript/}
 * 
 */


let offset = 0;
let lastPosition = 0;
let ticking = false;
// const header = document.getElementById('header');
const height = 100;

const onScroll = (currentPosition) => {

  //1pxでもスクロールしてるかどうか
  if (lastPosition >= 1) {
    document.querySelector('body').classList.add("is-scrolled");
  } else {
    document.querySelector('body').classList.remove("is-scrolled");
  }

  if (lastPosition > height || lastPosition === 0) {
    document.querySelector('body').classList.remove("is-scroll-start");
  } else {
    document.querySelector('body').classList.add("is-scroll-start");
  }

  if (lastPosition > height) {
    if (lastPosition > offset) {
       //下スクロール時の処理
      document.querySelector('body').classList.add("is-scroll-down");
      document.querySelector('body').classList.remove("is-scroll-up");
    } else {
       //上スクロール時の処理
      document.querySelector('body').classList.add("is-scroll-up");
      document.querySelector('body').classList.remove("is-scroll-down");
    }
    offset = lastPosition;
  }
};

document.addEventListener('scroll', () => {
  lastPosition = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      onScroll(window.scrollY);
      ticking = false;
    });
    ticking = true;
  }
});
