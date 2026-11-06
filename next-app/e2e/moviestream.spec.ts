import { expect, test } from '@playwright/test';

test.describe('MovieStream (KVFilmZone) Next.js Modernization Regression Suite', () => {
  test('1. Homepage, Navigation, Browser Console Errors & First-Party Ad Separation', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');

    // Verify Hero Carousel & Original Branding
    await expect(page.getByTestId('site-header')).toBeVisible();
    await expect(page.getByTestId('hero-carousel')).toBeVisible();
    await expect(page.getByText('🏅 Top 10 This Week')).toBeVisible();

    // Verify Advertisement Separation: zero first-party ad placeholders, floating ads, or pre-play interstitials
    await expect(page.getByText('Ad Placeholder')).toHaveCount(0);
    await expect(page.getByText('YOUR VIDEO WILL START AFTER THIS AD')).toHaveCount(0);
    await expect(page.locator('ins.adsbygoogle')).toHaveCount(0);

    // Navigate to Movies page
    await page.getByTestId('nav-link-movies').click();
    await expect(page).toHaveURL(/\/movies/);
    await expect(page.getByTestId('movies-page')).toBeVisible();

    // Navigate to TV Shows page
    await page.getByTestId('nav-link-tv-shows').click();
    await expect(page).toHaveURL(/\/tv/);
    await expect(page.getByTestId('tv-page')).toBeVisible();

    // Navigate to Watchlist page
    await page.getByTestId('nav-link-my-list').click();
    await expect(page).toHaveURL(/\/watchlist/);
    await expect(page.getByTestId('watchlist-page')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('2. Movie Catalog Filtering, Search, and Watchlist Persistence', async ({
    page,
  }) => {
    await page.goto('/search');

    const searchInput = page.getByTestId('search-page-input');
    await searchInput.fill('Dune');

    await expect(page.getByTestId('search-results-heading')).toContainText('Dune');
    await expect(page.getByTestId('search-results-grid')).toBeVisible();

    // Add to Watchlist from search result card
    const addBtn = page.getByLabel('Add Dune: Part Two to My List').first();
    await addBtn.click({ force: true });
    await expect(page.getByTestId('toast-notification')).toContainText(
      'Added to My List'
    );
    await expect(page.getByTestId('watchlist-count-badge')).toHaveText('1');

    // Verify item persists on Watchlist page
    await page.goto('/watchlist');
    await expect(page.getByTestId('watchlist-grid')).toBeVisible();
    await expect(page.getByText('Dune: Part Two')).toBeVisible();
  });

  test('3. Movie & Series Detail Pages, Video Player Loading, Playback Controls, Subtitles, Fullscreen & Source Fallback', async ({
    page,
  }) => {
    // Intercept external provider iframe requests so tests do not depend on third-party uptime
    await page.route('https://vidsrc.cc/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body style="background:#000;color:#fff">Authorized VidSrc CC Player</body></html>',
      })
    );
    await page.route('https://vidsrc.fyi/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body style="background:#000;color:#fff">Authorized VidSrc FYI Player</body></html>',
      })
    );
    await page.route('https://embed.su/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body style="background:#000;color:#fff">Authorized Embed SU Player</body></html>',
      })
    );

    // Visit TV Series Detail Page (/tv/1396 - Breaking Bad)
    await page.goto('/tv/1396');
    await expect(page.getByTestId('media-details-page')).toBeVisible();
    await expect(page.getByTestId('details-page-title')).toBeVisible();
    await expect(page.getByTestId('series-episodes-section')).toBeVisible();

    // Start playback of Episode 1
    await page.getByTestId('details-play-btn').click();
    await expect(page.getByTestId('video-player-container')).toBeVisible();

    const iframe = page.getByTestId('player-iframe');
    await expect(iframe).toHaveAttribute(
      'src',
      'https://vidsrc.cc/v2/embed/tv/1396/1/1?sub=en'
    );

    // Verify Provider Preservation: iframe has no restrictive sandbox attribute blocking provider scripts
    const sandboxAttr = await iframe.getAttribute('sandbox');
    expect(sandboxAttr).toBeNull();

    // Test Subtitles control (switch from en -> es -> off)
    const subSelect = page.getByTestId('control-subtitles-select');
    await subSelect.selectOption('es');
    await expect(iframe).toHaveAttribute(
      'src',
      'https://vidsrc.cc/v2/embed/tv/1396/1/1?sub=es'
    );

    // Test Playback Controls (Play/Pause, Seek, Mute, Fullscreen)
    const playPause = page.getByTestId('control-play-pause');
    await expect(playPause).toHaveAttribute('aria-label', 'Pause');
    await playPause.click();
    await expect(playPause).toHaveAttribute('aria-label', 'Play');

    const muteToggle = page.getByTestId('control-mute-toggle');
    await muteToggle.click();
    await expect(muteToggle).toHaveAttribute('aria-label', 'Unmute');

    const fullscreenBtn = page.getByTestId('control-fullscreen-btn');
    await fullscreenBtn.click();
    await expect(page.getByTestId('video-player-container')).toHaveAttribute(
      'data-fullscreen',
      'true'
    );

    // Test Source Selector & Multi-Source Fallback (visible on both Desktop and Mobile!)
    await expect(page.getByTestId('player-source-selector')).toBeVisible();
    await page.getByTestId('player-source-btn-2').click();
    await expect(iframe).toHaveAttribute(
      'src',
      'https://vidsrc.fyi/embed/tv/1396/1/1'
    );

    await page.getByTestId('player-source-btn-3').click();
    await expect(iframe).toHaveAttribute(
      'src',
      'https://embed.su/embed/tv/1396/1/1'
    );

    // Trigger fallback past the 3rd source to verify error handling overlay
    await page.getByTestId('control-fallback-btn').click();
    await expect(page.getByTestId('player-error-overlay')).toBeVisible();
    await page.getByTestId('player-retry-sources-btn').click();
    await expect(page.getByTestId('player-error-overlay')).toBeHidden();
  });

  test('4. Network Failure Handling & Recovery', async ({ page }) => {
    let shouldFail = true;
    await page.route('**/api/tmdb/catalog**', async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service temporarily unavailable' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/movies');
    await expect(page.getByTestId('catalog-error-alert')).toBeVisible();

    // Recover when Retry is clicked
    shouldFail = false;
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByTestId('catalog-error-alert')).toBeHidden();
    await expect(page.getByTestId('catalog-grid')).toBeVisible();
  });
});
