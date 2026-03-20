import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_PRICING_CONFIGS } from '../src/lib/pricing-data'

const prisma = new PrismaClient()

function computeTier(msaPopulation: number | null, cityPopulation: number): string {
  if (msaPopulation && msaPopulation >= 2000000) return 'major'
  if ((msaPopulation && msaPopulation >= 250000) || cityPopulation >= 100000) return 'mid'
  return 'small'
}

// Top US cities with MSA data - comprehensive seed dataset
const US_CITIES = [
  // Major metros (MSA >= 2M)
  { city: 'New York', state: 'New York', stateCode: 'NY', population: 8336817, msaName: 'New York-Newark-Jersey City', msaPopulation: 20140470, lat: 40.7128, lng: -74.006 },
  { city: 'Los Angeles', state: 'California', stateCode: 'CA', population: 3979576, msaName: 'Los Angeles-Long Beach-Anaheim', msaPopulation: 13200998, lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'Illinois', stateCode: 'IL', population: 2693976, msaName: 'Chicago-Naperville-Elgin', msaPopulation: 9618502, lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'Texas', stateCode: 'TX', population: 2320268, msaName: 'Houston-The Woodlands-Sugar Land', msaPopulation: 7122240, lat: 29.7604, lng: -95.3698 },
  { city: 'Phoenix', state: 'Arizona', stateCode: 'AZ', population: 1608139, msaName: 'Phoenix-Mesa-Chandler', msaPopulation: 4845832, lat: 33.4484, lng: -112.074 },
  { city: 'Philadelphia', state: 'Pennsylvania', stateCode: 'PA', population: 1603797, msaName: 'Philadelphia-Camden-Wilmington', msaPopulation: 6245051, lat: 39.9526, lng: -75.1652 },
  { city: 'San Antonio', state: 'Texas', stateCode: 'TX', population: 1547253, msaName: 'San Antonio-New Braunfels', msaPopulation: 2558143, lat: 29.4241, lng: -98.4936 },
  { city: 'San Diego', state: 'California', stateCode: 'CA', population: 1423851, msaName: 'San Diego-Chula Vista-Carlsbad', msaPopulation: 3338330, lat: 32.7157, lng: -117.1611 },
  { city: 'Dallas', state: 'Texas', stateCode: 'TX', population: 1343573, msaName: 'Dallas-Fort Worth-Arlington', msaPopulation: 7637387, lat: 32.7767, lng: -96.797 },
  { city: 'San Jose', state: 'California', stateCode: 'CA', population: 1021795, msaName: 'San Jose-Sunnyvale-Santa Clara', msaPopulation: 2000468, lat: 37.3382, lng: -121.8863 },
  { city: 'Austin', state: 'Texas', stateCode: 'TX', population: 978908, msaName: 'Austin-Round Rock-Georgetown', msaPopulation: 2283371, lat: 30.2672, lng: -97.7431 },
  { city: 'Fort Worth', state: 'Texas', stateCode: 'TX', population: 918915, msaName: 'Dallas-Fort Worth-Arlington', msaPopulation: 7637387, lat: 32.7555, lng: -97.3308 },
  { city: 'Jacksonville', state: 'Florida', stateCode: 'FL', population: 949611, msaName: 'Jacksonville', msaPopulation: 1605848, lat: 30.3322, lng: -81.6557 },
  { city: 'Columbus', state: 'Ohio', stateCode: 'OH', population: 905748, msaName: 'Columbus', msaPopulation: 2138926, lat: 39.9612, lng: -82.9988 },
  { city: 'Indianapolis', state: 'Indiana', stateCode: 'IN', population: 887642, msaName: 'Indianapolis-Carmel-Anderson', msaPopulation: 2111040, lat: 39.7684, lng: -86.1581 },
  { city: 'Charlotte', state: 'North Carolina', stateCode: 'NC', population: 874579, msaName: 'Charlotte-Concord-Gastonia', msaPopulation: 2660329, lat: 35.2271, lng: -80.8431 },
  { city: 'San Francisco', state: 'California', stateCode: 'CA', population: 873965, msaName: 'San Francisco-Oakland-Berkeley', msaPopulation: 4749008, lat: 37.7749, lng: -122.4194 },
  { city: 'Seattle', state: 'Washington', stateCode: 'WA', population: 737015, msaName: 'Seattle-Tacoma-Bellevue', msaPopulation: 4018762, lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'Colorado', stateCode: 'CO', population: 715522, msaName: 'Denver-Aurora-Lakewood', msaPopulation: 2963821, lat: 39.7392, lng: -104.9903 },
  { city: 'Washington', state: 'District of Columbia', stateCode: 'DC', population: 689545, msaName: 'Washington-Arlington-Alexandria', msaPopulation: 6385162, lat: 38.9072, lng: -77.0369 },
  { city: 'Nashville', state: 'Tennessee', stateCode: 'TN', population: 689447, msaName: 'Nashville-Davidson-Murfreesboro-Franklin', msaPopulation: 1989519, lat: 36.1627, lng: -86.7816 },
  { city: 'Oklahoma City', state: 'Oklahoma', stateCode: 'OK', population: 681054, msaName: 'Oklahoma City', msaPopulation: 1425695, lat: 35.4676, lng: -97.5164 },
  { city: 'El Paso', state: 'Texas', stateCode: 'TX', population: 678815, msaName: 'El Paso', msaPopulation: 868859, lat: 31.7619, lng: -106.485 },
  { city: 'Boston', state: 'Massachusetts', stateCode: 'MA', population: 675647, msaName: 'Boston-Cambridge-Newton', msaPopulation: 4941632, lat: 42.3601, lng: -71.0589 },
  { city: 'Portland', state: 'Oregon', stateCode: 'OR', population: 652503, msaName: 'Portland-Vancouver-Hillsboro', msaPopulation: 2512859, lat: 45.5152, lng: -122.6784 },
  { city: 'Las Vegas', state: 'Nevada', stateCode: 'NV', population: 641903, msaName: 'Las Vegas-Henderson-Paradise', msaPopulation: 2265461, lat: 36.1699, lng: -115.1398 },
  { city: 'Memphis', state: 'Tennessee', stateCode: 'TN', population: 633104, msaName: 'Memphis', msaPopulation: 1337779, lat: 35.1495, lng: -90.049 },
  { city: 'Louisville', state: 'Kentucky', stateCode: 'KY', population: 633045, msaName: 'Louisville/Jefferson County', msaPopulation: 1285439, lat: 38.2527, lng: -85.7585 },
  { city: 'Baltimore', state: 'Maryland', stateCode: 'MD', population: 585708, msaName: 'Baltimore-Columbia-Towson', msaPopulation: 2844510, lat: 39.2904, lng: -76.6122 },
  { city: 'Milwaukee', state: 'Wisconsin', stateCode: 'WI', population: 577222, msaName: 'Milwaukee-Waukesha', msaPopulation: 1574731, lat: 43.0389, lng: -87.9065 },
  { city: 'Albuquerque', state: 'New Mexico', stateCode: 'NM', population: 564559, msaName: 'Albuquerque', msaPopulation: 916774, lat: 35.0844, lng: -106.6504 },
  { city: 'Tucson', state: 'Arizona', stateCode: 'AZ', population: 542629, msaName: 'Tucson', msaPopulation: 1043433, lat: 32.2226, lng: -110.9747 },
  { city: 'Fresno', state: 'California', stateCode: 'CA', population: 542107, msaName: 'Fresno', msaPopulation: 1008654, lat: 36.7378, lng: -119.7871 },
  { city: 'Sacramento', state: 'California', stateCode: 'CA', population: 524943, msaName: 'Sacramento-Roseville-Folsom', msaPopulation: 2397382, lat: 38.5816, lng: -121.4944 },
  { city: 'Mesa', state: 'Arizona', stateCode: 'AZ', population: 504258, msaName: 'Phoenix-Mesa-Chandler', msaPopulation: 4845832, lat: 33.4152, lng: -111.8315 },
  { city: 'Kansas City', state: 'Missouri', stateCode: 'MO', population: 508090, msaName: 'Kansas City', msaPopulation: 2192035, lat: 39.0997, lng: -94.5786 },
  { city: 'Atlanta', state: 'Georgia', stateCode: 'GA', population: 498715, msaName: 'Atlanta-Sandy Springs-Alpharetta', msaPopulation: 6144050, lat: 33.749, lng: -84.388 },
  { city: 'Omaha', state: 'Nebraska', stateCode: 'NE', population: 486051, msaName: 'Omaha-Council Bluffs', msaPopulation: 967604, lat: 41.2565, lng: -95.9345 },
  { city: 'Colorado Springs', state: 'Colorado', stateCode: 'CO', population: 478961, msaName: 'Colorado Springs', msaPopulation: 755105, lat: 38.8339, lng: -104.8214 },
  { city: 'Raleigh', state: 'North Carolina', stateCode: 'NC', population: 474069, msaName: 'Raleigh-Cary', msaPopulation: 1413982, lat: 35.7796, lng: -78.6382 },
  { city: 'Long Beach', state: 'California', stateCode: 'CA', population: 466742, msaName: 'Los Angeles-Long Beach-Anaheim', msaPopulation: 13200998, lat: 33.7701, lng: -118.1937 },
  { city: 'Virginia Beach', state: 'Virginia', stateCode: 'VA', population: 459470, msaName: 'Virginia Beach-Norfolk-Newport News', msaPopulation: 1799674, lat: 36.8529, lng: -75.978 },
  { city: 'Miami', state: 'Florida', stateCode: 'FL', population: 442241, msaName: 'Miami-Fort Lauderdale-Pompano Beach', msaPopulation: 6166488, lat: 25.7617, lng: -80.1918 },
  { city: 'Oakland', state: 'California', stateCode: 'CA', population: 433031, msaName: 'San Francisco-Oakland-Berkeley', msaPopulation: 4749008, lat: 37.8044, lng: -122.2712 },
  { city: 'Minneapolis', state: 'Minnesota', stateCode: 'MN', population: 429954, msaName: 'Minneapolis-St. Paul-Bloomington', msaPopulation: 3690261, lat: 44.9778, lng: -93.265 },
  { city: 'Tampa', state: 'Florida', stateCode: 'FL', population: 399700, msaName: 'Tampa-St. Petersburg-Clearwater', msaPopulation: 3219514, lat: 27.9506, lng: -82.4572 },
  { city: 'Tulsa', state: 'Oklahoma', stateCode: 'OK', population: 413066, msaName: 'Tulsa', msaPopulation: 1015331, lat: 36.154, lng: -95.9928 },
  { city: 'Arlington', state: 'Texas', stateCode: 'TX', population: 394266, msaName: 'Dallas-Fort Worth-Arlington', msaPopulation: 7637387, lat: 32.7357, lng: -97.1081 },
  { city: 'New Orleans', state: 'Louisiana', stateCode: 'LA', population: 383997, msaName: 'New Orleans-Metairie', msaPopulation: 1271651, lat: 29.9511, lng: -90.0715 },
  // Mid-size cities
  { city: 'Wichita', state: 'Kansas', stateCode: 'KS', population: 397532, msaName: 'Wichita', msaPopulation: 647610, lat: 37.6872, lng: -97.3301 },
  { city: 'Cleveland', state: 'Ohio', stateCode: 'OH', population: 372624, msaName: 'Cleveland-Elyria', msaPopulation: 2088251, lat: 41.4993, lng: -81.6944 },
  { city: 'Bakersfield', state: 'California', stateCode: 'CA', population: 403455, msaName: 'Bakersfield', msaPopulation: 909235, lat: 35.3733, lng: -119.0187 },
  { city: 'Aurora', state: 'Colorado', stateCode: 'CO', population: 386261, msaName: 'Denver-Aurora-Lakewood', msaPopulation: 2963821, lat: 39.7294, lng: -104.8319 },
  { city: 'Anaheim', state: 'California', stateCode: 'CA', population: 350365, msaName: 'Los Angeles-Long Beach-Anaheim', msaPopulation: 13200998, lat: 33.8366, lng: -117.9143 },
  { city: 'Honolulu', state: 'Hawaii', stateCode: 'HI', population: 350964, msaName: 'Urban Honolulu', msaPopulation: 1016508, lat: 21.3069, lng: -157.8583 },
  { city: 'Santa Ana', state: 'California', stateCode: 'CA', population: 309441, msaName: 'Los Angeles-Long Beach-Anaheim', msaPopulation: 13200998, lat: 33.7455, lng: -117.8677 },
  { city: 'Riverside', state: 'California', stateCode: 'CA', population: 314998, msaName: 'Riverside-San Bernardino-Ontario', msaPopulation: 4600396, lat: 33.9533, lng: -117.3962 },
  { city: 'Corpus Christi', state: 'Texas', stateCode: 'TX', population: 317863, msaName: 'Corpus Christi', msaPopulation: 482475, lat: 27.8006, lng: -97.3964 },
  { city: 'Lexington', state: 'Kentucky', stateCode: 'KY', population: 322570, msaName: 'Lexington-Fayette', msaPopulation: 516697, lat: 38.0406, lng: -84.5037 },
  { city: 'Pittsburgh', state: 'Pennsylvania', stateCode: 'PA', population: 302971, msaName: 'Pittsburgh', msaPopulation: 2370930, lat: 40.4406, lng: -79.9959 },
  { city: 'St. Louis', state: 'Missouri', stateCode: 'MO', population: 301578, msaName: 'St. Louis', msaPopulation: 2820253, lat: 38.627, lng: -90.1994 },
  { city: 'Cincinnati', state: 'Ohio', stateCode: 'OH', population: 309317, msaName: 'Cincinnati', msaPopulation: 2256884, lat: 39.1031, lng: -84.512 },
  { city: 'Anchorage', state: 'Alaska', stateCode: 'AK', population: 291247, msaName: 'Anchorage', msaPopulation: 396317, lat: 61.2181, lng: -149.9003 },
  { city: 'Stockton', state: 'California', stateCode: 'CA', population: 320804, msaName: 'Stockton', msaPopulation: 779233, lat: 37.9577, lng: -121.2908 },
  { city: 'St. Paul', state: 'Minnesota', stateCode: 'MN', population: 311527, msaName: 'Minneapolis-St. Paul-Bloomington', msaPopulation: 3690261, lat: 44.9537, lng: -93.09 },
  { city: 'Newark', state: 'New Jersey', stateCode: 'NJ', population: 311549, msaName: 'New York-Newark-Jersey City', msaPopulation: 20140470, lat: 40.7357, lng: -74.1724 },
  { city: 'Greensboro', state: 'North Carolina', stateCode: 'NC', population: 299035, msaName: 'Greensboro-High Point', msaPopulation: 771851, lat: 36.0726, lng: -79.792 },
  { city: 'Buffalo', state: 'New York', stateCode: 'NY', population: 278349, msaName: 'Buffalo-Cheektowaga', msaPopulation: 1166902, lat: 42.8864, lng: -78.8784 },
  { city: 'Plano', state: 'Texas', stateCode: 'TX', population: 285494, msaName: 'Dallas-Fort Worth-Arlington', msaPopulation: 7637387, lat: 33.0198, lng: -96.6989 },
  { city: 'Lincoln', state: 'Nebraska', stateCode: 'NE', population: 291082, msaName: 'Lincoln', msaPopulation: 340217, lat: 40.8136, lng: -96.7026 },
  { city: 'Orlando', state: 'Florida', stateCode: 'FL', population: 307573, msaName: 'Orlando-Kissimmee-Sanford', msaPopulation: 2691925, lat: 28.5383, lng: -81.3792 },
  { city: 'Irvine', state: 'California', stateCode: 'CA', population: 307670, msaName: 'Los Angeles-Long Beach-Anaheim', msaPopulation: 13200998, lat: 33.6846, lng: -117.8265 },
  { city: 'Cincinnati', state: 'Ohio', stateCode: 'OH', population: 309317, msaName: 'Cincinnati', msaPopulation: 2256884, lat: 39.1031, lng: -84.512 },
  { city: 'Durham', state: 'North Carolina', stateCode: 'NC', population: 283506, msaName: 'Durham-Chapel Hill', msaPopulation: 644367, lat: 35.994, lng: -78.8986 },
  { city: 'Jersey City', state: 'New Jersey', stateCode: 'NJ', population: 292449, msaName: 'New York-Newark-Jersey City', msaPopulation: 20140470, lat: 40.7178, lng: -74.0431 },
  { city: 'Chandler', state: 'Arizona', stateCode: 'AZ', population: 275987, msaName: 'Phoenix-Mesa-Chandler', msaPopulation: 4845832, lat: 33.3062, lng: -111.8413 },
  { city: 'Chula Vista', state: 'California', stateCode: 'CA', population: 275487, msaName: 'San Diego-Chula Vista-Carlsbad', msaPopulation: 3338330, lat: 32.6401, lng: -117.0842 },
  { city: 'Boise', state: 'Idaho', stateCode: 'ID', population: 235684, msaName: 'Boise City', msaPopulation: 764718, lat: 43.615, lng: -116.2023 },
  { city: 'Richmond', state: 'Virginia', stateCode: 'VA', population: 226610, msaName: 'Richmond', msaPopulation: 1314434, lat: 37.5407, lng: -77.436 },
  { city: 'Spokane', state: 'Washington', stateCode: 'WA', population: 228989, msaName: 'Spokane-Spokane Valley', msaPopulation: 573493, lat: 47.6588, lng: -117.426 },
  // Small cities
  { city: 'Bozeman', state: 'Montana', stateCode: 'MT', population: 53293, msaName: 'Bozeman', msaPopulation: 119600, lat: 45.6770, lng: -111.0429 },
  { city: 'Abilene', state: 'Texas', stateCode: 'TX', population: 125182, msaName: 'Abilene', msaPopulation: 176000, lat: 32.4487, lng: -99.7331 },
  { city: 'Missoula', state: 'Montana', stateCode: 'MT', population: 75516, msaName: 'Missoula', msaPopulation: 121000, lat: 46.8721, lng: -114.0072 },
  { city: 'Flagstaff', state: 'Arizona', stateCode: 'AZ', population: 73964, msaName: 'Flagstaff', msaPopulation: 145000, lat: 35.1983, lng: -111.6513 },
  { city: 'Twin Falls', state: 'Idaho', stateCode: 'ID', population: 51807, msaName: null, msaPopulation: null, lat: 42.5558, lng: -114.4601 },
  { city: 'Laramie', state: 'Wyoming', stateCode: 'WY', population: 32382, msaName: null, msaPopulation: null, lat: 41.3114, lng: -105.5911 },
  { city: 'Bend', state: 'Oregon', stateCode: 'OR', population: 102059, msaName: 'Bend', msaPopulation: 200000, lat: 44.0582, lng: -121.3153 },
  { city: 'Cedar Rapids', state: 'Iowa', stateCode: 'IA', population: 137710, msaName: 'Cedar Rapids', msaPopulation: 275000, lat: 41.9779, lng: -91.6656 },
  { city: 'Sioux Falls', state: 'South Dakota', stateCode: 'SD', population: 192517, msaName: 'Sioux Falls', msaPopulation: 279000, lat: 43.5446, lng: -96.7311 },
  { city: 'Fargo', state: 'North Dakota', stateCode: 'ND', population: 125990, msaName: 'Fargo', msaPopulation: 261000, lat: 46.8772, lng: -96.7898 },
  { city: 'Billings', state: 'Montana', stateCode: 'MT', population: 119510, msaName: 'Billings', msaPopulation: 184000, lat: 45.7833, lng: -108.5007 },
  { city: 'Rapid City', state: 'South Dakota', stateCode: 'SD', population: 77503, msaName: 'Rapid City', msaPopulation: 148000, lat: 44.0805, lng: -103.2310 },
  { city: 'Great Falls', state: 'Montana', stateCode: 'MT', population: 60442, msaName: 'Great Falls', msaPopulation: 82000, lat: 47.5002, lng: -111.3008 },
  { city: 'Casper', state: 'Wyoming', stateCode: 'WY', population: 58287, msaName: 'Casper', msaPopulation: 80000, lat: 42.8501, lng: -106.3252 },
]

async function main() {
  console.log('Seeding database...')

  // 1. Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'jurisdigital2024'
  const hash = await bcrypt.hash(adminPassword, 12)
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { passwordHash: hash },
    create: { username: 'admin', passwordHash: hash },
  })
  console.log('Admin user created (username: admin)')

  // 2. Seed pricing configs
  for (const config of DEFAULT_PRICING_CONFIGS) {
    await prisma.pricingConfig.upsert({
      where: { id: `${config.department}-${config.serviceName}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() },
      update: { ...config },
      create: {
        id: `${config.department}-${config.serviceName}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
        ...config,
      },
    })
  }
  console.log(`Seeded ${DEFAULT_PRICING_CONFIGS.length} pricing configs`)

  // 3. Seed markets
  // Deduplicate by city+stateCode
  const seen = new Set<string>()
  const uniqueCities = US_CITIES.filter(c => {
    const key = `${c.city}-${c.stateCode}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  let marketCount = 0
  for (const city of uniqueCities) {
    const computedTier = computeTier(city.msaPopulation, city.population)
    await prisma.market.upsert({
      where: {
        city_stateCode: { city: city.city, stateCode: city.stateCode },
      },
      update: {
        population: city.population,
        msaName: city.msaName,
        msaPopulation: city.msaPopulation,
        computedTier,
        latitude: city.lat,
        longitude: city.lng,
      },
      create: {
        city: city.city,
        state: city.state,
        stateCode: city.stateCode,
        population: city.population,
        msaName: city.msaName,
        msaPopulation: city.msaPopulation,
        computedTier,
        latitude: city.lat,
        longitude: city.lng,
      },
    })
    marketCount++
  }
  console.log(`Seeded ${marketCount} markets`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
