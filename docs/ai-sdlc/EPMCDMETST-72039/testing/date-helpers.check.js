"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = process.argv[2] || path.resolve(__dirname, "..", "..", "..", "..", "app.js");
let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) { passed++; console.log("PASS: " + name); }
  else { failed++; console.log("FAIL: " + name); }
}

let h;
try {
  const source = fs.readFileSync(appPath, "utf8");
  const a = source.indexOf("function parseIsoDateToLocalDate");
  const b = source.indexOf("const MONTH_ABBREVIATIONS");
  const end = source.indexOf("function loadTasks");
  if (a < 0 || b < 0 || end < 0) throw new Error("helper block not found in app.js");
  const start = Math.min(a, b);
  if (end <= start) throw new Error("unexpected order of helpers and loadTasks");
  const context = vm.createContext({});
  vm.runInContext(
    source.slice(start, end) +
      "\nthis.__h = { parseIsoDateToLocalDate, getTodayLocalMidnight, formatDueDate, isTaskOverdue };",
    context
  );
  h = context.__h;
} catch (e) {
  console.log("FAIL: harness :: " + e.message);
  process.exit(2);
}

const d = h.parseIsoDateToLocalDate("2026-01-05");
check("parse valid date", d !== null && d.getFullYear() === 2026 && d.getMonth() === 0 && d.getDate() === 5);
["foo", "2026-99-99", "2026-02-30", "", null, undefined, 20260105].forEach(function (v) {
  check("parse invalid " + JSON.stringify(v) + " returns null", h.parseIsoDateToLocalDate(v) === null);
});

const t = h.getTodayLocalMidnight();
check("today is local midnight", t.getHours() === 0 && t.getMinutes() === 0 && t.getSeconds() === 0 && t.getMilliseconds() === 0);

check("format 2026-01-05", h.formatDueDate("2026-01-05") === "05 Jan 2026");
check("format 2026-12-31", h.formatDueDate("2026-12-31") === "31 Dec 2026");
check("format 2026-09-09", h.formatDueDate("2026-09-09") === "09 Sep 2026");
check("format invalid returns null", h.formatDueDate("foo") === null);

const today = new Date(2026, 5, 15);
function task(completed, dueDate) {
  return { id: "t", text: "x", completed: completed, createdAt: 1, dueDate: dueDate };
}
check("yesterday incomplete is overdue", h.isTaskOverdue(task(false, "2026-06-14"), today) === true);
check("today is not overdue", h.isTaskOverdue(task(false, "2026-06-15"), today) === false);
check("tomorrow is not overdue", h.isTaskOverdue(task(false, "2026-06-16"), today) === false);
check("completed past date is not overdue", h.isTaskOverdue(task(true, "2026-06-01"), today) === false);
check("legacy task without dueDate is not overdue", h.isTaskOverdue({ id: "t", text: "x", completed: false, createdAt: 1 }, today) === false);
check("malformed dueDate foo is not overdue", h.isTaskOverdue(task(false, "foo"), today) === false);
check("impossible date 2026-02-30 is not overdue", h.isTaskOverdue(task(false, "2026-02-30"), today) === false);
check("year boundary: 2026-12-31 vs 2027-01-01 is overdue", h.isTaskOverdue(task(false, "2026-12-31"), new Date(2027, 0, 1)) === true);

console.log("SUMMARY passed=" + passed + " failed=" + failed);
process.exit(failed > 0 ? 1 : 0);
