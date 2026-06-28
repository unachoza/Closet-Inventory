/**
 * Phase 0 Feasibility Spike — Product Detail Enrichment
 *
 * Tests ScrapingBee and Bright Data against retailer product pages
 * to verify we can extract materials, care, features, and size chart data.
 *
 * Usage:
 *   SCRAPINGBEE_API_KEY=xxx BRIGHTDATA_API_KEY=xxx npx tsx scripts/enrichment-spike.ts
 *
 * Or test one provider at a time:
 *   SCRAPINGBEE_API_KEY=xxx npx tsx scripts/enrichment-spike.ts
 */

// ─── Config ──────────────────────────────────────────────────────────

const TEST_URLS = [
  {
    retailer: 'aritzia',
    name: 'Sculpt Knit Racer Mini Dress',
    url: 'https://www.aritzia.com/us/en/product/sculpt-knit-racer-mini-dress/99158.html',
    expectedData: {
      materials: '99% nylon, 1% elastane',
      care: 'Hand wash',
      description: 'racerback mini dress',
    },
  },
  {
    retailer: 'zara',
    name: 'Sleeveless Top',
    url: 'https://www.zara.com/us/en/sleeveless-top-p03641871.html?v1=563442152',
    expectedData: {
      materials: null, // unknown — spike will reveal
      care: null,
      description: 'sleeveless',
    },
  },
  {
    retailer: 'anthropologie',
    name: 'Celandine Textured Knit Long-Sleeve Midi Dress',
    url: 'https://www.anthropologie.com/shop/celandine-textured-knit-long-sleeve-midi-dress?color=566&type=STANDARD',
    expectedData: {
      materials: null,
      care: null,
      description: 'midi dress',
    },
  },
  {
    retailer: 'poshmark',
    name: 'Poshmark search for Aritzia Sculpt Knit',
    url: 'https://poshmark.com/search?query=aritzia+sculpt+knit+racer+mini+dress&type=listings',
    expectedData: {
      materials: null,
      care: null,
      description: null,
    },
  },
];

// ─── Types ───────────────────────────────────────────────────────────

interface SpikeResult {
  provider: string;
  retailer: string;
  url: string;
  jsRendering: boolean;
  success: boolean;
  statusCode: number;
  responseTimeMs: number;
  htmlLength: number;
  found: {
    jsonLd: boolean;
    preloadedState: boolean;
    nextData: boolean;
    materials: string | null;
    care: string | null;
    description: string | null;
    features: string | null;
    fitInfo: string | null;
    sizeChart: string | null;
  };
  error?: string;
}

// ─── Extraction helpers ──────────────────────────────────────────────

function extractFromHtml(html: string, retailer: string): SpikeResult['found'] {
  const found: SpikeResult['found'] = {
    jsonLd: false,
    preloadedState: false,
    nextData: false,
    materials: null,
    care: null,
    description: null,
    features: null,
    fitInfo: null,
    sizeChart: null,
  };

  // JSON-LD
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    found.jsonLd = true;
    for (const block of jsonLdMatch) {
      const content = block.replace(/<\/?script[^>]*>/gi, '');
      try {
        const data = JSON.parse(content);
        const products = Array.isArray(data) ? data.filter((d: Record<string, unknown>) => d['@type'] === 'Product') : (data['@type'] === 'Product' ? [data] : []);
        for (const p of products) {
          if (p.description) found.description = String(p.description).substring(0, 200);
        }
      } catch { /* ignore parse errors */ }
    }
  }

  // __PRELOADED_STATE__
  if (html.includes('__PRELOADED_STATE__')) {
    found.preloadedState = true;
  }

  // __NEXT_DATA__
  if (html.includes('__NEXT_DATA__')) {
    found.nextData = true;
  }

  // Materials — generic pattern
  const materialsPatterns = [
    /Content:\s*([\d]+%\s*[\w\s,]+(?:[\d]+%\s*[\w\s]+)*)/i,
    /Composition:\s*([\d]+%\s*[\w\s,]+(?:[\d]+%\s*[\w\s]+)*)/i,
    /Material:\s*([\d]+%\s*[\w\s,]+(?:[\d]+%\s*[\w\s]+)*)/i,
    /(\d+%\s*(?:cotton|polyester|nylon|elastane|spandex|wool|silk|linen|rayon|viscose|acrylic|cashmere|modal|lyocell|tencel)[\w\s,%-]*)/i,
  ];
  for (const pat of materialsPatterns) {
    const m = html.match(pat);
    if (m) {
      found.materials = m[1].trim().substring(0, 200);
      break;
    }
  }

  // Care
  const carePatterns = [
    /Care:\s*([^<\n]+)/i,
    /care instructions[:\s]*([^<\n]+)/i,
    /(?:hand wash|machine wash|dry clean)[^<\n]*/i,
  ];
  for (const pat of carePatterns) {
    const m = html.match(pat);
    if (m) {
      found.care = (m[1] || m[0]).trim().substring(0, 200);
      break;
    }
  }

  // Description — retailer-specific
  if (retailer === 'aritzia') {
    const descMatch = html.match(/data-testid="product-description"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) found.description = descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 300);

    const featMatch = html.match(/data-testid="features-copy"[^>]*>([\s\S]*?)<\/(?:div|ul|p)>/i);
    if (featMatch) found.features = featMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 300);

    const fitMatch = html.match(/data-testid="size-and-fit-copy"[^>]*>([\s\S]*?)<\/(?:div|ul)>/i);
    if (fitMatch) found.fitInfo = fitMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 200);

    const sizeMatch = html.match(/data-testid="size-guide-details"[^>]*>([\s\S]*?)<\/div>/i);
    if (sizeMatch) found.sizeChart = sizeMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 300);
  }

  // Preloaded state materials (Aritzia)
  if (found.preloadedState && !found.materials) {
    const tabDetailsMatch = html.match(/"tabDetails"\s*:\s*"([^"]+)"/);
    if (tabDetailsMatch) {
      const decoded = tabDetailsMatch[1].replace(/\\u002F/g, '/').replace(/&nbsp;/g, ' ');
      const matMatch = decoded.match(/Content:\s*([^<]+)/i);
      if (matMatch) found.materials = matMatch[1].trim();
      const careMatch = decoded.match(/Care:\s*([^<]+)/i);
      if (careMatch) found.care = careMatch[1].trim();
    }
  }

  // Generic description fallback
  if (!found.description) {
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    if (metaDesc) found.description = metaDesc[1].substring(0, 300);
  }

  return found;
}

// ─── Provider fetchers ───────────────────────────────────────────────

async function fetchWithScrapingBee(
  url: string,
  apiKey: string,
  jsRendering: boolean,
): Promise<{ html: string; statusCode: number }> {
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: jsRendering ? 'true' : 'false',
    premium_proxy: 'true',
  });

  const response = await fetch(`https://app.scrapingbee.com/api/v1?${params}`);
  const html = await response.text();
  return { html, statusCode: response.status };
}

async function fetchWithBrightData(
  url: string,
  apiKey: string,
  jsRendering: boolean,
): Promise<{ html: string; statusCode: number }> {
  // Bright Data Web Scraper API
  // Uses their "scraping browser" for JS rendering, or "web unlocker" for HTML-only
  const endpoint = jsRendering
    ? 'https://api.brightdata.com/request'
    : 'https://api.brightdata.com/request';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      zone: jsRendering ? 'scraping_browser' : 'web_unlocker',
      url,
      format: 'raw',
    }),
  });

  const html = await response.text();
  return { html, statusCode: response.status };
}

// ─── Main spike runner ───────────────────────────────────────────────

async function runSpike(
  provider: string,
  fetcher: (url: string, apiKey: string, jsRendering: boolean) => Promise<{ html: string; statusCode: number }>,
  apiKey: string,
  testUrl: typeof TEST_URLS[number],
  jsRendering: boolean,
): Promise<SpikeResult> {
  const start = Date.now();
  try {
    const { html, statusCode } = await fetcher(testUrl.url, apiKey, jsRendering);
    const responseTimeMs = Date.now() - start;

    if (statusCode !== 200) {
      return {
        provider,
        retailer: testUrl.retailer,
        url: testUrl.url,
        jsRendering,
        success: false,
        statusCode,
        responseTimeMs,
        htmlLength: html.length,
        found: extractFromHtml('', testUrl.retailer),
        error: `HTTP ${statusCode}: ${html.substring(0, 200)}`,
      };
    }

    const found = extractFromHtml(html, testUrl.retailer);

    return {
      provider,
      retailer: testUrl.retailer,
      url: testUrl.url,
      jsRendering,
      success: true,
      statusCode,
      responseTimeMs,
      htmlLength: html.length,
      found,
    };
  } catch (err) {
    return {
      provider,
      retailer: testUrl.retailer,
      url: testUrl.url,
      jsRendering,
      success: false,
      statusCode: 0,
      responseTimeMs: Date.now() - start,
      htmlLength: 0,
      found: extractFromHtml('', testUrl.retailer),
      error: String(err),
    };
  }
}

// ─── Report ──────────────────────────────────────────────────────────

function printResults(results: SpikeResult[]): void {
  console.log('\n' + '═'.repeat(80));
  console.log('  ENRICHMENT SPIKE RESULTS');
  console.log('═'.repeat(80));

  for (const r of results) {
    const status = r.success ? '✅' : '❌';
    console.log(`\n${status} ${r.provider} → ${r.retailer} (JS: ${r.jsRendering ? 'ON' : 'OFF'})`);
    console.log(`   URL: ${r.url}`);
    console.log(`   Status: ${r.statusCode} | Time: ${r.responseTimeMs}ms | HTML: ${r.htmlLength} bytes`);

    if (r.error) {
      console.log(`   Error: ${r.error}`);
      continue;
    }

    console.log(`   JSON-LD: ${r.found.jsonLd ? '✅' : '❌'} | __PRELOADED_STATE__: ${r.found.preloadedState ? '✅' : '❌'} | __NEXT_DATA__: ${r.found.nextData ? '✅' : '❌'}`);
    console.log(`   Materials: ${r.found.materials ?? '❌ not found'}`);
    console.log(`   Care: ${r.found.care ?? '❌ not found'}`);
    console.log(`   Description: ${r.found.description ? r.found.description.substring(0, 80) + '…' : '❌ not found'}`);
    console.log(`   Features: ${r.found.features ? r.found.features.substring(0, 80) + '…' : '❌ not found'}`);
    console.log(`   Fit info: ${r.found.fitInfo ?? '❌ not found'}`);
    console.log(`   Size chart: ${r.found.sizeChart ? r.found.sizeChart.substring(0, 80) + '…' : '❌ not found'}`);
  }

  // Summary table
  console.log('\n' + '─'.repeat(80));
  console.log('  SUMMARY');
  console.log('─'.repeat(80));
  console.log(
    `${'Provider'.padEnd(15)} ${'Retailer'.padEnd(15)} ${'JS'.padEnd(5)} ${'OK'.padEnd(4)} ${'Mat'.padEnd(5)} ${'Care'.padEnd(5)} ${'Desc'.padEnd(5)} ${'Size'.padEnd(5)} ${'Time'.padEnd(8)}`,
  );
  for (const r of results) {
    console.log(
      `${r.provider.padEnd(15)} ${r.retailer.padEnd(15)} ${(r.jsRendering ? 'Y' : 'N').padEnd(5)} ${(r.success ? '✅' : '❌').padEnd(4)} ${(r.found.materials ? '✅' : '❌').padEnd(5)} ${(r.found.care ? '✅' : '❌').padEnd(5)} ${(r.found.description ? '✅' : '❌').padEnd(5)} ${(r.found.sizeChart ? '✅' : '❌').padEnd(5)} ${(r.responseTimeMs + 'ms').padEnd(8)}`,
    );
  }
}

// ─── Entry point ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  const scrapingBeeKey = process.env.SCRAPINGBEE_API_KEY;
  const brightDataKey = process.env.BRIGHTDATA_API_KEY;

  if (!scrapingBeeKey && !brightDataKey) {
    console.error('Error: Set SCRAPINGBEE_API_KEY and/or BRIGHTDATA_API_KEY env vars');
    console.error('  Sign up for free trials:');
    console.error('  - ScrapingBee: https://www.scrapingbee.com (1000 free credits)');
    console.error('  - Bright Data: https://brightdata.com/pricing/web-scraper');
    process.exit(1);
  }

  const results: SpikeResult[] = [];

  for (const testUrl of TEST_URLS) {
    // Test each provider with JS rendering OFF first (cheaper), then ON
    for (const jsRendering of [false, true]) {
      if (scrapingBeeKey) {
        console.log(`Testing ScrapingBee → ${testUrl.retailer} (JS: ${jsRendering ? 'ON' : 'OFF'})...`);
        const result = await runSpike('ScrapingBee', fetchWithScrapingBee, scrapingBeeKey, testUrl, jsRendering);
        results.push(result);

        // If HTML-only already got everything, skip JS rendering for this provider+retailer
        if (!jsRendering && result.found.materials && result.found.care && result.found.description) {
          console.log(`  → HTML-only got all data, skipping JS rendering for ${testUrl.retailer}`);
          continue;
        }
      }

      if (brightDataKey) {
        console.log(`Testing BrightData → ${testUrl.retailer} (JS: ${jsRendering ? 'ON' : 'OFF'})...`);
        const result = await runSpike('BrightData', fetchWithBrightData, brightDataKey, testUrl, jsRendering);
        results.push(result);

        if (!jsRendering && result.found.materials && result.found.care && result.found.description) {
          console.log(`  → HTML-only got all data, skipping JS rendering for ${testUrl.retailer}`);
          continue;
        }
      }
    }
  }

  printResults(results);
}

main().catch(console.error);
