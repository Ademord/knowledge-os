#!/usr/bin/env node
// KnowledgeOS graph pack linter.
// Usage: node validate.js [graph.json ...]   (no args = every graph in graphs.json)
// Exit code 1 on any ERROR; WARNs are advisory.
const fs = require('fs');
const path = require('path');

const BASE_KINDS = ['word', 'concept', 'grammar', 'situation', 'insight', 'culture', 'question'];
const BASE_RELS = ['similar_to', 'associated_with', 'part_of', 'opposite_of', 'confused_with', 'derived_from',
  'expresses', 'governs', 'used_in', 'explains', 'cultural_context', 'about', 'register_of', 'collocates_with', 'more_common_than'];
const UNIT_ARCHETYPES = { word: 'unit', concept: 'hub', grammar: 'context', situation: 'context', insight: 'note', culture: 'note', question: 'note' };

let failed = false;
const err = (f, msg) => { failed = true; console.log(`ERROR  ${f}: ${msg}`); };
const warn = (f, msg) => console.log(`WARN   ${f}: ${msg}`);

function lint(file) {
  let j;
  try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return err(file, 'invalid JSON — ' + e.message); }
  const kinds = { ...UNIT_ARCHETYPES };
  const declaredKinds = new Set(BASE_KINDS);
  (j.kinds || []).forEach(k => { declaredKinds.add(k.k); kinds[k.k] = k.archetype || 'unit'; });
  const declaredRels = new Set(BASE_RELS);
  (j.rels || []).forEach(r => declaredRels.add(r.r));
  (j.layers || []).forEach(l => (l.rels || []).forEach(r => { if (!declaredRels.has(r)) warn(file, `layer "${l.id}" references undeclared rel "${r}"`); }));

  const ids = new Set();
  for (const e of j.entities) {
    if (ids.has(e.i)) err(file, `duplicate entity id "${e.i}"`);
    ids.add(e.i);
    const kind = e.kind || 'word';
    if (!declaredKinds.has(kind)) err(file, `entity "${e.i}" has undeclared kind "${kind}"`);
    if (e.ex && e.bl && !e.ex.includes(e.bl)) err(file, `entity "${e.i}": bl "${e.bl}" is not a substring of ex`);
    if (kinds[kind] === 'unit') {
      if (!e.en) warn(file, `unit "${e.i}" has no en (definition) — recall/inspector will be empty`);
      if (!e.sy || !e.sy.length) warn(file, `unit "${e.i}" has no sy — recall practice step will be skipped`);
    }
    if (kinds[kind] === 'note' && !e.body && !e.note) warn(file, `note "${e.i}" has no body`);
  }

  const adjOut = {};
  let edgeErrs = 0;
  for (const e of j.edges) {
    if (!ids.has(e.s) || !ids.has(e.t)) { err(file, `edge ${e.s} -[${e.r}]-> ${e.t} references a missing entity`); edgeErrs++; continue; }
    if (!declaredRels.has(e.r)) warn(file, `edge ${e.s} -> ${e.t} uses undeclared rel "${e.r}" (renders with fallback style)`);
    if (e.s === e.t) err(file, `self-loop on "${e.s}" (${e.r})`);
    (adjOut[e.s] = adjOut[e.s] || []).push(e);
  }

  // units should have a layout home (expresses) unless explicitly positioned
  for (const e of j.entities) {
    const kind = e.kind || 'word';
    if (kinds[kind] !== 'unit') continue;
    const hasHome = (adjOut[e.i] || []).some(x => x.r === 'expresses') || (e.x != null && e.y != null) ||
      (adjOut[e.i] || []).some(x => x.r === 'derived_from');
    if (!hasHome) warn(file, `unit "${e.i}" has no expresses edge, derived_from base, or explicit x/y — layout will guess`);
  }

  // authored paths + hub ordering
  const kindOfId = {}; j.entities.forEach(e => { kindOfId[e.i] = e.kind || 'word'; });
  const seenPathIds = new Set();
  for (const p of (j.paths || [])) {
    if (!p.id) err(file, 'path without id');
    if (seenPathIds.has(p.id)) err(file, `duplicate path id "${p.id}"`);
    seenPathIds.add(p.id);
    if (!p.start || !ids.has(p.start)) err(file, `path "${p.id}": start "${p.start}" is not an existing entity`);
    else if (kinds[kindOfId[p.start]] !== 'hub') warn(file, `path "${p.id}": start "${p.start}" is not a hub kind`);
    if (!p.steps || !p.steps.length) { warn(file, `path "${p.id}" has no steps`); continue; }
    const seenSteps = new Set();
    for (const s of p.steps) {
      if (!ids.has(s)) { err(file, `path "${p.id}": step "${s}" is not an existing entity`); continue; }
      if (seenSteps.has(s)) warn(file, `path "${p.id}": duplicate step "${s}"`);
      seenSteps.add(s);
      const arch = kinds[kindOfId[s]];
      if (arch === 'hub') warn(file, `path "${p.id}": step "${s}" is a hub — hubs are sections, not steps`);
      else if (arch !== 'unit') warn(file, `path "${p.id}": step "${s}" is not a unit archetype`);
    }
  }
  const hubEnts = j.entities.filter(e => kinds[e.kind || 'word'] === 'hub');
  const ordVals = new Set();
  let ordCount = 0;
  for (const h of hubEnts) {
    if (h.ord === undefined) continue;
    ordCount++;
    if (typeof h.ord !== 'number') err(file, `hub "${h.i}": ord must be a number`);
    else if (ordVals.has(h.ord)) warn(file, `duplicate hub ord ${h.ord} ("${h.i}")`);
    ordVals.add(h.ord);
  }
  if (ordCount > 0 && ordCount < hubEnts.length) warn(file, `only ${ordCount}/${hubEnts.length} hubs carry ord — the rest fall back to derived ranking`);

  // cycle detection over the dependency rels — a cyclic curriculum is unlearnable
  const DEP = ['requires', 'builds_on'];
  const color = {}; // 0 unvisited, 1 in-stack, 2 done
  const stack = [];
  const dfs = (n) => {
    color[n] = 1; stack.push(n);
    for (const e of (adjOut[n] || [])) {
      if (!DEP.includes(e.r)) continue;
      if (color[e.t] === 1) { err(file, `dependency cycle: ${[...stack.slice(stack.indexOf(e.t)), e.t].join(' -> ')}`); continue; }
      if (!color[e.t]) dfs(e.t);
    }
    color[n] = 2; stack.pop();
  };
  ids.forEach(n => { if (!color[n]) dfs(n); });

  const rels = new Set(j.edges.map(e => e.r));
  console.log(`OK     ${file}: ${j.entities.length} entities, ${j.edges.length} edges, ${rels.size} rel types${edgeErrs ? ` (${edgeErrs} broken edges)` : ''}`);
}

const dir = __dirname;
let files = process.argv.slice(2);
if (!files.length) {
  const man = JSON.parse(fs.readFileSync(path.join(dir, 'graphs.json'), 'utf8'));
  files = man.graphs.map(g => path.join(dir, g.file));
}
files.forEach(lint);
process.exit(failed ? 1 : 0);
