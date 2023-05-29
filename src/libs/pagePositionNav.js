import ScrollMagic from "scrollmagic";
import "scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators"

/**
 * 
 * スクロールに応じて対象のナビに「is-current」クラスを付与する
 * 
 * @usage
 * はじめに
 * scrollmagicをインストールする必要があります
 * `npm i scrollmagic@2.0.8`
 * ※バージョン2.0.8で動作確認しました
 * 
 * 読み込み
 * import pagePositionNav from '@/libs/pagePositionNav.js';
 * 
 * 実行
 * pagePositionNav.init();
 * 
 * HTML
 * 対象のセクションにdata-page-section="hoge"
 * 対象のナビにdata-page-nav="hoge"
 * 
 */

const pagePositionNav = (() => {
  class PagePositionNav {

    constructor() {
      this.controller = new ScrollMagic.Controller({ addIndicators: false });
      this.sections = "[data-page-section]";
      this.settings = {
        addClassName: "is-current"
      }
    }

    init(options) {
      this.setup(options);
      this.attachEvent(this.controller);
    }

    //外部から入力された設定をマージ
    setup(options) {
      this.settings = Object.assign({
        addClassName: this.settings.addClassName
      }, options || {});
    }

    //ScrollMagicを実行
    attachEvent(controller) {
      let sections = document.querySelectorAll(this.sections);

      for (let [index, section] of Object.entries(sections)) {

        const nextSectionDistance = this.getNextSectionDistance(section, sections, index)

        let scene_pagePositionNav = new ScrollMagic.Scene({
          triggerElement: section,
          triggerHook: "onLeave",
          duration: section.clientHeight,
          offset: -120
        })
          // .addIndicators()
          .addTo(controller);

        scene_pagePositionNav.on("enter", () => {
          let targetElement = scene_pagePositionNav.triggerElement();
          this.removeNavActiveClass();
          document.querySelector(`[ data-page-nav = ${targetElement.getAttribute("data-page-section")}]`).classList.add(this.settings.addClassName);
        });

        scene_pagePositionNav.on("leave", () => {
          this.removeNavActiveClass();
        });

        //リサイズやスクロールでアップデート
        scene_pagePositionNav.on("update", function (event) {
          this.duration(nextSectionDistance);
        });
      }
    }

    //次のセクションまでの距離を取得
    getNextSectionDistance(section, sections, index) {

      if (sections[Number(index) + 1]) {
        const clientRect = section.getBoundingClientRect(); //現在のセクション
        const clientRectNext = sections[Number(index) + 1].getBoundingClientRect(); //次のセクション

        const clientRectTop = window.pageYOffset + clientRect.top; //ページの上端から、要素の上端までの距離
        const clientRectNextTop = window.pageYOffset + clientRectNext.top; //ページの上端から、要素の上端までの距離

        return clientRectNextTop - clientRectTop;

      } else {

        //次のセクションがない場合は0を返す
        //0を返すことで以降はずっと対象のナビはcurrentになる
        return 0

      }

    }

    removeNavActiveClass() {
      let navElements = document.querySelectorAll("[data-page-nav]");
      for (let navElement of navElements) {
        navElement.classList.remove(this.settings.addClassName);
      }
    }

  }

  return new PagePositionNav();
})();

export default pagePositionNav;

