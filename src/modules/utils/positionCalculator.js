/**
 * AMD module: Position calculation utilities for Timeline (vanilla JS).
 */
define([], function () {
  'use strict';

  /**
   * Calculate the date range (min/max) of events.
   * @param {Array} events - Array of {date: Date, ...}
   * @returns {{ min: Date, max: Date }}
   */
  function calculateDateRange(events) {
    if (!events || events.length === 0) throw new Error('No events provided');
    var times = events.map(function (e) { return e.date.getTime(); });
    return {
      min: new Date(Math.min.apply(null, times)),
      max: new Date(Math.max.apply(null, times)),
    };
  }

  /**
   * Calculate scale (pixels per day).
   * @param {number} dateRangeDays - Number of days in range
   * @param {number} containerSize - Container size in pixels
   * @returns {number}
   */
  function calculateScale(dateRangeDays, containerSize) {
    if (dateRangeDays === 0) return 1;
    return containerSize / dateRangeDays;
  }

  /**
   * Calculate pixel position of an event.
   * @param {Date} date
   * @param {Date} minDate
   * @param {number} scale - Pixels per day
   * @returns {number}
   */
  function calculateEventPosition(date, minDate, scale) {
    var ms = date.getTime() - minDate.getTime();
    var days = ms / (24 * 60 * 60 * 1000);
    return days * scale;
  }

  /**
   * Auto-calculate scale to fit all events in a container.
   * @param {Array} events
   * @param {number} containerSize
   * @returns {number}
   */
  function adjustScaleForViewport(events, containerSize) {
    var range = calculateDateRange(events);
    var rangeDays = (range.max.getTime() - range.min.getTime()) / (24 * 60 * 60 * 1000);
    return calculateScale(rangeDays, containerSize);
  }

  return {
    calculateDateRange: calculateDateRange,
    calculateScale: calculateScale,
    calculateEventPosition: calculateEventPosition,
    adjustScaleForViewport: adjustScaleForViewport,
  };
});
