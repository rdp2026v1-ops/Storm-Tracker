/**
 * Secondary Automated Weather & Marine Feed
 * Configured for Rong Doi Platform (RDP - Block 11.2)
 * Includes Procedural, Realistic Emergency Drill Scenario Generator
 */

export const HISTORIC_TYPHOON_PRESETS = [
    {
        name: 'Typhoon Tembin (Vintrí - Dec 2017)',
        description: 'Severe typhoon approaching Nam Con Son / Rong Doi field in Dec 2017.',
        records: [
            { stormName: 'TEMBIN', date: 'Day 1', time: '06:00', lat: 7.9, lon: 124.8, windSpeed: 55, windGust: 70, movingSpeed: 11, movingDirection: 'W', ltWindSpeed: 15, ltWindGust: 18 },
            { stormName: 'TEMBIN', date: 'Day 1', time: '18:00', lat: 7.8, lon: 122.0, windSpeed: 60, windGust: 75, movingSpeed: 12, movingDirection: 'W', ltWindSpeed: 18, ltWindGust: 22 },
            { stormName: 'TEMBIN', date: 'Day 2', time: '06:00', lat: 7.8, lon: 119.5, windSpeed: 65, windGust: 80, movingSpeed: 12, movingDirection: 'W', ltWindSpeed: 22, ltWindGust: 26 },
            { stormName: 'TEMBIN', date: 'Day 2', time: '18:00', lat: 7.8, lon: 116.5, windSpeed: 72, windGust: 88, movingSpeed: 13, movingDirection: 'W', ltWindSpeed: 28, ltWindGust: 35 },
            { stormName: 'TEMBIN', date: 'Day 3', time: '06:00', lat: 8.0, lon: 113.2, windSpeed: 75, windGust: 90, movingSpeed: 13, movingDirection: 'WSW', ltWindSpeed: 42, ltWindGust: 52 },
            { stormName: 'TEMBIN', date: 'Day 3', time: '18:00', lat: 8.1, lon: 109.8, windSpeed: 65, windGust: 80, movingSpeed: 12, movingDirection: 'W', ltWindSpeed: 58, ltWindGust: 70 }
        ]
    },
    {
        name: 'Super Typhoon Yagi (Sept 2024)',
        description: 'Category 5 Super Typhoon tracking across the South China Sea / East Sea.',
        records: [
            { stormName: 'YAGI', date: 'Day 1', time: '08:00', lat: 18.2, lon: 119.3, windSpeed: 45, windGust: 55, movingSpeed: 10, movingDirection: 'WNW', ltWindSpeed: 12, ltWindGust: 15 },
            { stormName: 'YAGI', date: 'Day 2', time: '14:00', lat: 19.0, lon: 116.5, windSpeed: 75, windGust: 95, movingSpeed: 9, movingDirection: 'W', ltWindSpeed: 16, ltWindGust: 20 },
            { stormName: 'YAGI', date: 'Day 3', time: '08:00', lat: 19.4, lon: 113.8, windSpeed: 120, windGust: 145, movingSpeed: 8, movingDirection: 'WNW', ltWindSpeed: 18, ltWindGust: 22 },
            { stormName: 'YAGI', date: 'Day 3', time: '20:00', lat: 19.9, lon: 110.8, windSpeed: 130, windGust: 160, movingSpeed: 11, movingDirection: 'WNW', ltWindSpeed: 20, ltWindGust: 25 }
        ]
    },
    {
        name: 'Historic Typhoon Linda (Nov 1997)',
        description: 'Catastrophic southern typhoon tracking across Nam Con Son Basin, Con Dao, and Ca Mau.',
        records: [
            { stormName: 'LINDA', date: 'Day 1', time: '06:00', lat: 8.2, lon: 114.5, windSpeed: 45, windGust: 55, movingSpeed: 13, movingDirection: 'W', ltWindSpeed: 20, ltWindGust: 25 },
            { stormName: 'LINDA', date: 'Day 1', time: '18:00', lat: 8.4, lon: 112.0, windSpeed: 55, windGust: 70, movingSpeed: 13, movingDirection: 'W', ltWindSpeed: 28, ltWindGust: 35 },
            { stormName: 'LINDA', date: 'Day 2', time: '06:00', lat: 8.6, lon: 109.5, windSpeed: 65, windGust: 80, movingSpeed: 14, movingDirection: 'W', ltWindSpeed: 48, ltWindGust: 62 },
            { stormName: 'LINDA', date: 'Day 2', time: '18:00', lat: 8.7, lon: 106.8, windSpeed: 70, windGust: 85, movingSpeed: 14, movingDirection: 'W', ltWindSpeed: 62, ltWindGust: 78 },
            { stormName: 'LINDA', date: 'Day 3', time: '06:00', lat: 8.9, lon: 104.2, windSpeed: 60, windGust: 75, movingSpeed: 14, movingDirection: 'W', ltWindSpeed: 35, ltWindGust: 45 }
        ]
    },
    {
        name: 'Typhoon Durian (Dec 2006)',
        description: 'Dangerous typhoon sweeping westward into southern offshore waters toward Vung Tau & Binh Thuan.',
        records: [
            { stormName: 'DURIAN', date: 'Day 1', time: '06:00', lat: 12.8, lon: 117.2, windSpeed: 80, windGust: 100, movingSpeed: 11, movingDirection: 'W', ltWindSpeed: 18, ltWindGust: 22 },
            { stormName: 'DURIAN', date: 'Day 1', time: '18:00', lat: 12.2, lon: 114.6, windSpeed: 85, windGust: 105, movingSpeed: 12, movingDirection: 'WSW', ltWindSpeed: 25, ltWindGust: 32 },
            { stormName: 'DURIAN', date: 'Day 2', time: '06:00', lat: 11.5, lon: 112.1, windSpeed: 75, windGust: 92, movingSpeed: 12, movingDirection: 'WSW', ltWindSpeed: 38, ltWindGust: 48 },
            { stormName: 'DURIAN', date: 'Day 2', time: '18:00', lat: 10.7, lon: 109.8, windSpeed: 70, windGust: 85, movingSpeed: 12, movingDirection: 'WSW', ltWindSpeed: 52, ltWindGust: 65 },
            { stormName: 'DURIAN', date: 'Day 3', time: '06:00', lat: 10.2, lon: 107.5, windSpeed: 55, windGust: 70, movingSpeed: 11, movingDirection: 'WSW', ltWindSpeed: 40, ltWindGust: 50 }
        ]
    },
    {
        name: 'Typhoon Ketsana (Sept 2009)',
        description: 'Major typhoon tracking westward across the central East Sea toward Central Vietnam.',
        records: [
            { stormName: 'KETSANA', date: 'Day 1', time: '06:00', lat: 15.2, lon: 117.8, windSpeed: 50, windGust: 65, movingSpeed: 10, movingDirection: 'W', ltWindSpeed: 14, ltWindGust: 18 },
            { stormName: 'KETSANA', date: 'Day 1', time: '18:00', lat: 15.5, lon: 115.3, windSpeed: 65, windGust: 80, movingSpeed: 11, movingDirection: 'W', ltWindSpeed: 18, ltWindGust: 24 },
            { stormName: 'KETSANA', date: 'Day 2', time: '06:00', lat: 15.8, lon: 113.0, windSpeed: 80, windGust: 100, movingSpeed: 11, movingDirection: 'W', ltWindSpeed: 24, ltWindGust: 30 },
            { stormName: 'KETSANA', date: 'Day 2', time: '18:00', lat: 15.9, lon: 110.6, windSpeed: 90, windGust: 110, movingSpeed: 12, movingDirection: 'W', ltWindSpeed: 28, ltWindGust: 36 },
            { stormName: 'KETSANA', date: 'Day 3', time: '08:00', lat: 15.8, lon: 108.8, windSpeed: 85, windGust: 105, movingSpeed: 12, movingDirection: 'W', ltWindSpeed: 22, ltWindGust: 28 }
        ]
    },
    {
        name: 'Typhoon Molave (Oct 2020)',
        description: 'High-speed Category 4 equivalent typhoon crossing the East Sea at over 25 km/h.',
        records: [
            { stormName: 'MOLAVE', date: 'Day 1', time: '06:00', lat: 13.5, lon: 119.5, windSpeed: 65, windGust: 80, movingSpeed: 13, movingDirection: 'WNW', ltWindSpeed: 15, ltWindGust: 20 },
            { stormName: 'MOLAVE', date: 'Day 1', time: '18:00', lat: 14.1, lon: 116.2, windSpeed: 80, windGust: 100, movingSpeed: 14, movingDirection: 'WNW', ltWindSpeed: 22, ltWindGust: 28 },
            { stormName: 'MOLAVE', date: 'Day 2', time: '06:00', lat: 14.6, lon: 113.2, windSpeed: 95, windGust: 118, movingSpeed: 14, movingDirection: 'WNW', ltWindSpeed: 30, ltWindGust: 38 },
            { stormName: 'MOLAVE', date: 'Day 2', time: '18:00', lat: 14.9, lon: 110.4, windSpeed: 90, windGust: 112, movingSpeed: 13, movingDirection: 'WNW', ltWindSpeed: 32, ltWindGust: 40 },
            { stormName: 'MOLAVE', date: 'Day 3', time: '08:00', lat: 15.1, lon: 108.9, windSpeed: 75, windGust: 95, movingSpeed: 12, movingDirection: 'WNW', ltWindSpeed: 24, ltWindGust: 30 }
        ]
    }
];

/**
 * Compute cardinal 16-point moving direction from coordinate delta
 */
function computeDirection16(lat1, lon1, lat2, lon2) {
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    let angle = (Math.atan2(dLon, dLat) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(angle / 22.5) % 16;
    return directions[idx];
}

/**
 * Procedural Dynamic Drill Generator
 * Generates randomized, meteorologically consistent 2 to 3-day typhoon scenarios
 * Starting in Green Zone (1000 - 750 NM) on Day 1 -> Yellow Zone -> Red Zone escalation.
 * Wind speeds & gusts calibrated 5% lower for realistic operational drill conditions.
 */
export function generateAutomaticDrillScenario() {
    const namePrefixes = ['ORION', 'PHOENIX', 'NEPTUNE', 'TITAN', 'VORTEX', 'AEGIS', 'TEMBIN-II', 'ZEPHYR', 'AURORA', 'VALIANT', 'TRITON'];
    const selectedPrefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
    const drillCodename = `DRILL-${selectedPrefix}-${Math.floor(10 + Math.random() * 90)}`;

    // 3 Archetype trajectories into Nam Con Son Basin / Block 11.2 (RDP: 7.7925 N, 108.2021 E)
    const trajectoryTypes = [
        {
            type: 'Northeast to WSW Corridor',
            startLat: 10.2 + (Math.random() * 1.6 - 0.8), // ~9.4 to 11.0 N
            startLon: 123.5 + (Math.random() * 1.5 - 0.5), // ~123.0 to 125.0 E (Green Zone ~900-980 NM)
            endLat: 7.9 + (Math.random() * 0.5 - 0.2),    // ~7.7 to 8.2 N
            endLon: 109.2 + (Math.random() * 0.8 - 0.4)    // ~108.8 to 109.6 E (Red Zone ~60-90 NM)
        },
        {
            type: 'Direct Equatorial West Track',
            startLat: 7.9 + (Math.random() * 1.0 - 0.5),  // ~7.4 to 8.4 N
            startLon: 124.0 + (Math.random() * 1.2 - 0.4), // ~123.6 to 125.2 E (Green Zone ~920-990 NM)
            endLat: 7.8 + (Math.random() * 0.4 - 0.2),    // ~7.6 to 8.0 N
            endLon: 109.0 + (Math.random() * 0.7 - 0.3)    // ~108.7 to 109.4 E (Red Zone ~45-80 NM)
        },
        {
            type: 'Southeast Recurve Track',
            startLat: 6.8 + (Math.random() * 1.0 - 0.5),  // ~6.3 to 7.3 N
            startLon: 123.8 + (Math.random() * 1.4 - 0.5), // ~123.3 to 125.2 E (Green Zone ~910-980 NM)
            endLat: 7.9 + (Math.random() * 0.6 - 0.2),    // ~7.7 to 8.3 N
            endLon: 109.4 + (Math.random() * 0.8 - 0.3)    // ~109.1 to 109.9 E (Red Zone ~70-110 NM)
        }
    ];

    const track = trajectoryTypes[Math.floor(Math.random() * trajectoryTypes.length)];

    // Randomize storm peak intensity archetype (Calibrated 5% lower max wind: ~58 to 82 kts)
    const peakWind = Math.round((65 + Math.floor(Math.random() * 24)) * 0.95);
    const baseTranslateSpeed = 11 + Math.floor(Math.random() * 4); // 11 to 14 kts

    // 6 Progression checkpoints across 3 Days (Day 1 Green -> Day 2 Yellow -> Day 3 Red)
    const timeline = [
        { day: 'Day 1', time: '06:00', progress: 0.00, windFrac: 0.35, rdpWindBase: 11 },
        { day: 'Day 1', time: '18:00', progress: 0.18, windFrac: 0.48, rdpWindBase: 15 },
        { day: 'Day 2', time: '06:00', progress: 0.38, windFrac: 0.65, rdpWindBase: 20 },
        { day: 'Day 2', time: '18:00', progress: 0.58, windFrac: 0.78, rdpWindBase: 27 },
        { day: 'Day 3', time: '06:00', progress: 0.78, windFrac: 0.90, rdpWindBase: 38 },
        { day: 'Day 3', time: '18:00', progress: 1.00, windFrac: 1.00, rdpWindBase: 50 }
    ];

    // Compute coordinate waypoints with natural curvature
    const coords = timeline.map((pt, i) => {
        const t = pt.progress;
        // Cubic spline easing with random wobble (+/- 0.15 deg)
        const latWobble = (Math.sin(t * Math.PI) * 0.25) + (Math.random() * 0.16 - 0.08);
        const lonWobble = (Math.random() * 0.16 - 0.08);

        const lat = +(track.startLat + (track.endLat - track.startLat) * t + latWobble).toFixed(2);
        const lon = +(track.startLon + (track.endLon - track.startLon) * t + lonWobble).toFixed(2);
        return { lat, lon };
    });

    const records = timeline.map((pt, i) => {
        const { lat, lon } = coords[i];

        // Determine moving direction from next or previous coordinate
        let movingDirection = 'W';
        if (i < coords.length - 1) {
            movingDirection = computeDirection16(lat, lon, coords[i + 1].lat, coords[i + 1].lon);
        } else if (i > 0) {
            movingDirection = computeDirection16(coords[i - 1].lat, coords[i - 1].lon, lat, lon);
        }

        // Realistic randomized wind speed & gust (5% lower maximum intensity)
        const rawWind = 28 + (peakWind - 28) * pt.windFrac + (Math.random() * 3.0 - 1.5);
        const windSpeed = Math.round(rawWind * 0.95);
        const windGust = Math.round(windSpeed * (1.16 + Math.random() * 0.07));
        const movingSpeed = Math.max(9, Math.min(16, baseTranslateSpeed + Math.floor(Math.random() * 3 - 1)));

        // Realistic local wind readings on RDP as storm approaches (5% lower calibration)
        const ltWindSpeed = Math.round((pt.rdpWindBase + (Math.random() * 3.0 - 1.5)) * 0.95);
        const ltWindGust = Math.round(ltWindSpeed * (1.18 + Math.random() * 0.06));

        return {
            stormName: drillCodename,
            date: pt.day,
            time: pt.time,
            lat,
            lon,
            windSpeed,
            windGust,
            movingSpeed,
            movingDirection,
            ltWindSpeed,
            ltWindGust
        };
    });

    return {
        name: `Automated Drill (${drillCodename})`,
        description: `Dynamic ${track.type}: Green Zone -> Yellow Zone -> Red Zone escalation (Peak: ${peakWind} kts, Gust: ~${Math.round(peakWind * 1.2)} kts).`,
        records
    };
}

/**
 * Fetch live offshore marine weather for Rong Doi Platform coordinates from Open-Meteo
 * @param {number} lat 
 * @param {number} lon 
 */
export async function fetchLivePlatformWeather(lat = 7.7925, lon = 108.2021) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure&wind_speed_unit=kn`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather API request failed');
        const data = await res.json();

        return {
            windSpeedKnots: Math.round(data.current.wind_speed_10m || 0),
            windGustKnots: Math.round(data.current.wind_gusts_10m || 0),
            windDirectionDeg: data.current.wind_direction_10m || 0,
            surfacePressureHpa: data.current.surface_pressure || 1012,
            timestamp: data.current.time
        };
    } catch (e) {
        console.warn('Unable to reach Open-Meteo Marine API, using simulated values:', e);
        return null;
    }
}
