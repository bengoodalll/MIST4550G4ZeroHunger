import { foodWasteData } from './data/food-waste-2022.js';
import { stuntingData } from './data/child-stunting.js';
import { undernourishmentData } from './data/undernourishment-world.js';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
const WORLD_GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson';
const IMAGE_PARAMS = '?auto=format&fit=crop&w=900&q=80';

const foodByRegion = new Map(foodWasteData.map(d => [d.region, {
  ...d,
  total: d.household + d.outOfHome + d.retail,
}]));
const stuntingByRegion = new Map(stuntingData.map(d => [d.region, d.rate]));

const global2000 = undernourishmentData.find(d => d.year === 2000)?.value ?? 12.7;
const global2020 = undernourishmentData.find(d => d.year === 2020)?.value ?? 8.8;
const global2024 = undernourishmentData.find(d => d.year === 2024)?.value ?? 8.2;

const REGIONS = [
  {
    id: 'sub-saharan-africa',
    name: 'Sub-Saharan Africa',
    color: '#E8A33D',
    anchor: { lat: -7, lon: 24 },
    zones: [{ lat: -8, lon: 23, latRadius: 38, lonRadius: 38 }],
    foodRegion: 'Sub-Saharan Africa',
    stuntingRegions: ['Sub-Saharan Africa'],
    image: `https://images.unsplash.com/photo-1553775927-a071d5a6a39a${IMAGE_PARAMS}`,
    imageAlt: 'Agricultural field used as a visual cue for Sub-Saharan Africa',
    summary: 'The sharpest regional warning in the chart set: high food waste and nearly 1 in 3 children affected by stunting.',
    notes: [
      'Limited refrigeration, long and fragile supply chains, and heat accelerate spoilage.',
      'The food-waste chart links infrastructure investment directly to getting food from farms to people.',
      'This is one of the regions where global averages hide the severity of child malnutrition.',
    ],
  },
  {
    id: 'oceania',
    name: 'Oceania',
    color: '#8FAE5A',
    anchor: { lat: -5, lon: 166 },
    zones: [
      { lat: -4, lon: 166, latRadius: 27, lonRadius: 34 },
      { lat: 6, lon: -160, latRadius: 18, lonRadius: 28 },
    ],
    foodRegion: 'Oceania',
    stuntingRegions: [],
    image: `https://images.unsplash.com/photo-1645539520055-113fc613d503${IMAGE_PARAMS}`,
    imageAlt: 'Island and agricultural landscape used as a visual cue for Oceania',
    summary: 'Oceania ranks near the top of the food-waste chart, driven mostly by household waste.',
    notes: [
      'The charted food-waste total is second only to Sub-Saharan Africa.',
      'Household waste is the dominant category, which makes storage, planning, and distribution behavior central.',
      'The child-stunting chart does not break out Oceania, so this region uses the food-waste facts from the chart set.',
    ],
  },
  {
    id: 'north-africa-west-asia',
    name: 'N. Africa & W. Asia',
    color: '#D57A46',
    anchor: { lat: 28, lon: 31 },
    zones: [{ lat: 28, lon: 31, latRadius: 18, lonRadius: 51 }],
    foodRegion: 'N. Africa & W. Asia',
    stuntingRegions: [],
    image: `https://images.unsplash.com/photo-1759390133291-88b21978d5f2${IMAGE_PARAMS}`,
    imageAlt: 'Dryland farming landscape used as a visual cue for North Africa and Western Asia',
    summary: 'This region has one of the higher food-waste totals and the highest retail waste figure in the food-waste chart.',
    notes: [
      'Retail waste reaches 25 kg per capita per year, the largest retail value in the regional food-waste chart.',
      'Food-price volatility matters here because energy, transport, and political instability feed directly into food costs.',
      'The stunting chart does not list this combined region, so the globe keeps the regional panel tied to the waste and price facts.',
    ],
  },
  {
    id: 'latin-america-caribbean',
    name: 'Latin America & Caribbean',
    color: '#C85F55',
    anchor: { lat: -13, lon: -70 },
    zones: [
      { lat: -18, lon: -63, latRadius: 43, lonRadius: 34 },
      { lat: 17, lon: -82, latRadius: 13, lonRadius: 31 },
    ],
    foodRegion: 'Latin America & Caribbean',
    stuntingRegions: ['Latin America & Caribbean'],
    image: `https://images.unsplash.com/photo-1663168883715-8e441675d216${IMAGE_PARAMS}`,
    imageAlt: 'Farm landscape used as a visual cue for Latin America and the Caribbean',
    summary: 'Food waste is high, and the child-stunting chart shows a mid-range but still serious malnutrition burden.',
    notes: [
      'Out-of-home waste is 33 kg per capita per year, one of the larger out-of-home values in the chart.',
      'Stunting at 12.1% is far below the highest-burden regions, but it still affects more than 1 in 10 children.',
      'The region illustrates why food-system progress cannot be measured by global averages alone.',
    ],
  },
  {
    id: 'europe-north-america',
    name: 'Europe & N. America',
    color: '#6FA8A0',
    anchor: { lat: 44, lon: -82 },
    zones: [
      { lat: 48, lon: 12, latRadius: 23, lonRadius: 34 },
      { lat: 43, lon: -102, latRadius: 32, lonRadius: 66 },
    ],
    foodRegion: 'Europe & N. America',
    stuntingRegions: ['Europe Region', 'Northern America'],
    image: `https://images.unsplash.com/photo-1500382017468-9049fed747ef${IMAGE_PARAMS}`,
    imageAlt: 'Wheat field used as a visual cue for Europe and Northern America',
    summary: 'The chart set shows lower child-stunting rates, but food waste remains substantial in wealthy economies.',
    notes: [
      'Out-of-home waste is 44 kg per capita per year, the highest out-of-home value in the food-waste chart.',
      'Europe Region and Northern America stunting rates are an order of magnitude lower than the highest-burden regions.',
      'The action section calls out household waste as a changeable behavior in wealthy economies.',
    ],
  },
  {
    id: 'eastern-se-asia',
    name: 'Eastern & SE Asia',
    color: '#D1B84F',
    anchor: { lat: 18, lon: 110 },
    zones: [
      { lat: 27, lon: 112, latRadius: 34, lonRadius: 42 },
      { lat: 0, lon: 113, latRadius: 16, lonRadius: 28 },
    ],
    foodRegion: 'Eastern & SE Asia',
    stuntingRegions: ['Eastern & SE Asia'],
    image: `https://images.unsplash.com/photo-1561504936-9ee23110af37${IMAGE_PARAMS}`,
    imageAlt: 'Rice field used as a visual cue for Eastern and Southeast Asia',
    summary: 'Food waste is concentrated in households, while child stunting remains above the lowest-burden regions.',
    notes: [
      "Household waste is 83 kg per capita per year, the largest part of this region's waste total.",
      'The stunting rate is 12.6%, close to Latin America and the Caribbean in the child-stunting chart.',
      'The region sits between the lowest and highest stunting burdens, showing how uneven progress can be.',
    ],
  },
  {
    id: 'central-southern-asia',
    name: 'Central & Southern Asia',
    color: '#B88D54',
    anchor: { lat: 24, lon: 75 },
    zones: [{ lat: 24, lon: 75, latRadius: 23, lonRadius: 25 }],
    foodRegion: 'Central & Southern Asia',
    stuntingRegions: ['Southern Asia'],
    image: `https://images.unsplash.com/photo-1558388556-2261d4cc1938${IMAGE_PARAMS}`,
    imageAlt: 'Rice field used as a visual cue for Central and Southern Asia',
    summary: 'The food-waste total is lower than several regions, but Southern Asia has one of the highest stunting rates.',
    notes: [
      'Southern Asia is nearly tied with Sub-Saharan Africa in the child-stunting chart.',
      'The chart shows almost 1 in 3 children affected by long-term malnutrition in Southern Asia.',
      'This is the clearest example that lower waste totals do not mean lower nutrition risk.',
    ],
  },
  {
    id: 'australia-new-zealand',
    name: 'Australia & New Zealand',
    color: '#79A7CF',
    anchor: { lat: -31, lon: 139 },
    zones: [
      { lat: -28, lon: 137, latRadius: 23, lonRadius: 30 },
      { lat: -42, lon: 173, latRadius: 9, lonRadius: 13 },
    ],
    foodRegion: 'Australia & New Zealand',
    stuntingRegions: [],
    image: `https://images.unsplash.com/photo-1509259305526-037fbbf698fa${IMAGE_PARAMS}`,
    imageAlt: 'Farm field used as a visual cue for Australia and New Zealand',
    summary: 'The food-waste chart puts Australia and New Zealand at the same total as Central and Southern Asia, with a different risk profile.',
    notes: [
      'The waste split is led by household waste at 72 kg per capita per year.',
      'Out-of-home waste reaches 33 kg per capita per year, matching Latin America and the Caribbean.',
      'The child-stunting chart does not list this region, so the globe keeps the regional panel tied to food-waste facts.',
    ],
  },
];

const REGION_BY_ID = new Map(REGIONS.map(region => [region.id, region]));
const REGION_INDEX_BY_ID = new Map(REGIONS.map((region, index) => [region.id, index]));

const COUNTRY_REGION_OVERRIDES = new Map([
  ...[
    'Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia', 'W. Sahara',
    'Western Sahara',
    'Armenia', 'Azerbaijan', 'Bahrain', 'Cyprus', 'Georgia', 'Iran', 'Iraq',
    'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine', 'Qatar',
    'Saudi Arabia', 'Syria', 'Turkey', 'United Arab Emirates', 'Yemen',
  ].map(name => [name, 'north-africa-west-asia']),
  ...[
    'Afghanistan', 'Bangladesh', 'Bhutan', 'India', 'Kazakhstan', 'Kyrgyzstan',
    'Nepal', 'Pakistan', 'Sri Lanka', 'Tajikistan', 'Turkmenistan', 'Uzbekistan',
  ].map(name => [name, 'central-southern-asia']),
  ...[
    'China', 'Japan', 'Mongolia', 'North Korea', 'South Korea', 'Taiwan',
    'Myanmar', 'Thailand', 'Laos', 'Vietnam', 'Cambodia', 'Malaysia',
    'Indonesia', 'Philippines', 'Brunei', 'Timor-Leste',
  ].map(name => [name, 'eastern-se-asia']),
  ...[
    'Australia', 'New Zealand',
  ].map(name => [name, 'australia-new-zealand']),
  ...[
    'Papua New Guinea', 'Fiji', 'Solomon Is.', 'Solomon Islands', 'Vanuatu',
    'New Caledonia',
  ].map(name => [name, 'oceania']),
  ...[
    'United States of America', 'Canada', 'Greenland', 'Russia',
  ].map(name => [name, 'europe-north-america']),
]);

export function initRegionalGlobe() {
  const canvas = document.getElementById('regional-globe-canvas');
  const panel = document.getElementById('globe-facts-panel');
  const buttons = Array.from(document.querySelectorAll('.globe-region-controls [data-region]'));
  if (!canvas || !panel || !buttons.length) return;

  const refs = {
    panel,
    name: document.getElementById('globe-region-name'),
    image: document.getElementById('globe-region-image'),
    imageCredit: document.getElementById('globe-region-image-credit'),
    summary: document.getElementById('globe-region-summary'),
    foodWaste: document.getElementById('globe-food-waste'),
    stunting: document.getElementById('globe-stunting'),
    undernourishment: document.getElementById('globe-undernourishment'),
    factList: document.getElementById('globe-fact-list'),
  };

  let activeRegionId = REGIONS[0].id;
  let rotateToRegion = () => {};

  buttons.forEach(button => {
    const region = REGION_BY_ID.get(button.dataset.region);
    if (!region) return;
    button.style.setProperty('--region-color', region.color);
    button.addEventListener('click', () => selectRegion(region.id, true));
  });

  function selectRegion(regionId, shouldRotate = false) {
    const region = REGION_BY_ID.get(regionId);
    if (!region) return;
    activeRegionId = region.id;
    updateFacts(region, refs, buttons);
    if (shouldRotate) rotateToRegion(region);
  }

  selectRegion(activeRegionId, false);
  revealGlobeSection();

  initGlobeScene(canvas, () => activeRegionId, selectRegion)
    .then(api => {
      rotateToRegion = api.rotateToRegion;
      rotateToRegion(REGION_BY_ID.get(activeRegionId));
    })
    .catch(err => {
      console.warn('[globe.js] Three.js globe failed to load:', err);
      canvas.closest('.globe-viewport')?.classList.add('globe-viewport--fallback');
    });
}

function updateFacts(region, refs, buttons) {
  const food = foodByRegion.get(region.foodRegion);
  const stuntingValues = region.stuntingRegions
    .map(name => ({ name, rate: stuntingByRegion.get(name) }))
    .filter(d => typeof d.rate === 'number');

  refs.panel.style.setProperty('--region-color', region.color);
  refs.name.textContent = region.name;
  refs.summary.textContent = region.summary;
  refs.image.src = region.image;
  refs.image.alt = region.imageAlt;
  refs.imageCredit.textContent = 'Photo: Unsplash';
  refs.foodWaste.textContent = food ? `${food.total} kg` : 'Not charted';
  refs.stunting.textContent = formatStuntingStat(stuntingValues);
  refs.undernourishment.textContent = `${global2024}%`;

  refs.factList.replaceChildren();
  getRegionFacts(region, food, stuntingValues).forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    refs.factList.appendChild(li);
  });

  buttons.forEach(button => {
    const active = button.dataset.region === region.id;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const gsap = window.gsap;
  if (gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.fromTo(refs.panel, { y: 16 }, { y: 0, duration: 0.35, ease: 'power2.out' });
  }
}

function getRegionFacts(region, food, stuntingValues) {
  const facts = [];
  if (food) {
    facts.push(`Food waste totals ${food.total} kg per person per year: ${food.household} household, ${food.outOfHome} out-of-home, and ${food.retail} retail.`);
  }
  stuntingValues.forEach(({ name, rate }) => {
    facts.push(`${name} child stunting is ${rate}%, from the UNICEF chart.`);
  });
  facts.push(...region.notes);
  facts.push(`Global undernourishment moved from ${global2000}% in 2000 to ${global2020}% in 2020 and ${global2024}% in 2024, so the 2030 Zero Hunger target remains at risk.`);
  return facts;
}

function formatStuntingStat(values) {
  if (!values.length) return 'Not charted';
  if (values.length === 1) return `${values[0].rate}%`;
  return values.map(({ name, rate }) => {
    if (name === 'Europe Region') return `EU ${rate}%`;
    if (name === 'Northern America') return `NA ${rate}%`;
    return `${rate}%`;
  }).join(' / ');
}

function revealGlobeSection() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gsap || !ScrollTrigger || prefersReduced) return;

  gsap.fromTo('.regional-globe-section .globe-stage', { opacity: 0, y: 36 }, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#regional-globe', start: 'top 70%' },
  });
  gsap.fromTo('.globe-region-controls button', { opacity: 0, y: 12 }, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: 0.04,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.globe-region-controls', start: 'top 86%' },
  });
}

async function initGlobeScene(canvas, getActiveRegionId, selectRegion) {
  const THREE = await import(THREE_URL);
  const d3 = window.d3;
  const landFeatures = await loadWorldFeatures(d3);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewport = canvas.closest('.globe-viewport');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 4.9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const globe = new THREE.Group();
  scene.add(globe);

  const radius = 1.28;
  const dotTexture = createDotTexture(THREE);
  const ringTexture = createRingTexture(THREE);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.955, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x120f0c })
  );
  core.renderOrder = 0;
  globe.add(core);

  const basePoints = new THREE.Points(
    createBaseDotGeometry(THREE, radius, 1650),
    new THREE.PointsMaterial({
      color: 0x4a4034,
      map: dotTexture,
      size: 0.018,
      transparent: true,
      opacity: 0.36,
      alphaTest: 0.25,
      depthWrite: false,
    })
  );
  basePoints.renderOrder = 1;
  globe.add(basePoints);

  const regionalDots = createRegionDotGeometry(THREE, radius, landFeatures, d3);
  const regionPoints = new THREE.Points(
    regionalDots.geometry,
    new THREE.PointsMaterial({
      vertexColors: true,
      map: dotTexture,
      size: window.matchMedia('(max-width: 768px)').matches ? 0.03 : 0.024,
      transparent: true,
      opacity: 0.96,
      alphaTest: 0.2,
      depthWrite: false,
    })
  );
  regionPoints.renderOrder = 2;
  globe.add(regionPoints);

  const marker = new THREE.Sprite(new THREE.SpriteMaterial({
    map: ringTexture,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  }));
  marker.scale.set(0.2, 0.2, 0.2);
  globe.add(marker);

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.075;
  const pointer = new THREE.Vector2();

  let dragging = false;
  let moved = false;
  let lastX = 0;
  let lastY = 0;
  let autoRotate = !prefersReduced;

  function resize() {
    const width = Math.max(1, viewport?.clientWidth || canvas.clientWidth || 640);
    const height = Math.max(1, viewport?.clientHeight || canvas.clientHeight || 520);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pickRegion(event) {
    updatePointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(regionPoints, false);
    if (!hits.length) return null;
    const regionIndex = regionalDots.regionIndices[hits[0].index];
    return REGIONS[regionIndex] ?? null;
  }

  canvas.addEventListener('pointerdown', event => {
    dragging = true;
    moved = false;
    autoRotate = false;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener('pointermove', event => {
    if (dragging) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      moved = moved || Math.abs(dx) + Math.abs(dy) > 4;
      globe.rotation.y += dx * 0.006;
      globe.rotation.x = clamp(globe.rotation.x + dy * 0.0045, -1.12, 1.12);
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }

    const hovered = pickRegion(event);
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  });

  canvas.addEventListener('pointerup', event => {
    canvas.releasePointerCapture?.(event.pointerId);
    dragging = false;
    if (!moved) {
      const picked = pickRegion(event);
      if (picked) selectRegion(picked.id, true);
    }
  });

  canvas.addEventListener('pointerleave', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  });

  window.addEventListener('resize', resize);
  resize();

  function rotateToRegion(region) {
    if (!region) return;
    const targetX = THREE.MathUtils.degToRad(region.anchor.lat) * 0.62;
    const rawTargetY = -THREE.MathUtils.degToRad(region.anchor.lon + 90);
    const targetY = nearestAngle(globe.rotation.y, rawTargetY);
    const targetPosition = latLonToVector(THREE, region.anchor.lat, region.anchor.lon, radius * 1.08);

    marker.position.copy(targetPosition);
    marker.material.color = new THREE.Color(region.color);

    if (window.gsap && !prefersReduced) {
      window.gsap.to(globe.rotation, {
        x: targetX,
        y: targetY,
        duration: 0.9,
        ease: 'power3.out',
      });
    } else {
      globe.rotation.x = targetX;
      globe.rotation.y = targetY;
    }
  }

  function animate() {
    const activeRegion = REGION_BY_ID.get(getActiveRegionId());
    if (activeRegion) {
      marker.position.copy(latLonToVector(THREE, activeRegion.anchor.lat, activeRegion.anchor.lon, radius * 1.08));
      marker.material.color = new THREE.Color(activeRegion.color);
      const worldPosition = marker.position.clone().applyEuler(globe.rotation);
      marker.visible = worldPosition.z > -0.08;
    }

    if (autoRotate && !dragging) globe.rotation.y += 0.0015;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { rotateToRegion };
}

function createBaseDotGeometry(THREE, radius, count) {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

async function loadWorldFeatures(d3) {
  if (!d3?.geoContains || !d3?.geoCentroid || !d3?.geoBounds) return null;

  try {
    const res = await fetch(WORLD_GEOJSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const geo = await res.json();
    if (!Array.isArray(geo.features)) return null;

    const landFeatures = geo.features
      .map(feature => {
        const regionId = classifyCountryFeature(feature, d3);
        const regionIndex = REGION_INDEX_BY_ID.get(regionId);
        if (typeof regionIndex !== 'number') return null;
        return {
          feature,
          regionIndex,
          bounds: d3.geoBounds(feature),
        };
      })
      .filter(Boolean);

    return landFeatures.length ? landFeatures : null;
  } catch (err) {
    console.warn('[globe.js] Falling back to regional dot zones:', err.message);
    return null;
  }
}

function classifyCountryFeature(feature, d3) {
  const name = feature.properties?.name;
  if (!name || name === 'Antarctica' || name === 'Fr. S. Antarctic Lands') return null;

  const override = COUNTRY_REGION_OVERRIDES.get(name);
  if (override) return override;

  const [lon, lat] = d3.geoCentroid(feature);

  if (lon < -25 && lon > -170) {
    return lat < 32 ? 'latin-america-caribbean' : 'europe-north-america';
  }

  if (lon >= -25 && lon <= 45 && lat >= 35) {
    return 'europe-north-america';
  }

  if (lon >= -20 && lon <= 55 && lat < 35 && lat > -36) {
    return isNorthAfricaName(name) ? 'north-africa-west-asia' : 'sub-saharan-africa';
  }

  if (lon > 35 && lon <= 65 && lat >= 10 && lat <= 43) {
    return 'north-africa-west-asia';
  }

  if (lon > 55 && lon <= 92 && lat >= 4 && lat <= 52) {
    return 'central-southern-asia';
  }

  if (lon > 92 && lon <= 150 && lat >= -12 && lat <= 56) {
    return 'eastern-se-asia';
  }

  if ((lon > 130 || lon < -140) && lat > -30 && lat < 20) {
    return 'oceania';
  }

  return null;
}

function isNorthAfricaName(name) {
  return ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia', 'W. Sahara', 'Western Sahara'].includes(name);
}

function createRegionDotGeometry(THREE, radius, landFeatures, d3) {
  const positions = [];
  const colors = [];
  const regionIndices = [];

  if (landFeatures?.length && d3?.geoContains) {
    return createLandDotGeometry(THREE, radius, landFeatures, d3);
  }

  for (let lat = -58; lat <= 74; lat += 2.45) {
    const lonStep = lat > 55 || lat < -45 ? 3.6 : 2.45;
    for (let lon = -180; lon < 180; lon += lonStep) {
      const jitterLat = lat + seededJitter(lat, lon, 1) * 0.8;
      const jitterLon = lon + seededJitter(lat, lon, 2) * 0.8;
      const regionIndex = findRegionIndex(jitterLat, jitterLon);
      if (regionIndex < 0) continue;

      const region = REGIONS[regionIndex];
      const pos = latLonToVector(THREE, jitterLat, jitterLon, radius * 1.012);
      const color = new THREE.Color(region.color);
      color.offsetHSL(0, 0, seededJitter(lat, lon, 3) * 0.08);

      positions.push(pos.x, pos.y, pos.z);
      colors.push(color.r, color.g, color.b);
      regionIndices.push(regionIndex);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return { geometry, regionIndices };
}

function createLandDotGeometry(THREE, radius, landFeatures, d3) {
  const positions = [];
  const colors = [];
  const regionIndices = [];

  for (let lat = -56; lat <= 75; lat += 1.7) {
    const lonStep = lat > 58 || lat < -45 ? 3.4 : 1.9;
    for (let lon = -180; lon < 180; lon += lonStep) {
      const jitterLat = lat + seededJitter(lat, lon, 1) * 0.42;
      const jitterLon = lon + seededJitter(lat, lon, 2) * 0.42;
      const regionIndex = findLandRegionIndex(jitterLat, jitterLon, landFeatures, d3);
      if (regionIndex < 0) continue;

      const region = REGIONS[regionIndex];
      const pos = latLonToVector(THREE, jitterLat, jitterLon, radius * 1.025);
      const color = new THREE.Color(region.color);
      color.offsetHSL(0, 0, seededJitter(lat, lon, 3) * 0.06);

      positions.push(pos.x, pos.y, pos.z);
      colors.push(color.r, color.g, color.b);
      regionIndices.push(regionIndex);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return { geometry, regionIndices };
}

function findLandRegionIndex(lat, lon, landFeatures, d3) {
  const point = [lon, lat];
  for (const entry of landFeatures) {
    if (!pointWithinBounds(point, entry.bounds)) continue;
    if (d3.geoContains(entry.feature, point)) return entry.regionIndex;
  }
  return -1;
}

function pointWithinBounds([lon, lat], bounds) {
  const [[minLon, minLat], [maxLon, maxLat]] = bounds;
  if (lat < minLat || lat > maxLat) return false;

  if (minLon <= maxLon) {
    return lon >= minLon && lon <= maxLon;
  }

  return lon >= minLon || lon <= maxLon;
}

function findRegionIndex(lat, lon) {
  for (let i = 0; i < REGIONS.length; i += 1) {
    if (REGIONS[i].zones.some(zone => inZone(lat, lon, zone))) return i;
  }
  return -1;
}

function inZone(lat, lon, zone) {
  const dLat = (lat - zone.lat) / zone.latRadius;
  const dLon = shortestLongitudeDistance(lon, zone.lon) / zone.lonRadius;
  return dLat * dLat + dLon * dLon <= 1;
}

function latLonToVector(THREE, lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createDotTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createRingTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 96, 96);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(48, 48, 31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(48, 48, 42, 0, Math.PI * 2);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function shortestLongitudeDistance(lon, center) {
  return ((((lon - center) + 540) % 360) - 180);
}

function nearestAngle(current, target) {
  const tau = Math.PI * 2;
  return current + ((((target - current) + Math.PI) % tau + tau) % tau - Math.PI);
}

function seededJitter(a, b, salt) {
  const value = Math.sin(a * 12.9898 + b * 78.233 + salt * 37.719) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
