# VCT Day Builder

A single-page web app that generates ready-to-paste Twitch `!editcom` chat commands for a full day of VCT broadcasts — maps, scores, IGLs, on-air talent, and casters.

Open `index.html` in a browser. No build, no server.

## Features

- **Multi-game day** — configure 1–4 games per day, each with its own teams, BO3/BO5 format, map veto, and live scores. Late games default to TBD so you can fill them in as the day goes.
- **Map veto + score entry** — pick map order (Team A pick / Team B pick / decider), side selection (ATK/DEF), and per-map scores with live validation (regulation, OT, decider-only rules) that flags invalid scores in red before generating.
- **Generates 5 chat commands in one click:**
  - `!maps` — current game's map veto + scores
  - `!igls` — IGLs/coaches for the current game
  - `!score` — running score across all games of the day
  - `!call` — on-air talent for the broadcast
  - `!casters` — play-by-play casters, grouped by region (Americas / EMEA / Pacific)
- **Roster data baked in** — team IGLs, coaches, and channel-specific tag abbreviations for every VCT international team, with manual roster updates only (no upstream auto-sync — what's in the file is what ships).
- **Display-time name overrides** — handle edge cases like the Brenshow combine rule without mutating roster data.
- **Talent + caster pickers** — checkbox grids per region with a free-text "Other" field for anyone not in the preset list.
- **Copy-to-clipboard buttons** on each generated command.

## Credits

Originally forked from [OurMeatball/VCT-Maps-and-IGL-Twitch-Commands](https://github.com/OurMeatball/VCT-Maps-and-IGL-Twitch-Commands), which is a single-game `!maps` generator. This version has since been rewritten into a full multi-game day builder with the additional commands and roster tooling listed above.
