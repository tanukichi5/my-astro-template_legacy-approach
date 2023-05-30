/*

アコーディオン: サンプル

*/

import Accordion from '@/libs/accordion';

const elements = document.querySelectorAll(".js-sample-accordion");
for (const element of elements) {
  new Accordion(element);
}