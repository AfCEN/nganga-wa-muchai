import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useFamilyStore } from '../data/store';

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Build hierarchical tree from people + connections ───
function buildFamilyTree(people, connections) {
  if (!people.length) return { roots: [], disconnected: [] };

  const personMap = new Map(people.map((p) => [p.id, { ...p }]));
  const childrenOf = new Map();
  const parentOf = new Map();
  const spouseOf = new Map();
  const siblingOf = new Map();

  connections.forEach((c) => {
    const hasSource = personMap.has(c.source);
    const hasTarget = personMap.has(c.target);
    if (!hasSource || !hasTarget) return;

    if (c.type === 'parent-child') {
      if (!childrenOf.has(c.source)) childrenOf.set(c.source, []);
      childrenOf.get(c.source).push(c.target);
      if (!parentOf.has(c.target)) parentOf.set(c.target, []);
      parentOf.get(c.target).push(c.source);
    } else if (c.type === 'spouse') {
      spouseOf.set(c.source, c.target);
      spouseOf.set(c.target, c.source);
    } else if (c.type === 'sibling') {
      if (!siblingOf.has(c.source)) siblingOf.set(c.source, []);
      siblingOf.get(c.source).push(c.target);
      if (!siblingOf.has(c.target)) siblingOf.set(c.target, []);
      siblingOf.get(c.target).push(c.source);
    }
  });

  const visited = new Set();

  function buildNode(personId) {
    if (!personId || visited.has(personId)) return null;
    visited.add(personId);

    const person = personMap.get(personId);
    if (!person) return null;

    // Spouse
    let spouse = null;
    const spouseId = spouseOf.get(personId);
    if (spouseId && !visited.has(spouseId)) {
      visited.add(spouseId);
      spouse = personMap.get(spouseId) || null;
    }

    // Collect children from both partners
    const childIds = new Set();
    (childrenOf.get(personId) || []).forEach((id) => childIds.add(id));
    if (spouseId) {
      (childrenOf.get(spouseId) || []).forEach((id) => childIds.add(id));
    }

    // Build child nodes recursively
    const children = [...childIds]
      .map((cid) => buildNode(cid))
      .filter(Boolean);

    return { person, spouse, children };
  }

  // Find roots: people with no parents
  const allChildIds = new Set();
  childrenOf.forEach((kids) => kids.forEach((k) => allChildIds.add(k)));
  const rootCandidates = people
    .filter((p) => !allChildIds.has(p.id))
    .sort((a, b) => (a.generation || 0) - (b.generation || 0));

  const roots = [];
  for (const candidate of rootCandidates) {
    if (!visited.has(candidate.id)) {
      const node = buildNode(candidate.id);
      if (node) roots.push(node);
    }
  }

  // Disconnected people
  const disconnected = people
    .filter((p) => !visited.has(p.id))
    .map((p) => ({ person: p, spouse: null, children: [] }));

  return { roots, disconnected };
}

// ─── Person Card ───
function PersonCard({ person, onClick }) {
  if (!person) return null;
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(person.id); }}
      className="flex flex-col items-center cursor-pointer group"
    >
      {/* Avatar */}
      {person.photo ? (
        <img
          src={person.photo}
          alt={person.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-[#e2c275]/30 group-hover:border-[#e2c275] transition-colors shadow-md mb-1.5"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e2c275] to-[#c4a35a] flex items-center justify-center border-2 border-[#e2c275]/30 group-hover:border-[#e2c275] transition-colors shadow-md mb-1.5">
          <span className="text-[#1a1a2e] text-xs font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            {getInitials(person.name)}
          </span>
        </div>
      )}
      {/* Card */}
      <div className="bg-[#1e1e34] border border-[#e2c275]/10 rounded-lg px-3 py-2 text-center w-[130px] group-hover:border-[#e2c275]/40 group-hover:shadow-lg group-hover:shadow-[#e2c275]/5 transition-all">
        <p className="text-xs text-white font-medium truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
          {person.name}
        </p>
        {person.role && (
          <p className="text-[9px] text-[#e2c275]/50 mt-0.5 truncate">{person.role}</p>
        )}
        {(person.birthYear || person.deathYear) && (
          <p className="text-[9px] text-gray-500 mt-0.5">
            {person.birthYear || '?'} – {person.deathYear || 'present'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Couple (person + spouse side by side) ───
function Couple({ person, spouse, onClick }) {
  return (
    <div className="flex items-start relative">
      <PersonCard person={person} onClick={onClick} />
      {spouse && (
        <>
          {/* Spouse connector line */}
          <div className="flex items-center self-stretch pt-6">
            <div className="w-8 border-t-2 border-[#e07a7a]/70 border-dashed" />
          </div>
          <PersonCard person={spouse} onClick={onClick} />
        </>
      )}
    </div>
  );
}

// ─── SVG vertical + horizontal connectors from couple down to children ───
function ChildConnector({ childCount }) {
  if (childCount === 0) return null;
  const h = 30;
  return (
    <div className="flex flex-col items-center">
      {/* Vertical line down from couple */}
      <div className="w-[2px] bg-[#e2c275]/60" style={{ height: h }} />
    </div>
  );
}

function HorizontalBar({ childCount }) {
  if (childCount <= 1) return null;
  return (
    <div className="relative flex justify-center w-full" style={{ height: 2 }}>
      {/* Bar spans from first child center to last child center */}
      <div
        className="absolute top-0 bg-[#e2c275]/50"
        style={{
          height: 2,
          left: `calc(50% / ${childCount})`,
          right: `calc(50% / ${childCount})`,
        }}
      />
      {/* Simpler: full-width bar with padding */}
      <div className="w-full bg-[#e2c275]/60" style={{ height: 2, marginLeft: '10%', marginRight: '10%' }} />
    </div>
  );
}

// ─── Tree Node (recursive) ───
function TreeNode({ node, onClick }) {
  const barRef = useRef(null);
  const childrenRef = useRef(null);

  useEffect(() => {
    // Measure first and last child to position horizontal bar
    if (!barRef.current || !childrenRef.current) return;
    const container = childrenRef.current;
    const children = container.querySelectorAll(':scope > [data-child]');
    if (children.length < 2) return;
    const first = children[0];
    const last = children[children.length - 1];
    const containerRect = container.getBoundingClientRect();
    const firstCenter = first.getBoundingClientRect().left + first.getBoundingClientRect().width / 2 - containerRect.left;
    const lastCenter = last.getBoundingClientRect().left + last.getBoundingClientRect().width / 2 - containerRect.left;
    barRef.current.style.left = `${firstCenter}px`;
    barRef.current.style.width = `${lastCenter - firstCenter}px`;
  });

  if (!node) return null;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Couple */}
      <Couple person={node.person} spouse={node.spouse} onClick={onClick} />

      {hasChildren && (
        <>
          {/* Vertical connector down from couple */}
          <div className="w-[2px] bg-[#e2c275]/60" style={{ height: 24 }} />

          {/* Children row */}
          <div ref={childrenRef} className="relative flex items-start gap-14">
            {/* Horizontal bar — positioned by useEffect */}
            {node.children.length > 1 && (
              <div
                ref={barRef}
                className="absolute bg-[#e2c275]/60"
                style={{ height: 2, top: 0 }}
              />
            )}

            {node.children.map((child) => (
              <div key={child.person.id} data-child className="flex flex-col items-center">
                {/* Vertical drop line */}
                <div className="w-[2px] bg-[#e2c275]/60" style={{ height: 24 }} />
                <TreeNode node={child} onClick={onClick} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───
export default function FamilyGraph({ onSelectPerson }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const { people, connections } = useFamilyStore();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const { roots, disconnected } = useMemo(
    () => buildFamilyTree(people, connections),
    [people, connections]
  );

  // Auto-fit on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!contentRef.current || !containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const contentW = contentRef.current.scrollWidth;
      const contentH = contentRef.current.scrollHeight;
      if (contentW > 0 && contentH > 0) {
        const fitZoom = Math.min(
          (containerW - 40) / contentW,
          (containerH - 40) / contentH,
          1
        );
        setZoom(Math.max(0.3, fitZoom));
        setPan({ x: 0, y: 0 });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [people, connections]);

  // Pan
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.person-card')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -0.06 : 0.06;
        return Math.max(0.2, Math.min(2, z + delta));
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, z - 0.15));
  const handleFit = () => {
    setPan({ x: 0, y: 0 });
    if (!contentRef.current || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const tw = contentRef.current.scrollWidth;
    const th = contentRef.current.scrollHeight;
    setZoom(Math.max(0.3, Math.min((cw - 40) / tw, (ch - 40) / th, 1)));
  };

  if (roots.length === 0 && disconnected.length === 0) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-[#12121f] rounded-2xl overflow-hidden border border-[#e2c275]/10 flex items-center justify-center">
        <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>No family members yet. Add someone to get started.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-[#12121f] rounded-2xl overflow-hidden border border-[#e2c275]/10 select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
    >
      {/* Background dots */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #e2c275 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Tree content — pannable + zoomable */}
      <div
        className="absolute inset-0 flex justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'top center',
        }}
      >
        <div ref={contentRef} className="inline-flex flex-col items-center pt-10 pb-20 px-10">
          {/* Main trees */}
          <div className="flex items-start gap-16">
            {roots.map((root) => (
              <TreeNode key={root.person.id} node={root} onClick={onSelectPerson} />
            ))}
          </div>

          {/* Disconnected people */}
          {disconnected.length > 0 && (
            <div className="mt-12 pt-6 border-t border-white/5 w-full">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Not yet connected to the tree
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                {disconnected.map((node) => (
                  <PersonCard key={node.person.id} person={node.person} onClick={onSelectPerson} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        {[
          { icon: ZoomIn, handler: handleZoomIn },
          { icon: ZoomOut, handler: handleZoomOut },
          { icon: Maximize2, handler: handleFit },
        ].map(({ icon: Icon, handler }, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); handler(); }}
            className="w-10 h-10 bg-[#1a1a2e]/90 border border-[#e2c275]/20 rounded-lg flex items-center justify-center text-[#e2c275]/70 hover:text-[#e2c275] hover:border-[#e2c275]/40 transition-all"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-[#1a1a2e]/90 backdrop-blur-sm border border-[#e2c275]/15 rounded-xl p-3 space-y-1.5 z-10">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          Connections
        </p>
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#e2c275]/60" />
          <span className="text-[10px] text-gray-400">Parent → Child</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 border-t-2 border-dashed border-[#e07a7a]/70" />
          <span className="text-[10px] text-gray-400">Spouse</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 border-t border-dotted border-[#7ab8e0]/70" />
          <span className="text-[10px] text-gray-400">Sibling</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#9b7ed8]/60" />
          <span className="text-[10px] text-gray-400">Grandparent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#6b8f71]/60" />
          <span className="text-[10px] text-gray-400">Uncle/Aunt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 border-t border-dashed border-[#c4956a]/70" />
          <span className="text-[10px] text-gray-400">Cousin</span>
        </div>
      </div>
    </div>
  );
}
