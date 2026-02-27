/**
 * AMD module: Date calculation utilities for Timeline (vanilla JS, no date-fns).
 */
define([], function () {
  'use strict';

  var MS_PER_DAY = 24 * 60 * 60 * 1000;

  /**
   * Add days to a date.
   * @param {Date} date
   * @param {number} days
   * @returns {Date}
   */
  function addDays(date, days) {
    var result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Returns day of week (0=Sun, 1=Mon...6=Sat).
   * @param {Date} date
   * @returns {number}
   */
  function getDayOfWeek(date) {
    return date.getDay();
  }

  /**
   * Calculate date from datum plus offset.
   * @param {Date} datum
   * @param {number} daysOffset
   * @returns {Date}
   */
  function calculateDateFromDatum(datum, daysOffset) {
    return addDays(datum, daysOffset);
  }

  /**
   * Calculate date from previous event date plus offset.
   * @param {Date} previousDate
   * @param {number} daysOffset
   * @returns {Date}
   */
  function calculateDateFromPreviousEvent(previousDate, daysOffset) {
    return addDays(previousDate, daysOffset);
  }

  var DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  function dayIndex(name) {
    return DAY_NAMES.indexOf(name.toLowerCase());
  }

  function isWeekend(date) {
    var d = getDayOfWeek(date);
    return d === 0 || d === 6;
  }

  function applyClosestWeekday(date, dayName) {
    var targetDay = dayIndex(dayName);
    if (targetDay < 0) {
      console.warn('applyClosestWeekday: unknown day name "' + dayName + '"');
      return date;
    }
    var current = getDayOfWeek(date);
    if (current === targetDay) return date;
    // Find next and previous occurrences
    var diffNext = (targetDay - current + 7) % 7;
    var diffPrev = (current - targetDay + 7) % 7;
    if (diffNext === 0) diffNext = 7;
    if (diffPrev === 0) diffPrev = 7;
    return diffNext <= diffPrev ? addDays(date, diffNext) : addDays(date, -diffPrev);
  }

  function applySingleRule(date, rule) {
    if (rule.indexOf('closestWeekday:') === 0) {
      return applyClosestWeekday(date, rule.slice('closestWeekday:'.length));
    }
    if (rule.indexOf('skipHolidays:') === 0) {
      // Simplified: advance past weekends
      return isWeekend(date) ? addDays(date, 1) : date;
    }
    if (rule === 'businessDaysOnly') {
      if (!isWeekend(date)) return date;
      // Find next Monday
      var d = getDayOfWeek(date);
      return addDays(date, d === 0 ? 1 : 2); // Sun->Mon (+1), Sat->Mon (+2)
    }
    if (rule === 'endOfMonth') {
      var r = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return r;
    }
    if (rule === 'startOfQuarter') {
      var month = date.getMonth();
      var qMonth = Math.floor(month / 3) * 3;
      return new Date(date.getFullYear(), qMonth, 1);
    }
    return date;
  }

  /**
   * Apply a production rule (or comma-separated rules) to a date.
   * @param {Date} date
   * @param {string} rule
   * @returns {Date}
   */
  function applyProductionRule(date, rule) {
    var rules = rule.split(',').map(function (r) { return r.trim(); }).filter(Boolean);
    return rules.reduce(function (d, r) { return applySingleRule(d, r); }, date);
  }

  /**
   * Validate event references (no missing refs, no circular deps).
   * @param {Array} events - Array of relative event data objects
   * @returns {{ valid: boolean, errors: string[] }}
   */
  function validateEventReferences(events) {
    var errors = [];
    var ids = {};
    events.forEach(function (e) { ids[e.id] = true; });

    events.forEach(function (event) {
      if (event.relativeMode === 'fromPreviousEvent' && event.relativeToEventId) {
        if (!ids[event.relativeToEventId]) {
          errors.push('Event "' + event.id + '" references unknown event "' + event.relativeToEventId + '"');
        }
      }
    });

    // Detect cycles via DFS
    var WHITE = 0, GRAY = 1, BLACK = 2;
    var color = {};
    var adj = {};
    events.forEach(function (e) {
      color[e.id] = WHITE;
      adj[e.id] = [];
      if (e.relativeMode === 'fromPreviousEvent' && e.relativeToEventId && ids[e.relativeToEventId]) {
        adj[e.id].push(e.relativeToEventId);
      }
    });

    function dfs(node) {
      color[node] = GRAY;
      var neighbors = adj[node] || [];
      for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        if (color[n] === GRAY) return true;
        if (color[n] === WHITE && dfs(n)) return true;
      }
      color[node] = BLACK;
      return false;
    }

    events.forEach(function (e) {
      if (color[e.id] === WHITE && dfs(e.id)) {
        errors.push('Circular dependency detected involving event "' + e.id + '"');
      }
    });

    return { valid: errors.length === 0, errors: errors };
  }

  /**
   * Resolve all event dates into a Map of id -> Date.
   * @param {Array} events
   * @param {Date} datum
   * @returns {Object} map of id -> Date (plain object used as map)
   */
  function resolveEventChain(events, datum) {
    var cache = {};
    var byId = {};
    events.forEach(function (e) { byId[e.id] = e; });

    function resolve(id, visited) {
      if (cache[id]) return cache[id];
      if (visited[id]) throw new Error('Circular dependency at event "' + id + '"');

      var event = byId[id];
      if (!event) throw new Error('Unknown event "' + id + '"');

      visited[id] = true;
      var date;
      if (event.relativeMode === 'fromPreviousEvent' && event.relativeToEventId) {
        var prevDate = resolve(event.relativeToEventId, visited);
        date = calculateDateFromPreviousEvent(prevDate, event.daysOffset);
      } else {
        date = calculateDateFromDatum(datum, event.daysOffset);
      }

      if (event.productionRule) {
        date = applyProductionRule(date, event.productionRule);
      }

      delete visited[id];
      cache[id] = date;
      return date;
    }

    events.forEach(function (e) { resolve(e.id, {}); });
    return cache;
  }

  /**
   * Resolve all events into fully-resolved event objects.
   * @param {Array} events
   * @param {Date} datum
   * @returns {Array} Array of {id, label, description, date, category, metadata}
   */
  function resolveAllEvents(events, datum) {
    var dateMap = resolveEventChain(events, datum);
    return events.map(function (event) {
      return {
        id: event.id,
        label: event.label,
        description: event.description,
        date: dateMap[event.id],
        category: event.category,
        metadata: event.metadata,
      };
    });
  }

  return {
    addDays: addDays,
    getDayOfWeek: getDayOfWeek,
    calculateDateFromDatum: calculateDateFromDatum,
    calculateDateFromPreviousEvent: calculateDateFromPreviousEvent,
    applyProductionRule: applyProductionRule,
    validateEventReferences: validateEventReferences,
    resolveEventChain: resolveEventChain,
    resolveAllEvents: resolveAllEvents,
  };
});
