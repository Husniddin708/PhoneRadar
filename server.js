const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'phones.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Helper: Read phones database
function readPhonesDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading phones database:', err);
    return [];
  }
}

// Helper: Write phones database
function writePhonesDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing phones database:', err);
    return false;
  }
}

// ====================================================================
// REST API ROUTES
// ====================================================================

/**
 * 1. GET /api/phones/search-suggestions
 * Instant live autocomplete suggestions as user types
 */
app.get('/api/phones/search-suggestions', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  if (!query) {
    return res.json([]);
  }

  const phones = readPhonesDB();
  const cleanQ = query.replace(/\s+/g, '');

  const suggestions = phones.filter(phone => {
    const allText = [
      phone.name,
      phone.brand,
      phone.badge,
      phone.performanceHardware.chipset,
      phone.camera.mainSensor.mp,
      phone.quickSpecs.battery
    ].join(' ').toLowerCase();

    const allTextClean = allText.replace(/\s+/g, '');

    return allText.includes(query) || allTextClean.includes(cleanQ);
  }).slice(0, 6).map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    image: p.image,
    priceEstimateUZS: p.priceEstimateUZS,
    priceEstimateUSD: p.priceEstimateUSD,
    badge: p.badge,
    quickCamera: p.quickSpecs.mainCamera,
    rating: p.rating
  }));

  res.json(suggestions);
});

/**
 * 2. GET /api/phones
 * Comprehensive search, filter, and sort
 */
app.get('/api/phones', (req, res) => {
  let phones = readPhonesDB();
  const {
    q,
    search,
    brand,
    category,
    minPrice,
    maxPrice,
    hasIp68,
    hasOis,
    sort
  } = req.query;

  const searchQuery = (q || search || '').trim().toLowerCase();

  // Filter: Search across all relevant hardware fields (Smart Token & Space-insensitive matching)
  if (searchQuery) {
    const cleanQ = searchQuery.replace(/\s+/g, '');
    const tokens = searchQuery.split(/\s+/).filter(Boolean);

    phones = phones.filter(p => {
      const allText = [
        p.name,
        p.brand,
        p.badge,
        p.performanceHardware.chipset,
        p.camera.mainSensor.mp,
        p.camera.overview,
        p.quickSpecs.mainCamera,
        p.battery.capacity,
        p.battery.wiredCharging,
        p.display.type,
        p.display.peakBrightness,
        p.bodyAndBuild.waterResistance
      ].join(' ').toLowerCase();

      const allTextClean = allText.replace(/\s+/g, '');

      // Direct clean match (e.g. "200mp" matches "200 mp", "s24ultra" matches "s24 ultra")
      if (allTextClean.includes(cleanQ)) return true;

      // Or all words/tokens present
      return tokens.every(token => allText.includes(token) || allTextClean.includes(token));
    });
  }

  // Filter: Brand
  if (brand && brand !== 'all') {
    phones = phones.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Filter: Category
  if (category && category !== 'all') {
    phones = phones.filter(p => p.category === category);
  }

  // Filter: Price range
  if (minPrice) {
    phones = phones.filter(p => p.priceEstimateUSD >= parseFloat(minPrice));
  }
  if (maxPrice) {
    phones = phones.filter(p => p.priceEstimateUSD <= parseFloat(maxPrice));
  }

  // Filter: IP68
  if (hasIp68 === 'true' || hasIp68 === true) {
    phones = phones.filter(p => p.bodyAndBuild.waterResistance.includes('IP68'));
  }

  // Filter: OIS
  if (hasOis === 'true' || hasOis === true) {
    phones = phones.filter(p => p.camera.mainSensor.ois.includes('OIS'));
  }

  // Sort
  if (sort) {
    switch (sort) {
      case 'rating-desc':
        phones.sort((a, b) => b.hardwareScores.overall - a.hardwareScores.overall);
        break;
      case 'camera-desc':
        phones.sort((a, b) => b.hardwareScores.camera - a.hardwareScores.camera);
        break;
      case 'battery-desc':
        phones.sort((a, b) => b.hardwareScores.battery - a.hardwareScores.battery);
        break;
      case 'price-asc':
        phones.sort((a, b) => a.priceEstimateUSD - b.priceEstimateUSD);
        break;
      case 'price-desc':
        phones.sort((a, b) => b.priceEstimateUSD - a.priceEstimateUSD);
        break;
      case 'newest':
        phones.sort((a, b) => b.releaseYear - a.releaseYear);
        break;
      default:
        break;
    }
  }

  res.json({
    total: phones.length,
    data: phones
  });
});

/**
 * 3. GET /api/phones/:id
 * Single phone detailed hardware
 */
app.get('/api/phones/:id', (req, res) => {
  const phones = readPhonesDB();
  const phone = phones.find(p => p.id === req.params.id);
  if (!phone) {
    return res.status(404).json({ error: 'Telefon topilmadi' });
  }
  res.json(phone);
});

/**
 * 4. GET /api/compare
 * Compare multiple phones side-by-side
 */
app.get('/api/compare', (req, res) => {
  const ids = (req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    return res.status(400).json({ error: 'Taqqoslash uchun hech qanday ID berilmadi' });
  }

  const phones = readPhonesDB();
  const compared = ids.map(id => phones.find(p => p.id === id)).filter(Boolean);

  res.json(compared);
});

/**
 * 5. POST /api/advisor
 * Server-side smart quiz matcher
 */
app.post('/api/advisor', (req, res) => {
  const { budget, priority, brand } = req.body;
  const phones = readPhonesDB();

  let minPrice = 0;
  let maxPrice = 99999;
  if (budget === 'budget-entry') {
    minPrice = 200;
    maxPrice = 490;
  } else if (budget === 'budget-mid') {
    minPrice = 450;
    maxPrice = 900;
  } else if (budget === 'budget-premium') {
    minPrice = 900;
    maxPrice = 99999;
  }

  let candidates = phones.filter(p => p.priceEstimateUSD >= minPrice && p.priceEstimateUSD <= maxPrice);

  if (brand === 'brand-apple') {
    const apples = candidates.filter(p => p.brand === 'Apple');
    if (apples.length > 0) candidates = apples;
  } else if (brand === 'brand-samsung') {
    const sams = candidates.filter(p => p.brand === 'Samsung');
    if (sams.length > 0) candidates = sams;
  } else if (brand === 'brand-xiaomi') {
    const xiaomis = candidates.filter(p => ['Xiaomi', 'OnePlus', 'Poco'].includes(p.brand));
    if (xiaomis.length > 0) candidates = xiaomis;
  }

  if (candidates.length === 0) {
    candidates = [...phones];
  }

  candidates.sort((a, b) => {
    if (priority === 'priority-camera') {
      return b.hardwareScores.camera - a.hardwareScores.camera;
    } else if (priority === 'priority-gaming') {
      return b.hardwareScores.performance - a.hardwareScores.performance;
    } else if (priority === 'priority-battery') {
      return b.hardwareScores.battery - a.hardwareScores.battery;
    } else if (priority === 'priority-durability') {
      return b.hardwareScores.durability - a.hardwareScores.durability;
    }
    return b.hardwareScores.overall - a.hardwareScores.overall;
  });

  res.json({
    recommended: candidates[0],
    alternatives: candidates.slice(1, 3)
  });
});

/**
 * 6. POST /api/phones/:id/reviews
 * Add user review to phone
 */
app.post('/api/phones/:id/reviews', (req, res) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !comment) {
    return res.status(400).json({ error: 'Ism va sharh matni to\'ldirilishi shart' });
  }

  const phones = readPhonesDB();
  const phone = phones.find(p => p.id === req.params.id);
  if (!phone) {
    return res.status(404).json({ error: 'Telefon topilmadi' });
  }

  if (!phone.reviews) {
    phone.reviews = [];
  }

  const newReview = {
    id: 'rev-' + Date.now(),
    userName: userName.trim(),
    rating: parseInt(rating) || 5,
    date: new Date().toISOString().split('T')[0],
    comment: comment.trim()
  };

  phone.reviews.unshift(newReview);
  writePhonesDB(phones);

  res.status(201).json({ success: true, review: newReview });
});

/**
 * 7. POST /api/phones (Admin: Add Phone)
 */
app.post('/api/phones', (req, res) => {
  const newPhone = req.body;
  if (!newPhone.name || !newPhone.brand) {
    return res.status(400).json({ error: 'Model nomi va brend to\'ldirilishi shart' });
  }

  const phones = readPhonesDB();
  const idSlug = (newPhone.id || newPhone.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
  newPhone.id = idSlug;

  // Defaults if missing
  newPhone.rating = newPhone.rating || 9.0;
  newPhone.hardwareScores = newPhone.hardwareScores || {
    overall: 90,
    camera: 90,
    battery: 90,
    display: 90,
    performance: 90,
    durability: 90
  };
  newPhone.reviews = newPhone.reviews || [];

  phones.unshift(newPhone);
  writePhonesDB(phones);

  res.status(201).json({ success: true, phone: newPhone });
});

/**
 * 8. PUT /api/phones/:id (Admin: Edit Phone)
 */
app.put('/api/phones/:id', (req, res) => {
  const phones = readPhonesDB();
  const idx = phones.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Telefon topilmadi' });
  }

  phones[idx] = { ...phones[idx], ...req.body };
  writePhonesDB(phones);

  res.json({ success: true, phone: phones[idx] });
});

/**
 * 9. DELETE /api/phones/:id (Admin: Delete Phone)
 */
app.delete('/api/phones/:id', (req, res) => {
  const phones = readPhonesDB();
  const filtered = phones.filter(p => p.id !== req.params.id);
  if (filtered.length === phones.length) {
    return res.status(404).json({ error: 'Telefon topilmadi' });
  }

  writePhonesDB(filtered);
  res.json({ success: true, message: 'Telefon bazadan muvaffaqiyatli o\'chirildi' });
});

/**
 * 10. GET /api/stats (Portal Statistics)
 */
app.get('/api/stats', (req, res) => {
  const phones = readPhonesDB();
  const brands = new Set(phones.map(p => p.brand));
  const avgRating = (phones.reduce((acc, p) => acc + (p.rating || 9.0), 0) / (phones.length || 1)).toFixed(1);

  res.json({
    totalPhones: phones.length,
    totalBrands: brands.size,
    averageRating: avgRating,
    brandsList: Array.from(brands)
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`PhoneRadar Fullstack REST API Server running at http://localhost:${PORT}`);
});
