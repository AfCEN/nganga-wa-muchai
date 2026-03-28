import { useState, useRef, useCallback } from 'react';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function PhotoCrop({ file, onConfirm, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgUrl = URL.createObjectURL(file);

  const handleMouseDown = useCallback((e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      // Map the visible crop area to the image
      const containerSize = 240;
      const scale = zoom * Math.max(img.width, img.height) / containerSize;
      const cx = (containerSize / 2 - offset.x) * scale / zoom;
      const cy = (containerSize / 2 - offset.y) * scale / zoom;
      const cropSize = containerSize * scale / zoom;

      // Draw circular crop
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        cx - cropSize / 2, cy - cropSize / 2, cropSize, cropSize,
        0, 0, size, size
      );

      canvas.toBlob((blob) => {
        const cropped = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
        onConfirm(cropped);
      }, 'image/jpeg', 0.9);
    };
    img.src = imgUrl;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-[#1a1a2e] border border-[#e2c275]/15 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-sm text-white mb-4 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
          Crop Photo
        </h3>

        {/* Crop area */}
        <div
          className="relative w-60 h-60 mx-auto rounded-full overflow-hidden border-2 border-[#e2c275]/30 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imgUrl}
            alt="Crop preview"
            className="absolute pointer-events-none select-none"
            draggable={false}
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              objectFit: 'cover',
              left: `calc(50% + ${offset.x}px)`,
              top: `calc(50% + ${offset.y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-2 text-gray-400 hover:text-[#e2c275] transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-32 accent-[#e2c275]"
          />
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="p-2 text-gray-400 hover:text-[#e2c275] transition-colors"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <p className="text-[10px] text-gray-500 text-center mt-2">Drag to reposition, zoom to resize</p>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#e2c275] text-[#1a1a2e] rounded-lg font-semibold text-sm hover:bg-[#f0d68a] transition-all"
          >
            <Check size={16} /> Crop
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
