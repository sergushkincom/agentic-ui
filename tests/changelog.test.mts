import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHANGELOG,
  NEW_BADGE_DAYS,
  componentChangedOn,
  daysAfter,
  formatChangelogDate,
  isNew,
  isNewComponent,
  pullRequestUrl,
  utcToday,
} from "../src/lib/changelog.ts";
import { COMPONENTS, REPO } from "../src/lib/registry.ts";

const byNumber = new Map(CHANGELOG.flatMap((entry) => entry.pulls.map((pull) => [pull.number, entry] as const)));

describe("changelog entries", () => {
  it("covers the launch on 11 Nov 2026 with pull request 4", () => {
    const launch = byNumber.get(4);
    assert.ok(launch);
    assert.equal(launch.date, "2026-11-11");
    assert.equal(launch.id, "2026-11-11");
    assert.equal(formatChangelogDate(launch.date), "11 Nov 2026");
    assert.deepEqual(
      launch.components,
      COMPONENTS.map((component) => component.slug),
    );
  });

  it("covers M1 on 12 Nov 2026 with pull requests 25 through 28", () => {
    const m1 = byNumber.get(25);
    assert.ok(m1);
    assert.equal(m1.date, "2026-11-12");
    assert.equal(formatChangelogDate(m1.date), "12 Nov 2026");
    assert.deepEqual(
      m1.pulls.map((pull) => pull.number).sort((a, b) => a - b),
      [25, 26, 27, 28],
    );
    assert.equal(m1.pulls.some((pull) => pull.number === 29), false);
  });

  it("includes the later merged work on the days those pull requests merged", () => {
    assert.equal(byNumber.get(29)?.date, "2026-11-12");
    assert.equal(byNumber.get(30)?.date, "2026-11-12");
    assert.equal(byNumber.get(31)?.date, "2026-11-12");
    assert.equal(byNumber.get(32)?.date, "2026-11-12");
    assert.equal(byNumber.get(33)?.date, "2026-11-13");
    assert.equal(byNumber.get(34)?.date, "2026-11-13");
    assert.equal(formatChangelogDate("2026-11-13"), "13 Nov 2026");
  });

  it("lists each pull request once, newest day first, and links it", () => {
    const numbers = CHANGELOG.flatMap((entry) => entry.pulls.map((pull) => pull.number));
    assert.deepEqual(numbers.sort((a, b) => a - b), [4, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]);
    assert.equal(new Set(numbers).size, numbers.length);
    const dates = CHANGELOG.map((entry) => entry.date);
    const newestFirst = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    assert.deepEqual(dates, newestFirst);
    assert.equal(pullRequestUrl(4), `${REPO}/pull/4`);
    for (const entry of CHANGELOG) {
      for (const slug of entry.components ?? []) {
        assert.ok(COMPONENTS.some((component) => component.slug === slug));
      }
    }
  });
});

describe("New badge window", () => {
  it("stays up for 30 days, counting the change day", () => {
    assert.equal(NEW_BADGE_DAYS, 30);
    assert.equal(isNew("2026-11-11", "2026-11-11"), true);
    assert.equal(daysAfter("2026-11-11", "2026-12-10"), 29);
    assert.equal(isNew("2026-11-11", "2026-12-10"), true);
    assert.equal(isNew("2026-11-11", "2026-12-11"), false);
    assert.equal(isNew("2026-11-11", "2026-11-10"), false);
  });

  it("rejects a date that is not a real calendar day", () => {
    assert.throws(() => isNew("2026-11-31", "2026-12-01"), /real calendar date/);
    assert.throws(() => formatChangelogDate("11.11.2026"), /YYYY-MM-DD/);
  });

  it("derives each component's change day from the changelog", () => {
    assert.equal(componentChangedOn("streaming-text"), "2026-11-12");
    assert.equal(componentChangedOn("human-override"), "2026-11-12");
    assert.equal(componentChangedOn("tool-call-feed"), "2026-11-12");
    for (const slug of ["thinking-state", "confidence-bar", "agent-decision-card", "fallback-boundary"]) {
      assert.equal(componentChangedOn(slug), "2026-11-11");
    }
    assert.equal(componentChangedOn("missing"), null);
    assert.equal(isNewComponent("missing", "2026-11-14"), false);

    // Launch components drop off on 11 Dec. The three edited on 12 Nov stay one more day.
    for (const component of COMPONENTS) {
      assert.equal(isNewComponent(component.slug, "2026-11-14"), true);
      assert.equal(isNewComponent(component.slug, "2026-12-10"), true);
    }
    assert.equal(isNewComponent("confidence-bar", "2026-12-11"), false);
    assert.equal(isNewComponent("streaming-text", "2026-12-11"), true);
    assert.equal(isNewComponent("streaming-text", "2026-12-12"), false);
  });

  it("formats today as a UTC calendar day", () => {
    assert.equal(utcToday(new Date("2026-11-14T23:30:00Z")), "2026-11-14");
    assert.equal(utcToday(new Date("2026-11-14T00:30:00+02:00")), "2026-11-13");
  });
});
