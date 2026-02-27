/**
 * AMD example: demonstrates using the Timeline AMD module.
 *
 * Usage with RequireJS (from project root with baseUrl set to src/modules/):
 *   require(['Timeline'], function(Timeline) { ... });
 *
 * Or with an explicit path:
 *   require(['src/modules/Timeline'], function(Timeline) { ... });
 */
require(['src/modules/Timeline'], function (Timeline) {
  'use strict';

  var container = document.getElementById('timeline-root');
  if (!container) {
    console.error('No #timeline-root element found');
    return;
  }

  var timeline = new Timeline(container, {
    datum: '2026-02-27',
    relativeEventsUrl: '/data/events.json',
    fixedEventsUrl: '/data/fixed-events.json',
    orientation: 'horizontal',
    scale: 10,
    onEventClick: function (event) {
      console.log('Clicked:', event.label, event.date);
    },
  });

  // Example: update orientation after 5 seconds
  setTimeout(function () {
    timeline.update({ orientation: 'vertical' });
  }, 5000);
});
