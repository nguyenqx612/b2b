/**
 * Part 3 — UAT (User Acceptance Testing, full-stack browser simulation)
 * Uses built-in fetch (Node 18+). No extra dependencies.
 * Run: node /mnt/d/Vibe/B2B/tests/uat.test.mjs
 */

const BASE = 'http://localhost:3001';
const ts = Date.now();

let totalPassed = 0;
let totalFailed = 0;

function step(journey, stepNum, desc, ok, reason) {
  if (ok) {
    console.log(`  [UAT] Journey ${journey} / Step ${stepNum}: ${desc} → PASS`);
    totalPassed++;
  } else {
    console.log(`  [UAT] Journey ${journey} / Step ${stepNum}: ${desc} → FAIL: ${reason}`);
    totalFailed++;
  }
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

// ─── JOURNEY 1: Seller onboarding and catalog ─────────────────────────────────
console.log('\n══ Journey 1: Seller onboarding and catalog ══');

let sellerJwt, sellerId;
let product1Id, product2Id;

{
  const r = await req('POST', '/api/auth/register', {
    email: `uat_seller${ts}@test.com`,
    password: 'UatPassword1!',
    role: 'seller',
    companyName: 'UAT Seller Corp',
    companyAddress: '123 Factory Road, Ho Chi Minh City',
    taxId: 'VN-12345',
  });
  step(1, 1, 'Register as new seller', r.status === 201 && r.json?.user?.id, `status=${r.status}`);
  if (r.json?.token) { sellerJwt = r.json.token; sellerId = r.json.user.id; }
}

{
  const r = await req('POST', '/api/auth/login', {
    email: `uat_seller${ts}@test.com`,
    password: 'UatPassword1!',
  });
  step(1, 2, 'Login → get JWT', r.status === 200 && !!r.json?.token, `status=${r.status}`);
  if (r.json?.token) sellerJwt = r.json.token;
}

{
  const r = await req('POST', '/api/products', {
    sku: `UAT-ELEC-${ts}`,
    name: 'UAT Electronics Widget',
    description: 'A high quality electronics component',
    category: 'Electronics',
    unit: 'pcs',
    priceUsdCents: 8500,
    priceRangeMin: 8000,
    priceRangeMax: 9000,
    cbmPerUnit: 0.8,
    weightKg: 2.5,
    hsCode: '8471.30',
    originCountry: 'VN',
  }, sellerJwt);
  step(1, 3, 'Create product 1 (Electronics)', r.status === 201 && !!r.json?.id, `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
  if (r.json?.id) product1Id = r.json.id;
}

{
  const r = await req('POST', '/api/products', {
    sku: `UAT-HW-${ts}`,
    name: 'UAT Hardware Tool',
    description: 'Industrial hardware tool for manufacturing',
    category: 'Hardware',
    unit: 'sets',
    priceUsdCents: 22000,
    priceRangeMin: 20000,
    priceRangeMax: 24000,
    cbmPerUnit: 2.5,
    weightKg: 8.0,
    hsCode: '8206.00',
    originCountry: 'VN',
  }, sellerJwt);
  step(1, 3, 'Create product 2 (Hardware)', r.status === 201 && !!r.json?.id, `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
  if (r.json?.id) product2Id = r.json.id;
}

{
  const r = await req('GET', '/api/products', null, sellerJwt);
  if (r.status === 200) {
    const items = r.json?.items ?? (Array.isArray(r.json) ? r.json : []);
    const hasP1 = items.some(p => p.id === product1Id);
    const hasP2 = items.some(p => p.id === product2Id);
    step(1, 4, 'List products → both appear with correct data', hasP1 && hasP2,
      `product1Found=${hasP1}, product2Found=${hasP2}, count=${items.length}`);
  } else {
    step(1, 4, 'List products → both appear', false, `status=${r.status}`);
  }
}

{
  if (product1Id) {
    const r = await req('PATCH', `/api/products/${product1Id}`, {
      priceRangeMin: 7500,
      priceRangeMax: 9500,
    }, sellerJwt);
    if (r.status === 200) {
      // Verify update by fetching
      const r2 = await req('GET', `/api/products/${product1Id}`, null, sellerJwt);
      const updated = r2.json?.priceRangeMin === 7500 && r2.json?.priceRangeMax === 9500;
      step(1, 5, 'Edit first product (change price range) → confirm update', updated,
        `priceRangeMin=${r2.json?.priceRangeMin}, priceRangeMax=${r2.json?.priceRangeMax}`);
    } else {
      step(1, 5, 'Edit first product (change price range)', false, `status=${r.status}: ${JSON.stringify(r.json)}`);
    }
  } else {
    step(1, 5, 'Edit first product (change price range)', false, 'product1Id not set');
  }
}

// ─── JOURNEY 2: Buyer discovery and price isolation ───────────────────────────
console.log('\n══ Journey 2: Buyer discovery and price isolation ══');

let buyerJwt, buyerId;

{
  const r = await req('POST', '/api/auth/register', {
    email: `uat_buyer${ts}@test.com`,
    password: 'UatPassword1!',
    role: 'buyer',
    companyName: 'UAT Buyer Inc',
  });
  step(2, 1, 'Register as new buyer', r.status === 201 && !!r.json?.user?.id, `status=${r.status}`);
  if (r.json?.token) { buyerJwt = r.json.token; buyerId = r.json.user.id; }
}

{
  const r = await req('POST', '/api/auth/login', {
    email: `uat_buyer${ts}@test.com`,
    password: 'UatPassword1!',
  });
  step(2, 2, 'Login → get JWT', r.status === 200 && !!r.json?.token, `status=${r.status}`);
  if (r.json?.token) buyerJwt = r.json.token;
}

{
  const r = await req('GET', '/api/products', null, buyerJwt);
  if (r.status === 200) {
    const items = r.json?.items ?? (Array.isArray(r.json) ? r.json : []);
    // Seller's products should appear in buyer's catalog
    const hasAnyProduct = items.length > 0;
    step(2, 3, 'Browse catalog → products appear', hasAnyProduct, `found ${items.length} products`);
  } else {
    step(2, 3, 'Browse catalog → products appear', false, `status=${r.status}`);
  }
}

{
  const r = await req('GET', '/api/products', null, buyerJwt);
  if (r.status === 200) {
    const jsonStr = JSON.stringify(r.json);
    const hasPriceUsdCents = jsonStr.includes('"priceUsdCents"');
    step(2, 4, '*** Assert: response JSON has NO priceUsdCents [CRITICAL PRICE ISOLATION]',
      !hasPriceUsdCents,
      hasPriceUsdCents ? 'SECURITY BUG: priceUsdCents exposed to buyer!' : '');
  } else {
    step(2, 4, '*** Assert: no priceUsdCents in buyer response', false, `status=${r.status}`);
  }
}

{
  const r = await req('GET', '/api/products', null, buyerJwt);
  if (r.status === 200) {
    const jsonStr = JSON.stringify(r.json);
    const hasMin = jsonStr.includes('"priceRangeMin"');
    const hasMax = jsonStr.includes('"priceRangeMax"');
    step(2, 5, 'Assert: response HAS priceRangeMin and priceRangeMax',
      hasMin && hasMax, `priceRangeMin=${hasMin}, priceRangeMax=${hasMax}`);
  } else {
    step(2, 5, 'Assert: price range fields present', false, `status=${r.status}`);
  }
}

// ─── JOURNEY 3: Full order lifecycle ──────────────────────────────────────────
console.log('\n══ Journey 3: Full order lifecycle ══');

// NOTE: POs are created with status='draft'. Lifecycle:
//   draft (buyer) → submitted (buyer) → acknowledged (seller) → confirmed (seller)
let orderId;

{
  if (!product1Id || !product2Id || !sellerId) {
    step(3, 1, 'Buyer creates PO with 2 line items', false, 'prerequisites missing (product/seller IDs)');
  } else {
    const r = await req('POST', '/api/orders', {
      sellerId,
      items: [
        { productId: product1Id, quantity: 5 },
        { productId: product2Id, quantity: 2 },
      ],
      notes: 'UAT Journey 3 PO',
      shippingTerms: 'FOB',
      portOfLoading: 'Ho Chi Minh City',
      portOfDischarge: 'Los Angeles',
    }, buyerJwt);
    step(3, 1, 'Buyer creates PO with 2 line items', r.status === 201 && !!r.json?.id,
      `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
    if (r.json?.id) orderId = r.json.id;
  }
}

{
  if (orderId) {
    const r = await req('GET', `/api/orders/${orderId}`, null, buyerJwt);
    // PO starts as 'draft', version 1
    const correctStatus = r.json?.status === 'draft';
    step(3, 2, "Assert: PO status = 'draft', currentVersion = 1",
      r.status === 200 && correctStatus && r.json?.currentVersion === 1,
      `status=${r.json?.status}, version=${r.json?.currentVersion}`);
  } else {
    step(3, 2, "Assert: PO status = 'draft'", false, 'orderId not set');
  }
}

// Buyer submits: draft → submitted
{
  if (orderId) {
    const r = await req('PATCH', `/api/orders/${orderId}/status`, {
      status: 'submitted', changeReason: 'UAT: buyer submits',
    }, buyerJwt);
    // This is a prerequisite step; we count it as a step too
    step(3, 2.5, "Buyer advances draft → submitted (prerequisite)",
      r.status === 200, `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
  }
}

{
  if (orderId) {
    const r = await req('GET', '/api/orders', null, sellerJwt);
    const orders = Array.isArray(r.json) ? r.json : [];
    const found = orders.some(o => o.id === orderId);
    step(3, 3, 'Seller: GET orders → finds the PO', found, `found=${found}, count=${orders.length}`);
  } else {
    step(3, 3, 'Seller: GET orders → finds the PO', false, 'orderId not set');
  }
}

{
  if (orderId) {
    const r = await req('PATCH', `/api/orders/${orderId}/status`, {
      status: 'acknowledged',
      changeReason: 'UAT: order reviewed',
    }, sellerJwt);
    step(3, 4, "Seller: advances status to 'acknowledged'",
      r.status === 200, `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
  } else {
    step(3, 4, "Seller: advances to 'acknowledged'", false, 'orderId not set');
  }
}

{
  if (orderId) {
    const r = await req('PATCH', `/api/orders/${orderId}/status`, {
      status: 'confirmed',
      changeReason: 'UAT: order confirmed',
    }, sellerJwt);
    step(3, 5, "Seller: advances to 'confirmed'",
      r.status === 200, `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
  } else {
    step(3, 5, "Seller: advances to 'confirmed'", false, 'orderId not set');
  }
}

{
  if (orderId) {
    const r = await req('GET', `/api/orders/${orderId}`, null, buyerJwt);
    step(3, 6, "Buyer: GET order → status = 'confirmed'",
      r.status === 200 && r.json?.status === 'confirmed',
      `status=${r.json?.status}`);
  } else {
    step(3, 6, "Buyer: GET order → status = 'confirmed'", false, 'orderId not set');
  }
}

const costInput = {
  goodsFobCents: 100000,
  freightCents: 15000,
  insuranceCents: 2000,
  customsDutyCents: 8000,
  portHandlingCents: 3000,
  otherCents: 500,
  currency: 'USD',
  notes: 'UAT cost breakdown',
};
const expectedTotal = 100000 + 15000 + 2000 + 8000 + 3000 + 500; // 128500

{
  if (orderId) {
    const r = await req('POST', `/api/costs/${orderId}`, costInput, sellerJwt);
    step(3, 7, 'Seller: enters cost breakdown (FOB + freight + duties)',
      r.status === 201 && !!r.json?.id, `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
  } else {
    step(3, 7, 'Seller: enters cost breakdown', false, 'orderId not set');
  }
}

{
  if (orderId) {
    const r = await req('GET', `/api/costs/${orderId}`, null, buyerJwt);
    const correctTotal = r.json?.totalLandedCents === expectedTotal;
    step(3, 8, `Buyer: GET /api/costs/:poId → verifies totalLandedCents = ${expectedTotal}`,
      r.status === 200 && correctTotal,
      `totalLandedCents=${r.json?.totalLandedCents}, expected=${expectedTotal}`);
  } else {
    step(3, 8, 'Buyer: GET costs', false, 'orderId not set');
  }
}

// ─── JOURNEY 4: Container simulation ─────────────────────────────────────────
console.log('\n══ Journey 4: Container simulation ══');

// Expected CBM: product1 cbmPerUnit=0.8 * qty=5 + product2 cbmPerUnit=2.5 * qty=2
// = 4.0 + 5.0 = 9.0
const expectedTotalCBM = 9.0;
const CONTAINER_40FT = 67.3;
const expectedContainersNeeded = expectedTotalCBM / CONTAINER_40FT;

let simResult;

{
  if (orderId) {
    const r = await req('POST', `/api/container/${orderId}/simulate`, {
      containerType: '40ft',
    }, buyerJwt);
    if (r.status === 200 && r.json?.simulation) {
      simResult = r.json.simulation;
      step(4, 2, `Assert: totalCBM = ${expectedTotalCBM}`,
        Math.abs(simResult.totalCBM - expectedTotalCBM) < 0.001,
        `totalCBM=${simResult.totalCBM}, expected=${expectedTotalCBM}`);
    } else {
      step(4, 2, 'Buyer calls POST /api/container/:poId/simulate', false,
        `status=${r.status}: ${JSON.stringify(r.json).slice(0,150)}`);
    }
  } else {
    step(4, 2, 'Container simulation', false, 'orderId not set');
  }
}

{
  if (simResult) {
    const actualContainers = simResult.containersNeeded;
    const diff = Math.abs(actualContainers - expectedContainersNeeded);
    step(4, 4, `Assert: containersNeeded ≈ ${expectedContainersNeeded.toFixed(4)}`,
      diff < 0.01, `containersNeeded=${actualContainers}`);
  } else {
    step(4, 4, 'Assert: containersNeeded is correct', false, 'no sim result');
  }
}

{
  if (orderId) {
    const r = await req('GET', `/api/container/${orderId}`, null, buyerJwt);
    const loads = Array.isArray(r.json) ? r.json : [];
    step(4, 5, 'Assert: result is saved (GET /api/container/:poId → non-empty)',
      r.status === 200 && loads.length > 0,
      `status=${r.status}, count=${loads.length}`);
  } else {
    step(4, 5, 'Assert: result is saved', false, 'orderId not set');
  }
}

// ─── JOURNEY 5: Version history and audit ────────────────────────────────────
console.log('\n══ Journey 5: Version history and audit ══');

{
  if (orderId) {
    const r = await req('GET', `/api/orders/${orderId}/versions`, null, buyerJwt);
    if (r.status === 200) {
      const versions = Array.isArray(r.json) ? r.json : [];
      // 4 versions: draft (created), submitted, acknowledged, confirmed
      step(5, 2, 'Assert: ≥3 versions exist (created + status transitions)',
        versions.length >= 3, `found ${versions.length} versions`);

      if (versions.length > 0) {
        const hasSnapshot = versions.every(v => v.snapshot !== undefined);
        const hasChangedBy = versions.every(v => v.changedBy !== undefined);
        const hasVersionNumber = versions.every(v => v.versionNumber !== undefined);
        step(5, 3, 'Assert: each version has snapshot, changedBy, versionNumber',
          hasSnapshot && hasChangedBy && hasVersionNumber,
          `snapshot=${hasSnapshot}, changedBy=${hasChangedBy}, versionNumber=${hasVersionNumber}, sample=${JSON.stringify(versions[0]).slice(0,200)}`);
      } else {
        step(5, 3, 'Assert: version fields', false, 'no versions found');
      }
    } else {
      step(5, 2, 'Buyer fetches GET /api/orders/:poId/versions', false, `status=${r.status}`);
      step(5, 3, 'Assert: each version has snapshot, changedBy, versionNumber', false, 'could not fetch versions');
    }
  } else {
    step(5, 2, 'Version history', false, 'orderId not set');
    step(5, 3, 'Version fields', false, 'orderId not set');
  }
}

// ─── SUMMARY ──────────────────────────────────────────────────────────────────
const total = totalPassed + totalFailed;
console.log(`\n${'═'.repeat(50)}`);
console.log(`Part 3 (UAT) Results: ${totalPassed}/${total} passed`);
if (totalFailed > 0) console.log(`  ✗ ${totalFailed} step(s) FAILED`);
console.log(`${'═'.repeat(50)}\n`);

process.exit(totalFailed > 0 ? 1 : 0);
