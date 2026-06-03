# Master Bedroom 3 — Interior Design Knowledge Base

> Continuity doc for the master-suite interior design project. Read this first when resuming.
> Last updated: 2026-06-01

---

## 1. Project at a glance

- **What:** Interior design for **Bedroom 3 (the master suite)** on the **first floor** of the PWD renovation plan.
- **Source plan:** `../PWD RENOVATION WORK PLAN.pdf` (ground + first floor CAD drawing). The first-floor master suite is the subject.
- **Deliverable so far:** a browser-based **3D walkthrough + 2D floor plan** built with Three.js (`index.html`), served locally by `server.js`.

### Design brief (confirmed with the owner)
| Topic | Decision |
|---|---|
| **Style** | Modern Minimalist |
| **Budget** | Premium (custom joinery, quality materials) |
| **Priorities** | King bed + seating · maximize storage · window seat with flanking cupboards |
| **No-go** | Clutter; the single lounge sofa was explicitly **removed** |

---

## 2. How to run the 3D model

```bash
cd "3d-design"
node server.js
# open http://localhost:5180
```
> **Port note:** this app serves on **5180** (the default in `server.js`), deliberately *not* 5173 — that's the portfolio website's Vite dev port, and the two clash if both run at once. Override with `PORT=xxxx node server.js` if needed.
- Zero npm dependencies (uses Three.js via CDN). Node 18+ (tested on v24).
- **Controls:** `3D View / Walk-through / 2D Floor Plan` toggle (top center) · **Focus room** (Whole suite / Bedroom / Closet / Bath) · **Day/Night** · **X-ray walls** · **Show/Hide ceiling** · **Top-down** · **Reset** · **Auto-spin** · mouse drag/scroll/right-drag.
- **Walk-through / first-person mode (added 2026-06-02):** `PointerLockControls` — click to lock the pointer, then **WASD / arrow keys** move and the mouse looks, at standing eye height `EYE=5.4` ft. `setView('orbit'|'walk'|'plan')` is the single switchboard. Start pose: standing in the bedroom near the balcony, looking toward the bed.
  - **Realism pass (2026-06-02):** **collision** — `colliders[]` is auto-built once from every opaque mesh taller than 0.6 ft (walls + furniture); glazing (`opacity<0.9`) is skipped so doorways and the balcony glass door stay passable. `blocked(x,z)` does circle-vs-AABB with body radius `PR=0.7`, resolved per-axis each frame so you **slide along walls** instead of sticking. **Smoothed velocity** (`velF/velR` lerp at 10/s, `MAXSPD=5.5` ft/s) gives weighty accel/decel; **head-bob** modulates eye height while moving; **FOV widens to 68°** in walk mode (52° for orbit). NOTE: colliders are baked at load with walls solid — if you later need Focus-isolated walk-throughs, rebuild them. Shadow map bumped to 4096².
- **Procedural textures (added 2026-06-02):** generated on-canvas (no external image files, so the site stays self-contained on Pages) via `cTex()` + `woodTex/stoneTex/linenTex`. Applied to `floorMat` (wood), `oak`/`oakV` (wood joinery), `linen` (woven upholstery), `stone` (marble). Textured materials set `color` to white so the map shows true; tune density with each texture's `repeat`.
- **Auto-opening doors (added 2026-06-02):** the balcony **bi-fold** is now an articulated 4-leaf accordion (`doorGrp` → nested hinge groups) driven by `setBalcony(t)` (concertina angles `+f,-2f,+2f,-2f`); the closet **mirror** is grouped (`mirrorGrp`) and slides via `setMirror(t)`. Both have `userData.noCollide=true` so the collision builder skips them (otherwise their closed-position colliders would block the now-open doorway). The balcony door opens by **proximity** in `animate()` (within 6.5 ft of x8/z24), lerped for smoothness — works in walk OR orbit. The **mirror is button-driven** (panel button `#btnMirror` toggles `mirrorTarget` 0↔1; `setMirror` lerps to it) so it stays put as a usable dressing mirror until you choose to slide it open.
- **Realistic reflections (added 2026-06-02):** `scene.environment` is a `RoomEnvironment` baked through `PMREMGenerator` — gives glass, brass, and the closet **mirror** real image-based reflections and softer material lighting. If day mode looks too bright, lower `renderer.toneMappingExposure` or the env sigma.
- **Focus room / zone isolation (added 2026-06-02):** geometry is split into `THREE.Group`s — `gShell` (walls/floors), `gBed`, `gCloset`, `gBath`, `gBalc` — via a module-level `TARGET` that `box()`/`boxAt()` add to (set per build section). `setFocus(z)` toggles group visibility, ghosts the shell walls to 8% opacity when isolating one room (so you can orbit freely), and snaps the camera to a per-zone preset in `FOCUS`. Balcony shows with the bedroom. **When you add geometry, set `TARGET` to the right group first**, or route stray `scene.add(...)` meshes to the group like the bed lamps / balcony pieces do.

### Hosting (added 2026-06-02)
- **Live site:** https://apyashaswi.github.io/Interior-designs/ — GitHub Pages, served from `main` branch root.
- **Repo:** https://github.com/apyashaswi/Interior-designs (public). Push to `main` and Pages rebuilds automatically (~1 min).
- It's a pure static site (CDN Three.js), so Pages serves `index.html` directly — `server.js` is local-dev only and unused in production.

### Files
- `index.html` — the whole app (Three.js scene **and** the SVG 2D plan). All geometry is plain JS coordinates.
- `server.js` — minimal zero-dependency static server.
- `package.json` — `npm start` runs the server.
- `KNOWLEDGE-BASE.md` — this file.

---

## 3. Coordinate system (READ before editing `index.html`)

- **1 unit = 1 foot.**
- **X** = width: `0` = left/west wall … `16.5` = right/east **window wall** (room is **16'6"** wide — see decision log #10).
- **Z** = depth: `0` = north/top (closet+bath end) … `31.75` = south (balcony end).
- **Y** = height: `0` = floor … `10` = structural slab; **8.5** = finished (false) ceiling.
- Helpers: `box(w,h,d, centerX,centerY,centerZ, mat)` is **center-based**; `boxAt(w,h,d, minX,minY,minZ, mat)` is **min-corner based**.
- Key constants (top of the script):
  `W=16.5`, `BC=W/2` (bath|closet divider = 8.25), `ZTOT=31.75`, `H=10`, `FC=8.5`, `Z_STRIP=8`, `Z_BED=24`, `BALC={ax:16.0,az:28.5,bx:10.75,bz:31.75}`.

---

## 4. Current layout (the source of truth)

```
            NORTH (z=0)  — exterior
 x0                  x8.25                  x16.5
  ┌─────────────────────┬─────────────────────┐  z0
  │     BATH 8'3"×8'     │ WALK-IN CLOSET 8'3"×8'│
  │  (vanity,WC,         │  (island, wardrobes)  │  ← strip 8 ft deep
  │   shower NE x5.25-8.25)  ┌── 2ft window (E wall, z3-5)
  │                ║     │  door→closet on WEST  │
  └───────door═════╝─────┴──(x8.75-11.25)───────┘  z8
  │        bath reached THROUGH closet           │
  │                                              │
  │   KING BED (headboard on LEFT wall, x0)      │  ┌ WINDOW SEAT (E wall)
  │   faces the big east window  ────────────────┼─►│ 12 ft, z8-20
  │                                              │  │ + 10ft window z10-20
  │   [ ~8 ft open floor toward window ]         │  └ L-WARDROBE z20-24
  │                                              │     + Leg B return x13-16.5
  │  entry door (left wall, z19.5-22) ───────────┤
  └───────── convertible glass door ────────────┘  z24
  │  3.0 solid │ 10 ft bi-fold door │ 3.5 (legB) │
  │           SIT-OUT / BALCONY ≈16'6"×7'9"       │  angled outer corner
  └──────────────────────────────────────────────┘  z31.75
            SOUTH — balcony / sit-out
```

### Dimensions
- **Bedroom:** **16'6"** (X) × 16'0" (Z, z8–24). Ceiling 10 ft with **1.5 ft false-ceiling cove** (finished 8.5 ft).
- **Bath:** ~8'3"×8' (x0–8.25, z0–8). Reached **through the closet** (no direct bedroom→bath door). Shower in NE corner (x5.25–8.25, z0–3.2).
- **Walk-in closet:** ~8'3"×8' (x8.25–16.5, z0–8), against the **east exterior wall**.
- **Balcony / sit-out:** ≈16'6"×7'9" (z24–31.75) with an **angled outer corner**.
- **No alcove** — the bath (8'3") + closet (8'3") split the full 16'6" width evenly; the old 3 ft alcove was only an artifact of the earlier 19 ft assumption.

### Openings
| Opening | Location | Size |
|---|---|---|
| Bedroom **entry door** | left wall (x=0), z 19.5–22 (near balcony) | ~2.5 ft |
| **Closet door** (from bedroom) | closet south wall, x 8.75–11.25 (**west side, away from E window**) | ~2.5 ft |
| **Closet→bath door** | partition x=8.25 (=BC), z 4–6 | ~2 ft |
| **Large Window #1** (bedroom) | east wall (x=16.5), z 10–20 | **10 ft**, window seat under |
| **Closet window** | east wall (x=16.5), z 3–5 | **2 ft**, 3 ft wall each side |
| **Large Window #2 / convertible bi-fold door** | balcony wall (z=24), x 3–13 | **10 ft** |

### Window / balcony wall splits (owner-specified)
- **East window wall (16 ft, along Z):** 2 ft cushion + **10 ft window** + 4 ft … resolved as 12 ft window-seat (z8–20) + 4 ft wardrobe (z20–24).
- **Balcony wall (16'6" along X):** **3.0 ft solid + 10 ft door + 3.5 ft Leg B** (was 5.5+10+3.5 at 19 ft; the 10 ft door and 3.5 ft Leg B were kept, the west solid trimmed to absorb the 2.5 ft).

---

## 5. Joinery & furniture (the feature pieces)

- **King bed** — headboard against the **left wall** (opposite the window); faces the big east window. `bedZc=13.5`, 6.5 wide × 6.6 long. (~8 ft of open floor now sits between the bed foot and the window seat, down from ~12 ft at the old 19 ft width.) Fluted upholstered headboard, 2 floating bedside tables + **brass pendant** lights, foot bench, rug, artwork.
- **Window seat** — **continuous 12 ft** along the east wall (z8–20), 1.83 ft deep, with a **daybed end** (backrest + bolster) at the north end where it meets solid wall. The 10 ft window sits above (z10–20). **Storage below (added 2026-06-02):** the 1.5 ft base is articulated into **6 handleless bays, drawer-over-cabinet** (vertical seams every 2 ft + a horizontal divide reveal at y0.85).
- **L-shaped wardrobe** (balcony end of the east wall):
  - **Leg A** = 4 ft full-height along the east wall (z20–24).
  - **Leg B** = 3.5 ft return wrapping the corner onto the balcony-wall stub (x13–16.5). Handleless oak.
- **Closet** — **wardrobes wrap all four walls (maximized 2026-06-02)**, full-height to the 8.5 ft ceiling, handleless oak: a full **north-wall run** (x8.4–16.4, 2 ft deep, with 5-door seams), an **east-wall run** south of the 2 ft window (z5–7.85), **one west-wall run** north of the bath door (z2.05–3.95; the S-of-bath-door run was **removed 2026-06-02** to clear the closet/bath door corner), and a **south-wall run** east of the bedroom door (x11.45–16.4). Run depths: `WD=2.0` (N/W), `ED=1.5` (E), `SD=1.6` (S). The **dressing island was removed 2026-06-02** (owner) — floor kept clear.
- **Sliding mirror door (closet, added 2026-06-02)** — a full-length (y0.4–7.0) framed **mirror panel** on a brass head+floor track in front of the east-wall window; shown **closed** (covering the 2 ft window, z2.85–5.15) and **slides south** along the track (z3–7.85) to tuck into/behind the east wardrobe and reveal the window. Static for now — a candidate for the same open/close animation as the bi-fold door.
- **Bath** — vanity (x0.3, north wall), WC (x1.0), glass shower enclosure in the **NE corner** (x5.25–8.25, z0–3.2).
- **Balcony** — 2 outdoor lounge chairs, coffee table, planter, glass railing following the angled corner.

---

## 6. Material & finish palette (Modern Minimalist · premium)

| Surface | Material | Hex (in code) |
|---|---|---|
| Walls | Warm white / greige | `0xefe9df` |
| Floor | Wide-plank engineered oak | `0xc9a16b` |
| Joinery (seat, wardrobes) | Oak veneer, **handleless** | `0xc69a6b` / dark `0x9c6f43` |
| Upholstery | Oat linen | `0xd8cdbb` |
| Accent textile | Charcoal | `0x33312f` |
| Bath | Stone + glass | `0xd7d2c8` / glass |
| Metal accents | Brushed brass | `0xb08d57` |
| Balcony | Timber deck | `0xb5a382` |

Lighting is **layered**: recessed downlights + perimeter **cove LED** (the 1.5 ft drop) + bedside **pendants** + room lights. Toggle **Night** to see the cove glow.

---

## 7. Decision log (why things are the way they are)

1. Started as a single 16'3"×16'0" room; expanded to model the **whole suite** (closet + bath + balcony).
2. Window seat + flanking cupboards placed on an **exterior** wall (the east wall).
3. Bed **rotated 90°** so the headboard is on the **left wall** (opposite the window) — wake facing the window/balcony light.
4. The uneven window-wall sides were unified, then evolved into **extended 12 ft seat (daybed) + corner L-wardrobe**.
5. **Single lounge sofa removed** at owner's request.
6. Convertible balcony door **narrowed to 10 ft** to make room for the L-wardrobe's Leg B (glazing stays clear of joinery).
7. Room **width set to 19 ft** (balcony wall = 5.5 + 10 + 3.5). *(superseded — see #10)*
8. Closet & bath confirmed **8×8 each** → strip depth deepened from 6.5 to **8 ft**; bedroom/balcony shifted accordingly.
9. **Closet window on the east wall** (its 8 ft side: 3 + 2 + 3); **closet door kept on the west side**, away from that window.
10. **Width corrected to 16'6" (2026-06-01).** Owner confirmed the original plan shows the room as **16'6" wide, not 19 ft**, and that there is **no alcove/passage**. The bath + closet now **split the 16'6" evenly (~8'3" each)** and fill the whole strip. Forced consequences: east wall moved to x=16.5 (window seat, windows, L-wardrobe shifted in); bath/closet repositioned (bath x0–8.25, closet x8.25–16.5; partition now x=8.25=BC); balcony wall re-split to **3.0 solid + 10 ft door + 3.5 Leg B** (door & Leg B preserved). Depth unchanged (16'0").

---

## 8. OPEN QUESTIONS — resume here next time

1. ~~The ~3 ft alcove~~ — **RESOLVED 2026-06-01:** there is no alcove; the room is 16'6" wide and bath+closet fill it (decision log #10).
2. **Confirm the closet window** is centered on the east wall exactly as the real plan shows. Also re-confirm the **west solid (3.0 ft) on the balcony wall** is acceptable, or whether the 10 ft door should shrink instead.
3. **The ~8 ft open floor** between the bed foot and the window seat — fill it (bench, pair of accent chairs facing the window, console) or keep it open and airy?
4. **Refinements offered but not yet built:** daybed book ledge · chamfer the inner corner of the L-wardrobe · wardrobe interior shelf/rail detail · **animated** bi-fold door (open/close button) · sheer + blackout **curtain layers** · load **real wood/stone textures** instead of flat colors.
5. **Not yet designed:** bath interior styling, closet interior organization detail, balcony flooring/planting, exact electrical/switching plan.

---

## 9. Editing tips

- Change a room size → update the relevant constant(s) and the hard-coded coordinates that reference the **east wall** / partitions. After any width/depth change, also update the matching values in the **`build2D()`** function (the SVG plan is drawn from the same numbers but is **not** auto-linked).
- The exterior walls use a single shared material `WALL`; **X-ray** toggles its opacity.
- Ceilings live in `ceilingGroup` (hidden by default); the cove glow is in `coveGroup`.
- Always re-test both the **3D view** and the **2D plan** after edits (the door swings, window glyphs, and dimension lines are drawn separately in `build2D()`).
- **Glazing (added 2026-06-01):** the **east wall now has REAL openings cut** for the two windows — it is built as solid segments + sills/headers (`box(...,WALL)`), no longer one box. Each opening has a bright **sky light-box** (`skyPanel(...)`, a `MeshBasicMaterial` gradient plane) tucked just outside at `x=W+0.2`, sized to the opening so it's only seen *through* the glass, not as a floating billboard. Windows + balcony door use `winGlass` (lighter, glassy) instead of `glassMat` (which is kept for the shower + railings). `setMode()` dims `skyMat` to dusk-blue at night. If you resize/move a window, also move its sky panel and re-cut the wall segments.
