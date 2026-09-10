/**
 * Data Export & Reporting Engine
 * Customized for Rong Doi Platform (RDP) Operations
 */

/**
 * Helper to dynamically load SheetJS if not already present on window
 */
async function ensureXLSXLoaded() {
    if (window.XLSX) return true;
    try {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'vendor/xlsx/xlsx.full.min.js';
            script.onload = () => resolve();
            script.onerror = () => {
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
                cdnScript.onload = () => resolve();
                cdnScript.onerror = () => reject(new Error('Failed to load SheetJS'));
                document.head.appendChild(cdnScript);
            };
            document.head.appendChild(script);
        });
        return !!window.XLSX;
    } catch (e) {
        console.warn('Could not load SheetJS dynamically:', e);
        return false;
    }
}

/**
 * Sanitize filename to avoid invalid characters
 */
function sanitizeFilename(name) {
    return (name || 'RDP_Storm_Track')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, '_')
        .trim();
}

/**
 * Export records to formatted Microsoft Excel (.xlsx)
 */
export async function exportToExcel(records, incidentName = 'Rong_Doi_Typhoon_Log') {
    if (!records || records.length === 0) {
        alert('No storm records to export. Please track or generate storm waypoints first.');
        return;
    }

    const hasXLSX = await ensureXLSXLoaded();
    const cleanName = sanitizeFilename(incidentName);
    const dateStr = new Date().toISOString().slice(0, 10);

    if (hasXLSX && window.XLSX) {
        try {
            const dataRows = records.map((r, i) => ({
                'Waypoint #': i + 1,
                'Storm Name': r.stormName || 'UNNAMED',
                'Date (dd/mm)': r.date || '',
                'Time (hh:mm)': r.time || '',
                'Latitude (°N)': r.lat != null ? +r.lat.toFixed(2) : '',
                'Longitude (°E)': r.lon != null ? +r.lon.toFixed(2) : '',
                'Storm Wind Speed (kts)': r.windSpeed != null ? r.windSpeed : '',
                'Storm Wind Gust (kts)': r.windGust != null ? r.windGust : '',
                'Moving Speed (kts)': r.movingSpeed != null ? r.movingSpeed : '',
                'Moving Direction': r.movingDirection || '',
                'RDP Wind Speed (kts)': r.ltWindSpeed != null ? r.ltWindSpeed : '',
                'RDP Wind Gust (kts)': r.ltWindGust != null ? r.ltWindGust : '',
                'Distance to RDP (NM)': r.distanceNM != null ? +r.distanceNM.toFixed(2) : '',
                'Predicted Tp (hours)': r.hasPassed ? 'PASSED' : (r.tp != null ? +r.tp.toFixed(2) : ''),
                'Approach Sector': r.approachDirection || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataRows);

            // Set column widths for clean readability in Excel
            worksheet['!cols'] = [
                { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
                { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 20 },
                { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 18 },
                { wch: 20 }, { wch: 20 }, { wch: 16 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'RDP Storm Track Log');

            const filename = `${cleanName}_${dateStr}.xlsx`;
            XLSX.writeFile(workbook, filename);
            return;
        } catch (err) {
            console.error('XLSX export error:', err);
            // Fall back to CSV if xlsx writing fails
        }
    }

    // Fallback: Export CSV if SheetJS cannot be loaded
    exportToCSV(records, incidentName);
}

/**
 * Export records to standard CSV with UTF-8 BOM for full Excel compatibility
 */
export function exportToCSV(records, incidentName = 'Rong_Doi_Typhoon_Log') {
    if (!records || records.length === 0) {
        alert('No storm records to export. Please track or generate storm waypoints first.');
        return;
    }

    const headers = [
        'Waypoint #',
        'Storm Name',
        'Date (dd/mm)',
        'Time (hh:mm)',
        'Latitude (°N)',
        'Longitude (°E)',
        'Storm Wind Speed (kts)',
        'Storm Wind Gust (kts)',
        'Moving Speed (kts)',
        'Moving Direction',
        'RDP Wind Speed (kts)',
        'RDP Wind Gust (kts)',
        'Distance to RDP (NM)',
        'Predicted Tp (hours)',
        'Approach Sector'
    ];

    const rows = records.map((r, i) => [
        i + 1,
        `"${(r.stormName || '').replace(/"/g, '""')}"`,
        `"${(r.date || '').replace(/"/g, '""')}"`,
        `"${(r.time || '').replace(/"/g, '""')}"`,
        r.lat != null ? r.lat.toFixed(2) : '',
        r.lon != null ? r.lon.toFixed(2) : '',
        r.windSpeed != null ? r.windSpeed : '',
        r.windGust != null ? r.windGust : '',
        r.movingSpeed != null ? r.movingSpeed : '',
        `"${(r.movingDirection || '').replace(/"/g, '""')}"`,
        r.ltWindSpeed != null ? r.ltWindSpeed : '',
        r.ltWindGust != null ? r.ltWindGust : '',
        r.distanceNM != null ? r.distanceNM.toFixed(2) : '',
        r.hasPassed ? 'PASSED' : (r.tp != null ? r.tp.toFixed(2) : ''),
        `"${(r.approachDirection || '').replace(/"/g, '""')}"`
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows parses accents and special symbols correctly
    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const cleanName = sanitizeFilename(incidentName);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${cleanName}_${dateStr}.csv`;

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

/**
 * Export operational action logs to formatted Microsoft Excel (.xlsx)
 */
export async function exportActionLogToExcel(logs, filenamePrefix = 'RDP_Storm_Action_Log') {
    if (!logs || logs.length === 0) {
        alert('No operational activities logged yet.');
        return;
    }

    const hasXLSX = await ensureXLSXLoaded();
    const cleanName = sanitizeFilename(filenamePrefix);
    const dateStr = new Date().toISOString().slice(0, 10);

    if (hasXLSX && window.XLSX) {
        try {
            const dataRows = logs.map((log, i) => ({
                'Event #': i + 1,
                'Timestamp': log.timestampFormatted || new Date(log.timestamp).toLocaleString(),
                'Operating Station': log.stationName || log.stationRole || 'N/A',
                'Category': log.category || 'OPERATION',
                'Operational Details & Audit Description': log.details || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataRows);

            worksheet['!cols'] = [
                { wch: 10 }, { wch: 22 }, { wch: 40 }, { wch: 20 }, { wch: 75 }
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'RDP Operational Action Log');

            const filename = `${cleanName}_${dateStr}.xlsx`;
            XLSX.writeFile(workbook, filename);
            return;
        } catch (err) {
            console.error('XLSX Action Log export error:', err);
        }
    }

    // Fallback CSV
    const headers = ['Event #', 'Timestamp', 'Operating Station', 'Category', 'Details'];
    const rows = logs.map((log, i) => [
        i + 1,
        `"${(log.timestampFormatted || new Date(log.timestamp).toLocaleString()).replace(/"/g, '""')}"`,
        `"${(log.stationName || log.stationRole || '').replace(/"/g, '""')}"`,
        `"${(log.category || '').replace(/"/g, '""')}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const filename = `${cleanName}_${dateStr}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

