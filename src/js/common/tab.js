/*

サイト全体で共通で使用するタブ

*/

import Tab from '@/libs/tab';

const elements = document.querySelectorAll(".js-tab");
for (const element of elements) {
  new Tab(element, {
    defaultOpenPanel: 0
  });
}