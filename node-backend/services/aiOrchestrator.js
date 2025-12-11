/**
 * AI Orchestrator
 * Processes AI jobs with mock responses (local development)
 * Future: Replace with real OpenAI/Vision API calls
 */

/**
 * Process a job based on its type
 * @param {Object} job - Job object
 * @returns {Promise<Object>} Processing result
 */
async function processJob(job) {
  const { type, data } = job;

  console.log(`🤖 AI Orchestrator processing ${type} job...`);

  // Simulate processing time
  await simulateProcessing(type);

  switch (type) {
    case 'stylist':
      return await processStylistJob(data);
    case 'wardrobe':
      return await processWardrobeJob(data);
    case 'body-scan':
      return await processBodyScanJob(data);
    case 'general':
    default:
      return await processGeneralJob(data);
  }
}

/**
 * Simulate AI processing time
 */
function simulateProcessing(type) {
  const delays = {
    'stylist': 2000,
    'wardrobe': 1500,
    'body-scan': 3000,
    'general': 1000
  };
  return new Promise(resolve => setTimeout(resolve, delays[type] || 1000));
}

/**
 * Process AI Stylist job
 * Mock: Returns style recommendations
 */
async function processStylistJob(data) {
  console.log('🎨 Generating style recommendations...');

  const mockResults = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
      confidence: 0.95,
      tags: ['streetwear', 'casual', 'denim'],
      title: 'Urban Streetwear Look',
      description: 'Perfect for casual weekend outings',
      items: [
        { name: 'Denim Jacket', price: '$89', category: 'outerwear' },
        { name: 'White Tee', price: '$24', category: 'tops' },
        { name: 'Black Jeans', price: '$79', category: 'bottoms' },
      ]
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
      confidence: 0.92,
      tags: ['luxury', 'elegant', 'formal'],
      title: 'Elegant Luxury Ensemble',
      description: 'Sophisticated style for special occasions',
      items: [
        { name: 'Blazer', price: '$299', category: 'outerwear' },
        { name: 'Silk Blouse', price: '$149', category: 'tops' },
        { name: 'Tailored Pants', price: '$189', category: 'bottoms' },
      ]
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1445384763658-0400939829cd?w=600&q=80',
      confidence: 0.88,
      tags: ['casual', 'minimal', 'comfortable'],
      title: 'Minimalist Casual Style',
      description: 'Effortless everyday comfort',
      items: [
        { name: 'Cotton Tee', price: '$34', category: 'tops' },
        { name: 'Chinos', price: '$69', category: 'bottoms' },
        { name: 'Sneakers', price: '$99', category: 'shoes' },
      ]
    },
  ];

  return {
    type: 'stylist',
    results: mockResults,
    metadata: {
      preferences: data.metadata?.preferences || [],
      processedAt: new Date().toISOString(),
      model: 'mock-ai-v1'
    }
  };
}

/**
 * Process AI Wardrobe job
 * Mock: Auto-tags clothing items
 */
async function processWardrobeJob(data) {
  console.log('👔 Auto-tagging wardrobe item...');

  const categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
  const colors = ['black', 'white', 'blue', 'red', 'gray', 'navy', 'beige'];
  const styles = ['casual', 'formal', 'sporty', 'elegant', 'vintage'];

  return {
    type: 'wardrobe',
    item: {
      category: categories[Math.floor(Math.random() * categories.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      style: styles[Math.floor(Math.random() * styles.length)],
      tags: [
        colors[Math.floor(Math.random() * colors.length)],
        styles[Math.floor(Math.random() * styles.length)],
        'auto-tagged'
      ],
      confidence: 0.85 + Math.random() * 0.15,
    },
    metadata: {
      processedAt: new Date().toISOString(),
      model: 'mock-classifier-v1'
    }
  };
}

/**
 * Process Body Scan job
 * Mock: Returns body measurements
 */
async function processBodyScanJob(data) {
  console.log('📏 Analyzing body measurements...');

  const height = 175 + Math.floor(Math.random() * 15);
  const chest = 90 + Math.floor(Math.random() * 15);
  const waist = 75 + Math.floor(Math.random() * 10);
  const hips = 88 + Math.floor(Math.random() * 12);
  const shoulders = 43 + Math.floor(Math.random() * 5);
  const inseam = 78 + Math.floor(Math.random() * 8);

  const bodyTypes = ['Athletic', 'Slim', 'Average', 'Broad'];
  const bodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

  let shirtSize = 'M';
  if (chest < 90) shirtSize = 'S';
  if (chest > 100) shirtSize = 'L';
  if (chest > 110) shirtSize = 'XL';

  let pantsSize = '32';
  if (waist < 75) pantsSize = '30';
  if (waist > 80) pantsSize = '34';
  if (waist > 85) pantsSize = '36';

  return {
    type: 'body-scan',
    measurements: {
      height,
      chest,
      waist,
      hips,
      shoulders,
      inseam,
      bodyType,
      shirtSize,
      pantsSize,
      confidence: 0.90 + Math.random() * 0.08,
    },
    metadata: {
      processedAt: new Date().toISOString(),
      model: 'mock-body-analyzer-v1',
      unit: 'cm'
    }
  };
}

/**
 * Process General job
 * Default handler
 */
async function processGeneralJob(data) {
  console.log('🔍 Processing general image analysis...');

  return {
    type: 'general',
    result: {
      processed: true,
      message: 'Image processed successfully'
    },
    metadata: {
      processedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  processJob
};
