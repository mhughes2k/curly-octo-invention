/**
 * AMD module: TimelineTrack component (vanilla JS).
 */
define(
  ['./utils/domHelpers', './utils/positionCalculator', './TimelineEvent', './TimelineConnector'],
  function (dom, posCalc, TimelineEvent, TimelineConnector) {
    'use strict';

    /**
     * Creates a TimelineTrack component.
     * @param {Object} config
     * @param {HTMLElement} config.container - Parent container element
     * @param {Array} config.events - Array of resolved event objects
     * @param {Date} config.minDate - Minimum date for positioning
     * @param {number} config.scale - Pixels per day
     * @param {string} config.orientation - 'horizontal' | 'vertical'
     * @param {Function} [config.onEventClick] - Click callback
     * @returns {Object} Component with render(), update(events), destroy() methods
     */
    function TimelineTrack(config) {
      var container = config.container;
      var events = config.events;
      var minDate = config.minDate;
      var scale = config.scale;
      var orientation = config.orientation;
      var onEventClick = config.onEventClick;

      var el = dom.createElement('div', 'timeline-track ' + orientation);
      container.appendChild(el);

      var eventComponents = [];
      var connectorComponents = [];

      function clearComponents() {
        eventComponents.forEach(function (c) { c.destroy(); });
        connectorComponents.forEach(function (c) { c.destroy(); });
        eventComponents = [];
        connectorComponents = [];
      }

      function renderEvents() {
        clearComponents();

        var positions = events.map(function (event) {
          return posCalc.calculateEventPosition(event.date, minDate, scale);
        });

        // Render connectors between consecutive events
        for (var i = 1; i < events.length; i++) {
          var connector = TimelineConnector({
            startPosition: positions[i - 1],
            endPosition: positions[i],
            orientation: orientation,
          });
          el.appendChild(connector.el);
          connectorComponents.push(connector);
        }

        // Render event markers
        events.forEach(function (event, idx) {
          var ec = TimelineEvent({
            event: event,
            position: positions[idx],
            orientation: orientation,
            onClick: onEventClick,
          });
          el.appendChild(ec.el);
          eventComponents.push(ec);
        });
      }

      return {
        /** Render events and connectors into the track. */
        render: function () { renderEvents(); },

        /**
         * Update events and re-render.
         * @param {Array} newEvents
         */
        update: function (newEvents) {
          events = newEvents;
          renderEvents();
        },

        /** Remove track element and clean up all children. */
        destroy: function () {
          clearComponents();
          if (el.parentNode) el.parentNode.removeChild(el);
        },
      };
    }

    return TimelineTrack;
  }
);
