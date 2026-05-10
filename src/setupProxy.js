/**
 * CRA dev-server proxy
 *
 * Mirrors the Netlify redirect in netlify.toml so /vidsrc-api/* works
 * identically on localhost and in production (no CORS errors either way).
 *
 * http-proxy-middleware is bundled with react-scripts — no extra install needed.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/vidsrc-api',
    createProxyMiddleware({
      target: 'https://vidsrc.cc',
      changeOrigin: true,
      pathRewrite: { '^/vidsrc-api': '' },
    })
  );
};
