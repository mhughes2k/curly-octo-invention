/**
 * AMD module: TimelineConnector component (vanilla JS).
 * Renders a connector line between two events on the timeline.
 */
define(['./utils/domHelpers'], function (dom) {
  'use strict';

  /**
   * Creates a TimelineConnector component.
   * @param {Object} config
   * @param {number} config.startPosition - Start pixel position
   * @param {number} config.endPosition - End pixel position
   * @param {string} config.orientation - 'horizontal' | 'vertical'
   * @returns {Object} Component with el (DOM element) and destroy() method
   */
  function TimelineConnector(config) {
    var startPosition = config.startPosition;
    var endPosition = config.endPosition;
    var orientation = config.orientation;

    var el = dom.createElement('div', 'timeline-connector ' + orientation);

    var size = Math.abs(endPosition - startPosition);
    var start = Math.min(startPosition, endPosition);

    if (orientation === 'horizontal') {
      el.style.left = start + 'px';
      el.style.width = size + 'px';
    } else {
      el.style.top = start + 'px';
      el.style.height = size + 'px';
    }

    return {
      el: el,
      destroy: function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  return TimelineConnector;
});
