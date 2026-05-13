#!/usr/bin/env node
// Sync only IGL and coach fields from upstream's teams array.
// Match by team name. Everything else (tag, region, custom names,
// HTML/CSS/JS) is left untouched.
//
// Expects upstream/main to be already fetched as a git remote.

const fs = require("fs");
const { execSync } = require("child_process");

const TEAM_RE = /\{\s*region:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*igl:\s*"([^"]+)",\s*coach:\s*"([^"]+)",\s*tag:\s*"([^"]+)"\s*\}/g;

function parseTeams(html) {
    const teams = new Map();
    let m;
    TEAM_RE.lastIndex = 0;
    while ((m = TEAM_RE.exec(html)) !== null) {
        teams.set(m[2], { region: m[1], name: m[2], igl: m[3], coach: m[4], tag: m[5] });
    }
    return teams;
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const upstreamHtml = execSync("git show upstream/main:index.html", { encoding: "utf8" });
const localHtml = fs.readFileSync("index.html", "utf8");

const upstream = parseTeams(upstreamHtml);
const local = parseTeams(localHtml);

if (upstream.size === 0) {
    console.error("ERROR: failed to parse upstream teams array (regex matched 0 rows).");
    process.exit(1);
}
if (local.size === 0) {
    console.error("ERROR: failed to parse local teams array (regex matched 0 rows).");
    process.exit(1);
}

console.log(`Parsed ${upstream.size} upstream teams, ${local.size} local teams.`);

const changes = [];
for (const [name, lt] of local) {
    const ut = upstream.get(name);
    if (!ut) continue;
    if (ut.igl !== lt.igl) {
        changes.push({ name, field: "igl", from: lt.igl, to: ut.igl });
    }
    if (ut.coach !== lt.coach) {
        changes.push({ name, field: "coach", from: lt.coach, to: ut.coach });
    }
}

if (changes.length === 0) {
    console.log("No IGL/Coach changes from upstream.");
    process.exit(0);
}

let newHtml = localHtml;
for (const c of changes) {
    // Replace only the targeted field within the matched team's object.
    // The lookahead anchors on the team's name to avoid touching other teams.
    const re = new RegExp(
        `(name:\\s*"${escapeRegex(c.name)}",[^}]*?${c.field}:\\s*")[^"]*(")`,
        "g"
    );
    const before = newHtml;
    newHtml = newHtml.replace(re, `$1${c.to}$2`);
    if (before === newHtml) {
        console.error(`ERROR: failed to apply update for ${c.name}.${c.field}`);
        process.exit(1);
    }
}

fs.writeFileSync("index.html", newHtml);

console.log(`\nApplied ${changes.length} IGL/Coach update(s):`);
for (const c of changes) {
    console.log(`  ${c.name}: ${c.field} "${c.from}" -> "${c.to}"`);
}

const summaryLines = changes.map(c => `- ${c.name}: ${c.field} ${c.from} -> ${c.to}`);
const commitMsg = `Auto-sync IGL/Coach from upstream\n\n${summaryLines.join("\n")}\n`;
fs.writeFileSync(process.env.SYNC_COMMIT_MSG_FILE || "/tmp/sync-commit-msg.txt", commitMsg);
