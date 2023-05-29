/*
    Simplemodal
    モーダルライブラリです
    HTMLの属性を切り替えるだけです。モーダル表示・非表示はCSSで行う
    ※CSSは自分で書いてください

    読み込み
    import Simplemodal from '../../plugins/simplemodal.js';

    HTML
    <button data-simplemodal-trigger="modal-id-01">モーダルを開く</button>

    <div id="modal-id-01">
      モーダルの中身
    <div>

    実行
    default)
    const simplemodal = new Simplemodal();

    custom Example)
    const simplemodal = new Simplemodal({
      trigger: "data-hoge-trigger",
      backFixed: false,
    });
*/

const simplemodal = (() => {
  //https://gist.github.com/ark-tds/cf5e0ecbf9311043823c869defa70b28
  const FOCUSABLE_ELEMENTS = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([aria-hidden])',
    'textarea:not([disabled]):not([aria-hidden])',
    'button:not([disabled]):not([aria-hidden])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])'
  ]

  return class Simplemodal {
    constructor(options) {

      const defaultOptions = {
        triggers: [],
        trigger: "data-simplemodal-trigger",
        modalContent: null, //任意のモーダル要素
        backFixed: true,
        multipleOpen: false,
        clickOutSideClose: false,
        onOpen: () => { },
        onClose: () => { }
      }

      this.options = this.mergeOptions(defaultOptions, options)

      this.initialized = false;

      this.triggerEvent = [];
      this.windowResizeEvent = null;
      this.onKeydown = this.onKeydown.bind(this)

      this.transitionendEvent = null

      this.clickOutSideCloseEvent = null

      this.expanded = {
        trigger: [],
        content: []
      }

      this.uuid = null

      this.popoverUpdateReizeEvent = null
      this.popoverUpdateScrollEvent = null

      this.init()
    }

    init() {
      //トリガーとパネルに属性を付与
      this.setUpAttribute(this.options.triggers);

      this.triggerEvent = [];
      this.triggerEvent = this.registerTriggerEvent();

      this.initialized = true;
    }

    mergeOptions(defaultOptions, options) {
      const mergeOptions = Object.assign(defaultOptions, options || {});
      mergeOptions.triggers = [...document.querySelectorAll(`[${mergeOptions.trigger}]`)]

      return mergeOptions
    }

    setUpAttribute(triggers) {
      const randomId = Math.random().toString(36).slice(2);
      triggers.forEach((trigger, index) => {
        let id = trigger.getAttribute(this.options.trigger);
        let content = document.getElementById(id);
        if (!id || !content) return
        trigger.setAttribute('aria-expanded', "false");
        trigger.setAttribute('aria-controls', id);
        content.setAttribute('aria-hidden', "true");

        //modalContentが指定されている場合はその対象セレクターにユニークclassを付与
        if (this.options.modalContent !== null) {
          content.querySelector(`${this.options.modalContent}`).classList.add(`modal-${randomId}`);
          this.uuid = `modal-${randomId}`
        }

      });
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

    triggerClick(trigger, event) {
      //defaultのクリックイベントを無効にするか
      if(!event.currentTarget.dataset.prevent) {
        event.preventDefault();
      }
      // const trigger = event.target;
      const content = document.querySelector(`#${trigger.getAttribute('aria-controls')}`)

      if (trigger.getAttribute('aria-expanded') == "false") {
        this.modalOpen(trigger, content, event);
      } else {
        this.modalClose(trigger, content, event);
      }

    }

    modalOpen(trigger, content, event) {

      //複数モーダルを開かない場合は全てのモーダルを閉じる
      if (!this.options.multipleOpen) this.closeAllModal();

      this.attachEvent(document, "keydown", this.onKeydown).addEvent();

      if(event) {
        if(event.currentTarget.dataset.popover) this.popover(true, trigger, content, event);
      }

      //モーダル外側クリック時のイベント登録
      if (this.options.clickOutSideClose) {
        this.clickOutSideCloseEvent = this.attachEvent(document, "click", this.clickOutSideClose.bind(this, trigger, content))
        this.clickOutSideCloseEvent.addEvent();
      }

      this.options.triggers.forEach((t, index) => {
        if (t.getAttribute('aria-controls') == trigger.getAttribute('aria-controls')) {
          t.setAttribute('aria-expanded', "true");
          t.classList.remove("is-close");
          t.classList.add("is-open");
        }
      });
      content.setAttribute('aria-hidden', "false");
      content.classList.remove("is-close");
      content.classList.add("is-open");

      if (this.options.backFixed) this.backFixed(true);


      this.expanded.trigger.push(trigger);
      this.expanded.content.push(content);

      this.options.onOpen(trigger, content)

    }

    popover(popover, trigger, content, event) {

      if(popover) {

        content.style.position = "absolute"
        // content.style.zIndex = "1000"
        // content.style.width = "200px"

        this.setPopoverPosition(trigger, content)
      
      // `${event.currentTarget.getBoundingClientRect().left + event.currentTarget.clientWidth - content.getBoundingClientRect().width + 1}px`
        this.popoverUpdateReizeEvent = this.attachEvent(window, "resize", this.setPopoverPosition.bind(this, trigger, content))
        this.popoverUpdateScrollevent = this.attachEvent(window, "scroll", this.setPopoverPosition.bind(this, trigger, content))

        this.popoverUpdateReizeEvent.addEvent()
        this.popoverUpdateScrollevent.addEvent()

      } else {
        if(this.popoverUpdateReizeEvent) this.popoverUpdateReizeEvent.removeEvent()
        if(this.popoverUpdateScrollevent) this.popoverUpdateScrollevent.removeEvent()
        content.style.position = ""
        content.style.top = ""
        content.style.left = ""
      }
      

    }

    setPopoverPosition(trigger, content) {
      // console.log(event.currentTarget.clientHeight + this.getScrollY())
      const triggerWidth = trigger.getBoundingClientRect().width
      const triggerHeight = trigger.getBoundingClientRect().height
      const triggerLeft = trigger.getBoundingClientRect().left
      const triggerRight = window.innerWidth - trigger.getBoundingClientRect().right
      const triggerTop = trigger.getBoundingClientRect().top

      const offset = trigger.dataset.popoverOffset ? Number(trigger.dataset.popoverOffset) : 0

      const scrollPosition = this.getScrollY()
      
      const contentWidth = content.getBoundingClientRect().width


      //画面外にはみ出た分のモーダル（popover）の長さ
      const rightOffScreenContent = (contentWidth / 2) - (triggerRight + triggerWidth / 2) >= 0
        ? (contentWidth / 2) - (triggerRight + triggerWidth / 2)
        : 0
      const leftOffScreenContent = (contentWidth / 2) - (triggerLeft + triggerWidth / 2) >= 0
        ? (contentWidth / 2) - (triggerLeft + triggerWidth / 2)
        : 0

      // console.log(rightOffScreenContent)
      // console.log(leftOffScreenContent)

      content.style.top = triggerTop + triggerHeight + scrollPosition + offset + "px"
      content.style.left = triggerLeft + triggerWidth - (triggerWidth / 2 + contentWidth / 2) - rightOffScreenContent + leftOffScreenContent + "px"

    }


    modalClose(trigger, content, event) {

      this.options.triggers.forEach((t, index) => {
        if (t.getAttribute('aria-controls') == trigger.getAttribute('aria-controls')) {
          t.setAttribute('aria-expanded', "false");
          t.classList.remove("is-open");
          t.classList.add("is-close");
        }
      });

      content.setAttribute('aria-hidden', "true");
      content.classList.remove("is-open");
      content.classList.add("is-close");

      if (this.options.backFixed) this.backFixed();

      this.expanded.trigger.pop();
      this.expanded.content.pop();

      if (!this.expanded.content.length) {
        this.attachEvent(document, "keydown", this.onKeydown).removeEvent();
      }

      //モーダル外側クリック時のイベント削除
      if (this.options.clickOutSideClose) {
        this.clickOutSideCloseEvent.removeEvent();
      }

      this.popover(false, trigger, content, event);

      this.options.onClose(trigger, content)
    }



    closeAllModal() {
      // console.log(this.expanded.trigger.length)
      if (this.expanded.trigger.length) {
        this.expanded.trigger.forEach((trigger) => {
          const content = document.querySelector(`#${trigger.getAttribute('aria-controls')}`)
          this.modalClose(trigger, content);
        })
      }
    }

    onKeydown(event) {
      // esc
      if (event.keyCode === 27) {
        // console.log(this.expanded.content[this.expanded.content.length - 1])
        this.expanded.trigger[this.expanded.trigger.length - 1].focus()
        this.modalClose(this.expanded.trigger[this.expanded.trigger.length - 1], this.expanded.content[this.expanded.content.length - 1], event)
      }
      //tab
      if (event.keyCode === 9) {
        this.retainFocus(event)
      }
    }

    retainFocus(event) {
      let focusableNodes = this.getFocusableNodes()

      if (focusableNodes.length === 0) return

      const focusedItemIndex = focusableNodes.indexOf(document.activeElement)

      //外側にフォーカスしている場合は強制的にモーダルの最初の要素をフォーカス
      if (focusedItemIndex === -1) {
        focusableNodes[0].focus()
        event.preventDefault()
      }

      if (event.shiftKey && focusedItemIndex === 0) {
        focusableNodes[focusableNodes.length - 1].focus()
        event.preventDefault()
      }

      if (!event.shiftKey && focusableNodes.length > 0 && focusedItemIndex === focusableNodes.length - 1) {
        focusableNodes[0].focus()
        event.preventDefault()
      }

    }

    getFocusableNodes() {
      const nodes = this.expanded.content[this.expanded.content.length - 1].querySelectorAll(FOCUSABLE_ELEMENTS)
      return [...nodes]
    }

    backFixed(fixed) {

      //固定するスクロール要素を取得(htmlもしくはbody)
      /**
      * @see {@link https://canonono.com/web/js/scrolling-element}
      */
      const scrollElement = 'scrollingElement' in document
        ? document.scrollingElement
        : document.documentElement;

      //現在のスクロール量をセット、すでに固定されている場合はscrollElementにセットされているtopの値を使用
      const scrollY = fixed
        ? this.getScrollY()
        : parseInt(scrollElement.style.top);

      //固定用CSS
      const styles = {
        position: 'fixed',
        top: `${scrollY * -1}px`,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      };

      //scrollElementに固定用CSSを反映
      for (const key in styles) {
        scrollElement.style[key] = fixed
          ? styles[key]
          : '';
      }

      !fixed ? scrollElement.classList.remove("is-backFixed") : scrollElement.classList.add("is-backFixed");

      //固定解除で元の位置にスクロール
      if (!fixed) window.scrollTo(0, scrollY * -1);
    };


    
    open(modalID, options) {
      if (!document.querySelector(`[${this.options.trigger}="${modalID}"]`)) return
      // console.log(document.querySelector(`[${this.options.trigger}="${modalID}"]`))
      const trigger = document.querySelector(`[${this.options.trigger}="${modalID}"]`)
      const content = document.querySelector(`#${trigger.getAttribute('aria-controls')}`)
      // console.log(this.options);
      this.options = this.mergeOptions(this.options, options)
      this.modalOpen(trigger, content)
    }
    
    close(modalID, options) {
      if (!document.querySelector(`[${this.options.trigger}="${modalID}"]`)) return
      // console.log(document.querySelector(`[${this.options.trigger}="${modalID}"]`))
      const trigger = document.querySelector(`[${this.options.trigger}="${modalID}"]`)
      const content = document.querySelector(`#${trigger.getAttribute('aria-controls')}`)
      // console.log(this.options);
      this.options = this.mergeOptions(this.options, options)
      this.modalClose(trigger, content)
    }

    updateOptions(modalID, options) {
      if (!document.querySelector(`[${this.options.trigger}="${modalID}"]`)) return
      this.options = this.mergeOptions(this.options, options)
    }

    // clickOutSideClose(trigger, content, e) {

    //   const id = trigger.getAttribute(this.options.trigger)
    //   const root = e.target.closest(this.options.modalContent)
    //   console.log(root)
    //   // const modalContent = this.options.modalContent
    //   //   ? !root.querySelector(this.options.modalContent)
    //   //   : !root

    //   if (!root && !e.target.closest(`[${this.options.trigger}]`)) {

    //     if (!this.expanded.content.includes(content)) return

    //     this.modalClose(trigger, content)
    //   }
    // }

    //モーダルの外側をクリックしたら閉じる
    clickOutSideClose(trigger, content, e) {

      const id = trigger.getAttribute(this.options.trigger)
      const target = this.options.modalContent !== null
        ? !e.target.closest(`.${this.uuid}`)
        : !e.target.closest(`#${id}`)

      if (target && !e.target.closest(`[${this.options.trigger}]`)) {

        if (!this.expanded.content.includes(content)) return

        this.modalClose(trigger, content)
      }
    }



    /**
    * @see {@link https://gist.github.com/think49/4431f6909b31b0c154c2054f94c546c0}
    */
    getScrollY() {
      if ('scrollY' in window) return window.scrollY;
      if ('pageYOffset' in window) return window.pageYOffset;

      const doc = window.document;

      return doc.compatMode === 'CSS1Compat' ? doc.documentElement.scrollTop : doc.body.scrollTop;
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
    if (obj instanceof jQuery) {
      return obj[0]
    }
    return document.querySelector(obj);
  }

})();

export default simplemodal;


// const simplemodal = new Simplemodal()
// window.simplemodal = simplemodal


// const simplepopover = new Simplemodal({
//   trigger : "data-popover-trigger",
//   clickOutSideClose : true,
//   backFixed : false
// })

// const fullScreenMenu = new Simplemodal({
//   trigger : "data-fullScreenMenu-trigger",
//   clickOutSideClose : true
// })

// const sideFixedMenuButtons = new Simplemodal({
//   trigger : "data-sideFixedMenuButtons-trigger",
//   clickOutSideClose : true,
//   backFixed : false
// })
