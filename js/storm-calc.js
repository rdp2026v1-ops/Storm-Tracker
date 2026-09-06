/**
 * Storm Calculations & Geodesic Utilities
 * Customized for Rong Doi Platform (RDP) & BK-TNHA WHP
 * Based on Typhoon Evacuation - RDP.docx SOP
 */

export const RONG_DOI_DEFAULT = {
    name: 'Rong Doi Platform (RDP)',
    code: 'RDP',
    lat: 7.7925,
    lon: 108.2021,
    description: 'Central Production Complex (PUQC), Block 11.2, Nam Con Son Basin'
};

export const BK_TNHA_DEFAULT = {
    name: 'BK-TNHA Wellhead Platform (WHP)',
    code: 'BK-TNHA',
    lat: 7.7300,
    lon: 107.9300,
    description: 'BK-TNHA Wellhead Platform, Block 12.11'
};

export const DIRECTIONS_16 = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in Nautical Miles (NM)
 */
export function calculateDistanceNM(lat1, lon1, lat2, lon2) {
    const R = 6371.0; // Earth radius in km
    const toRad = deg => (deg * Math.PI) / 180.0;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    return distanceKm / 1.852; // Convert km to Nautical Miles
}

/**
 * Calculate predicted time of arrival to 100 NM safety perimeter (Tp)
 * @param {number} distanceNM 
 * @param {number} movingSpeedKnots 
 * @param {number} stormLon 
 * @param {number} homeLon 
 * @returns {{ tp: number, days: number, hours: number, hasPassed: boolean, isSurrounding: boolean }}
 */
export function calculateArrivalTime(distanceNM, movingSpeedKnots, stormLon, homeLon) {
    const hasPassed = (stormLon - homeLon) <= -1.0;
    
    if (movingSpeedKnots <= 0) {
        return { tp: 0, days: 0, hours: 0, hasPassed, isSurrounding: false };
    }

    let tp = 0;
    let isSurrounding = false;

    if (distanceNM > 100) {
        tp = (distanceNM - 100) / movingSpeedKnots;
    } else {
        tp = 0;
        isSurrounding = true;
    }

    const days = Math.floor(tp / 24);
    const hours = +(tp % 24).toFixed(1);

    return {
        tp: +tp.toFixed(2),
        days,
        hours,
        hasPassed,
        isSurrounding
    };
}

/**
 * Calculate general approach direction from storm to platform
 * @param {number} stormLat 
 * @param {number} stormLon 
 * @param {number} homeLat 
 * @param {number} homeLon 
 * @returns {string} Direction string
 */
export function calculateApproachDirection(stormLat, stormLon, homeLat, homeLon) {
    const dLat = stormLat - homeLat;
    const dLon = stormLon - homeLon;
    const angleRad = Math.atan2(dLon, dLat);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    // Map 360 degrees to 8 cardinal sectors
    const sectors = [
        'North', 'North East', 'East', 'South East',
        'South', 'South West', 'West', 'North West'
    ];
    const index = Math.round(angleDeg / 45) % 8;
    return sectors[index];
}

/**
 * Determine storm classification based on maximum sustained wind speed (knots)
 * @param {number} windSpeed 
 * @returns {{ category: string, code: string, color: string, badgeClass: string }}
 */
export function getStormCategory(windSpeed) {
    if (windSpeed >= 64) {
        return { category: 'TYPHOON', code: 'TY', color: '#EF4444', badgeClass: 'badge-typhoon' };
    } else if (windSpeed >= 48) {
        return { category: 'SEVERE TROPICAL STORM', code: 'STS', color: '#F97316', badgeClass: 'badge-severe' };
    } else if (windSpeed >= 34) {
        return { category: 'TROPICAL STORM', code: 'TS', color: '#EAB308', badgeClass: 'badge-tropical' };
    } else if (windSpeed >= 17) {
        return { category: 'TROPICAL DEPRESSION', code: 'TD', color: '#3B82F6', badgeClass: 'badge-depression' };
    } else {
        return { category: 'FAIR / LOW PRESSURE', code: 'FAIR', color: '#10B981', badgeClass: 'badge-fair' };
    }
}

/**
 * Determine emergency zone code & operational guidance based on RDP SOP:
 * RED Zone <= 240 NM (< 24 hrs)
 * YELLOW Zone: 750 NM to 240 NM (< 36 hrs)
 * GREEN Zone: 1000 NM to 750 NM (< 48 hrs)
 * @param {number} distanceNM 
 * @param {number} windSpeed 
 * @param {number} rdpWindSpeed 
 * @param {number} rdpWindGust 
 * @param {boolean} hasPassed 
 * @param {string} approachDirection 
 * @returns {object} Full advisory object
 */
export function getEmergencyAdvisory(distanceNM, windSpeed, rdpWindSpeed, rdpWindGust, hasPassed, approachDirection) {
    let zoneCode = 'GREEN';
    let zoneColor = '#10B981';
    let zoneTitle = 'CODE GREEN (1000 NM to 750 NM)';
    let actionSummary = 'Monitor situation, 3-hourly forecasts, review WHP BK-TNHA & RDP shutdown readiness, standby helicopter.';

    if (distanceNM <= 240) {
        zoneCode = 'RED';
        zoneColor = '#EF4444';
        zoneTitle = 'CODE RED (Within 240 NM / < 24 hrs)';
        actionSummary = 'RED ALERT: Execute ESD-1 platform shutdown & depressurization. Final evacuation and platform abandonment.';
    } else if (distanceNM <= 750) {
        zoneCode = 'YELLOW';
        zoneColor = '#EAB308';
        zoneTitle = 'CODE YELLOW (750 NM to 240 NM / < 36 hrs)';
        actionSummary = 'YELLOW ALERT: Down-man all non-essential personnel (Flight #1). Cease FSO PPS-01 offtake, secure loose items on RDP & BK-TNHA.';
    } else if (distanceNM <= 1000) {
        zoneCode = 'GREEN';
        zoneColor = '#10B981';
        zoneTitle = 'CODE GREEN (1000 NM to 750 NM / < 48 hrs)';
        actionSummary = 'GREEN ALERT: OIM declared. Monitor 3-hourly, ensure emergency communications, ready VNHS helicopter standby.';
    } else {
        zoneCode = 'INFO';
        zoneColor = '#6B7280';
        zoneTitle = 'INFORMATIONAL (Outside 1000 NM)';
        actionSummary = 'Storm is currently outside the 1000 NM surveillance perimeter. Maintain routine tracking.';
    }

    // Platform sea-state advisory
    let platformCondition = 'No adverse weather. Be vigilant and stay informed.';
    let helicopterStatus = 'Helicopter operations normal.';
    
    if (rdpWindSpeed >= 55 || rdpWindGust >= 64) {
        platformCondition = 'Extremely high waves & violent gale. Shelter indoors; all WHP/deck work suspended.';
        helicopterStatus = '⚠️ Helicopters may NOT be available in these weather conditions.';
    } else if (rdpWindSpeed >= 48 || rdpWindGust >= 48) {
        platformCondition = 'Super high waves & strong wind. Extreme caution, outside deck access prohibited.';
        helicopterStatus = '⚠️ Helicopter flights restricted or on emergency standby only.';
    } else if (rdpWindSpeed >= 34 || rdpWindGust >= 34) {
        platformCondition = 'Significant high waves & strong winds. Secure outdoor equipment & loose objects on RDP and BK-TNHA.';
        helicopterStatus = 'Helicopter operations subject to weather window assessment.';
    } else if (rdpWindSpeed >= 17 || rdpWindGust >= 17) {
        platformCondition = 'Moderate wave action & fresh breeze. Exercise caution during deck and boat transfer operations.';
        helicopterStatus = 'Helicopter flights operational with caution.';
    }

    return {
        zoneCode,
        zoneColor,
        zoneTitle,
        actionSummary,
        platformCondition,
        helicopterStatus,
        hasPassed,
        approachDirection
    };
}
