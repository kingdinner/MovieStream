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

    /* ─── Design tokens — overridden at TV breakpoint ─── */
    :root {
      --card-w:         155px;
      --card-h:         232px;
      --card-ls-w:      268px;
      --card-ls-h:      151px;
      --header-h:       66px;
      --header-logo-fs: 26px;
      --hero-max-w:     560px;
      --hero-title-max: 80px;
      --hero-ovw-fs:    15px;
      --card-title-fs:  13px;
      --card-meta-fs:   11px;
      --row-gap:        8px;
      --grid-min-w:     155px;
      --grid-ls-min-w:  268px;
      --header-icon-sz: 40px;
      --avatar-sz:      36px;
      --avatar-fs:      19px;
    }
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

    /* ─── Smart TV / large screen (≥1920 px) ─── */
    @media (min-width:1920px) {
      :root {
        --card-w:         220px;
        --card-h:         330px;
        --card-ls-w:      380px;
        --card-ls-h:      214px;
        --header-h:       92px;
        --header-logo-fs: 36px;
        --hero-max-w:     760px;
        --hero-title-max: 104px;
        --hero-ovw-fs:    20px;
        --card-title-fs:  17px;
        --card-meta-fs:   14px;
        --row-gap:        14px;
        --grid-min-w:     212px;
        --grid-ls-min-w:  368px;
        --header-icon-sz: 54px;
        --avatar-sz:      46px;
        --avatar-fs:      24px;
      }
      /* Nav */
      .ni { font-size:20px !important; height:54px !important; padding:0 18px !important; gap:10px !important; }
      .ni.act::after { bottom:-9px !important; left:18px !important; right:18px !important; }
      /* Buttons */
      .hbtn { font-size:22px !important; padding:18px 46px !important; gap:12px !important; border-radius:7px !important; }
      .cbtn { width:50px !important; height:50px !important; border-width:2.5px !important; }
      /* Search */
      .sinput { width:320px !important; font-size:18px !important; padding:10px 16px 10px 46px !important; }
      /* Select + pagination */
      .sels  { font-size:18px !important; padding:12px 18px !important; }
      .pgbtn { font-size:20px !important; padding:18px 36px !important; min-width:64px !important; border-radius:10px !important; }
      /* Toast */
      .toast { font-size:18px !important; padding:14px 32px !important; border-radius:36px !important; bottom:48px !important; }
      /* Modal */
      .mbox     { max-width:1440px !important; border-radius:16px !important; }
      .moverlay { padding:56px !important; }
      /* Row arrows — always visible + bigger */
      .rarr { min-width:100px !important; opacity:1 !important; }
      /* Hero nav arrows */
      .hero-nav       { width:74px !important; height:74px !important; }
      .hero-nav.prev  { left:32px !important; }
      .hero-nav.next  { right:32px !important; }
      /* Hero dots */
      .hero-dot    { width:12px !important; height:12px !important; min-width:12px !important; min-height:12px !important; }
      .hero-dot.on { width:32px !important; max-width:32px !important; border-radius:6px !important; }
      /* Hero text classes */
      .hero-title    { font-size:clamp(64px,6.5vw,104px) !important; margin-bottom:20px !important; }
      .hero-overview { font-size:20px !important; line-height:1.7 !important; margin-bottom:36px !important; -webkit-line-clamp:4 !important; }
      /* Row */
      .row-title    { font-size:28px !important; padding-bottom:18px !important; }
      /* Browse pills */
      .section-pill { font-size:16px !important; padding:12px 26px !important; border-radius:28px !important; }
      /* Badges / match */
      .b-match { font-size:20px !important; }
      .badge   { font-size:15px !important; padding:4px 12px !important; }
      /* Episode btn */
      .epb { padding:18px 22px !important; gap:18px !important; font-size:16px !important; }
      /* Focus ring — crisp on TV */
      :focus-visible { outline:4px solid #e50914 !important; outline-offset:4px !important; }
    }

    /* ─── Tablet (641–1024 px) ─── */
    @media (min-width:641px) and (max-width:1024px) {
      :root {
        --card-w:         130px;
        --card-h:         195px;
        --card-ls-w:      220px;
        --card-ls-h:      124px;
        --header-h:       60px;
        --hero-max-w:     480px;
        --hero-ovw-fs:    14px;
        --row-gap:        6px;
        --grid-min-w:     130px;
        --grid-ls-min-w:  220px;
      }
      .hbtn { padding:10px 20px; font-size:15px; }
    }

    /* ─── Mobile (≤640 px) ─── */
    @media (max-width:640px) {
      :root {
        --card-w:         115px;
        --card-h:         172px;
        --card-ls-w:      190px;
        --card-ls-h:      107px;
        --header-h:       54px;
        --header-logo-fs: 22px;
        --hero-max-w:     100%;
        --hero-ovw-fs:    13px;
        --row-gap:        7px;
        --grid-min-w:     115px;
        --grid-ls-min-w:  190px;
        --header-icon-sz: 36px;
        --avatar-sz:      30px;
        --avatar-fs:      16px;
      }
      .ni span.nl { display:none; }
      .ni { padding:0 7px !important; height:32px !important; }
      .hbtn { padding:9px 16px; font-size:14px; gap:7px; }
      .hero-nav { display:none; }
      /* Hero text on mobile */
      .hero-title { font-size:clamp(26px,7.5vw,44px) !important; letter-spacing:1px !important; margin-bottom:10px !important; }
      .hero-overview { -webkit-line-clamp:2 !important; font-size:13px !important; margin-bottom:14px !important; }
      .hero-meta { gap:7px !important; margin-bottom:12px !important; }
      /* Modal full-screen sheet on mobile */
      .moverlay { padding:0 !important; align-items:flex-end !important; }
      .mbox { border-radius:16px 16px 0 0 !important; max-height:94vh; overflow-y:auto; width:100% !important; }
      /* Search input */
      .sinput { width:150px !important; font-size:13px !important; padding:7px 12px 7px 34px !important; }
      /* Episode button on mobile */
      .epb { padding:10px 12px !important; gap:10px !important; font-size:13px !important; }
      /* Row arrows hidden on mobile — rely on swipe */
      .rarr { display:none !important; }
      /* Genre pills compact on mobile */
      .genre-pill { padding:6px 14px !important; font-size:12px !important; }
      /* Player header on mobile */
      .player-bar { padding:10px 12px !important; gap:10px !important; }
      .player-src-btns { display:none !important; }
      .player-ep-bar { padding:9px 12px !important; gap:8px !important; }
      .player-ep-bar button { padding:7px 12px !important; font-size:13px !important; }
      /* Toast */
      .toast { font-size:13px !important; padding:9px 18px !important; bottom:20px !important; }
      /* Row title */
      .row-title { font-size:15px !important; padding-bottom:8px !important; }
      /* Cards: always-visible overlay on mobile (no hover) */
      .sc .ov { opacity:1; pointer-events:all; }
      .cbtn { width:28px !important; height:28px !important; }
    }

    /* ─── Small phone (≤480 px — iPhone SE, Galaxy A-series) ─── */
    @media (max-width:480px) {
      :root {
        --card-w:         100px;
        --card-h:         150px;
        --card-ls-w:      168px;
        --card-ls-h:      95px;
        --header-logo-fs: 20px;
        --header-h:       50px;
        --grid-min-w:     100px;
        --grid-ls-min-w:  168px;
        --header-icon-sz: 32px;
        --avatar-sz:      27px;
        --avatar-fs:      15px;
        --row-gap:        6px;
      }
      .hero-title { font-size:clamp(22px,8.5vw,38px) !important; }
      .hbtn { padding:8px 14px; font-size:13px; gap:6px; }
      .mbox { border-radius:12px 12px 0 0 !important; }
      /* Ep thumbnail smaller */
      .ep-thumb { width:90px !important; height:51px !important; }
      /* Header: tighter on tiny screens */
      .header-left { gap:12px !important; }
      .ni { padding:0 5px !important; }
      /* Genre pills even more compact */
      .genre-pill { padding:5px 11px !important; font-size:11px !important; }
    }

    /* ─── QHD / 2K (≥2560 px) ─── */
    @media (min-width:2560px) {
      :root {
        --card-w:         280px;
        --card-h:         420px;
        --card-ls-w:      480px;
        --card-ls-h:      270px;
        --header-h:       110px;
        --header-logo-fs: 44px;
        --hero-max-w:     900px;
        --hero-title-max: 128px;
        --hero-ovw-fs:    24px;
        --card-title-fs:  20px;
        --card-meta-fs:   16px;
        --row-gap:        18px;
        --grid-min-w:     260px;
        --grid-ls-min-w:  460px;
        --header-icon-sz: 64px;
        --avatar-sz:      54px;
        --avatar-fs:      28px;
      }
      .ni { font-size:24px !important; height:64px !important; padding:0 24px !important; }
      .hbtn { font-size:26px !important; padding:22px 56px !important; border-radius:8px !important; }
      .cbtn { width:60px !important; height:60px !important; border-width:3px !important; }
      .sinput { width:380px !important; font-size:22px !important; }
      .sels { font-size:22px !important; padding:14px 22px !important; }
      .pgbtn { font-size:24px !important; padding:22px 44px !important; border-radius:12px !important; }
      .toast { font-size:22px !important; padding:18px 40px !important; }
      .mbox { max-width:1800px !important; border-radius:20px !important; }
      .moverlay { padding:72px !important; }
      .rarr { min-width:120px !important; opacity:1 !important; }
      .hero-nav { width:90px !important; height:90px !important; }
      .hero-dot { width:14px !important; height:14px !important; }
      .hero-dot.on { width:38px !important; max-width:38px !important; }
      .hero-title { font-size:clamp(80px,7vw,128px) !important; }
      .hero-overview { font-size:24px !important; -webkit-line-clamp:4 !important; }
      .row-title { font-size:32px !important; }
      .badge { font-size:17px !important; padding:5px 14px !important; }
      .b-match { font-size:24px !important; }
      .epb { padding:22px 28px !important; gap:22px !important; font-size:20px !important; }
      .player-bar { padding:18px 28px !important; }
      :focus-visible { outline:5px solid #e50914 !important; outline-offset:5px !important; }
    }

    /* ─── 4K / 60-inch TV (≥3840 px) ─── */
    @media (min-width:3840px) {
      :root {
        --card-w:         380px;
        --card-h:         570px;
        --card-ls-w:      640px;
        --card-ls-h:      360px;
        --header-h:       150px;
        --header-logo-fs: 60px;
        --hero-max-w:     1200px;
        --hero-ovw-fs:    32px;
        --card-title-fs:  28px;
        --card-meta-fs:   22px;
        --row-gap:        24px;
        --grid-min-w:     360px;
        --grid-ls-min-w:  620px;
        --header-icon-sz: 88px;
        --avatar-sz:      72px;
        --avatar-fs:      38px;
      }
      .ni { font-size:32px !important; height:88px !important; padding:0 32px !important; }
      .hbtn { font-size:34px !important; padding:30px 72px !important; gap:16px !important; border-radius:10px !important; }
      .cbtn { width:80px !important; height:80px !important; border-width:4px !important; }
      .sinput { width:520px !important; font-size:30px !important; padding:16px 22px 16px 64px !important; }
      .sels { font-size:30px !important; padding:18px 28px !important; }
      .pgbtn { font-size:32px !important; padding:30px 60px !important; border-radius:16px !important; }
      .toast { font-size:30px !important; padding:24px 56px !important; border-radius:50px !important; bottom:72px !important; }
      .mbox { max-width:2400px !important; border-radius:28px !important; }
      .moverlay { padding:96px !important; }
      .rarr { min-width:160px !important; opacity:1 !important; }
      .hero-nav { width:120px !important; height:120px !important; }
      .hero-dot { width:20px !important; height:20px !important; }
      .hero-dot.on { width:52px !important; max-width:52px !important; }
      .hero-title { font-size:clamp(100px,8vw,180px) !important; }
      .hero-overview { font-size:32px !important; -webkit-line-clamp:4 !important; }
      .row-title { font-size:44px !important; }
      .badge { font-size:24px !important; padding:8px 20px !important; }
      .b-match { font-size:32px !important; }
      .epb { padding:32px 40px !important; gap:32px !important; font-size:28px !important; }
      .player-bar { padding:28px 40px !important; gap:24px !important; }
      .player-ep-bar { padding:24px 40px !important; }
      :focus-visible { outline:6px solid #e50914 !important; outline-offset:6px !important; }
    }
  `;
  document.head.appendChild(el);
};
