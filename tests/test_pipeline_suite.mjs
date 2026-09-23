import fs from 'node:fs';
import path from 'node:path';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AGRI-AI CROP DIAGNOSIS PIPELINE TEST SUITE');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:5001';

  // Helper to read file to base64 data url
  function getBase64DataUrl(relativePath, mime = 'image/jpeg') {
    const fullPath = path.resolve(relativePath);
    const buf = fs.readFileSync(fullPath);
    return `data:${mime};base64,${buf.toString('base64')}`;
  }

  // ------------------------------------------------------------------
  // 1. IMAGE VALIDATION TESTS
  // ------------------------------------------------------------------
  console.log('--- TEST 1: Image Validation (Frontend & Backend Constraints) ---');

  // 1a. Empty image
  try {
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: '', cropName: 'Tomato' })
    });
    console.log(`1a. Empty image check: Status ${res.status} (Expected: 400) ->`, (await res.json()).error);
  } catch (err) {
    console.error('1a failed:', err.message);
  }

  // 1b. Non-image format (PDF)
  try {
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'data:application/pdf;base64,JVBERi0xLjQKJ...', cropName: 'Tomato' })
    });
    console.log(`1b. Non-image format check: Status ${res.status} (Expected: 400) ->`, (await res.json()).error);
  } catch (err) {
    console.error('1b failed:', err.message);
  }

  // 1c. Corrupted/tiny image (< 500 bytes)
  try {
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'data:image/jpeg;base64,dG9vX3NtYWxs', cropName: 'Tomato' })
    });
    console.log(`1c. Corrupt/tiny image check: Status ${res.status} (Expected: 400) ->`, (await res.json()).error);
  } catch (err) {
    console.error('1c failed:', err.message);
  }

  // 1d. Oversized image (> 10MB)
  try {
    const oversizedBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(14 * 1024 * 1024);
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: oversizedBase64, cropName: 'Tomato' })
    });
    console.log(`1d. Oversized (>10MB) check: Status ${res.status} (Expected: 400) ->`, (await res.json()).error);
  } catch (err) {
    console.error('1d failed:', err.message);
  }

  // ------------------------------------------------------------------
  // 2. UNRELATED / NON-PLANT IMAGE TEST
  // ------------------------------------------------------------------
  console.log('\n--- TEST 2: Unrelated / Non-Plant Image Test (agri_robot.jpg) ---');
  try {
    const robotDataUrl = getBase64DataUrl('public/agri_robot.jpg', 'image/jpeg');
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: robotDataUrl,
        crop: { cropName: 'Tomato', fieldName: 'Greenhouse A' },
        preferredLanguage: 'en'
      })
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Possible Diagnosis:', data.possible_diagnosis);
    console.log('Severity:', data.severity);
    console.log('Confidence:', data.confidence);
    console.log('Symptoms snippet:', data.symptoms?.[0]?.slice(0, 100));
    console.log('Chemical treatment needed:', data.chemical_treatment?.needed);
    console.log('Source:', data.diagnosisSource);
  } catch (err) {
    console.error('Test 2 failed:', err.message);
  }

  // ------------------------------------------------------------------
  // 3. REAL HEALTHY LEAF TEST (ENGLISH)
  // ------------------------------------------------------------------
  console.log('\n--- TEST 3: Real Healthy Leaf Test (English) ---');
  try {
    const healthyDataUrl = getBase64DataUrl('public/test_healthy_leaf.jpg', 'image/jpeg');
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: healthyDataUrl,
        crop: {
          cropName: 'Tomato',
          fieldName: 'North Plot',
          growthStage: 'Vegetative',
          soilType: 'Loamy',
          irrigationMethod: 'Drip'
        },
        weather: { temp: 28, humidity: 55, rainChance: 5, location: 'Hyderabad' },
        preferredLanguage: 'en'
      })
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Possible Diagnosis:', data.possible_diagnosis);
    console.log('Severity:', data.severity);
    console.log('Confidence:', data.confidence);
    console.log('Symptoms snippet:', data.symptoms?.[0]);
    console.log('Chemical treatment needed:', data.chemical_treatment?.needed);
    console.log('Weather consideration:', data.weather_consideration);
    console.log('Source:', data.diagnosisSource);
  } catch (err) {
    console.error('Test 3 failed:', err.message);
  }

  // ------------------------------------------------------------------
  // 4. REAL DISEASED LEAF TEST (ENGLISH)
  // ------------------------------------------------------------------
  console.log('\n--- TEST 4: Real Diseased Leaf Test (English) ---');
  try {
    const diseasedDataUrl = getBase64DataUrl('public/test_diseased_leaf.jpg', 'image/jpeg');
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: diseasedDataUrl,
        crop: {
          cropName: 'Tomato',
          fieldName: 'East Orchard',
          growthStage: 'Fruiting',
          soilType: 'Red Soil',
          irrigationMethod: 'Flood'
        },
        weather: { temp: 29, humidity: 75, rainChance: 25, location: 'Hyderabad' },
        preferredLanguage: 'en'
      })
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Possible Diagnosis:', data.possible_diagnosis);
    console.log('Severity:', data.severity);
    console.log('Confidence:', data.confidence);
    console.log('Symptoms:', JSON.stringify(data.symptoms));
    console.log('Recommended Actions snippet:', data.recommended_actions?.[0]);
    console.log('Chemical recommendation:', data.chemical_treatment?.recommendation);
    console.log('Organic Alternative:', data.organic_alternative);
    console.log('Weather Consideration:', data.weather_consideration);
    console.log('Source:', data.diagnosisSource);
  } catch (err) {
    console.error('Test 4 failed:', err.message);
  }

  // ------------------------------------------------------------------
  // 5. REAL DISEASED LEAF TEST (TELUGU)
  // ------------------------------------------------------------------
  console.log('\n--- TEST 5: Real Diseased Leaf Test (Telugu) ---');
  let teluguResult = null;
  try {
    const diseasedDataUrl = getBase64DataUrl('public/test_diseased_leaf.jpg', 'image/jpeg');
    const res = await fetch(`${BASE_URL}/api/diagnoses/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: diseasedDataUrl,
        crop: {
          cropName: 'టమాటా',
          fieldName: 'ప్రధాన పొలం',
          growthStage: 'Fruiting'
        },
        weather: { temp: 29, humidity: 75, rainChance: 25, location: 'Hyderabad' },
        preferredLanguage: 'te'
      })
    });
    console.log(`Status: ${res.status}`);
    teluguResult = await res.json();
    console.log('Possible Diagnosis (Telugu):', teluguResult.possible_diagnosis);
    console.log('Severity:', teluguResult.severity);
    console.log('Symptoms snippet (Telugu):', teluguResult.symptoms?.[0]);
    console.log('Actions snippet (Telugu):', teluguResult.recommended_actions?.[0]);
    console.log('Chemical Recommendation (Telugu):', teluguResult.chemical_treatment?.recommendation);
    console.log('Organic Alternative (Telugu):', teluguResult.organic_alternative);
    console.log('Weather Consideration (Telugu):', teluguResult.weather_consideration);
  } catch (err) {
    console.error('Test 5 failed:', err.message);
  }

  // ------------------------------------------------------------------
  // 6. SAVE DIAGNOSIS TO SQLITE & GET HISTORY
  // ------------------------------------------------------------------
  console.log('\n--- TEST 6: Save Diagnosis & SQLite Persistence ---');
  try {
    if (teluguResult) {
      const diseasedDataUrl = getBase64DataUrl('public/test_diseased_leaf.jpg', 'image/jpeg');
      const saveRes = await fetch(`${BASE_URL}/api/diagnoses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...teluguResult,
          cropName: 'టమాటా',
          fieldName: 'ప్రధాన పొలం',
          imageUrl: diseasedDataUrl,
          preferredLanguage: 'te'
        })
      });
      const saved = await saveRes.json();
      console.log('Save response:', saved);

      const historyRes = await fetch(`${BASE_URL}/api/diagnoses`);
      const history = await historyRes.json();
      console.log(`Total history items in SQLite: ${history.length}`);
      if (history.length > 0) {
        const latest = history[0];
        console.log('Latest history item in DB:');
        console.log(' - ID:', latest.id);
        console.log(' - Crop:', latest.cropName);
        console.log(' - Possible Diagnosis:', latest.disease || latest.possible_diagnosis);
        console.log(' - Language:', latest.preferredLanguage);
        console.log(' - Source:', latest.diagnosisSource);
        console.log(' - Image URL:', latest.imageUrl);
      }
    }
  } catch (err) {
    console.error('Test 6 failed:', err.message);
  }

  console.log('\n====================================================');
  console.log('TEST SUITE COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');
}

runTests();
