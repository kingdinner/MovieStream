/**
 * Footer
 *
 * Simple branded footer shown at the bottom of the main page.
 */
export default function Footer() {
  return (
    <footer style={{
      padding: '44px 4% 28px',
      borderTop: '1px solid rgba(255,255,255,.07)',
      marginTop: 40,
    }}>
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 22, color: '#e50914', letterSpacing: 3, marginBottom: 14,
      }}>
        KVFilmZone
      </div>
      <p style={{ color: '#444', fontSize: 13, maxWidth: 480, lineHeight: 1.65 }}>
        Powered by TMDB · Streaming via VidSrc · For personal use only
      </p>
    </footer>
  );
}
