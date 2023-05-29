//画面の高さをcss変数（--vh）に入れるjsです。
//モバイルのsafariの100vhがおかしい問題を解決します。

//使い方
//css側で以下のように指定します。
//height: var(--vh, 100vh);

const setVariableVh = (() => {
  return class SetVariableVH {
    constructor() {
      this.vh = window.innerHeight;
      this.vw = window.innerWidth;
  
      this.init()
    }
  
    init() {
      this.setVariable()
      this.handleResizeEvent()
    }
  
    //css変数をセット
    setVariable() {
      document.documentElement.style.setProperty('--vh', `${this.vh}px`);
      window.addEventListener('load', () => {
        this.vh = window.innerHeight;
        this.vw = window.innerWidth;
        document.documentElement.style.setProperty('--vh', `${this.vh}px`);
      });
    }
  
    //画面幅が変わった場合にcss変数をセット
    handleResizeEvent() {
      window.addEventListener('resize', () => {
        if (this.vw === window.innerWidth) return
      
        this.vh = window.innerHeight;
        this.vw = window.innerWidth;
        this.setVariable();
      });
    }
  }
})();

export default setVariableVh;
// new SetVariableVH()

// import SetVariableVh from '@/libs/setVariableVh'
// const variableVh = new SetVariableVh()