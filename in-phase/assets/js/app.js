/**
 * Page behaviour: language switching, the phase calculator, the cycle wheel,
 * the hormone chart and rendering of the bilingual content.
 *
 * Depends on `window.Cycle` (cycle.js) and `window.CONTENT` (content.js).
 * All text reaches the DOM through textContent, never innerHTML, and no inline
 * styles or scripts are used, so the strict Content-Security-Policy in index.html holds.
 */
(function () {
  'use strict';

  var Cycle = window.Cycle;
  var C = window.CONTENT;
  if (!Cycle || !C) {
    console.error('In Phase: cycle.js and content.js must load before app.js.');
    return;
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var STORAGE_KEYS = { lang: 'inphase.lang', cycle: 'inphase.cycle' };
  var CATEGORIES = ['nutrition', 'exercise', 'productivity'];
  var HORMONES = ['oestrogen', 'progesterone'];
  var ERROR_FIELDS = {
    'date-required': 'last-start',
    'date-invalid': 'last-start',
    'date-future': 'last-start',
    'cycle-range': 'cycle-length',
    'period-range': 'period-length'
  };
  var FIELD_IDS = ['last-start', 'cycle-length', 'period-length'];

  /** Icon shapes on a 24 x 24 grid, drawn as strokes. */
  var ICONS = {
    mood: [
      ['path', { d: 'M12 20.5s-7.2-4.4-8.9-8.8C1.9 8.4 3.8 5 7.2 5c1.9 0 3.5 1 4.8 2.9C13.3 6 14.9 5 16.8 5c3.4 0 5.3 3.4 4.1 6.7C19.2 16.1 12 20.5 12 20.5z' }]
    ],
    happening: [['path', { d: 'M3 12h4l2.5-6.5 4 13 2.5-6.5H21' }]],
    nutrition: [
      ['path', { d: 'M12 8.3c-1.6-1.3-3.6-1.6-5.1-.7-1.7 1-2.4 3-2.1 5.5.4 3.3 2.3 6.4 4.3 6.4 1 0 1.7-.6 2.9-.6s1.9.6 2.9.6c2 0 3.9-3.1 4.3-6.4.3-2.5-.4-4.5-2.1-5.5-1.5-.9-3.5-.6-5.1.7z' }],
      ['path', { d: 'M12 8.3c0-2 .9-3.5 2.7-4.3' }]
    ],
    exercise: [['path', { d: 'M6.5 8.5v7M17.5 8.5v7M3.5 10.5v3M20.5 10.5v3M6.5 12h11' }]],
    productivity: [
      ['circle', { cx: 12, cy: 12, r: 8.5 }],
      ['path', { d: 'M12 7.5V12l3 2' }]
    ],
    sleep: [['path', { d: 'M20.3 14.3A8.5 8.5 0 0 1 9.7 3.7a8.5 8.5 0 1 0 10.6 10.6z' }]],
    track: [
      ['rect', { x: 4, y: 5, width: 16, height: 15, rx: 2 }],
      ['path', { d: 'M8 3v4M16 3v4M4 10h16M8.5 15l2.2 2.2 4.6-4.6' }]
    ]
  };

  var state = {
    lang: 'en',
    /** Reader input, or null while the 28-day example is shown. */
    inputs: null,
    /** Result of Cycle.getCycleStatus for the reader's input, or null. */
    status: null,
    /** Error codes currently shown on the form. */
    errors: [],
    /** Source ids in order of first appearance; a source's number is its index + 1. */
    citations: []
  };

  /** Scales and handlers of the most recent chart render. */
  var chart = { width: 0, day: 1, show: null, hide: null, invert: null };

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */

  function byId(id) {
    return document.getElementById(id);
  }

  function setAttrs(node, attrs) {
    Object.keys(attrs || {}).forEach(function (name) {
      var value = attrs[name];
      if (value === null || value === undefined || value === false) {
        return;
      }
      if (name === 'text') {
        node.textContent = String(value);
      } else if (value === true) {
        node.setAttribute(name, '');
      } else {
        node.setAttribute(name, String(value));
      }
    });
  }

  function append(node, children) {
    (Array.isArray(children) ? children : [children]).forEach(function (child) {
      if (child === null || child === undefined || child === false) {
        return;
      }
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  /** Create an HTML element. `attrs.text` sets textContent. */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    setAttrs(node, attrs);
    return children === undefined ? node : append(node, children);
  }

  /** Create an SVG element. */
  function svgEl(tag, attrs, children) {
    var node = document.createElementNS(SVG_NS, tag);
    setAttrs(node, attrs);
    return children === undefined ? node : append(node, children);
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    return node;
  }

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match;
    });
  }

  /** Pick the current language from an English/Spanish pair. */
  function tr(pair) {
    return typeof pair === 'string' ? pair : pair[state.lang];
  }

  /** Look up an interface string and fill its {placeholders}. */
  function ui(key, values) {
    var pair = C.ui[key];
    if (!pair) {
      console.warn('In Phase: missing interface string "' + key + '".');
      return key;
    }
    return values ? fill(pair[state.lang], values) : pair[state.lang];
  }

  function phaseById(id) {
    return C.phases.filter(function (phase) {
      return phase.id === id;
    })[0];
  }

  function sourceById(id) {
    return C.sources.filter(function (source) {
      return source.id === id;
    })[0];
  }

  /* Storage can be unavailable (private browsing, blocked site data). The page
     must work without it, so failures are expected and handled quietly. */

  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeStore(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* Nothing was stored, so there is nothing to remove. */
    }
  }

  /* ------------------------------------------------------------------ */
  /* Shared building blocks                                              */
  /* ------------------------------------------------------------------ */

  function citeNumber(id) {
    var index = state.citations.indexOf(id);
    if (index === -1) {
      state.citations.push(id);
      index = state.citations.length - 1;
    }
    return index + 1;
  }

  /** Superscript links to the numbered source list. */
  function cite(ids) {
    if (!ids || ids.length === 0) {
      return null;
    }
    var sup = el('sup', { class: 'cite' });
    var numbers = ids.map(citeNumber).sort(function (a, b) {
      return a - b;
    });
    numbers.forEach(function (number, position) {
      if (position > 0) {
        sup.appendChild(document.createTextNode(','));
      }
      sup.appendChild(
        el('a', {
          href: '#source-' + number,
          'aria-label': ui('sources.cite', { n: number }),
          text: number
        })
      );
    });
    return sup;
  }

  /** A paragraph of bilingual text followed by its citations. */
  function paragraph(item, attrs) {
    return el('p', attrs || {}, [tr(item.text), cite(item.sources)]);
  }

  function icon(name) {
    var svg = svgEl('svg', {
      class: 'icon',
      viewBox: '0 0 24 24',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    (ICONS[name] || []).forEach(function (shape) {
      svg.appendChild(svgEl(shape[0], shape[1]));
    });
    return svg;
  }

  /** Evidence label: filled dots plus words, so it never relies on colour. */
  function chip(level) {
    var filled = { strong: 3, moderate: 2, limited: 1 }[level];
    var dots = el('span', { class: 'chip-dots', 'aria-hidden': 'true' });
    for (var i = 0; i < 3; i += 1) {
      dots.appendChild(el('i', { class: i < filled ? 'on' : null }));
    }
    return el('span', { class: 'chip' }, [dots, tr(C.evidence[level].label)]);
  }

  function label(iconName, text) {
    return el('h4', { class: 'label' }, [icon(iconName), text]);
  }

  /** Cycle parameters in use: the reader's, or the 28-day example. */
  function currentCycle() {
    if (state.status) {
      return { cycleLength: state.status.cycleLength, periodLength: state.status.periodLength };
    }
    return { cycleLength: Cycle.DEFAULTS.cycleLength, periodLength: Cycle.DEFAULTS.periodLength };
  }

  function segmentMap() {
    var cycle = currentCycle();
    var map = {};
    Cycle.getPhaseSegments(cycle.cycleLength, cycle.periodLength).forEach(function (segment) {
      map[segment.id] = segment;
    });
    return map;
  }

  function daysLabel(range) {
    if (!range) {
      return ui('days.none');
    }
    return range.start === range.end ? ui('days.single', range) : ui('days.range', range);
  }

  /** "5 days", joined by a non-breaking space so the number never ends a line alone. */
  function dayCount(n) {
    var text = n === 1 ? ui('unit.day.one') : ui('unit.day.other', { n: n });
    return text.replace(/ /g, '\u00a0');
  }

  function formatDate(iso) {
    var date = new Date(Cycle.parseISODate(iso));
    try {
      return new Intl.DateTimeFormat(state.lang === 'es' ? 'es' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC'
      })
        .format(date)
        .replace(/ /g, '\u00a0');
    } catch (error) {
      return iso;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Static text                                                         */
  /* ------------------------------------------------------------------ */

  function renderStatic() {
    document.documentElement.lang = state.lang;
    document.title = ui('meta.title');
    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', ui('meta.description'));
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (node) {
      node.textContent = ui(node.getAttribute('data-i18n'));
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-attr]'), function (node) {
      node.getAttribute('data-i18n-attr').split(';').forEach(function (entry) {
        var parts = entry.split(':');
        node.setAttribute(parts[0].trim(), ui(parts[1].trim()));
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-lang') === state.lang));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Result card: wheel, legend, today                                   */
  /* ------------------------------------------------------------------ */

  function polar(cx, cy, radius, fraction) {
    var angle = fraction * 2 * Math.PI - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  /**
   * SVG path for a clockwise arc. `from` and `to` are fractions of a full turn
   * starting at twelve o'clock; `trim` shortens each end by that many pixels.
   */
  function arcPath(cx, cy, radius, from, to, trim) {
    var pad = trim / (2 * Math.PI * radius);
    var start = from + pad;
    var end = to - pad;
    var p0 = polar(cx, cy, radius, start);
    var p1 = polar(cx, cy, radius, end);
    var largeArc = end - start > 0.5 ? 1 : 0;
    return (
      'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
      'A' + radius + ' ' + radius + ' 0 ' + largeArc + ' 1 ' +
      p1[0].toFixed(2) + ' ' + p1[1].toFixed(2)
    );
  }

  function renderWheel() {
    var host = clear(byId('wheel'));
    var cycle = currentCycle();
    var length = cycle.cycleLength;
    var status = state.status;
    var cx = 150;
    var cy = 150;
    var radius = 104;

    var description = ui('wheel.aria', { length: length });
    if (status) {
      description += ' ' + ui('wheel.ariaToday', { day: status.day });
    }
    var svg = svgEl('svg', { viewBox: '0 0 300 300', role: 'img', 'aria-label': description });

    Cycle.getPhaseSegments(length, cycle.periodLength).forEach(function (segment) {
      var arc = svgEl('path', {
        class: 'arc',
        'data-phase': segment.id,
        d: arcPath(cx, cy, radius, (segment.start - 1) / length, segment.end / length, 1)
      });
      arc.appendChild(
        svgEl('title', { text: tr(phaseById(segment.id).name) + ' · ' + daysLabel(segment) })
      );
      svg.appendChild(arc);

      var tick = polar(cx, cy, radius + 31, (segment.start - 0.5) / length);
      svg.appendChild(
        svgEl('text', {
          class: 'wheel-tick',
          x: tick[0].toFixed(1),
          y: tick[1].toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          text: segment.start
        })
      );
    });

    var premenstrual = Cycle.getPremenstrualWindow(length);
    var bracket = svgEl('path', {
      class: 'wheel-bracket',
      d: arcPath(cx, cy, radius + 19, (premenstrual.start - 1) / length, premenstrual.end / length, 4)
    });
    bracket.appendChild(
      svgEl('title', { text: ui('legend.premenstrual') + ' · ' + daysLabel(premenstrual) })
    );
    svg.appendChild(bracket);

    if (status) {
      var marker = polar(cx, cy, radius, (status.day - 0.5) / length);
      svg.appendChild(
        svgEl('circle', {
          class: 'wheel-marker',
          cx: marker[0].toFixed(2),
          cy: marker[1].toFixed(2),
          r: 9
        })
      );
      svg.appendChild(centreText('wheel-text', cy - 36, ui('wheel.day')));
      svg.appendChild(centreText('wheel-num', cy + 3, status.day));
      svg.appendChild(centreText('wheel-text', cy + 40, ui('wheel.of', { length: length })));
    } else {
      svg.appendChild(centreText('wheel-num', cy - 6, length));
      svg.appendChild(centreText('wheel-text', cy + 30, ui('wheel.exampleUnit')));
    }

    host.appendChild(svg);

    function centreText(className, y, text) {
      return svgEl('text', {
        class: className,
        x: cx,
        y: y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        text: text
      });
    }
  }

  function renderLegend() {
    var list = clear(byId('wheel-legend'));
    var status = state.status;
    var ranges = segmentMap();

    C.phases.forEach(function (phase) {
      var range = ranges[phase.id];
      if (!range) {
        return;
      }
      var isCurrent = Boolean(status && status.phase === phase.id);
      list.appendChild(
        el('li', { 'data-phase': phase.id, class: isCurrent ? 'is-current' : null }, [
          el('span', { class: 'swatch' }),
          el('span', {
            class: 'legend-name',
            'data-today': isCurrent ? ui('wheel.today') : null,
            text: tr(phase.name)
          }),
          el('span', { class: 'legend-days', text: daysLabel(range) })
        ])
      );
    });

    list.appendChild(
      el('li', {}, [
        el('span', { class: 'swatch-line' }),
        el('span', { class: 'legend-name', text: ui('legend.premenstrual') }),
        el('span', {
          class: 'legend-days',
          text: daysLabel(Cycle.getPremenstrualWindow(currentCycle().cycleLength))
        })
      ])
    );
  }

  function renderToday() {
    var panel = clear(byId('today-panel'));
    var status = state.status;
    panel.removeAttribute('data-phase');

    if (!status) {
      panel.appendChild(el('p', { class: 'prompt', text: ui('result.examplePrompt') }));
      return;
    }

    var phase = phaseById(status.phase);
    var advice = status.premenstrual && phase.todayPremenstrual ? phase.todayPremenstrual : phase.today;
    panel.setAttribute('data-phase', phase.id);

    panel.appendChild(
      el('div', { class: 'today-phase' }, [
        el('span', { class: 'dot' }),
        el('h3', { text: tr(phase.name) }),
        el('span', { class: 'pill', text: ui('result.estimated') }),
        status.premenstrual ? el('span', { class: 'pill', text: ui('legend.premenstrual') }) : null
      ])
    );

    panel.appendChild(
      el('p', { class: 'today-meta' }, [
        el('strong', { text: ui('result.dayOf', { day: status.day, length: status.cycleLength }) }),
        ' · ',
        ui('result.next', {
          count: dayCount(status.daysUntilNextPeriod),
          date: formatDate(status.nextPeriodStart)
        })
      ])
    );

    if (status.cyclesElapsed >= 1) {
      panel.appendChild(el('p', { class: 'today-projected', text: ui('result.projected') }));
    }

    panel.appendChild(el('h4', { class: 'today-title', text: ui('result.todayTitle') }));
    panel.appendChild(
      el(
        'dl',
        { class: 'today-list' },
        ['mood'].concat(CATEGORIES).map(function (category) {
          return el('div', { class: 'today-item' }, [
            el('dt', {}, [icon(category), ui('cat.' + category)]),
            el('dd', { text: tr(advice[category]) })
          ]);
        })
      )
    );

    panel.appendChild(
      el('a', { class: 'more-link', href: '#phase-' + phase.id }, [
        ui('result.readMore') + ': ' + tr(phase.name)
      ])
    );
  }

  function renderToolNote() {
    var note = clear(byId('tool-note'));
    append(note, [tr(C.toolNotes.estimate.text), cite(C.toolNotes.estimate.sources)]);
    if (state.status && state.status.periodLength > 7) {
      append(note, [
        ' ',
        tr(C.toolNotes.longPeriod.text),
        cite(C.toolNotes.longPeriod.sources)
      ]);
    }
  }

  function renderResult() {
    byId('result-kicker').textContent = state.status ? ui('result.yours') : ui('result.example');
    renderWheel();
    renderLegend();
    renderToday();
    renderToolNote();
  }

  function announce(message) {
    byId('result-status').textContent = message;
  }

  function statusSentence() {
    var status = state.status;
    return ui('result.status', {
      day: status.day,
      length: status.cycleLength,
      phase: tr(phaseById(status.phase).name),
      count: dayCount(status.daysUntilNextPeriod)
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hormones: prose, legend, table and chart                            */
  /* ------------------------------------------------------------------ */

  function renderHormones() {
    var prose = clear(byId('hormones-prose'));
    C.hormones.paragraphs.forEach(function (item) {
      prose.appendChild(paragraph(item));
    });

    var legend = clear(byId('chart-legend'));
    HORMONES.forEach(function (hormone) {
      legend.appendChild(
        el('li', { class: 'series-' + hormone }, [
          el('span', { class: 'line-key' }),
          ui('chart.' + hormone)
        ])
      );
    });

    renderHormoneTable();
    renderChart();
  }

  function renderHormoneTable() {
    var host = clear(byId('hormone-table'));
    var ranges = segmentMap();
    var headerCell = function (text) {
      return el('th', { scope: 'col', text: text });
    };

    var rows = C.hormones.table
      .filter(function (row) {
        return Boolean(ranges[row.phase]);
      })
      .map(function (row) {
        return el('tr', {}, [
          el('th', { scope: 'row' }, [
            tr(phaseById(row.phase).name),
            el('br'),
            el('span', { class: 'legend-days', text: daysLabel(ranges[row.phase]) })
          ]),
          el('td', { text: tr(row.oestrogen) }),
          el('td', { text: tr(row.progesterone) })
        ]);
      });

    host.appendChild(
      el('table', {}, [
        el('thead', {}, [
          el('tr', {}, [
            headerCell(ui('chart.tablePhase')),
            headerCell(ui('chart.oestrogen')),
            headerCell(ui('chart.progesterone'))
          ])
        ]),
        el('tbody', {}, rows)
      ])
    );
  }

  /** Approximate rendered width of chart text, for placing labels without overlap. */
  function textWidth(text, fontSize) {
    return String(text).length * fontSize * 0.6;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function renderChart() {
    var host = byId('hormone-chart');
    var measured = Math.round(host.clientWidth);
    var width = Math.max(280, measured || 640);
    var height = 262;
    var margin = { top: 38, right: 12, bottom: 50, left: 12 };
    var plotWidth = width - margin.left - margin.right;
    var plotBottom = height - margin.bottom;
    var plotHeight = plotBottom - margin.top;

    var cycle = currentCycle();
    var length = cycle.cycleLength;
    var status = state.status;
    var ovulation = Cycle.estimateOvulationDay(length);

    var x = function (day) {
      return margin.left + ((day - 0.5) / length) * plotWidth;
    };
    var y = function (level) {
      return margin.top + (1 - level) * plotHeight;
    };

    chart.width = measured;
    chart.invert = function (pixels) {
      return ((pixels - margin.left) / plotWidth) * length + 0.5;
    };

    clear(host);
    host.setAttribute('aria-label', ui('chart.aria'));

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      width: width,
      height: height,
      'aria-hidden': 'true',
      focusable: 'false'
    });

    /* Phase strip along the top, with names where they fit. */
    Cycle.getPhaseSegments(length, cycle.periodLength).forEach(function (segment) {
      var left = x(segment.start - 0.5) + 1;
      var right = x(segment.end + 0.5) - 1;
      svg.appendChild(
        svgEl('rect', {
          class: 'c-strip',
          'data-phase': segment.id,
          x: left.toFixed(1),
          y: 18,
          width: Math.max(1, right - left).toFixed(1),
          height: 6,
          rx: 3
        })
      );
      var name = tr(phaseById(segment.id).short);
      if (textWidth(name, 11) + 6 <= right - left) {
        svg.appendChild(
          svgEl('text', {
            class: 'c-phase-label',
            x: ((left + right) / 2).toFixed(1),
            y: 11,
            'text-anchor': 'middle',
            text: name
          })
        );
      }
    });

    /* Baseline and day ticks. */
    svg.appendChild(
      svgEl('line', {
        class: 'c-axis',
        x1: margin.left,
        x2: width - margin.right,
        y1: plotBottom,
        y2: plotBottom
      })
    );

    var todayLabel = status ? ui('chart.today') + ' · ' + status.day : '';
    var todayHalf = textWidth(todayLabel, 12) / 2;
    var todayX = status
      ? clamp(x(status.day), margin.left + todayHalf, width - margin.right - todayHalf)
      : null;

    var ticks = [1];
    for (var day = 7; day <= length; day += 7) {
      ticks.push(day);
    }
    if (length - ticks[ticks.length - 1] >= 3) {
      ticks.push(length);
    }
    ticks.forEach(function (tickDay) {
      if (todayX !== null && Math.abs(x(tickDay) - todayX) < todayHalf + 14) {
        return;
      }
      svg.appendChild(
        svgEl('text', {
          class: 'c-tick',
          x: x(tickDay).toFixed(1),
          y: plotBottom + 17,
          'text-anchor': 'middle',
          text: tickDay
        })
      );
    });

    /* Ovulation marker, labelled under the axis. */
    var ovulationX = x(ovulation);
    svg.appendChild(
      svgEl('line', {
        class: 'c-ovulation',
        x1: ovulationX.toFixed(1),
        x2: ovulationX.toFixed(1),
        y1: margin.top,
        y2: plotBottom
      })
    );
    svg.appendChild(
      svgEl('path', {
        class: 'c-ovulation-mark',
        d:
          'M' + ovulationX.toFixed(1) + ' ' + (plotBottom + 24) +
          'l4 6h-8z'
      })
    );
    var ovulationText = ui('chart.ovulation');
    var ovulationHalf = textWidth(ovulationText, 11) / 2;
    svg.appendChild(
      svgEl('text', {
        class: 'c-axis-label',
        x: clamp(ovulationX, margin.left + ovulationHalf, width - margin.right - ovulationHalf).toFixed(1),
        y: plotBottom + 43,
        'text-anchor': 'middle',
        text: ovulationText
      })
    );

    /* Axis title on whichever side the ovulation label leaves free. */
    var titleOnRight = ovulationX < width / 2;
    svg.appendChild(
      svgEl('text', {
        class: 'c-axis-label',
        x: titleOnRight ? width - margin.right : margin.left,
        y: plotBottom + 43,
        'text-anchor': titleOnRight ? 'end' : 'start',
        text: ui('chart.axis')
      })
    );

    /* Today line first, so the hormone lines and their labels sit on top of it. */
    if (status) {
      svg.appendChild(
        svgEl('line', {
          class: 'c-today',
          x1: x(status.day).toFixed(1),
          x2: x(status.day).toFixed(1),
          y1: margin.top,
          y2: plotBottom
        })
      );
    }

    /* The two hormone lines. */
    HORMONES.forEach(function (hormone) {
      var commands = [];
      for (var d = 0.5; d <= length + 0.5 + 1e-9; d += 0.25) {
        commands.push(
          (commands.length ? 'L' : 'M') +
            x(d).toFixed(1) + ' ' +
            y(Cycle.hormoneLevels(d, length)[hormone]).toFixed(1)
        );
      }
      svg.appendChild(svgEl('path', { class: 'c-line series-' + hormone, d: commands.join('') }));
    });

    /* Direct labels beside each peak, kept apart and inside the plot. */
    var oestrogenPeak = ovulation - 1;
    var progesteronePeak = ovulation + Cycle.LUTEAL_DAYS / 2;
    var oestrogenName = ui('chart.oestrogen');
    var progesteroneName = ui('chart.progesterone');
    var oestrogenEnd = clamp(
      Math.min(x(oestrogenPeak) + 14, ovulationX - 5),
      margin.left + textWidth(oestrogenName, 12),
      width - margin.right
    );
    var progesteroneStart = clamp(
      x(progesteronePeak) - 14,
      oestrogenEnd + 10,
      width - margin.right - textWidth(progesteroneName, 12)
    );
    svg.appendChild(
      svgEl('text', {
        class: 'c-label',
        x: oestrogenEnd.toFixed(1),
        y: (y(Cycle.hormoneLevels(oestrogenPeak, length).oestrogen) - 9).toFixed(1),
        'text-anchor': 'end',
        text: oestrogenName
      })
    );
    svg.appendChild(
      svgEl('text', {
        class: 'c-label',
        x: progesteroneStart.toFixed(1),
        y: (y(Cycle.hormoneLevels(progesteronePeak, length).progesterone) - 9).toFixed(1),
        'text-anchor': 'start',
        text: progesteroneName
      })
    );

    /* Today's levels and tick label. */
    if (status) {
      var todayLevels = Cycle.hormoneLevels(status.day, length);
      HORMONES.forEach(function (hormone) {
        svg.appendChild(
          svgEl('circle', {
            class: 'c-dot series-' + hormone,
            cx: x(status.day).toFixed(1),
            cy: y(todayLevels[hormone]).toFixed(1),
            r: 4.5
          })
        );
      });
      svg.appendChild(
        svgEl('text', {
          class: 'c-today-label',
          x: todayX.toFixed(1),
          y: plotBottom + 17,
          'text-anchor': 'middle',
          text: todayLabel
        })
      );
    }

    /* Hover and keyboard read-out. */
    var crossLine = svgEl('line', { class: 'c-cross', y1: margin.top, y2: plotBottom });
    var crossDots = {};
    var cross = svgEl('g', { display: 'none' }, [crossLine]);
    HORMONES.forEach(function (hormone) {
      crossDots[hormone] = svgEl('circle', { class: 'c-dot series-' + hormone, r: 4.5 });
      cross.appendChild(crossDots[hormone]);
    });
    svg.appendChild(cross);

    var tip = el('div', { class: 'chart-tip', hidden: true });
    host.appendChild(svg);
    host.appendChild(tip);

    chart.day = status ? status.day : ovulation;

    chart.show = function (rawDay) {
      var shown = clamp(Math.round(rawDay), 1, length);
      var levels = Cycle.hormoneLevels(shown, length);
      var position = Cycle.getPhaseForDay(shown, length, cycle.periodLength);
      var px = x(shown);
      chart.day = shown;

      cross.removeAttribute('display');
      crossLine.setAttribute('x1', px.toFixed(1));
      crossLine.setAttribute('x2', px.toFixed(1));
      HORMONES.forEach(function (hormone) {
        crossDots[hormone].setAttribute('cx', px.toFixed(1));
        crossDots[hormone].setAttribute('cy', y(levels[hormone]).toFixed(1));
      });

      clear(tip);
      tip.appendChild(el('div', { class: 'tip-head', text: ui('chart.day', { day: shown }) }));
      tip.appendChild(
        el('div', {
          class: 'tip-phase',
          text:
            tr(phaseById(position.id).name) +
            (position.premenstrual ? ' · ' + ui('legend.premenstrual') : '')
        })
      );
      HORMONES.forEach(function (hormone) {
        tip.appendChild(
          el('div', { class: 'tip-row series-' + hormone }, [
            el('span', { class: 'line-key' }),
            el('span', { class: 'tip-name', text: ui('chart.' + hormone) + ':' }),
            el('span', {
              class: 'tip-value',
              text: ui('level.' + Cycle.describeHormone(hormone, shown, length))
            })
          ])
        );
      });
      tip.hidden = false;

      var tipWidth = tip.offsetWidth;
      var left = px + 14;
      if (left + tipWidth > width) {
        left = px - tipWidth - 14;
      }
      tip.style.left = Math.max(0, left) + 'px';
    };

    chart.hide = function () {
      cross.setAttribute('display', 'none');
      tip.hidden = true;
    };
  }

  function bindChart() {
    var host = byId('hormone-chart');

    function dayFromPointer(event) {
      return chart.invert(event.clientX - host.getBoundingClientRect().left);
    }

    host.addEventListener('pointermove', function (event) {
      if (chart.show) {
        chart.show(dayFromPointer(event));
      }
    });
    host.addEventListener('pointerdown', function (event) {
      if (chart.show) {
        chart.show(dayFromPointer(event));
      }
    });
    host.addEventListener('pointerleave', function () {
      if (chart.hide && document.activeElement !== host) {
        chart.hide();
      }
    });
    host.addEventListener('focus', function () {
      if (chart.show) {
        chart.show(chart.day);
      }
    });
    host.addEventListener('blur', function () {
      if (chart.hide) {
        chart.hide();
      }
    });
    host.addEventListener('keydown', function (event) {
      if (!chart.show) {
        return;
      }
      var length = currentCycle().cycleLength;
      var target = {
        ArrowLeft: chart.day - 1,
        ArrowRight: chart.day + 1,
        Home: 1,
        End: length
      }[event.key];
      if (target !== undefined) {
        event.preventDefault();
        chart.show(target);
      } else if (event.key === 'Escape') {
        chart.hide();
      }
    });

    if ('ResizeObserver' in window) {
      var queued = false;
      new window.ResizeObserver(function () {
        if (queued) {
          return;
        }
        queued = true;
        window.requestAnimationFrame(function () {
          queued = false;
          var width = Math.round(host.clientWidth);
          if (width && width !== chart.width) {
            renderChart();
          }
        });
      }).observe(host);
    } else {
      window.addEventListener('resize', renderChart);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Content sections                                                    */
  /* ------------------------------------------------------------------ */

  function renderFindings() {
    var host = clear(byId('findings'));
    C.findings.forEach(function (item) {
      host.appendChild(
        el('article', { class: 'finding' }, [
          icon(item.icon),
          el('h3', { text: tr(item.title) }),
          paragraph(item)
        ])
      );
    });

    var key = clear(byId('evidence-key'));
    C.EVIDENCE_LEVELS.forEach(function (level) {
      key.appendChild(
        el('div', {}, [
          el('dt', {}, [chip(level)]),
          el('dd', { text: tr(C.evidence[level].description) })
        ])
      );
    });
  }

  function renderPhase(phase, range, isCurrent) {
    var head = el('header', { class: 'phase-head' }, [
      el('div', {}, [
        el('p', { class: 'phase-days', text: daysLabel(range) }),
        el('h3', { text: tr(phase.name) }),
        el('p', { class: 'phase-tagline', text: tr(phase.tagline) })
      ]),
      isCurrent ? el('span', { class: 'here', text: ui('phase.here') }) : null
    ]);

    var intro = el('div', { class: 'phase-intro' }, [
      el('div', { class: 'block' }, [
        label('happening', ui('phase.happening')),
        paragraph(phase.happening)
      ]),
      el('div', { class: 'block' }, [
        label('mood', ui('phase.feel')),
        paragraph(phase.feel),
        chip(phase.feel.evidence)
      ])
    ]);

    var note = phase.note
      ? el('aside', { class: 'phase-note' }, [tr(phase.note.text), cite(phase.note.sources)])
      : null;

    var columns = el(
      'div',
      { class: 'phase-cols' },
      CATEGORIES.map(function (category) {
        return el('section', { class: 'block' }, [
          label(category, ui('cat.' + category)),
          el(
            'ul',
            { class: 'tips' },
            phase[category].map(function (item) {
              return el('li', { class: 'tip' }, [paragraph(item), chip(item.evidence)]);
            })
          )
        ]);
      })
    );

    return el('article', { class: 'phase', id: 'phase-' + phase.id, 'data-phase': phase.id }, [
      head,
      el('div', { class: 'phase-body' }, [intro, note, columns])
    ]);
  }

  function renderPhases() {
    var status = state.status;
    var ranges = segmentMap();

    byId('phases-intro').textContent = status
      ? ui('phases.introYours', { length: status.cycleLength })
      : ui('phases.introExample');

    var nav = clear(byId('phase-nav'));
    var list = clear(byId('phase-list'));

    C.phases.forEach(function (phase) {
      var range = ranges[phase.id];
      var isCurrent = Boolean(status && status.phase === phase.id);
      var days = range
        ? range.start === range.end
          ? String(range.start)
          : range.start + '–' + range.end
        : '';

      nav.appendChild(
        el(
          'a',
          {
            href: '#phase-' + phase.id,
            'data-phase': phase.id,
            'aria-current': isCurrent ? 'true' : null
          },
          [
            el('span', { class: 'dot' }),
            tr(phase.short),
            days ? el('span', { class: 'nav-days', text: days }) : null
          ]
        )
      );
      list.appendChild(renderPhase(phase, range, isCurrent));
    });
  }

  function renderBasics() {
    var host = clear(byId('basics-list'));
    C.basics.forEach(function (item) {
      host.appendChild(
        el('article', { class: 'basic' }, [
          icon(item.icon),
          el('h3', { text: tr(item.title) }),
          paragraph(item),
          chip(item.evidence)
        ])
      );
    });
  }

  function renderFit() {
    var host = clear(byId('fit-list'));
    C.fit.forEach(function (item) {
      host.appendChild(
        el('article', { class: 'fit-item' }, [el('h3', { text: tr(item.title) }), paragraph(item)])
      );
    });
  }

  function renderHelp() {
    var list = clear(byId('help-list'));
    C.help.items.forEach(function (item) {
      list.appendChild(el('li', {}, [tr(item.text), cite(item.sources)]));
    });
    append(clear(byId('help-treatments')), [
      tr(C.help.treatments.text),
      cite(C.help.treatments.sources)
    ]);
    append(clear(byId('help-urgent')), [tr(C.help.urgent.text), cite(C.help.urgent.sources)]);
  }

  function renderSources() {
    var list = clear(byId('source-list'));
    state.citations.forEach(function (id, index) {
      var source = sourceById(id);
      var href = source.doi ? 'https://doi.org/' + source.doi : source.url;
      var linkText = source.doi ? 'doi:' + source.doi : source.url.replace(/^https:\/\//, '');
      list.appendChild(
        el('li', { id: 'source-' + (index + 1) }, [
          el('span', { class: 'source-kind', text: ui('sources.' + source.kind) }),
          source.cite + ' ',
          el('a', { class: 'source-link', href: href, rel: 'noopener noreferrer', text: linkText })
        ])
      );
    });
  }

  /* ------------------------------------------------------------------ */
  /* Form                                                                */
  /* ------------------------------------------------------------------ */

  function renderErrors() {
    var messages = {};
    state.errors.forEach(function (code) {
      var field = ERROR_FIELDS[code];
      if (field && !messages[field]) {
        messages[field] = ui('err.' + code);
      }
    });

    FIELD_IDS.forEach(function (field) {
      var input = byId(field);
      var message = byId(field + '-error');
      if (messages[field]) {
        input.setAttribute('aria-invalid', 'true');
        message.textContent = messages[field];
        message.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        message.textContent = '';
        message.hidden = true;
      }
    });
  }

  function readForm() {
    return {
      lastPeriodStart: byId('last-start').value,
      cycleLength: Number(byId('cycle-length').value),
      periodLength: Number(byId('period-length').value),
      today: Cycle.localTodayISO()
    };
  }

  function writeForm(inputs) {
    byId('last-start').value = inputs ? inputs.lastPeriodStart : '';
    byId('cycle-length').value = inputs ? inputs.cycleLength : Cycle.DEFAULTS.cycleLength;
    byId('period-length').value = inputs ? inputs.periodLength : Cycle.DEFAULTS.periodLength;
  }

  function onSubmit(event) {
    event.preventDefault();
    var input = readForm();
    state.errors = Cycle.validateInputs(input);

    if (state.errors.length > 0) {
      renderErrors();
      byId(ERROR_FIELDS[state.errors[0]]).focus();
      return;
    }

    state.inputs = {
      lastPeriodStart: input.lastPeriodStart,
      cycleLength: input.cycleLength,
      periodLength: input.periodLength
    };
    state.status = Cycle.getCycleStatus(input);

    if (byId('remember').checked) {
      writeStore(STORAGE_KEYS.cycle, JSON.stringify(state.inputs));
    } else {
      removeStore(STORAGE_KEYS.cycle);
    }

    renderAll();
    announce(statusSentence());
  }

  function onForget() {
    removeStore(STORAGE_KEYS.cycle);
    state.inputs = null;
    state.status = null;
    state.errors = [];
    writeForm(null);
    byId('remember').checked = false;
    renderAll();
    announce(ui('result.cleared'));
    byId('last-start').focus();
  }

  /** Load dates saved on this device, discarding anything unusable. */
  function restoreSaved() {
    var raw = readStore(STORAGE_KEYS.cycle);
    if (!raw) {
      return;
    }
    try {
      var saved = JSON.parse(raw);
      var input = {
        lastPeriodStart: saved.lastPeriodStart,
        cycleLength: saved.cycleLength,
        periodLength: saved.periodLength,
        today: Cycle.localTodayISO()
      };
      state.status = Cycle.getCycleStatus(input);
      state.inputs = {
        lastPeriodStart: input.lastPeriodStart,
        cycleLength: input.cycleLength,
        periodLength: input.periodLength
      };
      writeForm(state.inputs);
      byId('remember').checked = true;
    } catch (error) {
      console.warn('In Phase: saved dates could not be used and were removed.', error);
      removeStore(STORAGE_KEYS.cycle);
      state.status = null;
      state.inputs = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Language                                                            */
  /* ------------------------------------------------------------------ */

  function isSupported(code) {
    return C.LANGUAGES.indexOf(code) !== -1;
  }

  /** Order of preference: ?lang= in the address, a saved choice, the browser's languages. */
  function detectLanguage() {
    var requested = null;
    try {
      requested = new URLSearchParams(window.location.search).get('lang');
    } catch (error) {
      requested = null;
    }
    if (isSupported(requested)) {
      return requested;
    }

    var saved = readStore(STORAGE_KEYS.lang);
    if (isSupported(saved)) {
      return saved;
    }

    var preferred =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || 'en'];
    for (var i = 0; i < preferred.length; i += 1) {
      var code = String(preferred[i]).slice(0, 2).toLowerCase();
      if (isSupported(code)) {
        return code;
      }
    }
    return 'en';
  }

  function setLanguage(lang) {
    if (!isSupported(lang) || lang === state.lang) {
      return;
    }
    state.lang = lang;
    writeStore(STORAGE_KEYS.lang, lang);
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState(null, '', url.toString());
    } catch (error) {
      /* Pages opened straight from disk cannot rewrite their address; the choice is still applied. */
    }
    renderAll();
  }

  /* ------------------------------------------------------------------ */
  /* Start-up                                                            */
  /* ------------------------------------------------------------------ */

  /** Render every section in page order, so sources are numbered as they first appear. */
  function renderAll() {
    state.citations = [];
    renderStatic();
    renderResult();
    renderHormones();
    renderFindings();
    renderPhases();
    renderBasics();
    renderFit();
    renderHelp();
    renderSources();
    renderErrors();
    byId('forget').hidden = !state.inputs;
  }

  function init() {
    state.lang = detectLanguage();
    byId('last-start').setAttribute('max', Cycle.localTodayISO());
    restoreSaved();

    byId('tool').addEventListener('submit', onSubmit);
    byId('forget').addEventListener('click', onForget);
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (button) {
      button.addEventListener('click', function () {
        setLanguage(button.getAttribute('data-lang'));
      });
    });

    bindChart();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
