/**
 * 
 * Container Queryのポリフィルを読み込みます
 * @see {@link https://coliss.com/articles/build-websites/operation/css/new-container-query-polyfill.html | coliss}
 * 
 */

const supportsContainerQueries = "container" in document.documentElement.style;

if (!supportsContainerQueries) {
  import("https://cdn.skypack.dev/container-query-polyfill");
}