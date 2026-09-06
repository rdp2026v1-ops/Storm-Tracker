/**
 * Interactive Marine GIS Map Module (Leaflet.js)
 * Customized for Rong Doi Field (Block 11.2 & Block 12.11):
 * - Free, high-resolution tile layers (Esri Dark Maritime, Esri Satellite, OSM - No API keys, No watermarks)
 * - Compact Rong Doi Central Complex (RDP) marker with RD Vertical picture
 * - Small BK-TNHA Wellhead orange point (without text inside)
 * - Dynamic zoom scaling
 * - 1000 NM / 750 NM / 240 NM Geodesic Perimeter Rings
 */

import { sfx } from './checklist.js';
import { RONG_DOI_DEFAULT, BK_TNHA_DEFAULT, calculateDistanceNM } from './storm-calc.js';

export class MarineMap {
    constructor({ containerId = 'map', homeCoords = RONG_DOI_DEFAULT, bkCoords = BK_TNHA_DEFAULT }) {
        this.containerId = containerId;
        this.homeCoords = { ...homeCoords };
        this.bkCoords = { ...bkCoords };
        this.map = null;
        this.platformMarker = null;
        this.bkMarker = null;
        this.rings = { 1000: null, 750: null, 240: null };
        this.stormTrackLayer = null;
        this.waypointMarkers = [];
        this.animatingMarker = null;
        this.animationTimer = null;
        this.isAnimating = false;

        this.initMap();
    }

    initMap() {
        if (!window.L) {
            console.error('Leaflet library is not loaded');
            return;
        }

        // 1. Dark Nautical Map Layer (Esri Dark Gray Canvas + Reference Labels - 100% Free, No Watermarks, No API Key)
        const esriDarkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap',
            maxZoom: 16
        });

        const esriDarkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
            attribution: '',
            maxZoom: 16,
            opacity: 0.85
        });

        const darkLayerGroup = L.layerGroup([esriDarkBase, esriDarkLabels]);

        // 2. High-Resolution Satellite Imagery (Esri World Imagery - Free, No Watermark)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri, Maxar, Earthstar Geographics',
            maxZoom: 18
        });

        // 3. Standard OpenStreetMap
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18
        });

        // Initialize Map centered on Rong Doi Field in South China Sea / East Sea
        this.map = L.map(this.containerId, {
            center: [10.2, 113.0],
            zoom: 5.5,
            layers: [darkLayerGroup],
            zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        // Layer Switcher
        const baseMaps = {
            'Dark Nautical': darkLayerGroup,
            'Satellite Imagery': satelliteLayer,
            'Standard Map': osmLayer
        };
        L.control.layers(baseMaps, null, { position: 'topright' }).addTo(this.map);

        // Map Feature Groups
        this.stormTrackLayer = L.featureGroup().addTo(this.map);

        // Plot Offshore Field Platforms & Safety Rings
        this.plotFieldFacilities();
        this.updateRings({ show1000: true, show750: true, show240: true });

        // Listen for map zoom events to scale RDP & BK-TNHA icons dynamically
        this.map.on('zoom', () => this.updateFacilityScale());
        this.map.on('zoomend', () => this.updateFacilityScale());
    }

    setHomeCoordinates(lat, lon) {
        this.homeCoords.lat = lat;
        this.homeCoords.lon = lon;
        this.plotFieldFacilities();
        this.updateRings(this.getCurrentRingVisibility());
    }

    /**
     * Compute compact, dynamic, zoom-dependent icon sizes for RDP and BK-TNHA
     */
    getScaleMetrics() {
        const zoom = this.map ? this.map.getZoom() : 5.5;
        // Mild scaling based on zoom level relative to baseline (zoom 5.5)
        const scale = Math.pow(1.18, zoom - 5.5);

        // Compact RDP Dimensions (Clamped between 20px and 64px)
        const rdpSize = Math.max(20, Math.min(64, Math.round(32 * scale)));
        const rdpPulse = Math.round(rdpSize * 1.3);
        const rdpLabelTop = Math.round(rdpSize * 0.95) + 3;
        const rdpFontSize = Math.max(0.55, Math.min(0.78, 0.65 * Math.pow(1.05, zoom - 5.5))).toFixed(2);

        // Compact BK-TNHA Orange Dot (Clamped between 4px and 12px)
        const bkDot = Math.max(4, Math.min(12, Math.round(6 * scale)));
        const bkPulse = Math.round(bkDot * 2.5);
        const bkLabelTop = Math.round(bkDot * 1.3) + 4;
        const bkFontSize = Math.max(0.5, Math.min(0.72, 0.6 * Math.pow(1.05, zoom - 5.5))).toFixed(2);

        return {
            zoom,
            rdpSize,
            rdpPulse,
            rdpLabelTop,
            rdpFontSize,
            bkDot,
            bkPulse,
            bkLabelTop,
            bkFontSize
        };
    }

    createRdpIcon() {
        const m = this.getScaleMetrics();
        return L.divIcon({
            className: 'custom-platform-marker rdp-large-marker',
            html: `
                <div class="platform-beacon-pulse rdp-pulse-large" style="width: ${m.rdpPulse}px; height: ${m.rdpPulse}px;"></div>
                <div class="platform-icon-container rdp-large-container" style="width: ${m.rdpSize}px; height: ${m.rdpSize}px;">
                    <img class="rdp-hero-img" src="assets/images/RD Vertical - transparent.png" alt="Rong Doi Platform" style="width: ${m.rdpSize}px; height: ${m.rdpSize}px;" onerror="this.src='assets/images/storm.png';" />
                    <span class="platform-label rdp-label" style="top: ${m.rdpLabelTop}px; font-size: ${m.rdpFontSize}rem;">RONG DOI (RDP)</span>
                </div>
            `,
            iconSize: [m.rdpSize, m.rdpSize],
            iconAnchor: [m.rdpSize / 2, m.rdpSize / 2]
        });
    }

    createBkIcon() {
        const m = this.getScaleMetrics();
        const boxSize = Math.max(m.bkPulse, m.bkDot + 10);
        return L.divIcon({
            className: 'bk-point-wrapper',
            html: `
                <div class="bk-orange-pulse" style="width: ${m.bkPulse}px; height: ${m.bkPulse}px;"></div>
                <div class="bk-orange-dot" style="width: ${m.bkDot}px; height: ${m.bkDot}px;" title="BK-TNHA (${this.bkCoords.lat}°N, ${this.bkCoords.lon}°E)"></div>
                <span class="platform-label bk-label" style="top: ${m.bkLabelTop}px; font-size: ${m.bkFontSize}rem;">BK-TNHA</span>
            `,
            iconSize: [boxSize, boxSize],
            iconAnchor: [boxSize / 2, boxSize / 2]
        });
    }

    updateFacilityScale() {
        if (this.platformMarker) {
            this.platformMarker.setIcon(this.createRdpIcon());
        }
        if (this.bkMarker) {
            this.bkMarker.setIcon(this.createBkIcon());
        }
    }

    plotFieldFacilities() {
        // Clear previous markers
        if (this.platformMarker) this.map.removeLayer(this.platformMarker);
        if (this.bkMarker) this.map.removeLayer(this.bkMarker);

        const distRdpToBk = calculateDistanceNM(
            this.homeCoords.lat, this.homeCoords.lon,
            this.bkCoords.lat, this.bkCoords.lon
        );

        // 1. Rong Doi Central Platform (RDP)
        this.platformMarker = L.marker([this.homeCoords.lat, this.homeCoords.lon], { icon: this.createRdpIcon() })
            .addTo(this.map)
            .bindPopup(`
                <div class="popup-card">
                    <h4>🏗️ Rong Doi Central Complex (RDP)</h4>
                    <p><strong>Position:</strong> ${this.homeCoords.lat.toFixed(4)}°N, ${this.homeCoords.lon.toFixed(4)}°E</p>
                    <p><strong>Location:</strong> Block 11.2, Nam Con Son Basin</p>
                    <p><strong>Facilities:</strong> Central PUQC, Living Quarters, Helideck</p>
                    <p><strong>FSO:</strong> PPS-01 Field Tanker Connected</p>
                    <p><strong>Distance to BK-TNHA:</strong> ${distRdpToBk.toFixed(2)} NM</p>
                </div>
            `);

        // 2. BK-TNHA Wellhead: Small Orange Point (without text inside)
        this.bkMarker = L.marker([this.bkCoords.lat, this.bkCoords.lon], { icon: this.createBkIcon() })
            .addTo(this.map)
            .bindPopup(`
                <div class="popup-card">
                    <h4>⚓ BK-TNHA Wellhead Platform (WHP)</h4>
                    <p><strong>Position:</strong> ${this.bkCoords.lat.toFixed(4)}°N, ${this.bkCoords.lon.toFixed(4)}°E</p>
                    <p><strong>Field:</strong> Block 12.11</p>
                    <p><strong>Type:</strong> Unmanned Wellhead Facility</p>
                    <p><strong>Distance to RDP:</strong> ${distRdpToBk.toFixed(2)} NM</p>
                </div>
            `);
    }

    /**
     * Render safety perimeter rings based on revised RDP SOP:
     * - 1000 NM (Green Zone: 1000 NM to 750 NM)
     * - 750 NM (Yellow Zone: 750 NM to 240 NM)
     * - 240 NM (Red Zone: < 240 NM)
     */
    updateRings({ show1000 = true, show750 = true, show240 = true }) {
        const nmToMeters = 1852;
        const ringsConfig = [
            { dist: 1000, color: '#10B981', show: show1000, dash: '8, 8', name: 'Green Zone (1000 NM to 750 NM / < 48 hrs)' },
            { dist: 750, color: '#EAB308', show: show750, dash: '6, 6', name: 'Yellow Zone (750 NM to 240 NM / < 36 hrs)' },
            { dist: 240, color: '#EF4444', show: show240, dash: '4, 4', name: 'Red Zone (Within 240 NM / < 24 hrs)' }
        ];

        ringsConfig.forEach(({ dist, color, show, dash, name }) => {
            if (this.rings[dist]) {
                this.map.removeLayer(this.rings[dist]);
                this.rings[dist] = null;
            }

            if (show) {
                this.rings[dist] = L.circle([this.homeCoords.lat, this.homeCoords.lon], {
                    radius: dist * nmToMeters,
                    color: color,
                    weight: dist === 240 ? 2.5 : 2,
                    dashArray: dash,
                    fillColor: color,
                    fillOpacity: dist === 240 ? 0.08 : 0.03,
                    interactive: true
                }).addTo(this.map).bindTooltip(name, { sticky: true, className: 'ring-tooltip' });
            }
        });
    }

    getCurrentRingVisibility() {
        return {
            show1000: !!this.rings[1000],
            show750: !!this.rings[750],
            show240: !!this.rings[240]
        };
    }

    renderStormTrack(records) {
        this.clearStormTrack();
        if (!records || records.length === 0) return;

        const latlngs = [];

        records.forEach((record, index) => {
            const point = [record.lat, record.lon];
            latlngs.push(point);

            const isLatest = index === records.length - 1;
            const marker = this.createWaypointMarker(record, isLatest);
            marker.addTo(this.stormTrackLayer);
            this.waypointMarkers.push(marker);
        });

        // Draw connecting polyline path
        if (latlngs.length > 1) {
            L.polyline(latlngs, {
                color: '#F97316',
                weight: 3,
                dashArray: '6, 6',
                opacity: 0.9,
                lineJoin: 'round'
            }).addTo(this.stormTrackLayer);
        }

        // Fit map bounds smoothly
        if (latlngs.length > 0) {
            const allPoints = [
                ...latlngs,
                [this.homeCoords.lat, this.homeCoords.lon],
                [this.bkCoords.lat, this.bkCoords.lon]
            ];
            this.map.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60], maxZoom: 8 });
        }
    }

    createWaypointMarker(record, isLatest = false) {
        const dir = (record.movingDirection || 'N').toUpperCase();
        const iconPath = `assets/icons/${dir}.png`;
        const stormIconPath = 'assets/images/storm.png';

        const distToBk = calculateDistanceNM(record.lat, record.lon, this.bkCoords.lat, this.bkCoords.lon);

        // Baseline: 34 knots = 50px icon size. Proportional scaling by factor (windSpeed / 34)
        const windSpeed = Math.max(10, record.windSpeed || 34);
        const factor = windSpeed / 34;
        const iconSizePx = Math.max(26, Math.min(130, Math.round(50 * factor)));
        const halfSizePx = Math.round(iconSizePx / 2);
        const arrowSizePx = Math.round(iconSizePx * 0.46);
        const vortexSizePx = Math.round(iconSizePx * 0.74);
        const fontSizeRem = (0.65 * Math.max(0.75, Math.min(1.25, Math.sqrt(factor)))).toFixed(2);
        const badgeBottomPx = -Math.round(iconSizePx * 0.12);

        const customIcon = L.divIcon({
            className: 'storm-waypoint-marker',
            html: `
                <div class="storm-marker-box ${isLatest ? 'latest-waypoint' : ''}" style="width: ${iconSizePx}px; height: ${iconSizePx}px; position: relative; display: flex; align-items: center; justify-content: center;">
                    <img class="storm-arrow-img" src="${iconPath}" alt="${dir}" onerror="this.style.display='none'" style="width: ${arrowSizePx}px; height: ${arrowSizePx}px; position: absolute; z-index: 5;" />
                    <img class="storm-vortex-img" src="${stormIconPath}" alt="Storm" style="width: ${vortexSizePx}px; height: ${vortexSizePx}px; position: absolute; z-index: 4;" />
                    <div class="storm-badge-info" style="position: absolute; bottom: ${badgeBottomPx}px; background: rgba(0,0,0,0.85); border: 1px solid #f97316; border-radius: 4px; padding: 1px 4px; white-space: nowrap; z-index: 6;">
                        <span class="badge-wind" style="color: #fb923c; font-size: ${fontSizeRem}rem; font-weight: 700; font-family: monospace;">${record.windSpeed} kts</span>
                    </div>
                </div>
            `,
            iconSize: [iconSizePx, iconSizePx],
            iconAnchor: [halfSizePx, halfSizePx]
        });

        const marker = L.marker([record.lat, record.lon], { icon: customIcon });

        marker.bindPopup(`
            <div class="popup-card storm-popup">
                <h4>🌀 ${record.stormName || 'UNNAMED'}</h4>
                <div class="popup-grid">
                    <div><strong>Date/Time:</strong> ${record.date || ''} ${record.time || ''}</div>
                    <div><strong>Coordinates:</strong> ${record.lat.toFixed(2)}°N, ${record.lon.toFixed(2)}°E</div>
                    <div><strong>Wind Speed:</strong> <span class="text-orange">${record.windSpeed} kts</span> (Gust: ${record.windGust} kts)</div>
                    <div><strong>Movement:</strong> ${record.movingSpeed} kts towards ${record.movingDirection}</div>
                    <div><strong>Distance to RDP:</strong> ${record.distanceNM ? record.distanceNM.toFixed(1) + ' NM' : 'N/A'}</div>
                    <div><strong>Distance to BK-TNHA:</strong> ${distToBk.toFixed(1)} NM</div>
                    <div><strong>Predicted Tp:</strong> ${record.tp ? record.tp.toFixed(1) + ' hrs' : 'N/A'}</div>
                    <div><strong>RDP Local Wind:</strong> ${record.ltWindSpeed || 0} kts (Gust: ${record.ltWindGust || 0} kts)</div>
                </div>
            </div>
        `);

        return marker;
    }

    clearStormTrack() {
        this.stopAnimation();
        this.stormTrackLayer.clearLayers();
        this.waypointMarkers = [];
    }

    startAnimation(records, onComplete = null) {
        if (!records || records.length < 2) {
            alert('At least 2 waypoints are required to simulate storm animation.');
            return;
        }

        this.stopAnimation();
        this.isAnimating = true;

        // Play thunder sound effect and store reference to stop synchronously
        this.currentAudio = sfx.playThunder();

        const firstWind = Math.max(10, records[0]?.windSpeed || 34);
        const initFactor = firstWind / 34;
        const initSizePx = Math.max(26, Math.min(130, Math.round(50 * initFactor)));
        const initHalfPx = Math.round(initSizePx / 2);

        const animIcon = L.divIcon({
            className: 'storm-animating-vortex-wrapper',
            html: `
                <div id="animating-vortex-box" style="width: ${initSizePx}px; height: ${initSizePx}px; margin-left: -${initHalfPx}px; margin-top: -${initHalfPx}px; display: flex; align-items: center; justify-content: center; position: relative;">
                    <img id="rotating-storm-img" src="assets/images/storm.png" alt="Simulating Storm" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.8)); transition: width 0.05s linear, height 0.05s linear;" />
                </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
        });

        let currentIdx = 0;
        let step = 0;
        const totalSteps = 50; // Steps per segment

        const startPt = records[0];
        this.animatingMarker = L.marker([startPt.lat, startPt.lon], { icon: animIcon }).addTo(this.map);

        const rotateStep = () => {
            if (!this.isAnimating) return;

            if (currentIdx >= records.length - 1) {
                this.stopAnimation();
                if (onComplete) onComplete();
                return;
            }

            const p1 = records[currentIdx];
            const p2 = records[currentIdx + 1];
            const progress = step / totalSteps;

            const curLat = p1.lat + (p2.lat - p1.lat) * progress;
            const curLon = p1.lon + (p2.lon - p1.lon) * progress;

            // Interpolate wind speed between current and next waypoint
            const w1 = Math.max(10, p1.windSpeed || 34);
            const w2 = Math.max(10, p2.windSpeed || 34);
            const curWind = w1 + (w2 - w1) * progress;

            // Compute exact proportional icon size (50px baseline at 34 kts)
            const curFactor = curWind / 34;
            const curSizePx = Math.max(26, Math.min(130, Math.round(50 * curFactor)));
            const curHalfPx = Math.round(curSizePx / 2);

            this.animatingMarker.setLatLng([curLat, curLon]);

            const box = document.getElementById('animating-vortex-box');
            const img = document.getElementById('rotating-storm-img');
            if (box) {
                box.style.width = `${curSizePx}px`;
                box.style.height = `${curSizePx}px`;
                box.style.marginLeft = `-${curHalfPx}px`;
                box.style.marginTop = `-${curHalfPx}px`;
            }
            if (img) {
                const angle = (step * 14 + currentIdx * 360) % 360;
                img.style.transform = `rotate(${angle}deg)`;
            }

            step++;
            if (step > totalSteps) {
                step = 0;
                currentIdx++;
            }

            // 100ms per step (smooth motion)
            this.animationTimer = setTimeout(rotateStep, 100);
        };

        rotateStep();
    }

    stopAnimation() {
        this.isAnimating = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
        if (this.animatingMarker) {
            this.map.removeLayer(this.animatingMarker);
            this.animatingMarker = null;
        }
        // Stop sound immediately when animation stops or finishes
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) {
                console.warn('Error stopping thunder sound:', e);
            }
            this.currentAudio = null;
        }
    }
}
