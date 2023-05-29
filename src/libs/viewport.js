/**
 * 
 * 374px未満はJSでviewportを固定する
 * 
 */
const viewport = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  function switchViewport() {
    if (window.outerWidth > 374) {
      viewport.setAttribute('content', 'initial-scale=1.0, width=device-width');
    } else {
      viewport.setAttribute('content', 'width=375');
    }
  }
  addEventListener('resize', switchViewport, false);
}

export default viewport