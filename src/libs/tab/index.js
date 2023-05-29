/**
 * @usage
 * Tab
 * アクセシブルなタブを実装できるライブラリです
 *
 * 読み込み
 * import Tab from '@/libs/tab';
 *
 * 実行
 * const tab = new Tab(".js-tab", {options}); //タブ全体を囲ってる枠を指定
 * 
 * (複数に当てる場合
 * const elements = document.querySelectorAll(".js-tab") as any;
 * for (const element of elements) {
 *   new Tab(element, {
 *     defaultOpenPanel: 0
 *   });
 * }
 *
 * -options
 * tabWrapper: ".js-tab-list", //タブリスト枠のセレクター
 * tabs: ".js-tab-button", //タブボタンのセレクター
 * panelWrapper: ".js-tab-panel-wrapper", //タブパネル枠のセレクター
 * panels: ".js-tab-panel", //タブパネルのセレクター
 * defaultOpenPanel: 0 //最初に開いた状態にしたいパネルのindex
 * 
 * 
 * 
 * @template
 * <div class="js-tab">
 * 
 *   <ul class="js-tab-list">
 *     <li>
 *       <button class="js-tab-button" type="button">
 *         タブ1
 *       </button>
 *     </li>
 *     <li>
 *       <button class="js-tab-button" type="button">
 *         タブ2
 *       </button>
 *     </li>
 *     <li>
 *       <button class="js-tab-button" type="button">
 *         タブ3
 *       </button>
 *     </li>
 *   </ul>
 * 
 *   <div class="js-tab-panel-wrapper">
 *     <div class="js-tab-panel">
 *       <p>タブ1の内容が入ります。</p>
 *     </div>
 *     <div class="js-tab-panel">
 *       <p>タブ2の内容が表示されます。</p>
 *     </div>
 *     <div class="js-tab-panel">
 *       <p>タブ３の内容です。</p>
 *     </div>
 *   </div>
 * 
 * </div>
*/

const tab = (() => {
  return class Tab {
    constructor(rootElement = ".js-tab", options) {
      // console.log(isElement(rootElement[0]))
      this.tabRootElement = convertElement(rootElement);

      //タブの親要素がない場合は終了
      if (!this.tabRootElement) return;

      this.options = {
        tabWrapper: ".js-tab-list",
        tabs: ".js-tab-button",
        panelWrapper: ".js-tab-panel-wrapper",
        panels: ".js-tab-panel",
        defaultOpenPanel: 0
      }

      this.tabWrapper = "";
      this.tabs = "";
      this.panelWrapper = "";
      this.panels = "";

      this.tabEvent = [];
      this.tabMoveEvent = [];

      this.idCount = 0;

      this.initialized = false;

      //外部から入力された設定をマージ
      this.mergeOptions(options);

      this.init()

    }

    init() {
      this.tabWrapper = this.tabRootElement.querySelector(this.options.tabWrapper);
      this.tabs = [...this.tabRootElement.querySelectorAll(this.options.tabs)];
      this.panelWrapper = this.tabRootElement.querySelector(this.options.panelWrapper);
      this.panels = [...this.tabRootElement.querySelectorAll(this.options.panels)];

      //トリガーとパネルに属性を付与
      this.setUpAttribute(this.tabs, this.panels)

      if (!(this.tabEvent.length == this.tabs.length)) {
        //トリガーをクリックしたときのイベント設定
        this.tabs.forEach((tab, index) => {
          this.tabEvent.push(this.attachEvent(tab, 'click', this.switchContent.bind(this)))
          this.tabEvent[index].addEvent();
        });
      }

      if (!(this.tabMoveEvent.length == this.tabs.length)) {
        //タブを方向キーで移動するイベント
        this.tabs.forEach((tab, index) => {
          this.tabMoveEvent.push(this.attachEvent(tab, 'keydown', this.moveTab.bind(this)))
          this.tabMoveEvent[index].addEvent();
        });
      }

      this.initialized = true;
    }

    mergeOptions(options) {
      this.options = Object.assign(this.options, options || {});
    }

    setUpAttribute(tabs, panels) {
      const uuid = this.uuid();
      this.tabWrapper.setAttribute("role", "tab-list")
      tabs.forEach((tab, index) => {
        tab.setAttribute("id", `tab-button-${uuid}-${index}`);
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", `tab-panel-${uuid}-${index}`);
        tab.setAttribute("aria-selected", "false");
        tab.setAttribute('tabindex', '-1');
      });
      panels.forEach((panel, index) => {
        panel.setAttribute("id", `tab-panel-${uuid}-${index}`);
        panel.setAttribute("role", "tab-panel");
        panel.setAttribute("aria-hidden", "true");
        panel.style.display = "none";
      });
      //最初に開きたいパネルを開く
      this.defaultOpenPanel(this.options.defaultOpenPanel)
    }

    switchContent(e) {
      e.preventDefault();
      const tab = e.target;
      const panel = document.querySelector(`#${e.target.getAttribute('aria-controls')}`)

      if (tab.getAttribute('aria-selected') == "false") {
        this.hideContents();
        this.showContent(tab, panel);
      }

    }

    showContent(tab, panel) {
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute('tabindex', '0');
      panel.setAttribute("aria-hidden", "false");
      panel.style.display = "";
    }

    hideContents() {
      this.tabs.forEach((tab, index) => {
        tab.setAttribute("aria-selected", "false");
        tab.setAttribute('tabindex', '-1');
      });
      this.panels.forEach((panel, index) => {
        panel.setAttribute("aria-hidden", "true");
        panel.style.display = "none";
      });
    }

    defaultOpenPanel(index) {
      const tab = this.tabs[index];
      const panel = this.panels[index]
      this.showContent(tab, panel);
    }

    moveTab(event) {
      const pressKeys = {
        left: event.keyCode === 37,
        right: event.keyCode === 39,
        enter: event.keyCode === 13
      }

      //現在のindex
      let currentIndex = this.tabs.indexOf(event.currentTarget);

      //次にフォーカスするindexを取得
      const getNextFocusTabIndex = (index) => {

        let nextFocusTabIndex = index;

        if (pressKeys.left) nextFocusTabIndex -= 1;
        if (pressKeys.right) nextFocusTabIndex += 1;

        //最初のindexより後ろに行くと最後のindexを設定
        if (nextFocusTabIndex === -1) {
          nextFocusTabIndex = this.tabs.length - 1;
        }

        //最後のindexより先に行くと最初のindexを設定
        if (nextFocusTabIndex >= this.tabs.length) {
          nextFocusTabIndex = 0;
        }
        return nextFocusTabIndex
      }

      const target = this.tabs[getNextFocusTabIndex(currentIndex)];

      if (pressKeys.left || pressKeys.right) {
        target.focus();
        event.preventDefault();
      }

      if (pressKeys.enter) {
        target.focus();
        target.click();
        event.preventDefault();
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

    uuid() {
      // ランダムなIDを生成
      const randomID = Math.random().toString(36).slice(2)
      this.idCount = this.idCount++
      return `${randomID}--${this.idCount}`
    }


  }

  function convertElement(obj) {
    if (obj instanceof HTMLElement) {
      return obj
    }
    if (obj instanceof jQuery) {
      return obj[0]
    }
    return document.querySelector(obj);
  }

  // ユニークidを生成
  // let count = 0
  // function uuid() {
  //   // ランダムなIDを生成
  //   const randomID = Math.random().toString(36).slice(2)
  //   this.idCount = this.idCount++
  //   return `${randomID}--${this.idCount}`
  // }

  // function reset() {
  //   count = 0
  // }

})();

export default tab;
