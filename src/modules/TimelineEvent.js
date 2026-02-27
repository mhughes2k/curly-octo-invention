/**
 * AMD module: TimelineEvent component (vanilla JS).
 */
define(['./utils/domHelpers'], function (dom) {
  'use strict';

  /**
   * Creates a TimelineEvent component.
   * @param {Object} config
   * @param {Object} config.event - Event data {id, label, description, date, category}
   * @param {number} config.position - Pixel position
   * @param {string} config.orientation - 'horizontal' | 'vertical'
   * @param {Function} config.onClick - Click callback receiving the event data
   * @returns {Object} Component with el (DOM element) and destroy() method
   */
  function TimelineEvent(config) {
    var event = config.event;
    var position = config.position;
    var orientation = config.orientation;
    var onClick = config.onClick;

    // Build element
    var el = dom.createElement('div', 'timeline-event');
    if (event.category) dom.addClass(el, event.category);
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', event.label + (event.description ? ': ' + event.description : ''));

    var marker = dom.createElement('div', 'event-marker');
    var label = dom.createElement('span', 'event-label');
    label.textContent = event.label;
    var tooltip = dom.createElement('div', 'event-tooltip');
    tooltip.textContent = event.description || event.label;

    el.appendChild(marker);
    el.appendChild(label);
    el.appendChild(tooltip);

    dom.setPosition(el, position, orientation);

    // Handlers
    var clickHandler = function () { if (onClick) onClick(event); };
    var keyHandler = function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onClick) onClick(event);
      }
    };

    dom.on(el, 'click', clickHandler);
    dom.on(el, 'keydown', keyHandler);

    return {
      el: el,
      destroy: function () {
        dom.off(el, 'click', clickHandler);
        dom.off(el, 'keydown', keyHandler);
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  return TimelineEvent;
});
