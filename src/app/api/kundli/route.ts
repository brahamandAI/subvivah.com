import { NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get coordinates from place name using a geocoding API
async function getCoordinates(placeName: string) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: placeName,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'Kundli-Generator/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    } else {
      throw new Error('Location not found');
    }
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw new Error(`Could not find coordinates for the given place: ${placeName}`);
  }
}

// Calculate Julian Day
function calculateJulianDay(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  
  let y = year;
  let m = month;
  
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) + 
            Math.floor(30.6001 * (m + 1)) + 
            day + b - 1524.5 +
            (hour + minute / 60 + second / 3600) / 24;
            
  return jd;
}

// Calculate Lahiri Ayanamsa
function calculateLahiriAyanamsa(jd: number) {
  const jd_reference = 2435553.5;
  const ayanamsa_reference = 23.15;
  const precession_rate = 50.288;  // arcseconds per year
  const years_since_reference = (jd - jd_reference) / 365.25;
  const ayanamsa = ayanamsa_reference + (precession_rate * years_since_reference) / 3600;
  
  return ayanamsa;
}

// Calculate Sun longitude
function calculateSunLongitude(jd: number) {
  const t = (jd - 2451545.0) / 36525;
  let L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const M_rad = M * Math.PI / 180;
  const e = 0.016708634 - 0.000042037 * t - 0.0000000283 * t * t;
  
  const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M_rad) +
            (0.019993 - 0.000101 * t) * Math.sin(2 * M_rad) +
            0.000289 * Math.sin(3 * M_rad);
  
  const L_true = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  const L_apparent = L_true - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
  
  const longitude = L_apparent % 360;
  return longitude < 0 ? longitude + 360 : longitude;
}

// Helper function to determine which sign a longitude falls in
function getSignFromLongitude(longitude: number) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex];
}

// Calculate Greenwich Sidereal Time
function calculateGreenwichSiderealTime(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                T * T * (0.000387933 - T / 38710000.0);
  return (theta % 360) / 15; // Convert to hours
}

// Calculate houses
function calculateHouses(ascendant: number) {
  const houses = [];
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  for (let i = 0; i < 12; i++) {
    const houseSignIndex = Math.floor((ascendant + (i * 30)) / 30) % 12;
    houses.push({
      house: i + 1,
      sign: signs[houseSignIndex],
      degree: (ascendant + (i * 30)) % 30,
      name: getHouseName(i + 1)
    });
  }
  
  return houses;
}

// Get house name in Sanskrit
function getHouseName(houseNumber: number) {
  const houseNames = {
    1: 'Lagna (Ascendant)',
    2: 'Dhana (Wealth)',
    3: 'Sahaja (Siblings)',
    4: 'Sukha (Happiness)',
    5: 'Putra (Children)',
    6: 'Ari (Enemies)',
    7: 'Yuvati (Spouse)',
    8: 'Randhra (Longevity)',
    9: 'Dharma (Religion)',
    10: 'Karma (Career)',
    11: 'Labha (Gains)',
    12: 'Vyaya (Losses)'
  };
  return houseNames[houseNumber as keyof typeof houseNames] || `House ${houseNumber}`;
}

// Calculate ascendant
function calculateAscendant(date: Date, lat: number, lng: number) {
  // This is a simplified calculation
  // In a real implementation, you would use more accurate astronomical formulas
  const jd = calculateJulianDay(date);
  const gst = calculateGreenwichSiderealTime(jd);
  const lst = (gst + lng / 15) % 24;
  const ramc = lst * 15;
  
  // Simplified ascendant calculation
  const ascendant = (ramc + lat) % 360;
  return ascendant;
}

// Calculate nakshatra
function calculateNakshatra(longitude: number) {
  const nakshatras = [
    { name: 'Ashwini', ruler: 'Ketu', range: [0, 13.333333] },
    { name: 'Bharani', ruler: 'Venus', range: [13.333333, 26.666666] },
    { name: 'Krittika', ruler: 'Sun', range: [26.666666, 40] },
    { name: 'Rohini', ruler: 'Moon', range: [40, 53.333333] },
    { name: 'Mrigashira', ruler: 'Mars', range: [53.333333, 66.666666] },
    { name: 'Ardra', ruler: 'Rahu', range: [66.666666, 80] },
    { name: 'Punarvasu', ruler: 'Jupiter', range: [80, 93.333333] },
    { name: 'Pushya', ruler: 'Saturn', range: [93.333333, 106.666666] },
    { name: 'Ashlesha', ruler: 'Mercury', range: [106.666666, 120] },
    { name: 'Magha', ruler: 'Ketu', range: [120, 133.333333] },
    { name: 'Purva Phalguni', ruler: 'Venus', range: [133.333333, 146.666666] },
    { name: 'Uttara Phalguni', ruler: 'Sun', range: [146.666666, 160] },
    { name: 'Hasta', ruler: 'Moon', range: [160, 173.333333] },
    { name: 'Chitra', ruler: 'Mars', range: [173.333333, 186.666666] },
    { name: 'Swati', ruler: 'Rahu', range: [186.666666, 200] },
    { name: 'Vishakha', ruler: 'Jupiter', range: [200, 213.333333] },
    { name: 'Anuradha', ruler: 'Saturn', range: [213.333333, 226.666666] },
    { name: 'Jyeshtha', ruler: 'Mercury', range: [226.666666, 240] },
    { name: 'Mula', ruler: 'Ketu', range: [240, 253.333333] },
    { name: 'Purva Ashadha', ruler: 'Venus', range: [253.333333, 266.666666] },
    { name: 'Uttara Ashadha', ruler: 'Sun', range: [266.666666, 280] },
    { name: 'Shravana', ruler: 'Moon', range: [280, 293.333333] },
    { name: 'Dhanishta', ruler: 'Mars', range: [293.333333, 306.666666] },
    { name: 'Shatabhisha', ruler: 'Rahu', range: [306.666666, 320] },
    { name: 'Purva Bhadrapada', ruler: 'Jupiter', range: [320, 333.333333] },
    { name: 'Uttara Bhadrapada', ruler: 'Saturn', range: [333.333333, 346.666666] },
    { name: 'Revati', ruler: 'Mercury', range: [346.666666, 360] }
  ];

  for (const nakshatra of nakshatras) {
    if (longitude >= nakshatra.range[0] && longitude < nakshatra.range[1]) {
      return {
        name: nakshatra.name,
        ruler: nakshatra.ruler,
        pada: Math.floor((longitude - nakshatra.range[0]) / 3.333333) + 1
      };
    }
  }
  
  return null;
}

export async function POST(req: Request) {
  try {
    const { fullName, dob, tob, pob, gender } = await req.json();

    // Validate required fields
    if (!fullName || !dob || !tob || !pob) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        requiredFields: {
          fullName: 'Full name of the person',
          dob: 'Date of birth (YYYY-MM-DD)',
          tob: 'Time of birth (HH:MM)',
          pob: 'Place of birth'
        }
      }, { status: 400 });
    }

    // Get coordinates for the place of birth
    const coordinates = await getCoordinates(pob);
    
    // Parse date and time
    const [year, month, day] = dob.split('-').map(Number);
    const [hour, minute] = tob.split(':').map(Number);
    
    // Create date object - ensure UTC
    const dateObj = new Date(Date.UTC(year, month-1, day, hour, minute, 0));
    
    // Calculate Julian Day
    const jd = calculateJulianDay(dateObj);
    
    // Calculate Sun's position
    const sunLongitude = calculateSunLongitude(jd);
    const sunSign = getSignFromLongitude(sunLongitude);
    
    // Calculate Ayanamsa
    const ayanamsa = calculateLahiriAyanamsa(jd);
    
    // Calculate sidereal Sun position
    const siderealSunLongitude = (sunLongitude - ayanamsa + 360) % 360;
    const siderealSunSign = getSignFromLongitude(siderealSunLongitude);
    
    // Calculate Ascendant
    const ascendant = calculateAscendant(dateObj, coordinates.lat, coordinates.lng);
    const ascendantSign = getSignFromLongitude(ascendant);
    
    // Calculate Houses
    const houses = calculateHouses(ascendant);
    
    // Calculate Nakshatra for Sun
    const sunNakshatra = calculateNakshatra(siderealSunLongitude);
    
    // Assemble the kundli data
    const kundliData = {
      personalInfo: {
        fullName,
        dateOfBirth: dob,
        timeOfBirth: tob,
        placeOfBirth: pob,
        gender: gender || 'Not specified',
        coordinates: coordinates
      },
      ascendant: {
        longitude: ascendant,
        sign: ascendantSign,
        degree: ascendant % 30
      },
      sunPosition: {
        tropical: {
          longitude: sunLongitude,
          sign: sunSign,
          degree: sunLongitude % 30
        },
        sidereal: {
          longitude: siderealSunLongitude,
          sign: siderealSunSign,
          degree: siderealSunLongitude % 30,
          nakshatra: sunNakshatra
        }
      },
      houses: houses,
      ayanamsa: ayanamsa,
      disclaimer: "This is a basic kundli calculation. For detailed analysis, please consult with a professional astrologer."
    };
    
    return NextResponse.json(kundliData);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Error generating kundli', 
      details: error.message
    }, { status: 500 });
  }
} 