/**
 * 
 * スクロールバーをjsで表示する
 * モバイルsafariはスクロールバー用のCSSが使えないためその対策
 * 
 */

import SimpleBar from 'simplebar'; // or "import SimpleBar from 'simplebar';" if you want to use it manually.
import ResizeObserver from 'resize-observer-polyfill';

//スクロールバーを表示したい要素
//今回はc-table-scrollのみだが、他の要素も対象にしたい場合は".c-table-scroll, .hoge"のように増やす
const elements = document.querySelectorAll(".c-table-scroll");
for (const element of elements) {
  new SimpleBar(element, { autoHide: false });
}

// You will need a ResizeObserver polyfill for browsers that don't support it! (iOS Safari, Edge, ...)
window.ResizeObserver = ResizeObserver;