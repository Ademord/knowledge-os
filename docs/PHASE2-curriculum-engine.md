# KnowledgeOS vNext — Phase 2 (Curriculum Engine, FROZEN) + Phase 3 (Experience Design)

## Roadmap

- **Phase 1 — Knowledge Model** ✅ (ontology-driven graph, domain packs, modes, routes, adaptive card — shipped)
- **Phase 2 — Curriculum Engine** 🧊 FROZEN SPEC (below, Part A): the Zoltraak handoff. The manifesto has converged after five revision rounds; no further reasoning clauses. First implementation step: **persist the frozen spec verbatim to `knowledge-os/docs/PHASE2-curriculum-engine.md`** so it survives outside this plan, then implement it.
- **Phase 3 — Experience Design** 🔄 (Part B): make someone *want* to use this every day. The graph is evidence; the product is watching the smallest basis of a field emerge.

---

# PART A — Phase 2: Zoltraak handoff (frozen spec — implement as written, do not iterate)

Cluster GENERATE row (+ whole-domain entry) produces Franco's Zoltraak training protocol with all revision rounds applied, plus graph-derived Zoltraak candidates with evidence. Each component has exactly one job: **"The graph provides evidence. The heuristic proposes candidates. The rubric structures the argument. Conceptual reasoning makes the final decision."** The receiving AI challenges the graph when they disagree and must search and falsify before committing — with reasoning budget proportional to scope.

Changes in `knowledge-os/KnowledgeOS.dc.html` (+ `docs/PHASE2-curriculum-engine.md` + README + design sync). No schema changes. **`buildHandoff` must return structured data (`zoltraaks[]` with per-dimension evidence, spells[], flags, margin) alongside the flat text — Phase 3's progressive revelation and animations consume the structure.**

## ZOLTRAAK_MANIFESTO (final composition, verbatim const)

1. **Reasoning preamble** — "think like a researcher, not a formatter" block (alternatives before selection; challenge first instinct; **"What assumption am I making that could be false?"**; hidden invariants; explain-many over appear-often; reconstruction test between competitors; smallest explanatory core; global over local) + *"Treat every generated answer as a hypothesis to be stress-tested before being presented. Your first solution is a draft, not your final conclusion."*
2. **MDL objective** + **Goodhart guard** (immediately after MDL): *"Compression is the objective only under the constraint that explanatory power is preserved. Never merge concepts merely to obtain a smaller basis."* + anti-elegance clause: *"Do not optimize for elegance at the expense of truth. If the field genuinely requires additional independent primitives, prefer an irreducible basis over an artificially elegant decomposition."* + **basis definition**: *"Treat Zoltraaks as a basis of the conceptual vector space. A good basis is not the smallest possible list, but the smallest set from which the remaining concepts can be reconstructed with minimal additional assumptions."* + **scope proportionality**: *"Scale the depth of the decomposition to the scope of the request. For a single concept, search for the local conceptual basis. For a cluster, search for the cluster basis. For an entire discipline, search for the global basis. Spend your reasoning budget proportionally to the scope."*
3. **Core protocol** (prior rounds): elite-practitioner framing; compression-primitive definition early; reusable+generative definition; four properties (reused constantly · transfers broadly · enables reconstruction · survives forgetting); no count constraint ("smallest set…"); specialized-spells-mistaken-for-Zoltraaks section (never "false"); durable-retrieval questions replacing "six months"; keep "Every lesson should leave me with fewer isolated facts and more Zoltraaks."
4. **Rubric** (Recurrence · Generativity · Reconstruction · Compression · Transfer) with the explanatory clause: *"The rubric is explanatory, not eliminatory. Every criterion contributes evidence; exceptionally strong performance in one dimension may compensate for weaker evidence in another. The final decision is justified in prose, not by the raw count alone."*
5. **Evidence layers** — the one-job pipeline sentence verbatim: *"The graph provides evidence. The heuristic proposes candidates. The rubric structures the argument. Conceptual reasoning makes the final decision."* Plus *"The graph is evidence, not authority."* Graph evidence suggests; only conceptual reasoning explains — for every Zoltraak, supply the conceptual compression argument the graph cannot ("this unifies X, Y, Z into one invariant"). **Challenge the graph**: *"If the graph appears structurally inconsistent with the conceptual decomposition, explicitly identify the inconsistency instead of silently accepting it. Suggest which missing edges, missing abstractions, or incorrect relationships would reconcile the graph with the field."*
6. **Required output additions**: a *Decomposition Confidence* estimate (High/Medium/Low, reason, potential ambiguity — confidence in the chosen basis, not the concepts); a *graph corrections* note when warranted.
7. **The objective sentence** (placed prominently, closing the MDL section): *"Your objective is not to identify important concepts. Your objective is to discover the irreducible conceptual basis from which an expert could plausibly reconstruct the discipline after forgetting every specialized technique."* Plus the regret criterion: *"Prefer concepts that minimize explanatory regret — the concepts you would wish, six months after learning the whole field, that you had mastered first."*
8. **Adversarial review loop** (search → falsify → repair → present):
   - Alternative decomposition: *"Before presenting your final Zoltraak decomposition, attempt to construct a second, fundamentally different decomposition of the field. Compare both using the rubric and MDL objective. Present only the stronger decomposition, but briefly explain why the alternative was rejected."*
   - **Falsification**: *"Before committing, actively attempt to falsify your decomposition. Assume it is wrong. Search for the strongest evidence against your chosen Zoltraaks. Ask which concept, if elevated instead, would produce a simpler or more explanatory basis. Only present your decomposition after you can no longer improve it through this adversarial review."*
   - **Adversarial Defense** (operational, per selected Zoltraak): *if this were NOT a Zoltraak: what would replace it? what becomes harder to explain? what evidence argues against my choice?*
   - **Compression audit**: *Can any two selected Zoltraaks be merged into a deeper invariant? (→ not yet minimal.) Can any selected Zoltraak be derived from the others? (→ not independent.) Can any important area of the field NOT be reconstructed from this basis? (→ incomplete.)*
   - **Stopping criterion** (operational Occam): *"Stop searching when an additional refinement produces less explanatory benefit than additional complexity."*
   - **The Rediscovery Test** (named, the defining test): *"Rediscovery Test: Starting only from the proposed Zoltraaks and first principles, could a competent researcher plausibly rediscover the remainder of the discipline? If not, identify what is missing from the basis."*

No numeric weights anywhere in the prompt — the implementation's scoring stays internal; the prompt stays conceptual.

## Engine — `zoltraakAnalyze(unitIds)` (discovery pipeline, evidence-only output)

1. **Candidates**: all units in scope.
2. **Per-test graph evidence** (qualitative strings, no pass/fail gate): Recurrence (deg, freq) · Generativity (dependency fan-out via incoming `requires`/`builds_on`, transitive; non-dep domains: `derived_from` children + collocations) · Reconstruction (`why` present) · **Compression evidence** (`instance_of` pattern link, ≥3 distinct rel types converge, bridge) · Transfer (2+ hub bridge, `connects_to`).
3. **Ranking**: criteria normalized 0–1, internally weighted (generativity .3, compression .25, transfer .2, recurrence .15, reconstruction .1) → score used ONLY for candidate ordering/threshold, weights never emitted.
4. **Proposed set**: score ≥ ~55% of scope max, min 3, cap 8 (14 domain-wide) — presented as *proposed*, with the manifesto making clear the receiving AI owns the final call and may promote/demote with argument.
5. **Apparent-Zoltraak annotation**: non-proposed member whose dominant edge to a proposed Zoltraak is `optimizes`/`implemented_by` with low fan-out → *"frequently mistaken for a Zoltraak — a specialized spell of {target}"*.

## Prompt assembly — `buildHandoff(hubId|null, 'zoltraak')`

1. Manifesto.
2. `== PROPOSED ZOLTRAAKS OF {cluster | the field} (graph evidence — the final decomposition is yours to argue) ==` — per candidate: name — meaning; **Graph evidence:** per-rubric-dimension qualitative evidence lines; depends-on; `why`. (The conceptual compression argument is explicitly delegated to the AI per manifesto §5.)
3. `== WHY THESE AND NOT THE OTHERS? ==` — generated paragraph comparing the top non-proposed candidate to its related proposed Zoltraak ("We propose {A} rather than {B} because … Mastering {A} enables reconstruction of {B}; the reverse is not true."), plus instruction to extend/overturn this reasoning where the rubric argues otherwise.
4. `== SPECIALIZED SPELLS (build on the Zoltraaks above) ==` — remainder + apparent-Zoltraak annotations.
5. Data blocks (reused): LEARNER STATE · TEACHING ORDER · CONFUSIONS · INSIGHTS · RULES & SCENES / FAILURES & TRADEOFFS.
6. Closing: apply the protocol strictly; run the full adversarial loop (alternative decomposition → falsification → Adversarial Defense → compression audit → Rediscovery Test, stopping per the Occam criterion) before answering; produce the Decomposition Confidence and any graph corrections.

UI: `zoltraak` flavor FIRST in GENERATE row; modal strip `TRAINING PROTOCOL: ZOLTRAAK MASTERY`, why-line describing propose→argue pipeline; `ZOLTRAAK BRIEF · WHOLE DOMAIN` button in Learn routes-panel header (`openHandoff(null,'zoltraak')`; teaching order = hubOrder→stepsForHub concat).

## Reuse
`buildHandoff` data blocks + `capsIn`; `stepsForHub`/`hubOrder`; handoff modal + `copyHandoff`; `handoffFormatRec` untouched for other flavors.

## Part A files
- `knowledge-os/docs/PHASE2-curriculum-engine.md` — this frozen spec, verbatim (created first).
- `knowledge-os/KnowledgeOS.dc.html` — manifesto const, `zoltraakAnalyze()` (returns structured evidence), buildHandoff branch + null-hub scope, flavor order, routes-panel button, modal variant.
- `knowledge-os/README.md` — flavor, propose→argue pipeline, rubric-is-explanatory + challenge-the-graph clauses.

---

# PART B — Phase 3: Experience Design

The engine is done; this phase is entirely about how the user *experiences* it. Staged D0→D2; each stage independently shippable, verified, and synced to the design project (animations are designer-sensitive — sync after each stage so the designer can iterate). Global constraints: single-file DC app; respect `prefers-reduced-motion` (all animations become instant states); no persistent rAF loops (hidden-tab pause caveat — use CSS transitions and finite timed sequences); ≤100 animated nodes is fine for CSS transitions.

### D0 — The graph becomes alive (highest value ÷ effort)

1. **Unlock glow on selection**: selecting any unit already draws its prerequisite spine (gold, upstream). Add the mirror: the **transitive dependents** (what mastering this unlocks) glow in a second color (teal) downstream. One selection now answers "what do I need" AND "what do I get". Reuses `prereqPath` machinery inverted; new `unlockSet` in `renderVals`; legend hint line.
2. **Conceptual Compression metric** (renamed from Knowledge Compression Ratio — it's the product's identity): `conceptualCompression(scope)` = basis size vs units reachable from the basis via dependency closure → rendered as `7 → 183 · 26.1×`. Shown: Learn routes-panel header (domain), Zoltraak modal header (scope), Analytics tile. Dependency domains only (hidden when `!hasDep`).
3. **Progressive revelation of the handoff modal**: default view = numbered Zoltraak list + Conceptual Compression; per item **two separate expanders mirroring the philosophy's layers** — `[Graph evidence]` (edges, counts, bridges, pattern links — what the graph provides) and `[Conceptual reasoning]` (the `why` first-principles line, the depends/unlocks reconstruction argument, and what the receiving AI is instructed to argue — what reasoning provides); apparent-Zoltraak rows show their flag inline; `[Full prompt]` toggle reveals the flat text; **Copy always copies the complete prompt** regardless of what's revealed.

### D1 — Watching the basis emerge

4. **Rediscovery Mode**: button in the Zoltraak modal + Learn panel ("RUN THE REDISCOVERY TEST"). The graph rewinds: everything except the proposed basis fades to near-black; then staged waves (timed sequence, ~900ms/wave, click-to-advance under reduced motion) light up the dependency closure — wave 1: direct dependents, wave 2: next ring… each wave counts up the compression figure. Ends on the full graph + "N concepts rediscovered from a basis of K". Reuses routeSet-style dimming + staged reveal sets; state `redisc: {waves, i}`.
5. **Discovery animation** (opening a Zoltraak brief) — **gated so it never becomes friction**: plays only the first time ever for a scope OR when the derived basis changed since last shown (persist a basis hash per scope in the save blob); otherwise jump straight to the modal. When it plays: 3-beat timed sequence (candidates ring-highlight → non-basis fades → basis glows), ~2.5s, skippable by click, skipped under reduced motion. (Rediscovery Mode is different — an intentional learning activity, always available.)
6. **Mastery rings — the graph as learning history**: every unit node carries a progress ring: ○ hollow = seen (discovered), ◔ partial arc = explained (learning/strong — some retrieval passed), ● full ring + glow = mastered (retrieval passed repeatedly). Implemented as a conic-gradient ring layer per node (the template's ring slot gains a sibling); replaces hue as the *sole* mastery signal and resolves the long-standing fill-progression critique. Legend updated.
7. **Decomposition-margin bar** in the modal: local, honest confidence proxy — the score gap between the weakest selected Zoltraak and the strongest excluded candidate, rendered as a thin bar + one generated sentence ("margin is wide/narrow; {B} is the nearest contender"). Clearly labeled as heuristic margin — the *Decomposition Confidence* proper remains the receiving AI's job per the manifesto.

### D2 — Compression made visible

8. **Compression animation**: from a Zoltraak's expanded row (or apparent-Zoltraak flag), "collapse" its specialized spells: spell nodes transition (CSS left/top, 600ms) onto the Zoltraak, shrink+fade with a "specialized spell" label, then spring back. Node divs are absolutely positioned — animate via a transient `collapseTo` coordinate override with transition, then clear.
9. **Learning journey strip** (Learn panel header): knowledge-entropy bar — unexplored+weak mass vs mastered, rendered as a compressing bar over time (uses existing history log). Small, quiet, always-on.

### Backlog (v4, explicitly not now)
Personalized transfer highlighting: mine the learning history for recurring struggle patterns (e.g. representation changes) and, when a new topic matches the pattern, quietly highlight the learner's own past chain — prediction from personal history, not prerequisites.

## Phase 3 files
- `knowledge-os/KnowledgeOS.dc.html` — all of the above (state machines `redisc`/`discovery`/`collapseTo`, `unlockSet`, `conceptualCompression()`, modal restructure).
- `knowledge-os/README.md` — Rediscovery Mode, Conceptual Compression, alive-graph interactions.
- Design project sync after each stage.

## Verification

**Part A (engine):**
1. LLM → Architecture → ZOLTRAAK: manifesto spot-checks — "hypothesis to be stress-tested", "Minimum Description Length", "irreducible basis", "basis of the conceptual vector space", "explanatory, not eliminatory", "identify the inconsistency", "What assumption am I making that could be false?", "actively attempt to falsify", "explanatory regret", "Decomposition Confidence", "Rediscovery Test", "Adversarial Defense", the compression-audit questions, "Never merge concepts merely to obtain a smaller basis", "Spend your reasoning budget proportionally to the scope", "Stop searching when an additional refinement produces less explanatory benefit than additional complexity", "reconstruct the discipline after forgetting every specialized technique", no "six months from now without notes", no numeric weights anywhere in the text. Attention proposed with graph-evidence lines; FlashAttention annotated "frequently mistaken for a Zoltraak — a specialized spell of Attention"; WHY THESE AND NOT THE OTHERS present.
2. German → Bewegung → ZOLTRAAK: gehen/fahren proposed via recurrence/transfer/derived-form generativity (no dep edges).
3. Whole-domain brief: ≤14 proposed, hub-spanning teaching order. Clipboard toasts; other four flavors unchanged; `node validate.js` green; `docs/PHASE2-curriculum-engine.md` exists and matches this spec.

**Part B (experience), per stage in the browser (headless-Edge screenshots where visuals matter):**
4. D0: selecting Attention shows gold upstream spine AND teal downstream unlock-glow simultaneously; Conceptual Compression figure appears in Learn header/modal/Analytics (LLM) and is absent in German; Zoltraak modal opens in summary view, expanders reveal per-item reasoning, Copy still copies the full prompt.
5. D1: Rediscovery Mode fades to basis then unlocks in waves ending with the rediscovered count; reduced-motion → click-to-advance stills. Discovery beat plays on FIRST open only, then never again until the basis hash changes (verify by opening twice). Mastery rings: a discovered node shows hollow ring, a learning node partial arc, a mastered node full ring+glow; modal expanders show Graph evidence and Conceptual reasoning as separate sections. Margin bar renders with the nearest-contender sentence.
6. D2: collapse animation runs and restores cleanly (no stuck node positions after ESC mid-animation); journey strip reflects history.
7. Regression after each stage: routes, review session, practice loop, card, deep links, both domains, mobile viewport. `node validate.js` green. ui-design-critic pass on D1+D2 visuals; design-project re-sync per stage.

---

# Manifesto v2 revisions (2026-08-04) — RE-FROZEN

Five amendments to the ZOLTRAAK_MANIFESTO (Curriculum Designer only; teaching flavors are pure artifact consumers and unaffected). Section order preserved: objective → optimization criterion → research protocol → rubric → evidence → search → required outputs.

1. **Zoltraak disambiguation** — explicit taxonomy: *conceptual primitive* (comparison, invariance, locality) vs *compression primitive* (graph traversal unifying BFS/DFS/flood fill) vs *frequently used technique* (sorting recurs everywhere; sorting is not primitive — comparison is closer). Recurrence alone never qualifies; "recurring" ≠ "primitive".
2. **Comparative rubric** — apply comparatively, not absolutely: rank candidate A against candidate B per criterion; a Zoltraak earns its place by beating alternatives, not by passing checkboxes.
3. **Graph surgery license** — beyond edge tweaks: merge nodes, split nodes, introduce hidden abstractions, remove unnecessary abstractions, invert dependencies, replace entire subgraphs — whenever it yields a lower-MDL explanation. All operations reported in graph corrections. (Graph → Hypothesis → Better Graph.)
4. **Rediscovery Test v2** — forced failure analysis: "Forget every specialized spell. Starting only from these Zoltraaks, reconstruct the curriculum. Note exactly where reconstruction fails" — each failure marks a missing basis element or hidden abstraction.
5. **THE SEARCH replaces ADVERSARIAL REVIEW** — natural-prose search with termination ("continue searching for substantially different decompositions until no alternative provides greater explanatory power relative to its additional complexity"); deliberately NOT repeat/until pseudocode (over-algorithmic loops make the model narrate instead of search). Plus **search/justification separation**: internally search broadly, then forget the search — present only the winner and a concise account of why the strongest alternatives lost.

Backlog (next evolution, not implemented): beam search over candidate bases — generate N fundamentally different decompositions up front, compress and attack each, compare MDL, choose the winner, explain the losers.
