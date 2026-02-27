/**
 * AMD module: TimelineAxis component (vanilla JS).
 */
define(['./utils/domHelpers', './utils/positionCalculator'], function (dom, posCalc) {
  'use strict';

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(date) {
    return MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
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
      var rangeDays = (maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000);
      // Show roughly one tick every 30 days, minimum 2 ticks
      var step = Math.max(1, Math.round(rangeDays / 10));

      for (var day = 0; day <= rangeDays; day += step) {
        var tickDate = new Date(minDate.getTime() + day * 24 * 60 * 60 * 1000);
        var position = posCalc.calculateEventPosition(tickDate, minDate, scale);

        var tick = dom.createElement('div', 'timeline-axis-tick');
        var tickLine = dom.createElement('div', 'tick-line');
        var tickLabel = dom.createElement('span', 'tick-label');
        tickLabel.textContent = formatDate(tickDate);

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
