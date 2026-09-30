# VICHITH — VISUAL EXPERIENCE BLUEPRINT

## Design Philosophy

**NOT** a SaaS website with cards and feature grids.
**IS** a cinematic, spatial, interactive creative experience.

Every section must answer: "Why does this look like this?" 
If the answer is "because it looks nice" — remove it.

---

## GLOBAL SYSTEM

### Color (Strict Vichith only)
- **Background:** #070809
- **Foreground:** #F4F4F5  
- **Accent:** #83D0BE (cyan)
- **Muted:** #71717A, #52525B
- **Borders:** rgba(255,255,255,0.06)

### Typography Hierarchy
- **Hero:** Syne 72-96px, weight 700, tracking -0.03em
- **Display:** Syne 48-64px, weight 600
- **Headline:** Inter 24-32px, weight 500
- **Body:** Inter 16-18px, weight 400
- **Technical:** JetBrains Mono 11-13px, uppercase, tracking 0.1em

### Motion Language
- **Easing:** cubic-bezier(0.16, 1, 0.3, 1)
- **Micro:** 150ms (hover, focus)
- **Interface:** 300ms (transitions)
- **Narrative:** 800-1200ms (section reveals)
- **Stagger:** 80-100ms between elements

### 3D System
- **Perspective:** 1200-1500px
- **Depth:** -200 to +200 z-space
- **Rotation:** ±15deg max (subtle)
- **No random spinning cubes** — every 3D element has purpose

---

## SECTION 1: NAVBAR

**Concept:** Command bar — part of the interface, not decoration

**Structure:**
```
[LOGO]    Product  Chithra  Studio  Explore  Pricing    [Log in] [Start Creating]
```

**Behavior:**
- Transparent at top → subtle glass on scroll
- Thin 1px border appears: rgba(255,255,255,0.06)
- Mega-menu on Product hover: 3 columns, staggered reveal
- No giant pill containers

---

## SECTION 2: HERO

**Concept:** The creative environment emerges from void

**Visual Thesis:**
Floating creative primitives converge toward a central intelligence.

**Layers:**
1. **Ambient:** Radial gradient (#83D0BE at 2% opacity)
2. **Grid:** Perspective grid lines, tilted 10deg
3. **Primitives:** 8 wireframe boxes (Script, Storyboard, Asset, Timeline, Generation, Character, Scene, Reference)
   - Scattered in 3D space
   - 60-100px, 1px borders, no fill
   - Gentle rotation, individual timing
4. **Hub:** Central Vichith mark "◎" at 80px
   - Pulsing glow, 4s cycle
   - Cyan border, 1px
5. **Typography:** "VICHITH" + tagline + CTA

**Motion Sequence:**
- Grid fades in
- Primitives appear scattered (staggered)
- Hub scales from 0 with spring
- Typography reveals character by character
- CTA appears with glow pulse

**Scroll:** Primitives drift toward center, typography fades

---

## SECTION 3: FRAGMENTATION (Problem)

**Concept:** Feel the pain of disconnected workflow

**Visual:**
- Title: "Creating shouldn't mean switching between everything"
- 8 primitives floating in separation
- Lines connect them (thin, stretched)
- As user scrolls: primitives drift FURTHER apart
- Lines snap, fade

**Typography:**
- "8 tools. 8 contexts. 8 workflows."
- Each in different spatial position
- No cards. No icons. Just words in space.

**Transition:** Elements begin converging

---

## SECTION 4: TRANSFORMATION

**Concept:** The convergence — from scattered to unified

**Scroll-Narrative (Pinned):**

**Phase 1 (0-30%):** Maximum Fragmentation
- Primitives at widest separation
- Typography: "8 tools. 8 contexts. 8 workflows."

**Phase 2 (30-60%):** Movement
- Elements spiral toward center
- Glowing paths traced (#83D0BE at 20%)
- Typography: "What if..."

**Phase 3 (60-90%):** Convergence
- All elements align
- Network pattern forms
- Typography: "...it was one?"

**Phase 4 (90-100%):** Emergence
- Elements merge
- Vichith mark expands
- Expanding ring: 1px → 300px, fades
- Typography: "One connected creative environment"

**Technical:**
- GSAP ScrollTrigger with scrub
- SVG paths for connections
- 3D transforms for depth

---

## SECTION 5: CHITHRA

**Concept:** The intelligence layer — not chat, creative partnership

**Composition:** Asymmetric two-column

**Left:**
- "CHITHRA" — Syne 120px, weight 700
- "Your creative partner" — Inter 24px
- "Understands context. Remembers decisions. Works alongside you."

**Right: Spatial Conversation**
- User input appears (bottom left)
- Chithra hub pulses (center)
- Lines radiate to context nodes (Script, Character, Reference, Timeline)
- Nodes illuminate in sequence
- "Generating..." with animated dots
- Result emerges from center

**Motion:**
- Entire sequence on scroll
- ~3 seconds duration
- No chat bubbles — spatial, not conversational

---

## SECTION 6: CREATIVE WORLD

**Concept:** One spatial environment for all work

**Visual:**
- Central hub: Vichith mark, 180px, slow rotation
- 6 nodes in arc: Script | Storyboard | Character | Reference | Timeline | Generation
- Each node: thin circle, 80px, 1px border
- Labels: Mono 10px, uppercase
- Thin lines connect to hub (active on hover)

**Interaction:**
- Hover node: scales 1.1, glows cyan
- Preview fragment appears
- Click: scrolls to corresponding section

---

## SECTION 7: PRODUCTION PIPELINE

**Concept:** Script → Storyboard → Generation → Timeline as one flow

**Format:** Horizontal scroll section (pinned)

**Frame 1: Script**
- Screenplay text in mono
- "INT. COFFEE SHOP - DAY" glows cyan
- Text begins dissolving

**Frame 2: Storyboard**
- 3 frames appear from dissolved text
- Arranged in slight arc
- Perspective tilted

**Frame 3: Generation**
- Each frame multiplies to 4 variations
- Grid: 3x4
- Selected frame glows

**Frame 4: Timeline**
- Frames drop into timeline strip
- Multiple tracks visible
- Playhead scrubs across

**Transitions:** Morph, no cuts. FLIP animations.

---

## SECTION 8: GENERATION

**Concept:** Generation as craft, not magic

**Layout:** Split composition

**Left:**
- Prompt input: "Cinematic wide shot, golden hour..."
- Cursor blinks
- Mono 16px

**Center:**
- Strategy indicators:
  - Quality: 4K ProRes
  - Variations: 4
  - Cost: 12 credits
- Each illuminates in sequence

**Right:**
- 2x2 grid of variations
- 1px border each
- Hover: scale 1.05

**Motion:**
Prompt types → Indicators light up → Variations generate (staggered)

---

## SECTION 9: HUMAN CONTROL

**Concept:** AI proposes, creator decides

**Visual:**
- NOT split cards — integrated spatial
- Center: Creative artifact (larger than UI)
- Left: "AI suggests" + proposal + 94% confidence
- Right: Floating action buttons (Approve | Adjust | Regenerate | Reject)
- Minimal: text + subtle underline

**Typography:**
- "AI does the work. Creator stays in control."
- Syne 56px, centered

---

## SECTION 10: CAPABILITIES

**Concept:** Typographic index, not feature grid

**Layout:**
```
01  IDEATE
02  PLAN
03  SCRIPT
04  STORYBOARD
05  GENERATE
06  EDIT
07  COMPOSE
08  PUBLISH
```

**Treatment:**
- Number: Mono 14px, #52525B
- Title: Syne 48px, weight 600
- Hover: shifts right 20px, color → #83D0BE
- Preview image appears blurred behind
- 1px border-bottom

**Motion:**
- Stagger in (100ms each)
- Smooth 300ms hover

---

## SECTION 11: PRICING

**Concept:** Credit economics, not tier cards

**Visual:**
- Interactive calculator
- Credit visualization
- Usage sliders
- What each tier enables

**NO:**
- Generic pricing cards
- Feature checklists
- "Most Popular" badges

**YES:**
- Contextual explanations
- Credit flows
- Workflow enablement

---

## SECTION 12: FINAL CTA

**Concept:** Inevitable conclusion

**Visual:**
```
You bring the idea.
Vichith brings it to life.
```

**Typography:**
- Line 1: Inter 24px, #71717A
- Line 2: Syne 72px, weight 700
- "brings it to life" — #83D0BE

**CTA:**
- [START CREATING →]
- Large pill, #83D0BE
- Hover: scale 1.05, glow

**Background:**
- Expanding circle from center
- 1px stroke, rgba(131,208,190,0.1)
- Scales 0 → 200%, fades

---

## SECTION 13: FOOTER

**Concept:** Final composition

**Layout:**
```
VICHITH                          Product   Company   Resources
Creative production,             Chithra   About     Documentation
reimagined.                      Studio    Careers   Changelog
                                 Pricing   Contact   Support

                                                      [START CREATING →]
```

**Treatment:**
- Logo: Syne 48px, weight 700
- Links: Inter 14px, hover color shift
- Line: 1px top border
- Minimal, spacious

---

## PERFORMANCE & ACCESSIBILITY

- 60fps scroll target
- GPU transforms only
- Lazy load below fold
- prefers-reduced-motion support
- Semantic HTML
- Keyboard navigation

---

## TECH STACK

- CSS 3D for spatial effects
- GSAP + ScrollTrigger for scroll narrative
- Framer Motion for interactions
- Three.js only where WebGL genuinely improves story
- SVG for lines/connections

---

END BLUEPRINT
