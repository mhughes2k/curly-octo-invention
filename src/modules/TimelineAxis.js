/**
 * AMD module: TimelineAxis component (vanilla JS).
 */
define(['./utils/domHelpers', './utils/positionCalculator'], function (dom, posCalc) {
  'use strict';

  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /**
   * Formats a date according to a format token (mirrors date-fns patterns used in React version).
   * Supported tokens: 'MMM d', 'MMM yyyy', 'yyyy'
   * @param {Date} date
   * @param {string} fmt
   * @returns {string}
   */
  function formatDate(date, fmt) {
    var mon = MONTHS_SHORT[date.getMonth()];
    if (fmt === 'MMM d') {
      return mon + ' ' + date.getDate();
    }
    if (fmt === 'MMM yyyy') {
      return mon + ' ' + date.getFullYear();
    }
    // 'yyyy'
    return String(date.getFullYear());
  }

  /**
   * Returns tick interval and format string for a given range in days.
   * Mirrors the React getTickInterval() logic exactly.
   * @param {number} rangeDays
   * @returns {{ interval: number, fmt: string }}
   */
  function getTickInterval(rangeDays) {
    if (rangeDays <= 30)  return { interval: 1,   fmt: 'MMM d' };
    if (rangeDays <= 90)  return { interval: 30,  fmt: 'MMM yyyy' };
    if (rangeDays <= 180) return { interval: 60,  fmt: 'MMM yyyy' };
    if (rangeDays <= 365) return { interval: 90,  fmt: 'MMM yyyy' };
    return                       { interval: 365, fmt: 'yyyy' };
  }

  /**
   * Creates a TimelineAxis component.
   * @param {Object} config
   * @param {HTMLElement} config.container - Parent container element
   * @param {Date} config.minDate - Start of timeline
   * @param {Date} config.maxDate - End of timeline
   * @param {number} config.scale - Pixels per day
   * @param {string} config.orientation - 'horizontal' | 'vertical'
   * @returns {Object} Component with render(), update(config), destroy() methods
   */
  function TimelineAxis(config) {
    var container = config.container;
    var minDate = config.minDate;
    var maxDate = config.maxDate;
    var scale = config.scale;
    var orientation = config.orientation;

    var el = dom.createElement('div', 'timeline-axis ' + orientation);
    container.appendChild(el);

    var ticks = [];

    function clearTicks() {
      ticks.forEach(function (t) { if (t.parentNode) t.parentNode.removeChild(t); });
      ticks = [];
    }

    function renderTicks() {
      clearTicks();
      var MS_PER_DAY = 24 * 60 * 60 * 1000;
      var rangeDays = Math.round((maxDate.getTime() - minDate.getTime()) / MS_PER_DAY);
      var tickConfig = getTickInterval(rangeDays);
      var step = tickConfig.interval;
      var fmt = tickConfig.fmt;

      for (var day = 0; day <= rangeDays; day += step) {
        var tickDate = new Date(minDate.getTime() + day * MS_PER_DAY);
        var position = posCalc.calculateEventPosition(tickDate, minDate, scale);

        var tick = dom.createElement('div', 'timeline-axis-tick');
        var tickLine = dom.createElement('div', 'tick-line');
        var tickLabel = dom.createElement('span', 'tick-label');
        tickLabel.textContent = formatDate(tickDate, fmt);

        tick.appendChild(tickLine);
        tick.appendChild(tickLabel);

        if (orientation === 'horizontal') {
          tick.style.left = position + 'px';
        } else {
          tick.style.top = position + 'px';
        }

        el.appendChild(tick);
        ticks.push(tick);
      }
    }

    return {
      /** Render axis ticks into the container. */
      render: function () { renderTicks(); },

      /**
       * Update axis configuration and re-render.
       * @param {Object} newConfig
       */
      update: function (newConfig) {
        if (newConfig.minDate !== undefined) minDate = newConfig.minDate;
        if (newConfig.maxDate !== undefined) maxDate = newConfig.maxDate;
        if (newConfig.scale !== undefined) scale = newConfig.scale;
        if (newConfig.orientation !== undefined) {
          orientation = newConfig.orientation;
          el.className = 'timeline-axis ' + orientation;
        }
        renderTicks();
      },

      /** Remove the axis element and clean up. */
      destroy: function () {
        clearTicks();
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  return TimelineAxis;
});
