/*

サイト全体で共通で使用するアコーディオン

*/

import Accordion from '@/libs/accordion';

const elements = document.querySelectorAll(".js-accordion");
for (const element of elements) {
  new Accordion(element);
}