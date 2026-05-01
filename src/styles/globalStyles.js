/**
 * Injects global CSS into the document once.
 *
 * SCROLL FIX (modal):
 *   - .moverlay now has overflow-y:auto so the overlay itself scrolls.
 *   - .mbox no longer has max-height / overflow-y — it grows naturally
 *     and the overlay scrolls around it.
 *   This prevents content being clipped at the top when a flex
 *   align-items:center parent can't fully contain a tall child.
 *
 * SCROLL FIX (ViewAllPage):
 *   The ViewAllPage component manages body overflow itself (see component).
 */
export const injectStyles = () => {
  if (document.getElementById('stream-styles')) return;
  const el = document.createElement('style');
  el.id = 'stream-styles';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #000; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; -ms-overflow-style: none; }

    /* ── Cards ── */
    .sc { position:relative; flex-shrink:0; cursor:pointer; border-radius:6px; overflow:hidden; outline:none; }
    .sc img { display:block; width:100%; height:100%; object-fit:cover; transition:transform .35s ease; }
    .sc:focus, .sc:focus-visible { box-shadow: 0 0 0 3px #e50914; }
    .sc:hover img, .sc:focus img { transform:scale(1.06); }
    .sc .ov { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.96) 0%, rgba(0,0,0,.25) 55%, transparent 100%); opacity:0; transition:opacity .25s; display:flex; flex-direction:column; justify-content:flex-end; padding:12px; pointer-events:none; }
    .sc:hover .ov, .sc:focus .ov { opacity:1; pointer-events:all; }
    @media (hover:none) { .sc .ov { opacity:1; pointer-events:all; } }
    .sc .ov .ca { display:flex; gap:7px; margin-bottom:7px; }
    .cbtn { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,.75); background:rgba(0,0,0,.45); cursor:pointer; color:#fff; transition:all .15s; flex-shrink:0; }
    .cbtn.pl { background:#fff; border-color:#fff; color:#000; }
    .cbtn:hover, .cbtn:focus { border-color:#fff; background:rgba(255,255,255,.25); outline:none; }
    .cbtn.pl:hover, .cbtn.pl:focus { background:rgba(255,255,255,.82); }
    .cbtn.added { background:#e50914; border-color:#e50914; }

    /* ── Row arrows ── */
    .rarr { position:absolute; top:0; bottom:0; z-index:10; display:flex; align-items:center; padding:0 14px; cursor:pointer; opacity:0; transition:opacity .25s; color:#fff; border:none; background:linear-gradient(to right,rgba(0,0,0,.85),transparent); min-width:72px; justify-content:center; }
    .rarr.r { right:0; background:linear-gradient(to left,rgba(0,0,0,.85),transparent); }
    .rw:hover .rarr, .rw:focus-within .rarr { opacity:1; }
    .rarr svg { filter:drop-shadow(0 0 6px rgba(0,0,0,.8)); }
    /* Always show on no-hover / TV devices */
    @media (hover:none) { .rarr { opacity:.75; } }

    /* ── Buttons ── */
    .hbtn { display:inline-flex; align-items:center; gap:9px; padding:11px 26px; border-radius:5px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:600; cursor:pointer; border:none; transition:all .18s; white-space:nowrap; }
    .hbtn.pl { background:#fff; color:#000; }
    .hbtn.pl:hover,.hbtn.pl:focus { background:rgba(255,255,255,.82); outline:none; }
    .hbtn.nf { background:rgba(109,109,110,.7); color:#fff; }
    .hbtn.nf:hover,.hbtn.nf:focus { background:rgba(109,109,110,.5); outline:none; }

    /* ── Nav ── */
    .ni { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 10px; font-size:14px; font-weight:500; color:rgba(255,255,255,.7); background:none; border:none; cursor:pointer; transition:color .18s; font-family:'DM Sans',sans-serif; position:relative; white-space:nowrap; line-height:1; }
    .ni.act { color:#fff; }
    .ni.act::after { content:''; position:absolute; bottom:-6px; left:10px; right:10px; height:2px; background:#e50914; border-radius:1px; }
    .ni:hover,.ni:focus { color:#fff; outline:none; }
    .ni svg { display:block; }

    /* ── Modal overlay: flex so .mbox is centered; overlay scrolls when tall ── */
    .moverlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.82);
      z-index: 200;
      display: flex;
      overflow-y: auto;
      padding: 20px;
      animation: fi .22s ease;
    }
    @keyframes fi { from{opacity:0} to{opacity:1} }

    /* ── Modal box: margin:auto in flex = centered both axes ── */
    .mbox {
      background: #181818;
      border-radius: 12px;
      max-width: 980px;
      width: 100%;
      margin: auto;
      position: relative;
      animation: su .28s cubic-bezier(.25,.46,.45,.94);
    }
    @keyframes su { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }

    /* ── Episode btn ── */
    .epb { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,.07); border:none; border-radius:5px; padding:11px 14px; width:100%; text-align:left; cursor:pointer; transition:background .18s; color:#fff; font-family:'DM Sans',sans-serif; }
    .epb:hover,.epb:focus { background:rgba(255,255,255,.15); outline:none; }
    .epb.playing { background:rgba(229,9,20,.18); border:1px solid rgba(229,9,20,.4); }

    /* ── Misc ── */
    .badge { display:inline-block; padding:2px 8px; border-radius:3px; font-size:12px; font-weight:600; }
    .b-hd   { background:rgba(255,255,255,.13); color:#ccc; border:1px solid rgba(255,255,255,.18); }
    .b-rt   { background:rgba(229,9,20,.13); color:#ff7070; border:1px solid rgba(229,9,20,.28); }
    .b-match{ color:#46d369; font-weight:700; font-size:14px; }
    @keyframes sh { 0%,100%{opacity:.35} 50%{opacity:.7} }
    .shim { animation:sh 1.4s ease-in-out infinite; background:#1c1c1c; }
    .toast { position:fixed; bottom:32px; left:50%; transform:translateX(-50%); background:#fff; color:#000; padding:10px 22px; border-radius:24px; font-weight:600; font-size:14px; z-index:999; animation:toastin .3s ease; pointer-events:none; white-space:nowrap; }
    @keyframes toastin { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

    /* ── Search input ── */
    .sinput { background:rgba(0,0,0,.8); border:1.5px solid rgba(255,255,255,.7); color:#fff; padding:8px 14px 8px 38px; font-size:14px; font-family:'DM Sans',sans-serif; border-radius:3px; width:210px; outline:none; }
    .sinput::placeholder { color:rgba(255,255,255,.45); }
    .sinput:focus { border-color:#fff; }

    /* ── Select ── */
    .sels { background:#2a2a2a; color:#fff; border:1.5px solid rgba(255,255,255,.18); padding:8px 14px; border-radius:4px; font-size:14px; font-family:'DM Sans',sans-serif; cursor:pointer; outline:none; }

    /* ── Pagination ── */
    .pgbtn { background:rgba(255,255,255,.1); border:2px solid rgba(255,255,255,.25); color:#fff; padding:13px 26px; border-radius:8px; cursor:pointer; font-size:16px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all .18s; min-width:52px; }
    .pgbtn:hover,.pgbtn:focus { background:rgba(255,255,255,.22); border-color:rgba(255,255,255,.5); outline:none; transform:translateY(-1px); }
    .pgbtn.act { background:#e50914; border-color:#e50914; }
    .pgbtn:disabled { opacity:.3; cursor:not-allowed; transform:none; }

    /* ── Hero carousel slides ── */
    .hero-wrap { overflow: hidden; }
    .hero-slide { position:absolute; inset:0; transition:opacity 1s ease; }
    .hero-slide.active { opacity:1; pointer-events:all; }
    .hero-slide.hidden { opacity:0; pointer-events:none; }

    /* ── Hero carousel dots ── */
    .hero-dot { display:block; width:8px; height:8px; min-width:8px; min-height:8px; max-width:22px; max-height:8px; border-radius:50%; background:rgba(255,255,255,.4); border:none; cursor:pointer; transition:all .35s ease; flex-shrink:0; padding:0; margin:0; line-height:0; font-size:0; appearance:none; -webkit-appearance:none; box-sizing:content-box; }
    .hero-dot.on { background:#e50914; width:22px; border-radius:4px; }
    .hero-dot:hover:not(.on) { background:rgba(255,255,255,.7); }

    /* ── Hero carousel prev/next arrows ── */
    .hero-nav { position:absolute; top:50%; transform:translateY(-50%); z-index:8; background:rgba(0,0,0,.5); border:1.5px solid rgba(255,255,255,.25); color:#fff; border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; opacity:0; }
    .hero-wrap:hover .hero-nav, .hero-wrap:focus-within .hero-nav { opacity:1; }
    .hero-nav:hover, .hero-nav:focus-visible { background:rgba(255,255,255,.2); border-color:#fff; outline:none; }
    .hero-nav.prev { left:20px; }
    .hero-nav.next { right:20px; }
    /* Always show on no-hover / TV devices */
    @media (hover:none) { .hero-nav { opacity:.85; } }

    /* ── Smart TV / large screen ── */
    @media (min-width:1920px) {
      .ni { font-size:18px; padding:10px 6px; }
      .hbtn { font-size:20px; padding:14px 34px; }
      .cbtn { width:40px; height:40px; }
      .sinput { width:270px; font-size:16px; }
      .rarr { min-width:60px; }
    }
    @media (max-width:640px) {
      .ni span.nl { display:none; }
      .hbtn { padding:9px 16px; font-size:14px; }
      .hero-nav { display:none; }
    }
  `;
  document.head.appendChild(el);
};
