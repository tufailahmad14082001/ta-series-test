/* TA SERIES — display labels and folder colours (teal design).
   Display names only: the underlying file/folder names in tree.js
   and data.js are never renamed. Used by material.html (folder and
   file rows, breadcrumbs) and nursing-ethics-quiz.html (chapter
   titles). Loaded before the page's own script. */
(function () {
  "use strict";
  var LABELS = {
    "COURSE GRIDE": "Course Grid",
    "2.COURSE GRID": "Course Grid",
    "METERIALS": "Materials",
    "Bills of Rights": "Bill of Rights",
    "Ethical Dilemma in Professional Practice": "Ethical Dilemmas in Professional Practice",
    "2023'SLIDES": "2023 Slides",
    "Z FOR PRINT": "Print-ready Files",
    "Z. CHECKLIST": "Checklist",
    "0. Special": "Special Materials",
    "1.SLIDES [NEW • OLD]": "Slides · New & Archive",
    "1. SLIDES": "Slides"
  };
  /* Substring cleanups, applied after an exact match fails. Order
     matters: the longer "Ethical Dilemma in Professional Practice"
     is handled by the exact map above; "Ethical Dilemma" alone only
     ever appears as part of that title. */
  var SUBS = [
    ["AHN_II", "MSN II / AHN II"],
    ["AHN II", "MSN II / AHN II"],
    ["COURSE GRIDE", "Course Grid"],
    ["METERIALS", "Materials"],
    ["2023'SLIDES", "2023 Slides"],
    ["SLIDES 2023", "2023 Slides"],
    ["2023 SLIDES", "2023 Slides"],
    ["Z FOR PRINT", "Print-ready Files"],
    ["Z. CHECKLIST", "Checklist"],
    ["1.SLIDES [NEW • OLD]", "Slides · New & Archive"],
    ["2.COURSE GRID", "Course Grid"],
    ["0. Special", "Special Materials"]
  ];
  window.TA_LABELS = LABELS;
  window.taLabel = function (name) {
    var s = String(name == null ? "" : name);
    if (Object.prototype.hasOwnProperty.call(LABELS, s)) return LABELS[s];
    /* Case-insensitive exact match (e.g. "Course Gride"). */
    var keys = Object.keys(LABELS), i;
    for (i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === s.toLowerCase()) return LABELS[keys[i]];
    }
    var out = s;
    for (i = 0; i < SUBS.length; i++) {
      out = out.split(SUBS[i][0]).join(SUBS[i][1]);
    }
    return out;
  };

  /* One folder colour per semester (spec section 3). Subfolders keep
     the semester colour, one shade lighter. */
  var COLORS = {
    "TA SERIES Slides Book": "#E0A030",
    "Semester 1": "#0E7C86",
    "Semester 2": "#3C6FB0",
    "Semester 3": "#7A5BB0",
    "Semester 4": "#B5543C",
    "Semester 5": "#3E8E5A",
    "Semester 6": "#D08A2E",
    "Semester 7": "#B04A6A",
    "Semester 8": "#2F4B7A"
  };
  var LIGHTER = {
    "TA SERIES Slides Book": "#E8B95A",
    "Semester 1": "#35A9B3",
    "Semester 2": "#6B93C4",
    "Semester 3": "#9A7FC4",
    "Semester 4": "#C97A63",
    "Semester 5": "#63AC7C",
    "Semester 6": "#DEA654",
    "Semester 7": "#C4748C",
    "Semester 8": "#5A6E96"
  };
  window.TA_FOLDER_COLORS = COLORS;
  window.taFolderColor = function (name, topName) {
    var n = String(name == null ? "" : name);
    if (Object.prototype.hasOwnProperty.call(COLORS, n)) return COLORS[n];
    var top = String(topName == null ? "" : topName);
    if (top && top !== n && Object.prototype.hasOwnProperty.call(LIGHTER, top)) return LIGHTER[top];
    /* Deeper folders: inherit the top folder's colour, lighter. */
    var m = /Semester\s*([1-8])/.exec(top || n);
    if (m) return LIGHTER["Semester " + m[1]];
    if (/slides book/i.test(top || n)) return LIGHTER["TA SERIES Slides Book"];
    return "#0E7C86";
  };
})();
