/**
 * Main Application Controller
 * Customized for Rong Doi Platform (RDP - Block 11.2) & BK-TNHA (Block 12.11)
 */

import {
    RONG_DOI_DEFAULT,
    BK_TNHA_DEFAULT,
    calculateDistanceNM,
    calculateArrivalTime,
    calculateApproachDirection,
    getStormCategory,
    getEmergencyAdvisory
} from './storm-calc.js';

import { MarineMap } from './map.js';
import { ChecklistManager, CHECKLIST_DEFINITIONS, parseChecklistItem, ROLE_STYLES, sfx } from './checklist.js';
import { SyncEngine, OPERATING_STATIONS } from './sync.js';
import { exportToExcel, exportToCSV, exportActionLogToExcel } from './export.js';
import { HISTORIC_TYPHOON_PRESETS, generateAutomaticDrillScenario, fetchLivePlatformWeather } from './live-feed.js';

class AppController {
    constructor() {
        this.records = this.loadRecords();
        this.actionLogs = this.loadActionLogs();
        this.activeLogFilter = 'ALL';
        this.homeCoords = { ...RONG_DOI_DEFAULT };
        this.bkCoords = { ...BK_TNHA_DEFAULT };
        this.activeZoneModal = 'GREEN';

        this.map = new MarineMap({
            containerId: 'map',
            homeCoords: this.homeCoords,
            bkCoords: this.bkCoords
        });

        this.checklists = new ChecklistManager('rdp_storm_tracker_checklists', () => {
            this.updateChecklistBadges();
            this.syncEngine.broadcast('checklist_updated', this.checklists.states);
        });

        this.syncEngine = new SyncEngine({
            roomName: 'rong-doi-ops',
            onDataReceived: (data) => this.handleRemoteSync(data)
        });

        this.initDOM();
        this.initEvents();
        this.initClock();
        this.applyRolePermissions();
        this.renderAll();
    }

    loadRecords() {
        try {
            const saved = localStorage.getItem('rdp_storm_tracker_records');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveRecords() {
        try {
            localStorage.setItem('rdp_storm_tracker_records', JSON.stringify(this.records));
            this.syncEngine.broadcast('records_updated', this.records);
        } catch (e) {
            console.error('Failed to save records:', e);
        }
    }

    loadActionLogs() {
        try {
            const saved = localStorage.getItem('rdp_storm_action_logs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveActionLogs() {
        try {
            localStorage.setItem('rdp_storm_action_logs', JSON.stringify(this.actionLogs));
        } catch (e) {
            console.error('Failed to save action logs:', e);
        }
    }

    logAction(category, details, customStation = null) {
        const station = customStation || this.syncEngine.getStation();
        const now = new Date();
        const timestampFormatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        const entry = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: Date.now(),
            timestampFormatted,
            stationRole: station.id,
            stationName: station.name,
            stationShort: station.shortName,
            badgeColor: station.badgeColor || '#38bdf8',
            icon: station.icon || '🛡️',
            category: category.toUpperCase(),
            details
        };

        this.actionLogs.unshift(entry);
        if (this.actionLogs.length > 500) {
            this.actionLogs.pop();
        }

        this.saveActionLogs();
        this.syncEngine.broadcast('action_logged', entry);

        if (document.getElementById('modal-action-log')?.classList.contains('active')) {
            this.renderActionLogModal();
        }
    }

    handleRemoteSync(message) {
        if (message.action === 'records_updated') {
            this.records = message.payload || [];
            this.renderAll();
        } else if (message.action === 'checklist_updated') {
            this.checklists.states = message.payload || {};
            this.updateChecklistBadges();
            if (document.getElementById('modal-checklist').classList.contains('active')) {
                this.renderChecklistModal(this.activeZoneModal);
            }
        } else if (message.action === 'action_logged') {
            const newLog = message.payload;
            if (newLog && !this.actionLogs.some(l => l.id === newLog.id)) {
                this.actionLogs.unshift(newLog);
                if (this.actionLogs.length > 500) this.actionLogs.pop();
                this.saveActionLogs();
                if (document.getElementById('modal-action-log')?.classList.contains('active')) {
                    this.renderActionLogModal();
                }
            }
        }
    }

    applyRolePermissions() {
        const station = this.syncEngine.getStation();
        const syncLabel = document.getElementById('sync-label');
        if (syncLabel) {
            syncLabel.textContent = `Live Sync: ${station.name} (${this.syncEngine.roomName})`;
        }

        // Storm data input form elements
        const formInputs = this.form?.querySelectorAll('input, select, button[type="submit"]');
        const btnReset = document.getElementById('btn-reset');
        const presetSelect = document.getElementById('preset-selector');
        const btnGenDrill = document.getElementById('btn-generate-drill');
        const btnFetchWx = document.getElementById('btn-fetch-live-wx');

        // Check station authorization
        const canInput = !!station.canInputStormData;

        if (formInputs) {
            formInputs.forEach(el => {
                if (el.id !== 'btn-animate') {
                    el.disabled = !canInput;
                }
            });
        }

        if (btnReset) btnReset.disabled = !canInput;
        if (presetSelect) presetSelect.disabled = !canInput;
        if (btnGenDrill) btnGenDrill.disabled = !canInput;
        if (btnFetchWx) btnFetchWx.disabled = !canInput;

        // Visual notice if storm input is disabled
        let notice = document.getElementById('station-auth-notice');
        if (!notice && this.form) {
            notice = document.createElement('div');
            notice.id = 'station-auth-notice';
            notice.className = 'readonly-station-banner';
            this.form.parentElement.insertBefore(notice, this.form);
        }

        if (notice) {
            if (!canInput) {
                notice.style.display = 'flex';
                notice.innerHTML = `
                    <span>🔒</span>
                    <div>
                        <strong>Station Access [${station.shortName}]:</strong> Storm data input is restricted to <em>Offshore CCR – CRT</em>. Checklists authorized: ${station.canTickChecklist ? '✅ Yes' : '❌ Read-Only'}.
                    </div>
                `;
            } else {
                notice.style.display = 'none';
            }
        }

        // Update action log current station text
        const logStationBadge = document.getElementById('log-current-station');
        if (logStationBadge) {
            logStationBadge.textContent = `Active: ${station.shortName}`;
            logStationBadge.style.color = station.badgeColor;
            logStationBadge.style.background = `${station.badgeColor}22`;
        }
    }

    initDOM() {
        this.form = document.getElementById('storm-form');
        this.tableBody = document.getElementById('table-body');
        this.alertBanner = document.getElementById('alert-banner');
        this.alertIcon = document.getElementById('alert-icon');
        this.alertHeadline = document.getElementById('alert-headline');
        this.alertDetails = document.getElementById('alert-details');
        this.metricDistance = document.getElementById('metric-distance');
        this.metricTp = document.getElementById('metric-tp');
        this.metricApproach = document.getElementById('metric-approach');

        this.resetForm();
    }

    resetForm() {
        if (this.form) this.form.reset();
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');

        const stormDate = document.getElementById('storm-date');
        const stormTime = document.getElementById('storm-time');
        const stormName = document.getElementById('storm-name');
        const movingDir = document.getElementById('moving-direction');
        const presetSel = document.getElementById('preset-selector');

        if (stormDate) stormDate.value = `${dd}/${mm}`;
        if (stormTime) stormTime.value = `${hh}:${min}`;
        if (stormName) stormName.value = 'TYPHOON-01';
        if (movingDir) movingDir.value = 'WSW';
        if (presetSel) presetSel.value = '';

        // Explicitly clear all numeric coordinates and wind readings
        ['storm-lat', 'storm-lon', 'wind-speed', 'wind-gust', 'moving-speed', 'lt-wind-speed', 'lt-wind-gust'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }

    initEvents() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const station = this.syncEngine.getStation();
            if (!station.canInputStormData) {
                alert(`⚠️ Access Denied: Station "${station.name}" does not have authorization to input storm waypoint data. Switch to "Offshore Central Control Room (CCR – CRT)" in Live Sync.`);
                return;
            }
            this.handleFormSubmit();
        });

        document.getElementById('btn-reset').addEventListener('click', (e) => {
            e.preventDefault();
            const station = this.syncEngine.getStation();
            if (!station.canInputStormData) {
                alert(`⚠️ Access Denied: Station "${station.name}" cannot reset tracking data.`);
                return;
            }

            this.records = [];
            try {
                localStorage.removeItem('rdp_storm_tracker_records');
            } catch (err) {}
            this.saveRecords();
            this.resetForm();
            if (this.map) {
                this.map.stopAnimation();
                this.map.clearStormTrack();
                if (this.map.map) {
                    this.map.map.setView([this.homeCoords.lat, this.homeCoords.lon], 5.5);
                }
            }
            this.renderAll();
            this.logAction('RESET', `Cleared storm tracking waypoints and reset dashboard to Standby.`);
        });

        document.getElementById('btn-animate').addEventListener('click', () => {
            this.map.startAnimation(this.records, () => {
                alert('Storm path animation completed.');
            });
        });

        // Safety Rings: 1000 NM, 750 NM, 240 NM
        const updateRings = () => {
            this.map.updateRings({
                show1000: document.getElementById('toggle-1000').checked,
                show750: document.getElementById('toggle-750').checked,
                show240: document.getElementById('toggle-240').checked
            });
        };
        document.getElementById('toggle-1000').addEventListener('change', updateRings);
        document.getElementById('toggle-750').addEventListener('change', updateRings);
        document.getElementById('toggle-240').addEventListener('change', updateRings);

        document.getElementById('preset-selector').addEventListener('change', (e) => {
            const station = this.syncEngine.getStation();
            if (!station.canInputStormData) {
                alert(`⚠️ Access Denied: Station "${station.name}" cannot load scenarios.`);
                e.target.value = '';
                return;
            }

            const val = e.target.value;
            if (!val) return;
            const idx = parseInt(val.replace('preset_', ''));
            const preset = HISTORIC_TYPHOON_PRESETS[idx];
            if (preset && confirm(`Load scenario: "${preset.name}"?`)) {
                this.loadPreset(preset);
                this.logAction('DRILL', `Loaded Historic Typhoon Scenario: "${preset.name}" (${preset.records.length} waypoints)`);
            }
        });

        // Auto-Generate Dynamic Drill Scenario
        document.getElementById('btn-generate-drill').addEventListener('click', () => {
            const station = this.syncEngine.getStation();
            if (!station.canInputStormData) {
                alert(`⚠️ Access Denied: Station "${station.name}" cannot generate drill scenarios.`);
                return;
            }

            const drill = generateAutomaticDrillScenario();
            this.loadPreset(drill);
            this.logAction('DRILL', `Generated 3-Day Scenario: "${drill.name}" (Initial Dist: ${drill.records[0]?.distanceNM?.toFixed(1) || '950'} NM, Initial Winds: ${drill.records[0]?.windSpeed} kts)`);
            alert(`🎲 ${drill.name} Generated!\nTrack starts in Green Zone on Day 1 and escalates towards Rong Doi across 3 days.`);
        });

        document.getElementById('btn-fetch-live-wx').addEventListener('click', async () => {
            const station = this.syncEngine.getStation();
            if (!station.canInputStormData) {
                alert(`⚠️ Access Denied: Station "${station.name}" cannot update platform weather.`);
                return;
            }

            const btn = document.getElementById('btn-fetch-live-wx');
            btn.textContent = '⏳ Fetching...';
            const wx = await fetchLivePlatformWeather(this.homeCoords.lat, this.homeCoords.lon);
            btn.textContent = '📡 Live RDP Wx';
            if (wx) {
                document.getElementById('lt-wind-speed').value = wx.windSpeedKnots;
                document.getElementById('lt-wind-gust').value = wx.windGustKnots;
                this.logAction('WEATHER', `Fetched Live Offshore Weather at RDP: Wind ${wx.windSpeedKnots} kts, Gust ${wx.windGustKnots} kts, Surface Pressure ${wx.surfacePressureHpa} hPa`);
                alert(`Updated Rong Doi Platform weather:\nWind Speed: ${wx.windSpeedKnots} kts, Gust: ${wx.windGustKnots} kts, Surface Pressure: ${wx.surfacePressureHpa} hPa`);
            } else {
                alert('Could not reach weather server. Please enter values manually.');
            }
        });

        document.getElementById('btn-export-excel').addEventListener('click', () => {
            const stormName = this.records[0]?.stormName || 'RDP_Storm_Track';
            exportToExcel(this.records, stormName);
        });

        // Action Log Modal Buttons & Events
        const btnOpenActionLog = document.getElementById('btn-open-action-log');
        if (btnOpenActionLog) {
            btnOpenActionLog.addEventListener('click', () => {
                this.renderActionLogModal();
                this.openModal('modal-action-log');
            });
        }

        const btnExportActionLog = document.getElementById('btn-export-action-log');
        if (btnExportActionLog) {
            btnExportActionLog.addEventListener('click', () => {
                const logsToExport = this.getFilteredActionLogs();
                exportActionLogToExcel(logsToExport);
            });
        }

        const btnClearActionLog = document.getElementById('btn-clear-action-log');
        if (btnClearActionLog) {
            btnClearActionLog.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all operational activity logs?')) {
                    this.actionLogs = [];
                    this.saveActionLogs();
                    this.renderActionLogModal();
                }
            });
        }

        const logFilterSelect = document.getElementById('action-log-filter');
        if (logFilterSelect) {
            logFilterSelect.addEventListener('change', (e) => {
                this.activeLogFilter = e.target.value;
                this.renderActionLogModal();
            });
        }

        // Modals
        document.getElementById('btn-open-green').addEventListener('click', () => this.openChecklistModal('GREEN'));
        document.getElementById('btn-open-yellow').addEventListener('click', () => this.openChecklistModal('YELLOW'));
        document.getElementById('btn-open-red').addEventListener('click', () => this.openChecklistModal('RED'));

        document.getElementById('btn-open-videos').addEventListener('click', () => this.openModal('modal-videos'));
        document.getElementById('btn-open-scale').addEventListener('click', () => this.openModal('modal-scale'));
        document.getElementById('btn-open-explanation').addEventListener('click', () => this.openModal('modal-explanation'));
        document.getElementById('btn-sync-settings').addEventListener('click', () => this.openModal('modal-sync'));

        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-close');
                this.closeModal(targetId);
            });
        });

        document.querySelectorAll('.video-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.video-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const src = btn.getAttribute('data-src');
                const videoEl = document.getElementById('sea-state-video');
                videoEl.src = src;
                videoEl.play().catch(() => {});
            });
        });

        document.getElementById('btn-reset-current-checklist').addEventListener('click', () => {
            const station = this.syncEngine.getStation();
            if (!station.canTickChecklist) {
                alert(`⚠️ Access Denied: Station "${station.name}" cannot reset checklists.`);
                return;
            }
            if (confirm(`Reset checklist for ${this.activeZoneModal} zone?`)) {
                this.checklists.resetZone(this.activeZoneModal);
                this.renderChecklistModal(this.activeZoneModal);
                this.logAction('CHECKLIST', `Reset all SOP action items in ${this.activeZoneModal} Alert Zone checklist.`);
            }
        });

        const syncRoomInput = document.getElementById('sync-room-name');
        const syncRoleSelect = document.getElementById('sync-user-role');
        if (syncRoomInput) syncRoomInput.value = this.syncEngine.roomName;
        if (syncRoleSelect) syncRoleSelect.value = this.syncEngine.userRole;

        document.getElementById('btn-save-sync-config').addEventListener('click', () => {
            const newRoom = (syncRoomInput?.value || '').trim() || 'rong-doi-ops';
            const newRole = syncRoleSelect?.value || 'CCR_CRT';
            this.syncEngine.setRoomName(newRoom);
            this.syncEngine.saveUserRole(newRole);
            this.applyRolePermissions();
            this.closeModal('modal-sync');

            const currentStation = this.syncEngine.getStation();
            this.logAction('STATION', `Operating station switched to ${currentStation.name} on channel "${newRoom}"`);
            alert(`✅ Live Collaboration Connected!\nChannel: "${newRoom}"\nStation: ${currentStation.name}`);
        });

        window.addEventListener('sync-status-changed', () => {
            this.applyRolePermissions();
        });
    }

    handleFormSubmit() {
        const stormName = document.getElementById('storm-name').value.trim();
        const date = document.getElementById('storm-date').value.trim();
        const time = document.getElementById('storm-time').value.trim();
        const lat = parseFloat(document.getElementById('storm-lat').value);
        const lon = parseFloat(document.getElementById('storm-lon').value);
        const windSpeed = parseFloat(document.getElementById('wind-speed').value);
        const windGust = parseFloat(document.getElementById('wind-gust').value);
        const movingSpeed = parseFloat(document.getElementById('moving-speed').value);
        const movingDirection = document.getElementById('moving-direction').value;
        const ltWindSpeed = parseFloat(document.getElementById('lt-wind-speed').value);
        const ltWindGust = parseFloat(document.getElementById('lt-wind-gust').value);

        if (isNaN(lat) || isNaN(lon) || isNaN(windSpeed) || isNaN(movingSpeed)) {
            alert('Please enter valid numeric values for coordinates and speeds.');
            return;
        }

        const distanceNM = calculateDistanceNM(lat, lon, this.homeCoords.lat, this.homeCoords.lon);
        const arrival = calculateArrivalTime(distanceNM, movingSpeed, lon, this.homeCoords.lon);
        const approachDirection = calculateApproachDirection(lat, lon, this.homeCoords.lat, this.homeCoords.lon);

        const newRecord = {
            id: Date.now().toString(),
            stormName,
            date,
            time,
            lat,
            lon,
            windSpeed,
            windGust,
            movingSpeed,
            movingDirection,
            ltWindSpeed,
            ltWindGust,
            distanceNM,
            tp: arrival.tp,
            hasPassed: arrival.hasPassed,
            approachDirection
        };

        this.records.push(newRecord);
        this.saveRecords();
        this.renderAll();

        this.logAction('WAYPOINT', `Tracked Storm Waypoint #${this.records.length}: ${stormName} at ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E | Wind: ${windSpeed} kts (Gust: ${windGust} kts) | Dist: ${distanceNM.toFixed(1)} NM | Tp: ${arrival.hasPassed ? 'Passed' : arrival.tp.toFixed(1) + 'h'}`);

        sfx.playChime();
    }

    loadPreset(preset) {
        this.records = preset.records.map((r, i) => {
            const distanceNM = calculateDistanceNM(r.lat, r.lon, this.homeCoords.lat, this.homeCoords.lon);
            const arrival = calculateArrivalTime(distanceNM, r.movingSpeed, r.lon, this.homeCoords.lon);
            const approachDirection = calculateApproachDirection(r.lat, r.lon, this.homeCoords.lat, this.homeCoords.lon);

            return {
                id: (Date.now() + i).toString(),
                ...r,
                distanceNM,
                tp: arrival.tp,
                hasPassed: arrival.hasPassed,
                approachDirection
            };
        });

        if (this.records.length > 0) {
            const latest = this.records[this.records.length - 1];
            document.getElementById('storm-name').value = latest.stormName;
            document.getElementById('storm-date').value = latest.date;
            document.getElementById('storm-time').value = latest.time;
            document.getElementById('storm-lat').value = latest.lat;
            document.getElementById('storm-lon').value = latest.lon;
            document.getElementById('wind-speed').value = latest.windSpeed;
            document.getElementById('wind-gust').value = latest.windGust;
            document.getElementById('moving-speed').value = latest.movingSpeed;
            document.getElementById('moving-direction').value = latest.movingDirection;
            document.getElementById('lt-wind-speed').value = latest.ltWindSpeed;
            document.getElementById('lt-wind-gust').value = latest.ltWindGust;
        }

        this.saveRecords();
        this.renderAll();
    }

    renderAll() {
        this.renderAlertBanner();
        this.renderTable();
        this.map.renderStormTrack(this.records);
        this.updateChecklistBadges();
        document.getElementById('incident-count-badge').textContent = `${this.records.length} Point(s)`;
    }

    renderAlertBanner() {
        if (this.records.length === 0) {
            this.alertBanner.className = 'alert-banner-container';
            this.alertIcon.textContent = '🛡️';
            this.alertHeadline.textContent = 'STANDBY / NO ACTIVE THREAT';
            this.alertDetails.textContent = 'Awaiting storm coordinates to compute geodesic range to RDP & BK-TNHA, predicted arrival time (Tp), and evacuation criteria.';
            this.metricDistance.textContent = '-- NM';
            this.metricTp.textContent = '-- hrs';
            this.metricApproach.textContent = '--';
            return;
        }

        const latest = this.records[this.records.length - 1];
        const category = getStormCategory(latest.windSpeed);
        const advisory = getEmergencyAdvisory(
            latest.distanceNM,
            latest.windSpeed,
            latest.ltWindSpeed,
            latest.ltWindGust,
            latest.hasPassed,
            latest.approachDirection
        );

        this.alertBanner.className = `alert-banner-container code-${advisory.zoneCode.toLowerCase()}`;

        if (advisory.zoneCode === 'RED') {
            this.alertIcon.textContent = '🚨';
        } else if (advisory.zoneCode === 'YELLOW') {
            this.alertIcon.textContent = '⚠️';
        } else if (advisory.zoneCode === 'GREEN') {
            this.alertIcon.textContent = '🟢';
        } else {
            this.alertIcon.textContent = 'ℹ️';
        }

        this.alertHeadline.innerHTML = `
            <span>${category.category} • ${advisory.zoneTitle}</span>
            <span style="font-size: 0.8rem; background: ${category.color}; color: #fff; padding: 2px 8px; border-radius: 4px;">${category.code} (${latest.windSpeed} kts)</span>
        `;

        this.alertDetails.innerHTML = `
            <strong>Directive:</strong> ${advisory.actionSummary} | <strong>At Rong Doi:</strong> ${advisory.platformCondition} (${advisory.helicopterStatus})
        `;

        this.metricDistance.textContent = `${latest.distanceNM.toFixed(1)} NM`;
        this.metricDistance.className = `metric-pill-value ${latest.distanceNM <= 240 ? 'highlight-red' : (latest.distanceNM <= 750 ? 'highlight-yellow' : '')}`;

        if (latest.hasPassed) {
            this.metricTp.textContent = 'PASSED';
        } else if (latest.tp === 0) {
            this.metricTp.textContent = 'SURROUNDING';
        } else {
            const days = Math.floor(latest.tp / 24);
            const hrs = (latest.tp % 24).toFixed(1);
            this.metricTp.textContent = days > 0 ? `${days}d ${hrs}h` : `${hrs} hrs`;
        }

        this.metricApproach.textContent = advisory.approachDirection;
    }

    renderTable() {
        if (this.records.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; color: var(--text-dim); padding: 24px;">No storm waypoint data tracked yet. Enter coordinates above or load a preset.</td>
                </tr>
            `;
            return;
        }

        const station = this.syncEngine.getStation();
        const canDelete = station.canInputStormData;

        this.tableBody.innerHTML = this.records.map((r, i) => {
            const distToBk = calculateDistanceNM(r.lat, r.lon, this.bkCoords.lat, this.bkCoords.lon);
            return `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${r.stormName || 'UNNAMED'}</strong></td>
                    <td>${r.date || ''} ${r.time || ''}</td>
                    <td>${r.lat.toFixed(2)}°N, ${r.lon.toFixed(2)}°E</td>
                    <td><span style="color: #fb923c; font-weight: 700;">${r.windSpeed}</span> / ${r.windGust} kts</td>
                    <td>${r.movingSpeed} kts (${r.movingDirection})</td>
                    <td><strong>${r.distanceNM ? r.distanceNM.toFixed(1) + ' NM' : 'N/A'}</strong> (BK: ${distToBk.toFixed(1)} NM)</td>
                    <td>${r.hasPassed ? 'Passed' : (r.tp ? r.tp.toFixed(1) + 'h' : '0h')}</td>
                    <td>${r.ltWindSpeed || 0} / ${r.ltWindGust || 0} kts</td>
                    <td>
                        <button class="btn btn-danger btn-delete-row" data-id="${r.id}" style="padding: 2px 6px; font-size: 0.7rem;" ${canDelete ? '' : 'disabled title="Restricted to Offshore CCR"'}>Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        if (canDelete) {
            this.tableBody.querySelectorAll('.btn-delete-row').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const deletedIdx = this.records.findIndex(r => r.id === id);
                    const deletedRec = this.records[deletedIdx];
                    this.records = this.records.filter(r => r.id !== id);
                    this.saveRecords();
                    this.renderAll();
                    if (deletedRec) {
                        this.logAction('WAYPOINT', `Deleted storm waypoint #${deletedIdx + 1}: ${deletedRec.stormName} (${deletedRec.lat.toFixed(2)}°N, ${deletedRec.lon.toFixed(2)}°E)`);
                    }
                });
            });
        }
    }

    openChecklistModal(zone) {
        this.activeZoneModal = zone;
        this.renderChecklistModal(zone);
        this.openModal('modal-checklist');
    }

    renderChecklistModal(zone) {
        const def = CHECKLIST_DEFINITIONS[zone];
        if (!def) return;

        const station = this.syncEngine.getStation();
        const canTick = !!station.canTickChecklist;

        document.getElementById('checklist-modal-title').innerHTML = `
            <span style="color: ${def.color};">●</span> ${def.title}
        `;

        const resetBtn = document.getElementById('btn-reset-current-checklist');
        if (resetBtn) {
            resetBtn.disabled = !canTick;
            resetBtn.title = canTick ? '' : 'Read-only mode for station Others';
        }

        const body = document.getElementById('checklist-modal-body');
        const state = this.checklists.states[zone] || {};

        body.innerHTML = def.items.map((rawItem, idx) => {
            const parsed = parseChecklistItem(rawItem);
            const isChecked = !!state[idx]?.completed;
            const operator = state[idx]?.operator || parsed.role;
            const timeStr = state[idx]?.timestamp ? new Date(state[idx].timestamp).toLocaleTimeString() : '';
            const meta = isChecked ? `Completed by ${operator} at ${timeStr}` : '';

            return `
                <div class="checklist-item-row ${isChecked ? 'completed' : ''}" data-idx="${idx}">
                    <input type="checkbox" id="chk-${zone}-${idx}" ${isChecked ? 'checked' : ''} ${canTick ? '' : 'disabled'} />
                    <div style="flex: 1;">
                        <div class="checklist-role-badge-row">
                            <span class="checklist-role-badge" style="color: ${parsed.style.color}; background: ${parsed.style.bg}; border: 1px solid ${parsed.style.border};">
                                ${parsed.style.icon} ${parsed.role}
                            </span>
                        </div>
                        <label for="chk-${zone}-${idx}" class="checklist-text">${parsed.action}</label>
                        ${meta ? `<div class="checklist-meta" style="color: ${parsed.style.color}; font-weight: 600;">✓ ${meta}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        if (canTick) {
            body.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const row = e.target.closest('.checklist-item-row');
                    const idx = parseInt(row.getAttribute('data-idx'));
                    const parsed = parseChecklistItem(def.items[idx]);
                    const newState = this.checklists.toggleItem(zone, idx, parsed.role);
                    this.renderChecklistModal(zone);
                    this.updateChecklistBadges();

                    const actionStatus = newState ? 'COMPLETED' : 'UNCHECKED';
                    this.logAction('CHECKLIST', `[${zone} Alert] ${actionStatus} action item for ${parsed.role}: "${parsed.action}"`);
                });
            });
        }
    }

    getFilteredActionLogs() {
        if (this.activeLogFilter === 'ALL') {
            return this.actionLogs;
        }
        if (['CCR_CRT', 'OIM_IM', 'ONSHORE_IMT', 'LOGISTICS_VTSB', 'RADIO_TELECOMS', 'OTHERS'].includes(this.activeLogFilter)) {
            return this.actionLogs.filter(l => l.stationRole === this.activeLogFilter);
        }
        return this.actionLogs.filter(l => l.category === this.activeLogFilter);
    }

    renderActionLogModal() {
        const tbody = document.getElementById('action-log-tbody');
        const countTotal = document.getElementById('log-count-total');
        const stationBadge = document.getElementById('log-current-station');
        const currentStation = this.syncEngine.getStation();

        if (countTotal) {
            countTotal.textContent = `${this.actionLogs.length} Total Event(s)`;
        }

        if (stationBadge) {
            stationBadge.textContent = `Active: ${currentStation.shortName}`;
            stationBadge.style.color = currentStation.badgeColor;
            stationBadge.style.background = `${currentStation.badgeColor}22`;
        }

        const filtered = this.getFilteredActionLogs();

        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 24px;">No operational activities match the selected filter.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map((log, i) => {
            const catClass = `cat-${(log.category || 'waypoint').toLowerCase()}`;
            const badgeColor = log.badgeColor || '#38bdf8';

            return `
                <tr>
                    <td style="font-family: var(--font-mono); color: var(--text-dim);">${i + 1}</td>
                    <td style="font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap;">${log.timestampFormatted || new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                        <span class="log-station-badge" style="color: ${badgeColor}; background: ${badgeColor}18; border: 1px solid ${badgeColor}40;">
                            ${log.icon || '🛡️'} ${log.stationShort || log.stationName}
                        </span>
                    </td>
                    <td>
                        <span class="log-cat-badge ${catClass}">${log.category}</span>
                    </td>
                    <td style="line-height: 1.4; color: var(--text-main);">${log.details}</td>
                </tr>
            `;
        }).join('');
    }

    updateChecklistBadges() {
        ['GREEN', 'YELLOW', 'RED'].forEach(zone => {
            const stats = this.checklists.getZoneStats(zone);
            const badge = document.getElementById(`badge-${zone.toLowerCase()}`);
            if (badge) {
                badge.textContent = `${stats.completed}/${stats.total}`;
                if (stats.completed === stats.total && stats.total > 0) {
                    badge.style.background = 'rgba(16, 185, 129, 0.8)';
                    badge.style.color = '#ffffff';
                } else {
                    badge.style.background = 'rgba(0, 0, 0, 0.4)';
                    badge.style.color = 'inherit';
                }
            }
        });
    }

    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            const video = modal.querySelector('video');
            if (video) video.pause();
        }
    }

    initClock() {
        const clockEl = document.getElementById('live-clock');
        const update = () => {
            const now = new Date();
            const utcStr = now.toISOString().slice(11, 19);
            const locStr = now.toTimeString().slice(0, 8);
            clockEl.textContent = `UTC ${utcStr} | LOCAL ${locStr}`;
        };
        update();
        setInterval(update, 1000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});
