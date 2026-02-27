/**
 * AMD module: Main Timeline component (vanilla JS).
 * Uses XMLHttpRequest to load JSON event data, resolves event chains,
 * and renders the timeline into a DOM container.
 */
define(
  ['./utils/dateCalculations', './utils/positionCalculator', './TimelineTrack', './TimelineAxis'],
  function (dateCalcs, posCalc, TimelineTrack, TimelineAxis) {
    'use strict';

    var DEFAULT_SCALE = 10; // pixels per day

    /**
     * Validate a relative events JSON object.
     * @param {Object} json
     * @returns {{ valid: boolean, error: string|null }}
     */
    function validateRelativeJson(json) {
      if (!json || typeof json !== 'object') return { valid: false, error: 'Invalid JSON' };
      if (typeof json.datum !== 'string') return { valid: false, error: 'Missing datum field' };
      if (!Array.isArray(json.events)) return { valid: false, error: 'Missing events array' };
      for (var i = 0; i < json.events.length; i++) {
        var e = json.events[i];
        if (!e.id || !e.label || typeof e.daysOffset !== 'number') {
          return { valid: false, error: 'Event at index ' + i + ' missing required fields (id, label, daysOffset)' };
        }
      }
      return { valid: true, error: null };
    }

    /**
     * Validate a fixed events JSON object.
     * @param {Object} json
     * @returns {{ valid: boolean, error: string|null }}
     */
    function validateFixedJson(json) {
      if (!json || typeof json !== 'object') return { valid: false, error: 'Invalid JSON' };
      if (!Array.isArray(json.events)) return { valid: false, error: 'Missing events array' };
      for (var i = 0; i < json.events.length; i++) {
        var e = json.events[i];
        if (!e.id || !e.label || typeof e.date !== 'string') {
          return { valid: false, error: 'Fixed event at index ' + i + ' missing required fields (id, label, date)' };
        }
      }
      return { valid: true, error: null };
    }

    /**
     * Load JSON via XMLHttpRequest.
     * @param {string} url
     * @param {Function} callback - (error, data)
     */
    function loadJson(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            callback(null, JSON.parse(xhr.responseText));
          } catch (e) {
            callback(new Error('Failed to parse JSON: ' + e.message));
          }
        } else {
          callback(new Error('HTTP ' + xhr.status + ' loading ' + url));
        }
      };
      xhr.send();
    }

    /**
     * Main Timeline AMD module.
     * @param {HTMLElement} container - DOM container
     * @param {Object} config - Configuration
     * @param {string} config.datum - ISO date string for reference
     * @param {string} config.relativeEventsUrl - URL for relative events JSON
     * @param {string} [config.fixedEventsUrl] - Optional URL for fixed events JSON
     * @param {string} [config.orientation='horizontal'] - 'horizontal' | 'vertical'
     * @param {number} [config.scale] - Pixels per day
     * @param {Function} [config.onEventClick] - Click callback
     */
    function Timeline(container, config) {
      this.container = container;
      this.config = config;
      this.orientation = config.orientation || 'horizontal';
      this.scale = config.scale || DEFAULT_SCALE;
      this.events = [];
      this.track = null;
      this.axis = null;
      this.destroyed = false;

      this.init();
    }

    Timeline.prototype.init = function () {
      this.container.className = 'timeline-container ' + this.orientation;
      this.loadEvents();
    };

    Timeline.prototype.loadEvents = function () {
      var self = this;
      var relativeEventsUrl = this.config.relativeEventsUrl;
      var fixedEventsUrl = this.config.fixedEventsUrl;

      loadJson(relativeEventsUrl, function (err, relJson) {
        if (self.destroyed) return;
        if (err) {
          self.renderError(err.message);
          return;
        }

        var validation = validateRelativeJson(relJson);
        if (!validation.valid) {
          self.renderError('Invalid events JSON: ' + validation.error);
          return;
        }

        var refValidation = dateCalcs.validateEventReferences(relJson.events);
        if (!refValidation.valid) {
          self.renderError('Event reference errors: ' + refValidation.errors.join('; '));
          return;
        }

        var datum = new Date(relJson.datum);
        var resolvedEvents;
        try {
          resolvedEvents = dateCalcs.resolveAllEvents(relJson.events, datum);
        } catch (e) {
          self.renderError('Failed to resolve events: ' + e.message);
          return;
        }

        if (fixedEventsUrl) {
          loadJson(fixedEventsUrl, function (fixErr, fixJson) {
            if (self.destroyed) return;
            if (!fixErr) {
              var fixValidation = validateFixedJson(fixJson);
              if (fixValidation.valid) {
                var fixedEvents = fixJson.events.map(function (e) {
                  return { id: e.id, label: e.label, description: e.description, date: new Date(e.date), category: e.category, metadata: e.metadata };
                });
                resolvedEvents = resolvedEvents.concat(fixedEvents);
                resolvedEvents.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
              }
            }
            self.events = resolvedEvents;
            self.render();
          });
        } else {
          self.events = resolvedEvents;
          self.render();
        }
      });
    };

    Timeline.prototype.render = function () {
      if (this.destroyed || this.events.length === 0) return;

      // Clean up previous render
      if (this.track) { this.track.destroy(); this.track = null; }
      if (this.axis) { this.axis.destroy(); this.axis = null; }

      var range = posCalc.calculateDateRange(this.events);
      var minDate = range.min;
      var maxDate = range.max;

      this.track = TimelineTrack({
        container: this.container,
        events: this.events,
        minDate: minDate,
        scale: this.scale,
        orientation: this.orientation,
        onEventClick: this.config.onEventClick,
      });
      this.track.render();

      this.axis = TimelineAxis({
        container: this.container,
        minDate: minDate,
        maxDate: maxDate,
        scale: this.scale,
        orientation: this.orientation,
      });
      this.axis.render();
    };

    Timeline.prototype.renderError = function (message) {
      this.container.innerHTML = '';
      var errorEl = document.createElement('div');
      errorEl.className = 'timeline-error';
      errorEl.textContent = message;
      this.container.appendChild(errorEl);
    };

    /**
     * Update configuration and re-render.
     * @param {Object} newConfig
     */
    Timeline.prototype.update = function (newConfig) {
      if (newConfig.scale !== undefined) this.scale = newConfig.scale;
      if (newConfig.orientation !== undefined) {
        this.orientation = newConfig.orientation;
        this.container.className = 'timeline-container ' + this.orientation;
      }
      if (newConfig.onEventClick !== undefined) this.config.onEventClick = newConfig.onEventClick;
      this.render();
    };

    /** Destroy the timeline and clean up all resources. */
    Timeline.prototype.destroy = function () {
      this.destroyed = true;
      if (this.track) { this.track.destroy(); this.track = null; }
      if (this.axis) { this.axis.destroy(); this.axis = null; }
      this.container.innerHTML = '';
      this.events = [];
    };

    return Timeline;
  }
);
