// src/13_timeline.js — SRT-driven draggable timeline with resize handles
(function () {
  'use strict';

  // ── SRT parser ───────────────────────────────────────────
  function parseSrt(text) {
    const out = [];
    const blocks = (text || '').trim().split(/\r?\n[ \t]*\r?\n/);
    for (const block of blocks) {
      const lines = block.trim().split(/\r?\n/);
      let arrowIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) { arrowIdx = i; break; }
      }
      if (arrowIdx === -1) continue;
      const [startStr, endStr] = lines[arrowIdx].split('-->').map(s => s.trim());
      const start = tcToSec(startStr);
      const end   = tcToSec(endStr);
      if (!isFinite(start)) continue;
      const lyric = lines.slice(arrowIdx + 1).join(' ').trim();
      if (!lyric) continue;
      out.push({ start, end, dur: Math.max(end - start, 0.5), text: lyric });
    }
    return out;
  }

  function tcToSec(tc) {
    const m = String(tc).match(/^(\d+):(\d+):(\d+)[,.](\d+)$/);
    if (!m) return NaN;
    return +m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/Math.pow(10, m[4].length);
  }

  function secToTc(s) {
    if (!isFinite(s) || s < 0) s = 0;
    const h  = Math.floor(s / 3600);
    const m  = Math.floor((s % 3600) / 60);
    const ss = Math.floor(s % 60);
    const ms = Math.round((s % 1) * 1000);
    return `${p2(h)}:${p2(m)}:${p2(ss)},${String(ms).padStart(3,'0')}`;
  }

  function p2(n) { return String(n).padStart(2, '0'); }

  // ── Write back to SRT textarea ───────────────────────────
  function updateSrt(blocks) {
    const ta = document.getElementById('srtLyrics');
    if (!ta) return;
    ta.value = blocks.map((b, i) =>
      `${i + 1}\n${secToTc(b.start)} --> ${secToTc(b.end)}\n${b.text}`
    ).join('\n\n');
    syncToEngine(blocks);
  }

  function syncToEngine(blocks) {
    const lyricsEl = document.getElementById('lyrics');
    if (!lyricsEl) return;
    lyricsEl.value = blocks.map(b => {
      const m = Math.floor(b.start / 60).toString().padStart(2, '0');
      const s = (b.start % 60).toFixed(2).padStart(5, '0');
      return `[${m}:${s}]${b.text}`;
    }).join('\n');
    lyricsEl.dispatchEvent(new Event('input'));
  }

  // ── Constants ────────────────────────────────────────────
  const COLORS = [
    'linear-gradient(135deg,#7c3aed,#06b6d4)',
    'linear-gradient(135deg,#e11d48,#f97316)',
    'linear-gradient(135deg,#059669,#84cc16)',
  ];
  const PX_PER_SEC = 40;
  const TRACK_H    = 30;
  const TRACK_N    = 3;
  const RULER_H    = 16;
  const HANDLE_W   = 10;

  let currentBlocks = [];

  // ── Render ───────────────────────────────────────────────
  function render(blocks) {
    currentBlocks = blocks;

    const track = document.getElementById('amuviTimelineTrack');
    const outer = document.getElementById('amuviDragTimeline');
    if (!track || !outer) return;

    const totalSec = blocks.length > 0 ? Math.max(...blocks.map(b => b.end)) + 10 : 60;
    const totalW   = Math.max(outer.clientWidth - 4, totalSec * PX_PER_SEC + 120);
    track.style.width = totalW + 'px';

    // clear old content (keep playhead)
    Array.from(track.querySelectorAll('.amuvi-tl-block, .amuvi-ruler')).forEach(el => el.remove());

    // ── ruler ──
    const ruler = document.createElement('div');
    ruler.className = 'amuvi-ruler';
    ruler.style.cssText = `position:absolute;top:0;left:0;width:${totalW}px;height:${RULER_H}px;pointer-events:none;`;
    const tickEvery = totalSec > 300 ? 30 : totalSec > 120 ? 10 : 5;
    for (let t = 0; t <= totalSec; t += tickEvery) {
      const lbl = document.createElement('span');
      lbl.style.cssText = `position:absolute;left:${t*PX_PER_SEC + 2}px;top:0;font-size:9px;color:#94a3b8;white-space:nowrap;`;
      lbl.textContent = `${Math.floor(t/60)}:${p2(t%60)}`;
      ruler.appendChild(lbl);
      const tick = document.createElement('div');
      tick.style.cssText = `position:absolute;left:${t*PX_PER_SEC}px;top:${RULER_H - 4}px;width:1px;height:${RULER_H + TRACK_H * TRACK_N}px;background:rgba(255,255,255,.1);`;
      ruler.appendChild(tick);
    }
    track.appendChild(ruler);

    // ── blocks ──
    blocks.forEach((b, i) => {
      const col    = i % TRACK_N;
      const top    = RULER_H + col * TRACK_H + 2;
      const left   = Math.round(b.start * PX_PER_SEC);
      const width  = Math.max(Math.round(b.dur * PX_PER_SEC) - 2, 30);
      const height = TRACK_H - 4;

      const el = document.createElement('div');
      el.className = 'amuvi-tl-block';
      el.style.cssText = [
        'position:absolute',
        `left:${left}px`,
        `top:${top}px`,
        `width:${width}px`,
        `height:${height}px`,
        `background:${COLORS[col]}`,
        'color:#fff',
        'border-radius:4px',
        `font-size:10px`,
        `line-height:${height}px`,
        `padding:0 ${HANDLE_W + 4}px`,
        'box-sizing:border-box',
        'overflow:hidden',
        'white-space:nowrap',
        'cursor:grab',
        'box-shadow:0 2px 6px rgba(0,0,0,.4)',
        'user-select:none',
        'touch-action:none',
        'z-index:1',
      ].join(';');
      el.title = `${b.text}\n${secToTc(b.start)} → ${secToTc(b.end)}`;
      el.textContent = b.text;

      // ── resize handles ──
      const HANDLE_STYLE = (side) =>
        `position:absolute;${side}:0;top:0;width:${HANDLE_W}px;height:100%;` +
        `cursor:ew-resize;z-index:5;display:flex;align-items:center;justify-content:center;` +
        `background:rgba(0,0,0,.25);` +
        (side === 'left' ? 'border-radius:4px 0 0 4px;' : 'border-radius:0 4px 4px 0;');

      const lh = document.createElement('div');
      lh.style.cssText = HANDLE_STYLE('left');
      lh.innerHTML = `<span style="font-size:8px;color:rgba(255,255,255,.7);pointer-events:none;">◁</span>`;
      el.appendChild(lh);

      const rh = document.createElement('div');
      rh.style.cssText = HANDLE_STYLE('right');
      rh.innerHTML = `<span style="font-size:8px;color:rgba(255,255,255,.7);pointer-events:none;">▷</span>`;
      el.appendChild(rh);

      // ── body drag (move) ──
      let dragActive = false, dragMoved = false, dragX0 = 0, dragL0 = 0;

      el.addEventListener('pointerdown', e => {
        if (e.target === lh || e.target.parentElement === lh) return;
        if (e.target === rh || e.target.parentElement === rh) return;
        e.preventDefault();
        dragActive = true; dragMoved = false;
        dragX0 = e.clientX; dragL0 = parseFloat(el.style.left);
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
        el.style.zIndex = '99';
        el.style.opacity = '0.85';
      });
      el.addEventListener('pointermove', e => {
        if (!dragActive) return;
        const dx = e.clientX - dragX0;
        if (Math.abs(dx) > 2) dragMoved = true;
        el.style.left = Math.max(0, dragL0 + dx) + 'px';
      });
      el.addEventListener('pointerup', e => {
        if (!dragActive) return;
        dragActive = false;
        el.releasePointerCapture(e.pointerId);
        el.style.cursor = 'grab';
        el.style.zIndex = '1';
        el.style.opacity = '1';
        if (dragMoved) {
          const ns = parseFloat(el.style.left) / PX_PER_SEC;
          const diff = ns - b.start;
          b.start = ns; b.end = b.end + diff; b.dur = b.end - b.start;
          updateSrt(currentBlocks);
        } else {
          if (window._seek) window._seek(b.start);
        }
      });

      // ── left handle (move start) ──
      let lActive = false, lX0 = 0, lL0 = 0, lW0 = 0;
      lh.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        lActive = true;
        lX0 = e.clientX; lL0 = parseFloat(el.style.left); lW0 = parseFloat(el.style.width);
        lh.setPointerCapture(e.pointerId);
        el.style.zIndex = '99';
      });
      lh.addEventListener('pointermove', e => {
        if (!lActive) return;
        const dx = e.clientX - lX0;
        const newL = Math.max(0, lL0 + dx);
        const newW = Math.max(22, lW0 - (newL - lL0));
        el.style.left = newL + 'px';
        el.style.width = newW + 'px';
      });
      lh.addEventListener('pointerup', e => {
        if (!lActive) return;
        lActive = false;
        lh.releasePointerCapture(e.pointerId);
        el.style.zIndex = '1';
        b.start = parseFloat(el.style.left) / PX_PER_SEC;
        b.dur   = b.end - b.start;
        updateSrt(currentBlocks);
      });

      // ── right handle (move end) ──
      let rActive = false, rX0 = 0, rW0 = 0;
      rh.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        rActive = true;
        rX0 = e.clientX; rW0 = parseFloat(el.style.width);
        rh.setPointerCapture(e.pointerId);
        el.style.zIndex = '99';
      });
      rh.addEventListener('pointermove', e => {
        if (!rActive) return;
        el.style.width = Math.max(22, rW0 + (e.clientX - rX0)) + 'px';
      });
      rh.addEventListener('pointerup', e => {
        if (!rActive) return;
        rActive = false;
        rh.releasePointerCapture(e.pointerId);
        el.style.zIndex = '1';
        b.end = b.start + parseFloat(el.style.width) / PX_PER_SEC;
        b.dur = b.end - b.start;
        updateSrt(currentBlocks);
      });

      track.appendChild(el);
    });
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const srtEl    = document.getElementById('srtLyrics');
    const lyricsEl = document.getElementById('lyrics');
    if (!srtEl || !lyricsEl) { setTimeout(init, 200); return; }

    const onSrtChange = () => {
      const blocks = parseSrt(srtEl.value);
      render(blocks);
      syncToEngine(blocks);
    };
    srtEl.addEventListener('input', onSrtChange);

    // initial render
    if (srtEl.value.trim()) onSrtChange();

    // playhead + active block highlight
    const outer = document.getElementById('amuviDragTimeline');
    let lastActiveIdx = -1;
    (function raf() {
      const S = window._S;
      const ph = document.getElementById('amuviTimelinePlayhead');
      if (ph && outer && S) {
        const t = S.t || 0;
        const x = t * PX_PER_SEC;
        ph.style.left = x + 'px';

        // auto-scroll to follow playhead during playback
        if (S.playing) {
          const vl = outer.scrollLeft, vr = vl + outer.clientWidth;
          if (x > vr - 60 || x < vl) outer.scrollLeft = x - 80;
        }

        // highlight the currently playing block
        const activeIdx = currentBlocks.findIndex(b => t >= b.start && t < b.end);
        if (activeIdx !== lastActiveIdx) {
          lastActiveIdx = activeIdx;
          const track = document.getElementById('amuviTimelineTrack');
          if (track) {
            track.querySelectorAll('.amuvi-tl-block').forEach((el, i) => {
              if (i === activeIdx) {
                el.style.outline = '2px solid #fff';
                el.style.boxShadow = '0 0 12px 3px rgba(255,255,255,0.6)';
              } else {
                el.style.outline = '';
                el.style.boxShadow = '0 2px 6px rgba(0,0,0,.4)';
              }
            });
          }
        }
      }
      requestAnimationFrame(raf);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 400));
  } else {
    setTimeout(init, 400);
  }
})();
