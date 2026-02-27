/**
 * AMD module: DOM utility functions for Timeline (vanilla JS).
 */
define([], function () {
  'use strict';

  /**
   * Create a DOM element with optional class and attributes.
   * @param {string} tag
   * @param {string} [className]
   * @param {Object} [attributes]
   * @returns {HTMLElement}
   */
  function createElement(tag, className, attributes) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (attributes) {
      Object.keys(attributes).forEach(function (key) {
        el.setAttribute(key, attributes[key]);
      });
    }
    return el;
  }

  /**
   * Set element position based on orientation.
   * @param {HTMLElement} el
   * @param {number} position - Pixel position
   * @param {string} orientation - 'horizontal' | 'vertical'
   */
  function setPosition(el, position, orientation) {
    if (orientation === 'vertical') {
      el.style.top = position + 'px';
    } else {
      el.style.left = position + 'px';
    }
  }

  /**
   * Add a CSS class to an element.
   * @param {HTMLElement} el
   * @param {string} className
   */
  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  }

  /**
   * Remove a CSS class from an element.
   * @param {HTMLElement} el
   * @param {string} className
   */
  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '').trim();
    }
  }

  /**
   * Check if an element has a CSS class.
   * @param {HTMLElement} el
   * @param {string} className
   * @returns {boolean}
   */
  function hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);
    return new RegExp('\\b' + className + '\\b').test(el.className);
  }

  /**
   * Add an event listener.
   * @param {HTMLElement} el
   * @param {string} event
   * @param {Function} handler
   */
  function on(el, event, handler) {
    el.addEventListener(event, handler);
  }

  /**
   * Remove an event listener.
   * @param {HTMLElement} el
   * @param {string} event
   * @param {Function} handler
   */
  function off(el, event, handler) {
    el.removeEventListener(event, handler);
  }

  return {
    createElement: createElement,
    setPosition: setPosition,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    on: on,
    off: off,
  };
});
