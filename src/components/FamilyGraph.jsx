import React, { useRef, useState, useEffect, useCallback } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useFamilyStore } from '../data/store';

const CONNECTION_COLORS = {
  'parent-child': '#e2c275',
  spouse: '#e07a7a',
  sibling: '#7ab8e0',
};

function getGenerationColor(generation) {
  if (generation <= 2) return '#e2c275';
  if (generation <= 4) return '#7a5c3a';
  return '#6b8f71';
}

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function FamilyGraph({ onSelectPerson }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const simRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const dragRef = useRef(null);
  const panRef = useRef(null);

  const { people, connections } = useFamilyStore();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Set up dimensions
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Build simulation
  useEffect(() => {
    const nodes = people.map((p) => ({
      id: p.id,
      name: p.name,
      generation: p.generation,
      initials: getInitials(p.name),
      color: getGenerationColor(p.generation),
      role: p.role,
    }));

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const links = connections
      .filter((c) => nodeMap.has(c.source) && nodeMap.has(c.target))
      .map((c) => ({
        source: c.source,
        target: c.target,
        type: c.type,
        color: CONNECTION_COLORS[c.type] || '#555',
      }));

    nodesRef.current = nodes;
    linksRef.current = links;

    // Center transform
    transformRef.current = { x: dimensions.width / 2, y: dimensions.height / 2, k: 1 };

    const sim = forceSimulation(nodes)
      .force('link', forceLink(links).id((d) => d.id).distance(80).strength(0.7))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide(30))
      .on('tick', () => draw());

    simRef.current = sim;

    return () => sim.stop();
  }, [people, connections, dimensions.width, dimensions.height]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const { x: tx, y: ty, k } = transformRef.current;
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const hovered = hoveredNode;

    // Connected nodes for highlighting
    const connectedIds = new Set();
    if (hovered) {
      connectedIds.add(hovered);
      links.forEach((l) => {
        const sid = typeof l.source === 'object' ? l.source.id : l.source;
        const tid = typeof l.target === 'object' ? l.target.id : l.target;
        if (sid === hovered) connectedIds.add(tid);
        if (tid === hovered) connectedIds.add(sid);
      });
    }

    ctx.clearRect(0, 0, width, height);

    // Background dot pattern
    ctx.fillStyle = 'rgba(226, 194, 117, 0.03)';
    for (let gx = 0; gx < width; gx += 40) {
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(k, k);

    // Draw links
    links.forEach((link) => {
      const source = typeof link.source === 'object' ? link.source : null;
      const target = typeof link.target === 'object' ? link.target : null;
      if (!source || !target) return;

      const sid = source.id;
      const tid = target.id;
      const isDimmed = hovered && !connectedIds.has(sid) && !connectedIds.has(tid);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = isDimmed ? 'rgba(80,80,80,0.12)' : `${link.color}77`;
      ctx.lineWidth = (isDimmed ? 0.5 : link.type === 'spouse' ? 2.5 : 1.2) / k;

      if (link.type === 'sibling') {
        ctx.setLineDash([4 / k, 4 / k]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes
    const radius = 20;
    nodes.forEach((node) => {
      const isHov = hovered === node.id;
      const isConn = connectedIds.has(node.id);
      const isDimmed = hovered && !isConn;

      // Glow
      if (isHov) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}22`;
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(node.x - 3, node.y - 3, 2, node.x, node.y, radius);
      grad.addColorStop(0, isDimmed ? '#444' : node.color);
      grad.addColorStop(1, isDimmed ? '#2a2a2a' : `${node.color}aa`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      if (isHov || isConn) {
        ctx.strokeStyle = isHov ? '#fff' : node.color;
        ctx.lineWidth = (isHov ? 3 : 1.5) / k;
        ctx.stroke();
      }

      // Initials
      ctx.fillStyle = isDimmed ? '#777' : '#1a1a2e';
      ctx.font = `bold ${12 / k}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.initials, node.x, node.y);

      // Name label
      if (k > 0.5) {
        ctx.fillStyle = isDimmed ? '#555' : '#ccc';
        ctx.font = `${11 / k}px Inter, sans-serif`;
        ctx.fillText(node.name, node.x, node.y + radius + 14 / k);
      }
    });

    ctx.restore();
  }, [hoveredNode]);

  // Redraw when hoveredNode changes
  useEffect(() => {
    draw();
  }, [hoveredNode, draw]);

  // Hit test: find node under mouse
  const hitTest = useCallback((mx, my) => {
    const { x: tx, y: ty, k } = transformRef.current;
    const worldX = (mx - tx) / k;
    const worldY = (my - ty) / k;
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      if (dx * dx + dy * dy < 22 * 22) return n;
    }
    return null;
  }, []);

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Dragging a node
    if (dragRef.current) {
      const { x: tx, y: ty, k } = transformRef.current;
      dragRef.current.fx = (mx - tx) / k;
      dragRef.current.fy = (my - ty) / k;
      simRef.current?.alpha(0.3).restart();
      return;
    }

    // Panning
    if (panRef.current) {
      const dx = mx - panRef.current.lastX;
      const dy = my - panRef.current.lastY;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      panRef.current.lastX = mx;
      panRef.current.lastY = my;
      draw();
      return;
    }

    const node = hitTest(mx, my);
    setHoveredNode(node ? node.id : null);
    canvas.style.cursor = node ? 'pointer' : 'grab';
  }, [hitTest, draw]);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const node = hitTest(mx, my);
    if (node) {
      dragRef.current = node;
      node.fx = node.x;
      node.fy = node.y;
      simRef.current?.alphaTarget(0.3).restart();
    } else {
      panRef.current = { lastX: mx, lastY: my };
    }
  }, [hitTest]);

  const handleMouseUp = useCallback((e) => {
    if (dragRef.current) {
      const node = dragRef.current;
      // Check if it was a click (not a drag)
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hitNode = hitTest(mx, my);
      if (hitNode && hitNode.id === node.id) {
        onSelectPerson?.(node.id);
      }
      node.fx = null;
      node.fy = null;
      dragRef.current = null;
      simRef.current?.alphaTarget(0);
    }
    panRef.current = null;
  }, [hitTest, onSelectPerson]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const t = transformRef.current;
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newK = Math.max(0.2, Math.min(4, t.k * scaleFactor));

    t.x = mx - (mx - t.x) * (newK / t.k);
    t.y = my - (my - t.y) * (newK / t.k);
    t.k = newK;
    draw();
  }, [draw]);

  // Attach wheel listener with passive: false
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleZoomIn = () => {
    const t = transformRef.current;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const newK = Math.min(4, t.k * 1.4);
    t.x = cx - (cx - t.x) * (newK / t.k);
    t.y = cy - (cy - t.y) * (newK / t.k);
    t.k = newK;
    draw();
  };

  const handleZoomOut = () => {
    const t = transformRef.current;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const newK = Math.max(0.2, t.k / 1.4);
    t.x = cx - (cx - t.x) * (newK / t.k);
    t.y = cy - (cy - t.y) * (newK / t.k);
    t.k = newK;
    draw();
  };

  const handleFit = () => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });
    const padding = 60;
    const graphW = maxX - minX + padding * 2;
    const graphH = maxY - minY + padding * 2;
    const k = Math.min(dimensions.width / graphW, dimensions.height / graphH, 2);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    transformRef.current = {
      x: dimensions.width / 2 - cx * k,
      y: dimensions.height / 2 - cy * k,
      k,
    };
    draw();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-[#12121f] rounded-2xl overflow-hidden border border-[#e2c275]/10">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { panRef.current = null; dragRef.current = null; setHoveredNode(null); }}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        {[
          { icon: ZoomIn, handler: handleZoomIn },
          { icon: ZoomOut, handler: handleZoomOut },
          { icon: Maximize2, handler: handleFit },
        ].map(({ icon: Icon, handler }, i) => (
          <button
            key={i}
            onClick={handler}
            className="w-10 h-10 bg-[#1a1a2e]/90 border border-[#e2c275]/20 rounded-lg flex items-center justify-center text-[#e2c275]/70 hover:text-[#e2c275] hover:border-[#e2c275]/40 transition-all"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-[#1a1a2e]/90 backdrop-blur-sm border border-[#e2c275]/15 rounded-xl p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Generations
        </p>
        {[
          { color: '#e2c275', label: 'Elders' },
          { color: '#7a5c3a', label: 'Middle' },
          { color: '#6b8f71', label: 'Younger' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.label}
            </span>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t border-white/5 space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Connections</p>
          {[
            { color: '#e2c275', label: 'Parent-Child' },
            { color: '#e07a7a', label: 'Spouse' },
            { color: '#7ab8e0', label: 'Sibling' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-5 h-0.5" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
