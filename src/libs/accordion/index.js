/**
 * @usage
 * Accordion
 * アクセシブルなアコーディオンを実装できるライブラリです
 *
 * 読み込み
 * import Accordion from '../../plugins/accordion.js';
 *
 * 実行
 * const accordion = new Accordion(".js-accordion", {options}); //アコーディオン全体を囲ってる枠を指定
 *
 * -options
 * trigger: ".js-accordion-trigger", //トリガー
 * panel: ".js-accordion-panel", //パネル
 * easing: "ease-out", //イージング(CSS)
 * duration: '.3s', //パネルが開く時間(CSS)
 * multipleOpen: true, //パネルを複数開くことができるかどうか
 * defaultOpenPanels: [0,1], //デフォルトで開きたいパネルをindexで指定
 * onOpen: function, パネルを開いたときの処理
 * onClose: function パネルを閉じたときの処理
 *
 * 最初から開く
 * js-accordion-panelにdata-accordion-default-openを付与
 *
 * 最初から閉じる
 * js-accordion-panelにdata-accordion-default-closeを付与
 *
 * 破棄
 * accordion.destroy()
 * 
 * 
 * @template
 * <div class="js-accordion">
 *  <div>
 *    <div>
 *      <button type="button" class="js-accordion-trigger">
 *        アコーディオンのトリガー
 *      </button>
 *    </div>
 *    <div class="js-accordion-panel">
 *      アコーディオンの中身
 *    </div>
 *  </div>
 *  <div>
 *    <div>
 *      <button type="button" class="js-accordion-trigger">
 *        アコーディオンのトリガー
 *      </button>
 *    </div>
 *    <div class="js-accordion-panel">
 *      アコーディオンの中身
 *    </div>
 *  </div>
 * </div>
*/

const accordion = (() => {
  return class Accordion {
    /**
     * Creates an instance of Accordion.
     * @param {string} [rootElement=".js-accordion"]
     * @param {*} options
     */
    constructor(
      rootElement = ".js-accordion",
      options
    ) {

      this.accordionRootElement = convertElement(rootElement);
      //アコーディオンの親要素がない場合は終了
      if (!this.accordionRootElement) return;

      const defaultOptions = {
        triggers: [],
        panels: [],
        trigger: ".js-accordion-trigger",
        panel: ".js-accordion-panel",
        easing: "ease-out",
        duration: '.3s',
        multipleOpen: true,
        defaultOpenPanels: [],
        onOpen: () => { },
        onClose: () => { }
      }

      this.options = this.mergeOptions(defaultOptions, options)

      this.initialized = false;

      this.triggerEvent = [];
      this.windowResizeEvent = null;

      this.transitionendEvent = null

      this.expanded = new Set(); //開いてるパネルのindexを格納

      this.init()
    }

    init() {
      if(this.initialized) return
      //トリガーとパネルに属性を付与
      this.setUpAttribute(this.options.triggers, this.options.panels)

      this.removeEvents()

      this.triggerEvent = this.registerTriggerEvent();
      this.windowResizeEvent = this.registerResizeEvent();

      this.initialized = true;
    }

    registerTriggerEvent() {
      //トリガーをクリックしたときのイベント設定
      let register = [];
      this.options.triggers.forEach((trigger, index) => {
        register.push(this.attachEvent(trigger, 'click', this.triggerClick.bind(this, trigger)))
        register[index].addEvent();
      });
      return register;
    }

    registerResizeEvent() {
      //リサイズ時パネル再計算イベント設定
      let register = "";
      register = this.attachEvent(window, 'resize', this.windowResizePanelHeightRecalculation.bind(this))
      register.addEvent();
      return register;
    }

    removeEvents() {

      if (!this.triggerEvent.length || !this.windowResizeEvent) return

      this.triggerEvent.forEach((trigger) => {
        trigger.removeEvent();
      });
      this.windowResizeEvent.removeEvent();

      this.triggerEvent = []
      this.windowResizeEvent = null

    }

    mergeOptions(defaultOptions, options) {
      const mergeOptions = Object.assign(defaultOptions, options || {});
      mergeOptions.triggers = [...this.accordionRootElement.querySelectorAll(mergeOptions.trigger)]
      mergeOptions.panels = [...this.accordionRootElement.querySelectorAll(mergeOptions.panel)]

      return mergeOptions
    }

    setUpAttribute(triggers, panels) {
      const randomId = Math.random().toString(36).slice(2);
      const pinpointOpen = [];
      const pinpointClose = [];
      triggers.forEach((trigger, index) => {
        trigger.setAttribute('id', `accordion-trigger-${randomId}-${index}`);
        trigger.setAttribute('aria-expanded', "false");
        trigger.setAttribute('aria-controls', `accordion-panel-${randomId}-${index}`);
      });
      panels.forEach((panel, index) => {
        panel.setAttribute('id', `accordion-panel-${randomId}-${index}`);
        panel.setAttribute('aria-hidden', "true");
        panel.style.boxSizing = 'border-box';
        panel.style.overflow = 'hidden';
        panel.style.height = '0px';
        if (panel.hasAttribute("data-accordion-default-open")) {
          pinpointOpen.push(index)
        }
        if (panel.hasAttribute("data-accordion-default-close")) {
          pinpointClose.push(index)
        }
      });
      //最初に開きたいパネルがあれば開く
      this.options.defaultOpenPanels.forEach((index) => {
        this.defaultOpenPanel(index, false)
      });

      pinpointOpen.forEach((index) => {
        this.pinpointOpenPanel(index)
      });
      pinpointClose.forEach((index) => {
        this.pinpointClosePanel(index)
      });

    }

    defaultOpenPanel(index) {
      const trigger = this.options.triggers[index];
      const panel = this.options.panels[index]
      this.panelOpen(trigger, panel);
    }

    pinpointOpenPanel(index) {
      const trigger = this.options.triggers[index];
      const panel = this.options.panels[index]
      this.panelOpen(trigger, panel);
    }
    pinpointClosePanel(index) {
      const trigger = this.options.triggers[index];
      const panel = this.options.panels[index]
      this.panelClose(trigger, panel);
    }

    triggerClick(trigger, e) {
      e.preventDefault();
      // const trigger = e.target;
      const panel = document.querySelector(`#${trigger.getAttribute('aria-controls')}`);


      if (!this.options.multipleOpen) {
        this.expanded.forEach((index) => {
          if (!this.expanded.has(this.getItemIndex(trigger))) {
            this.otherPanelClose(index)
          }
        });
      }

      if (trigger.getAttribute('aria-expanded') == "false") {
        this.panelOpen(trigger, panel, true, e);
      } else {
        this.panelClose(trigger, panel, e);
      }
    }

    panelOpen(trigger, panel, notTransition, event) {
      trigger.setAttribute('aria-expanded', "true");
      panel.setAttribute('aria-hidden', "false");
      panel.style.height = `${this.getPanelHeight(panel)}px`;
      panel.style.visibility = `visible`;
      panel.style.transition = notTransition ? `height ${this.options.easing} ${this.options.duration}, visibility ${this.options.duration}` : "";
      this.expanded.add(this.getItemIndex(trigger))

      if (event) {
        if (this.options.duration == 0) {
          this.onOpen(trigger, panel)
        } else {
          this.transitionendEvent = this.attachEvent(panel, 'transitionend', this.onOpen.bind(this, trigger, panel))
          this.transitionendEvent.addEvent()
        }
      }
    }

    onOpen(trigger, panel) {
      this.options.onOpen(trigger, panel)
      if (!(this.options.duration == 0)) {
        this.transitionendEvent.removeEvent()
      }
    }


    panelClose(trigger, panel, event) {
      trigger.setAttribute('aria-expanded', "false");
      panel.setAttribute('aria-hidden', "true");
      panel.style.height = "0px";
      panel.style.visibility = `hidden`;
      panel.style.transition = `height ${this.options.easing} ${this.options.duration}, visibility ${this.options.duration}`;
      this.expanded.delete(this.getItemIndex(trigger))

      if (event) {
        if (this.options.duration == 0) {
          this.onClose(trigger, panel)
        } else {
          this.transitionendEvent = this.attachEvent(panel, 'transitionend', this.onClose.bind(this, trigger, panel))
          this.transitionendEvent.addEvent()
        }
      }
    }

    onClose(trigger, panel) {
      this.options.onClose(trigger, panel)
      if (!(this.options.duration == 0)) {
        this.transitionendEvent.removeEvent()
      }
    }

    otherPanelClose(index) {
      const trigger = this.options.triggers[index];
      const panel = this.options.panels[index]
      this.panelClose(trigger, panel);
    }

    getItemIndex(trigger) {
      return this.options.triggers.indexOf(trigger);
    }


    getPanelHeight(panel) {
      // パネルのコピーを作る
      let ghostPanel = panel.cloneNode(true);
      // パネルの親ノードに挿入
      panel.parentNode.appendChild(ghostPanel);
      // ひとまずみえなくする
      ghostPanel.style.cssText = "display:block; height:auto; visibility:hidden;";
      // コピーの高さを調べる
      var ghostPanelHeight = ghostPanel.offsetHeight;
      // コピーした要素を削除する
      panel.parentNode.removeChild(ghostPanel);
      // console.log(ghostPanelHeight)
      return ghostPanelHeight
    }

    windowResizePanelHeightRecalculation() {
      this.expanded.forEach((index) => {
        const panel = this.options.panels[index];
        const resizedHeight = this.getPanelHeight(panel);
        panel.style.height = resizedHeight + 'px';
      });
    }

    destroy() {
      if (this.initialized) {
        for (let trigger of this.triggerEvent) {
          trigger.removeEvent();
        }
        this.triggerEvent = [];
        this.windowResizeEvent.removeEvent();
        this.windowResizeEvent = null

        this.options.triggers.forEach((v, i) => {
          const trigger = this.options.triggers[i];
          const panel = this.options.panels[i];
          this.panelOpen(trigger, panel, false)
          panel.removeAttribute("style");
        });
        // this.options.triggers = ""
        // this.options.panels = ""
        this.expanded = new Set();
        this.initialized = false
      }
    }

    attachEvent(element, type, listener, options) {
      return {
        addEvent() {
          element.addEventListener(type, listener, options);
        },
        removeEvent() {
          element.removeEventListener(type, listener);
        }
      }
    }

  }

  function convertElement(obj) {
    if (obj instanceof HTMLElement) {
      return obj
    }
    // if (obj instanceof jQuery) {
    //   return obj[0]
    // }
    return document.querySelector(obj);
  }


})();

export default accordion;