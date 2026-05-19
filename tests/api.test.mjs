/**
 * Part 2 — Functional/Integration Tests (API against live Docker)
 * Uses built-in fetch (Node 18+). No extra dependencies.
 * Run: node /mnt/d/Vibe/B2B/tests/api.test.mjs
 */

const BASE = 'http://localhost:3001';
const ts = Date.now();

let passed = 0;
let failed = 0;

function pass(name) {
  console.log(`  ✓ PASS: ${name}`);
  passed++;
}

function fail(name, reason) {
  console.log(`  ✗ FAIL: ${name} — ${reason}`);
  failed++;
}

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, json };
}

async function assertApiAvailable() {
  try {
    const res = await fetch(`${BASE}/health`);
    if (!res.ok) throw new Error(`health returned ${res.status}`);
  } catch (err) {
    console.error(`API integration tests require a running API at ${BASE}. Start the Docker stack before running npm run test:api.`);
    console.error(err);
    process.exit(1);
  }
}

await assertApiAvailable();

// State shared across tests
let sellerToken, buyerToken, thirdPartyToken, otherSellerToken;
let sellerId, buyerId, otherSellerId;
let productId, productId2, otherSellerProductId;
let orderId, otherSellerOrderId;

// ─── AUTH ────────────────────────────────────────────────────────────────────
console.log('\nAUTH');

{
  const r = await req('POST', '/api/auth/register', {
    email: `seller${ts}@test.com`,
    password: 'password123',
    role: 'seller',
    companyName: 'Test Seller Co',
  });
  if (r.status === 201 && r.json?.token && r.json?.user?.id) {
    sellerToken = r.json.token;
    sellerId = r.json.user.id;
    pass('POST /api/auth/register → seller account (201)');
  } else {
    fail('POST /api/auth/register → seller account (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('POST', '/api/auth/register', {
    email: `buyer${ts}@test.com`,
    password: 'password123',
    role: 'buyer',
    companyName: 'Test Buyer Co',
  });
  if (r.status === 201 && r.json?.token && r.json?.user?.id) {
    buyerToken = r.json.token;
    buyerId = r.json.user.id;
    pass('POST /api/auth/register → buyer account (201)');
  } else {
    fail('POST /api/auth/register → buyer account (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// Third-party user for auth isolation tests
{
  const r = await req('POST', '/api/auth/register', {
    email: `third${ts}@test.com`,
    password: 'password123',
    role: 'buyer',
    companyName: 'Third Party Co',
  });
  if (r.status === 201) thirdPartyToken = r.json.token;
}

// Second seller for cross-seller authorization tests
{
  const r = await req('POST', '/api/auth/register', {
    email: `seller2-${ts}@test.com`,
    password: 'password123',
    role: 'seller',
    companyName: 'Other Seller Co',
  });
  if (r.status === 201 && r.json?.token && r.json?.user?.id) {
    otherSellerToken = r.json.token;
    otherSellerId = r.json.user.id;
    pass('POST /api/auth/register → second seller account (201)');
  } else {
    fail('POST /api/auth/register → second seller account (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('POST', '/api/auth/register', {
    email: `seller${ts}@test.com`,
    password: 'password123',
    role: 'seller',
    companyName: 'Test Seller Co',
  });
  if (r.status === 409) {
    pass('POST /api/auth/register → duplicate email (409)');
  } else {
    fail('POST /api/auth/register → duplicate email (409)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('POST', '/api/auth/login', {
    email: `seller${ts}@test.com`,
    password: 'password123',
  });
  if (r.status === 200 && r.json?.token) {
    pass('POST /api/auth/login → valid credentials → returns JWT (200)');
  } else {
    fail('POST /api/auth/login → valid credentials → returns JWT (200)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('POST', '/api/auth/login', {
    email: `seller${ts}@test.com`,
    password: 'wrongpassword',
  });
  if (r.status === 401) {
    pass('POST /api/auth/login → wrong password (401)');
  } else {
    fail('POST /api/auth/login → wrong password (401)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', '/health');
  if (r.status === 200 && r.json?.status === 'ok') {
    pass('GET /health (200, {status:"ok"})');
  } else {
    fail('GET /health (200, {status:"ok"})', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// ─── PRODUCTS (as seller) ─────────────────────────────────────────────────────
console.log('\nPRODUCTS (as seller)');

{
  const r = await req('POST', '/api/products', {
    sku: `SKU-${ts}`,
    name: 'Test Widget',
    category: 'Electronics',
    unit: 'pcs',
    priceUsdCents: 5000,
    priceRangeMin: 4500,
    priceRangeMax: 5500,
    cbmPerUnit: 0.5,
    weightKg: 1.2,
    hsCode: '8471.30',
    originCountry: 'VN',
  }, sellerToken);
  if (r.status === 201 && r.json?.id && r.json?.priceUsdCents !== undefined) {
    productId = r.json.id;
    pass('POST /api/products → create product (201, has priceUsdCents)');
  } else {
    fail('POST /api/products → create product (201, has priceUsdCents)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// Create second product for UAT
{
  const r = await req('POST', '/api/products', {
    sku: `SKU2-${ts}`,
    name: 'Test Gadget',
    category: 'Hardware',
    unit: 'pcs',
    priceUsdCents: 12000,
    priceRangeMin: 11000,
    priceRangeMax: 13000,
    cbmPerUnit: 1.2,
    weightKg: 3.0,
    hsCode: '8543.70',
    originCountry: 'VN',
  }, sellerToken);
  if (r.status === 201) productId2 = r.json.id;
}

// Create product owned by the second seller for cross-seller authorization tests
{
  const r = await req('POST', '/api/products', {
    sku: `SKU-OTHER-${ts}`,
    name: 'Other Seller Product',
    category: 'Electronics',
    unit: 'pcs',
    priceUsdCents: 7000,
    priceRangeMin: 6500,
    priceRangeMax: 7500,
    cbmPerUnit: 0.7,
    weightKg: 2.0,
    hsCode: '8471.41',
    originCountry: 'VN',
  }, otherSellerToken);
  if (r.status === 201 && r.json?.id) {
    otherSellerProductId = r.json.id;
    pass('POST /api/products → second seller creates product (201)');
  } else {
    fail('POST /api/products → second seller creates product (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', '/api/products', null, sellerToken);
  if (r.status === 200) {
    const items = r.json?.items ?? r.json ?? [];
    const hasPrice = Array.isArray(items) && items.some(p => p.priceUsdCents !== undefined);
    const hasSeller = Array.isArray(items) && items.some(p => p.sellerId === sellerId);
    if (hasPrice && hasSeller) {
      pass('GET /api/products → seller gets own products (has priceUsdCents, correct sellerId)');
    } else {
      fail('GET /api/products → seller gets own products', `priceUsdCents=${hasPrice}, sellerId=${hasSeller}, response=${JSON.stringify(r.json).slice(0,200)}`);
    }
  } else {
    fail('GET /api/products → seller gets own products', `got ${r.status}`);
  }
}

// ─── PRICE ISOLATION (as buyer) ───────────────────────────────────────────────
console.log('\nPRICE ISOLATION (as buyer — critical security invariant)');

{
  const r = await req('GET', '/api/products', null, buyerToken);
  if (r.status === 200) {
    const items = r.json?.items ?? r.json ?? [];
    const jsonStr = JSON.stringify(r.json);
    const hasPriceUsdCents = jsonStr.includes('"priceUsdCents"');
    if (!hasPriceUsdCents) {
      pass('*** GET /api/products → buyer response MUST NOT contain priceUsdCents [CRITICAL]');
    } else {
      fail('*** GET /api/products → buyer response MUST NOT contain priceUsdCents [CRITICAL SECURITY BUG]',
        'priceUsdCents found in buyer response — price isolation is BROKEN');
    }
  } else {
    fail('GET /api/products → buyer price isolation check', `got ${r.status}`);
  }
}

{
  const r = await req('GET', '/api/products', null, buyerToken);
  if (r.status === 200) {
    const items = r.json?.items ?? r.json ?? [];
    const jsonStr = JSON.stringify(r.json);
    const hasMin = jsonStr.includes('"priceRangeMin"');
    const hasMax = jsonStr.includes('"priceRangeMax"');
    if (hasMin && hasMax) {
      pass('GET /api/products → buyer response has priceRangeMin, priceRangeMax');
    } else {
      fail('GET /api/products → buyer response has priceRangeMin, priceRangeMax',
        `priceRangeMin=${hasMin}, priceRangeMax=${hasMax}`);
    }
  } else {
    fail('GET /api/products → buyer price range check', `got ${r.status}`);
  }
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
// NOTE: POs are created with status='draft'. The lifecycle is:
//   draft → submitted → acknowledged → confirmed → ...
// The buyer advances draft→submitted, then the seller advances submitted→acknowledged.
console.log('\nORDERS');

{
  const r = await req('POST', '/api/orders', {
    sellerId,
    items: [{ productId, quantity: 10 }],
    notes: 'Test PO',
  }, buyerToken);
  if (r.status === 201 && r.json?.id) {
    orderId = r.json.id;
    pass('POST /api/orders → buyer creates PO with the product (201)');
  } else {
    fail('POST /api/orders → buyer creates PO with the product (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('POST', '/api/orders', {
    sellerId: otherSellerId,
    items: [{ productId: otherSellerProductId, quantity: 3 }],
    notes: 'PO for second seller',
  }, buyerToken);
  if (r.status === 201 && r.json?.id) {
    otherSellerOrderId = r.json.id;
    pass('POST /api/orders → buyer creates PO with second seller product (201)');
  } else {
    fail('POST /api/orders → buyer creates PO with second seller product (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', '/api/orders', null, buyerToken);
  if (r.status === 200) {
    const orders = Array.isArray(r.json) ? r.json : [];
    if (orders.some(o => o.id === orderId)) {
      pass('GET /api/orders → buyer sees the order');
    } else {
      fail('GET /api/orders → buyer sees the order', `order ${orderId} not found in ${JSON.stringify(orders).slice(0,200)}`);
    }
  } else {
    fail('GET /api/orders → buyer sees the order', `got ${r.status}`);
  }
}

{
  const r = await req('GET', '/api/orders', null, sellerToken);
  if (r.status === 200) {
    const orders = Array.isArray(r.json) ? r.json : [];
    if (orders.some(o => o.id === orderId)) {
      pass('GET /api/orders → seller sees the order');
    } else {
      fail('GET /api/orders → seller sees the order', `order ${orderId} not found in ${JSON.stringify(orders).slice(0,200)}`);
    }
  } else {
    fail('GET /api/orders → seller sees the order', `got ${r.status}`);
  }
}

{
  const r = await req('GET', `/api/orders/${orderId}/versions`, null, buyerToken);
  if (r.status === 200) {
    const versions = Array.isArray(r.json) ? r.json : [];
    if (versions.length === 1) {
      pass('GET /api/orders/:id/versions → has 1 version (initial)');
    } else {
      fail('GET /api/orders/:id/versions → has 1 version (initial)', `got ${versions.length} versions`);
    }
  } else {
    fail('GET /api/orders/:id/versions → has 1 version (initial)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// Step 1: Buyer advances draft → submitted
{
  const r = await req('PATCH', `/api/orders/${orderId}/status`, {
    status: 'submitted',
    changeReason: 'Buyer submits order',
  }, buyerToken);
  if (r.status !== 200) {
    fail('PATCH /api/orders/:id/status → buyer advances to submitted (prerequisite)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('PATCH', `/api/orders/${orderId}/status`, {
    status: 'acknowledged',
    changeReason: 'Buyer attempts seller-only transition',
  }, buyerToken);
  if (r.status === 403) {
    pass("PATCH /api/orders/:id/status → buyer cannot advance to 'acknowledged' (403)");
  } else {
    fail("PATCH /api/orders/:id/status → buyer cannot advance to 'acknowledged' (403)", `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// Step 2: Seller advances submitted → acknowledged
{
  const r = await req('PATCH', `/api/orders/${orderId}/status`, {
    status: 'acknowledged',
    changeReason: 'Order received and reviewed',
  }, sellerToken);
  if (r.status === 200) {
    pass("PATCH /api/orders/:id/status → seller advances to 'acknowledged' (200)");
  } else {
    fail("PATCH /api/orders/:id/status → seller advances to 'acknowledged' (200)", `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', `/api/orders/${orderId}/versions`, null, sellerToken);
  if (r.status === 200) {
    const versions = Array.isArray(r.json) ? r.json : [];
    // Now 3 versions: initial creation, submitted, acknowledged
    if (versions.length >= 2) {
      pass('GET /api/orders/:id/versions → now has 2+ versions (after transitions)');
    } else {
      fail('GET /api/orders/:id/versions → now has 2+ versions', `got ${versions.length} versions`);
    }
  } else {
    fail('GET /api/orders/:id/versions → now has 2+ versions', `got ${r.status}`);
  }
}

{
  // Try invalid transition: acknowledged → shipped (skipping states)
  const r = await req('PATCH', `/api/orders/${orderId}/status`, {
    status: 'shipped',
  }, sellerToken);
  if (r.status === 422) {
    pass('PATCH /api/orders/:id/status → invalid transition (422)');
  } else {
    fail('PATCH /api/orders/:id/status → invalid transition rejected', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// ─── AUTHORIZATION ────────────────────────────────────────────────────────────
console.log('\nAUTHORIZATION');

{
  const r = await req('GET', `/api/orders/${orderId}`, null, thirdPartyToken);
  if (r.status === 404 || r.status === 403) {
    pass('GET /api/orders/:id → third-party JWT (404 or 403)');
  } else {
    fail('GET /api/orders/:id → third-party JWT (404 or 403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', `/api/documents/${orderId}`, null, thirdPartyToken);
  if (r.status === 404 || r.status === 403) {
    pass('GET /api/documents/:poId → third-party denied (404 or 403)');
  } else {
    fail('GET /api/documents/:poId → third-party denied (404 or 403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const key = encodeURIComponent(`documents/${orderId}/fake.pdf`);
  const r = await req('GET', `/api/messages/s3-signed-url?key=${key}`, null, thirdPartyToken);
  if (r.status === 404 || r.status === 403) {
    pass('GET /api/messages/s3-signed-url → third-party denied for PO-scoped key (404 or 403)');
  } else {
    fail('GET /api/messages/s3-signed-url → third-party denied for PO-scoped key (404 or 403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', '/api/admin/users', null, buyerToken);
  if (r.status === 403) {
    pass('GET /api/admin/users → non-admin (403)');
  } else {
    fail('GET /api/admin/users → non-admin (403)', `got ${r.status}`);
  }
}

// ─── CONTAINER SIM ────────────────────────────────────────────────────────────
console.log('\nCONTAINER SIM');

{
  const r = await req('POST', `/api/container/${orderId}/simulate`, {
    containerType: '40ft',
  }, buyerToken);
  if (r.status === 200 && r.json?.simulation) {
    const sim = r.json.simulation;
    const hasAll = sim.totalCBM !== undefined && sim.containersNeeded !== undefined && sim.utilizationPct !== undefined;
    if (hasAll) {
      pass('POST /api/container/:poId/simulate → returns simulation with totalCBM, containersNeeded, utilizationPct');
    } else {
      fail('POST /api/container/:poId/simulate → missing fields', `got: ${JSON.stringify(sim)}`);
    }
  } else {
    fail('POST /api/container/:poId/simulate → returns simulation', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', `/api/container/${orderId}`, null, thirdPartyToken);
  if (r.status === 404 || r.status === 403) {
    pass('GET /api/container/:poId → third-party denied (404 or 403)');
  } else {
    fail('GET /api/container/:poId → third-party denied (404 or 403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// ─── COSTS ────────────────────────────────────────────────────────────────────
console.log('\nCOSTS');

{
  const r = await req('POST', `/api/costs/${otherSellerOrderId}`, {
    goodsFobCents: 10000,
    freightCents: 1000,
    insuranceCents: 100,
    customsDutyCents: 500,
    portHandlingCents: 200,
    otherCents: 0,
    currency: 'USD',
  }, sellerToken);
  if (r.status === 403) {
    pass('POST /api/costs/:poId → unrelated seller denied (403)');
  } else {
    fail('POST /api/costs/:poId → unrelated seller denied (403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('POST', `/api/costs/${orderId}`, {
    goodsFobCents: 50000,
    freightCents: 8000,
    insuranceCents: 500,
    customsDutyCents: 2500,
    portHandlingCents: 1000,
    otherCents: 0,
    currency: 'USD',
    notes: 'Initial cost estimate',
  }, sellerToken);
  if (r.status === 201 && r.json?.id) {
    pass('POST /api/costs/:poId → seller creates cost breakdown (201)');
  } else {
    fail('POST /api/costs/:poId → seller creates cost breakdown (201)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', `/api/costs/${orderId}`, null, buyerToken);
  if (r.status === 200 && r.json !== null) {
    pass('GET /api/costs/:poId → buyer can read cost breakdown');
  } else {
    fail('GET /api/costs/:poId → buyer can read cost breakdown', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

{
  const r = await req('GET', `/api/costs/${orderId}`, null, thirdPartyToken);
  if (r.status === 404 || r.status === 403) {
    pass('GET /api/costs/:poId → third-party denied (404 or 403)');
  } else {
    fail('GET /api/costs/:poId → third-party denied (404 or 403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
console.log('\nDOCUMENTS');

{
  const r = await req('POST', `/api/documents/${otherSellerOrderId}/generate`, {
    docType: 'commercial_invoice',
  }, sellerToken);
  if (r.status === 403) {
    pass('POST /api/documents/:poId/generate → unrelated seller denied (403)');
  } else {
    fail('POST /api/documents/:poId/generate → unrelated seller denied (403)', `got ${r.status}: ${JSON.stringify(r.json)}`);
  }
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${'─'.repeat(50)}`);
console.log(`Part 2 (API Functional) Results: ${passed}/${total} passed`);
if (failed > 0) {
  console.log(`  ✗ ${failed} test(s) FAILED`);
}
console.log(`${'─'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
