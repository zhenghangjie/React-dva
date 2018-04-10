import 'core-js/es6/map';
import 'core-js/es6/set';
import Promise from 'promise-polyfill';
import Fetch from 'fetch-polyfill';

// Promise polyfill
if (!window.Promise) {
  window.Promise = Promise;
}
// Fetch polyfill
if (!window.fetch) {
  window.fetch = Fetch;
}
global.requestAnimationFrame =
  global.requestAnimationFrame || function requestAnimationFrame(callback) {
    setTimeout(callback, 0);
  };
