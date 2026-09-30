# VICHITH VISUAL BLUEPRINT
## Complete Marketing Website Redesign
### One Continuous Creative Experience

---

## NAVBAR
**Concept:** Floating command bar — part of the interface, not decoration

**Composition:**
- Fixed position, transparent → subtle glass on scroll
- Height: 64px
- Z-index: 1000
- Layout: Flexbox, space-between

**Structure:**
```
[LOGO]          [PRODUCT] [CHITHRA] [STUDIO] [EXPLORE] [PRICING]          [LOG IN] [START CREATING]
```

**Visual Treatment:**
- Logo: Syne font "vichith" at 16px, tracking -0.02em, weight 600
- Nav links: Inter 13px, weight 500, color #71717A, hover #F4F4F5
- CTA: Pill button, #83D0BE bg, #070809 text, 14px medium
- No giant pill container around nav items
- Thin 1px bottom border appears on scroll: rgba(255,255,255,0.06)

**Mega Menu (Product hover):**
- Full-width, appears with staggered reveal
- Three columns: "Creative World" | "Studio" | "Chithra"
- Each column shows workflow steps as small technical labels
- Motion: Slides down 20px, opacity 0→1, staggered 50ms per column
- Background: #070809 with subtle blur
- Border: 1px rgba(255,255,255,0.08)

---

## SECTION 1: HERO
**Concept:** The creative environment emerges from nothing

**Composition:** Full viewport (100vh), perspective 1500px

**Visual Layers (back to front):**

### Layer 1: Ambient Space
- Subtle radial gradient: center 40% 50%, #83D0BE at 2% opacity, 800px blur
- Grid lines: 1px rgba(255,255,255,0.03), 60px spacing, perspective tilted 10deg
- Animation: Slow parallax drift on scroll

### Layer 2: Floating Creative Primitives
- 8 thin wireframe boxes floating in 3D space
- Each represents: Script, Storyboard, Asset, Timeline, Generation, Character, Scene, Reference
- Initial position: scattered across viewport, random Z (-200 to 100)
- Size: 60-100px, 1px borders, no fill
- Color: rgba(255,255,255,0.08)
- Motion: Gentle rotation (20s duration), individual timing

### Layer 3: Central Hub
- Size: 200x200px
- Thin circular border: 1px rgba(131,208,190,0.3)
- Inside: Vichith mark or "◎" symbol at 80px
- Color: #83D0BE
- Animation: Pulses gently, 4s cycle
- Position: Slightly above center (40% from top)

### Layer 4: Typography
```
                    VICHITH
    From idea to finished frame.
    
    [START CREATING →]
    
    Currently opening to early creators
```

**Typography specs:**
- "VICHITH": Syne 72px desktop, 48px mobile, weight 700, tracking -0.03em, center
- Tagline: Inter 20px, weight 400, #A1A1AA, center, max-width 400px
- CTA: 14px medium, #83D0BE pill, centered
- Meta text: JetBrains Mono 11px, uppercase, #52525B, center

**Motion Sequence:**
1. Grid fades in (0-800ms)
2. Floating primitives appear scattered (200-1200ms, staggered)
3. Central hub scales from 0 (600-1000ms, spring easing)
4. "VICHITH" characters animate in from bottom (800-1400ms, stagger 30ms)
5. Tagline fades up (1200-1600ms)
6. CTA appears with subtle glow pulse (1400-1800ms)
7. Scroll indicator appears at bottom (1800ms+)

**Scroll Behavior:**
- As user scrolls down, primitives drift toward center
- Typography fades and scales down slightly
- Hub pulses brighter
- Smooth handoff to Problem section

---

## SECTION 2: FRAGMENTATION
**Concept:** The scattered creative stack

**Composition:** 120vh height, pinned for 800px scroll

**Visual Treatment:**
- Background: Pure #070809
- Title appears at top: "Creating shouldn't mean switching between everything."
- Typography: Syne 48px, weight 600, tracking -0.02em
- Subtitle: Inter 16px, #71717A, "The current workflow is fragmented."

**The Primitives (8 elements):**
Each is a thin wireframe box, 80-120px, 1px border, floating at different Z depths

| Element | Initial Position | Final Position |
|---------|-----------------|----------------|
| SCRIPT | -30% X, -20% Y, Z: -150 | Drifts further apart on scroll |
| STORYBOARD | 25% X, -15% Y, Z: 50 | |
| ASSET | -20% X, 10% Y, Z: -100 | |
| TIMELINE | 30% X, 15% Y, Z: 80 | |
| GENERATION | -25% X, 25% Y, Z: -50 | |
| CHARACTER | 15% X, -25% Y, Z: 120 | |
| SCENE | -15% X, -10% Y, Z: -200 | |
| REFERENCE | 35% X, 20% Y, Z: 60 | |

**Motion:**
- Scroll-linked: As user scrolls through this section, elements drift FURTHER apart
- Rotation increases (0deg → 15deg random axes)
- Opacity decreases slightly (1 → 0.7)
- Thin connecting lines appear between them (SVG), then stretch and fade

**Transition to next section:**
- Elements begin moving toward a common center point
- This motion transitions into the Vichith section
- Visual metaphor: "From scattered to unified"

---

## SECTION 3: TRANSFORMATION
**Concept:** Fragmentation converges into Vichith

**Composition:** 150vh, pinned scroll section

**Scroll Narrative:**

**Phase 1 (0-30%):** Maximum Fragmentation
- All 8 primitives at widest separation
- Lines between them are stretched thin, breaking
- Typography: "8 tools. 8 contexts. 8 workflows."

**Phase 2 (30-60%):** Movement Begins
- Primitives start moving toward center
- Paths traced with glowing lines (#83D0BE at 20% opacity)
- Typography fades to: "What if..."

**Phase 3 (60-90%):** Convergence
- All elements spiral toward center
- Rotation slows, aligns to 0
- Z-depth normalizes to 0
- Lines connect into network pattern
- Typography: "...it was one?"

**Phase 4 (90-100%):** Emergence
- All elements merge into single form
- Vichith "◎" mark appears at center
- Expanding ring animation (1px → 300px, fades)
- Section transitions to Chithra

**Technical Implementation:**
- GSAP ScrollTrigger with scrub: 1
- Three.js for 3D primitive positioning (optional) or CSS 3D transforms
- SVG paths for connection lines
- Perspective: 1200px

---

## SECTION 4: CHITHRA
**Concept:** The intelligence layer — not an AI chatbot, a creative partner

**Composition:** 100vh, two-column asymmetric

**Left Column (60%):**
- Large "CHITHRA" text: Syne 120px, weight 700, tracking -0.03em
- Subtitle: "Your creative partner" — Inter 24px, #A1A1AA
- Description: "Understands context. Remembers decisions. Works alongside you."

**Right Column (40%):**
- Interactive conversation visualization
- NOT a chat interface — a spatial interaction

**Spatial Conversation:**
```
[User input appears] → [Chithra processes] → [Context appears] → [Action executes]
```

**Visual Treatment:**
- User input: Small label, bottom left
- Processing: Central hub pulses, thin lines radiate to context nodes
- Context nodes (4): Script | Character | Reference | Timeline — arranged in arc above
- Each node illuminates in sequence (200ms stagger)
- Action: Typography "Generates" with line animation
- Result: Storyboard frame emerges from center

**Motion:**
- Entire sequence plays on scroll into view
- Or on click for interaction
- Duration: ~3 seconds
- Easing: Custom [0.16, 1, 0.3, 1]

**Background:**
- Subtle radial gradient centered on Chithra hub
- Faint connection lines between context nodes (always visible, subtle)

---

## SECTION 5: CREATIVE WORLD
**Concept:** One spatial environment for all creative work

**Composition:** 100vh, centered radial layout

**Central Hub:**
- Size: 180px
- Vichith mark at center
- Thin circular border: 1px rgba(255,255,255,0.1)
- Animated: Slow rotation (60s), pulses on hover

**Surrounding Nodes (6 elements in arc):**
| Node | Position | Label |
|------|----------|-------|
| Script | Top-left arc | "01 SCRIPT" |
| Storyboard | Top arc | "02 STORYBOARD" |
| Character | Top-right arc | "03 CHARACTER" |
| Reference | Right arc | "04 REFERENCE" |
| Timeline | Bottom arc | "05 TIMELINE" |
| Generation | Left arc | "06 GENERATION" |

**Node Treatment:**
- Each is a thin circle, 80px diameter, 1px border
- Label: JetBrains Mono 10px, uppercase, tracking 0.1em
- Hover: Node scales 1.1, border glows #83D0BE
- Active: Thin line connects to center hub

**Interaction:**
- Hover on node: Shows preview fragment (script excerpt, storyboard frame, etc.)
- Click node: Camera "moves" to that section (scroll triggers)

**Typography:**
- Section title: "One Creative World" — Syne 64px, top of section
- Subtitle: "All your creative work. One connected environment." — Inter 18px

---

## SECTION 6: PRODUCTION PIPELINE
**Concept:** Script → Storyboard → Generation → Timeline as one continuous flow

**Composition:** Horizontal scroll section (pinned), 400vh equivalent

**Narrative Scroll:**

**Frame 1: Script**
- Full-screen script text (screenplay format)
- Typography: Mono 14px, #71717A
- Highlighted scene: "INT. COFFEE SHOP - DAY" glows #83D0BE
- As scroll progresses, text begins to transform

**Frame 2: Storyboard Emergence**
- Script dissolves, storyboard frames appear (3 frames)
- Each frame shows key moments from scene
- Frames arranged in slight arc, perspective tilted
- Motion: Fade in with scale 0.9→1

**Frame 3: Generation**
- Storyboard frames multiply — each becomes 4 variations
- Variations shown as grid: 3x4 frames
- Selected frame highlighted with subtle glow
- Motion: Staggered appearance, 50ms delay

**Frame 4: Timeline**
- Selected frames drop into timeline strip
- Timeline shown at bottom, multiple tracks visible
- Playhead moves across
- Final frame holds

**Visual Transition:**
- Between each phase, elements morph/transform
- No hard cuts — continuous flow
- Use FLIP animation technique for seamless transitions

---

## SECTION 7: GENERATION LABORATORY
**Concept:** The generation process as craft, not magic

**Composition:** 100vh, split screen

**Left (40%):**
- Prompt input visualization
- "Cinematic wide shot, golden hour, shallow depth of field"
- Typography: Mono 16px, #F4F4F5
- Cursor blinks

**Center (20%):**
- Strategy indicators
- Quality: 4K ProRes
- Variations: 4
- Cost: 12 credits
- Style: Film grain, cinematic

**Right (40%):**
- Output variations grid
- 2x2 grid of generated frames
- Each frame: 1px border, subtle shadow
- Hover: Frame scales slightly, shows details

**Motion:**
- Sequence: Prompt types → Strategy indicators illuminate → Variations generate (staggered)
- Duration: 4 seconds on scroll into view

**Typography:**
- Section label: "GENERATION" — Mono 11px, uppercase, #83D0BE
- Title: "Precise generation. Complete control." — Syne 48px

---

## SECTION 8: HUMAN CONTROL
**Concept:** AI proposes, creator decides

**Composition:** 100vh, centered

**Visual Treatment:**
- Split interface showing AI proposal vs Creator controls
- NOT two cards — integrated spatial layout

**Left Side (AI):**
- "AI suggests:" label — Mono 11px, #71717A
- Proposed action in clean typography
- Confidence indicator: 94% — small bar chart

**Right Side (Creator):**
- "Creator controls:" label
- Floating action buttons: Approve | Adjust | Regenerate | Reject
- Each button is minimal: text + subtle underline on hover

**Central Element:**
- The creative artifact being reviewed (frame, edit, etc.)
- Larger than surrounding UI
- Focus of attention

**Typography:**
- Title: "AI does the work. Creator stays in control." — Syne 56px
- Centered, max-width 700px

---

## SECTION 9: PRODUCT SHOWCASE
**Concept:** The actual Vichith interface as immersive experience

**Composition:** 120vh, scroll-triggered state changes

**Scroll Narrative:**

**Phase 1: Studio View**
- Full product interface mockup
- Generation panel visible
- Cursor movement animation

**Phase 2: Chithra Integration**
- Panel slides in from right
- Shows conversation with Chithra
- Demonstrates context awareness

**Phase 3: Timeline**
- View transitions to timeline
- Multiple tracks visible
- Playhead scrubs

**Visual Treatment:**
- Interface is real — actual Vichith UI components
- Not fake screenshots
- Use real interface elements, animated
- Border: 1px rgba(255,255,255,0.08)
- Subtle shadow: 0 25px 80px rgba(0,0,0,0.5)

---

## SECTION 10: CAPABILITIES INDEX
**Concept:** Typographic index, not feature cards

**Composition:** 100vh, vertical list

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

**Visual Treatment:**
- Number: Mono 14px, #52525B, fixed width
- Title: Syne 48px, #F4F4F5, weight 600
- Hover: Title shifts right 20px, color → #83D0BE
- Background: Preview image/fragment appears on hover (blurred, behind)
- Line: 1px border-bottom rgba(255,255,255,0.06)

**Motion:**
- List items stagger in (100ms each)
- Hover: Smooth 300ms transition
- Active item: Stays highlighted while scrolling

---

## SECTION 11: TRUST
**Concept:** Minimal, restrained social proof

**Composition:** 60vh, centered

**Visual Treatment:**
- No logo grid
- No testimonial cards
- Single statement: "Trusted by 2,847+ creators"
- Typography: Syne 32px, center
- Subtle horizontal line above and below
- Small marks/logos appear in faint row below

**Motion:**
- Fade in with slight scale
- Line draws from center outward

---

## SECTION 12: FINAL CTA
**Concept:** The inevitable conclusion

**Composition:** 100vh, dramatic

**Visual Treatment:**
- Background: Pure #070809
- Central typography:
```
You bring the idea.
Vichith brings it to life.
```
- "You bring the idea." — Inter 24px, #71717A
- "Vichith brings it to life." — Syne 72px, weight 700, #F4F4F5
- "brings it to life" — color #83D0BE

**CTA:**
- [START CREATING →]
- Large pill button, #83D0BE, 16px semibold
- Hover: Scale 1.05, subtle glow

**Background Element:**
- Single expanding circle from center
- 1px stroke, rgba(131,208,190,0.1)
- Scales from 0 to 200% viewport
- Animation: 2s ease-out

---

## SECTION 13: FOOTER
**Concept:** Final composition, not afterthought

**Composition:** 40vh, spatial layout

**Layout:**
```
VICHITH                               Product      Company      Resources
Creative production,                  Chithra      About        Documentation
reimagined.                           Studio       Careers      Changelog
                                      Pricing      Contact      Support

                                                                      START CREATING →
```

**Visual Treatment:**
- Logo: Syne 48px, weight 700
- Tagline: Inter 16px, #71717A, max-width 200px
- Links: Inter 14px, #71717A, hover #F4F4F5
- CTA: Same as previous, aligned right
- Line: 1px top border, rgba(255,255,255,0.06)

**Bottom Bar:**
- Copyright, Privacy, Terms
- Inter 12px, #52525B
- Centered

---

## GLOBAL MOTION SYSTEM

### Scroll Engine
- Primary: GSAP ScrollTrigger with scrub: 1
- Pinning for narrative sections
- Parallax layers at 0.2, 0.5, 0.8 speeds

### Micro-interactions
- Hover: 150ms, ease-out
- Click: 100ms, ease-in-out
- Focus: 200ms, visible ring

### Narrative Transitions
- Section entrance: 800-1200ms
- Stagger: 80-100ms between elements
- Easing: [0.16, 1, 0.3, 1] (signature smooth)

### 3D Transforms
- Perspective: 1200-1500px
- RotateX/Y for depth: ±10-15deg max
- Z-depth for layering: -200 to +200

---

## RESPONSIVE STRATEGY

### Desktop (1280px+)
- Full spatial compositions
- All 3D effects active
- Horizontal scroll sections

### Tablet (768-1279px)
- Reduced 3D depth
- Vertical scroll replaces horizontal
- Simplified spatial arrangements

### Mobile (<768px)
- Minimal 3D (performance)
- Single column layouts
- Typography scales down
- Touch-optimized interactions
- Reduced motion support

---

## PERFORMANCE REQUIREMENTS

- Target: 60fps scroll
- Lazy load sections below fold
- IntersectionObserver for animations
- prefers-reduced-motion support
- GPU-friendly transforms only
- Compressed assets

---

## TECHNICAL NOTES

- CSS 3D for most spatial effects
- Three.js only for hero/convergence if needed
- GSAP + ScrollTrigger for scroll narrative
- Framer Motion for component interactions
- SVG for lines and connections
- WebGL only where genuinely valuable

---

END OF BLUEPRINT
