/**
 * Emergency Response Checklists Manager
 * Customized for Rong Doi Platform (RDP) & BK-TNHA
 * Exact SOP actions from Typhoon Evacuation - RDP.docx
 */

export const CHECKLIST_DEFINITIONS = {
    RED: {
        title: 'RED ALERT CHECKLIST (Within 240 NM / < 24 hrs / Platform Abandonment)',
        code: 'RED',
        color: '#EF4444',
        items: [
            'OIM (IM): Declare RED ALERT situation to all POB.',
            'OIM (IM): Ensure emergency response procedures followed, muster and account for POB.',
            'OIM (IM): Ensure all personnel remain inside the accommodation except for deemed essential services such as preparing to abandon the platform activities. If outside activities are necessary, ensure 2 personnel are deployed to actively assist and look out for each other. Record all outside personnel movements via Muster Controller.',
            'OIM (IM): Inform DIM, FSO and other field support vessels / services as to Red Alert status.',
            'OIM (IM): Commence to evacuate personnel as required from the Facility utilizing air or marine support as required / available.',
            'OIM (IM): Confirm the Nav-aids are operational prior to abandonment',
            'OIM (IM): Prior to abandonment – it is not advisable to leave any motor driven equipment running such as Emergency Generators or Fire pumps except for emergency reasons.',
            'On Duty CRT: Upon IM instruction, execute ESD-1 facility shutdown and depressurization; verify SCSSVs on RDP & BK-TNHA are fully closed.',
            'On Duty CRT: Prepare to abandon the platform.',
            'Telecom Tech: Prepare to abandon platform.',
            'Telecom Tech: Co-ordinate air traffic as required for necessary air evacuation operation of remaining personnel.',
            'Telecom Tech: Liaise with other vessels/FSO within the field and advise that abandonment operations are underway.',
            'Telecom Tech: Monitor typhoons path and strength - record weather indicators on a 1 hourly basis and report to IM (OIM).',
            'Telecom Tech: Liaise with other facilities in the area to maintain information flow regarding weather conditions',
            'ERT / Medic: Secure all medical facilities and ensure the controlled drugs cabinet is locked prior to departure.',
            'DIM Onshore: Initiate onshore emergency response, contacting the IMT and helicopter contractor, Search & Rescue standby, and post-typhoon remobilization plan.'
        ]
    },
    YELLOW: {
        title: 'YELLOW ALERT CHECKLIST (750 NM to 240 NM / < 36 hrs / Down-Manning)',
        code: 'YELLOW',
        color: '#EAB308',
        items: [
            'OIM (IM): Declare YELLOW ALERT.',
            'OIM (IM): Start down-manning and evacuation of all non-essential personnel (Flight No. 1) in coordination with FSO Superintendent.',
            'OIM (IM): Inform onshore management and request air operations to start evacuation.',
            'OIM (IM): Confirm Production shutdown / depressurization procedures are reviewed and ready.',
            'OIM (IM): Confirm Helideck safe for helicopter landing and refueling.',
            'OIM (IM): Monitor typhoon path and strength hourly in conjunction with Telecom Technician.',
            'OIM (IM): Confirm with FSO PPS-01 that all offtake/tanker loading operations have ceased and lines secured.',
            'OIM (IM): Liaise with Supply boats - demob vessel and non-essential personnel on vessel to safe haven if deemed necessary.',
            'OIM (IM): Determine the need for early evacuation taking into consideration helicopter limitations and the number of persons that need to be evacuated from the facility and adjoining FSO.',
            'OIM (IM): Ensure Nav-aids and Non directional beacon are operational',
            'OIM (IM): Confirm preparations are underway for total evacuation of facility.',
            'On Duty CRT: Review shutdown & depressurizing procedures for Process, WHP & BK-TNHA; prepare for possible total shutdown.',
            'Telecom Tech: Monitor typhoon path & strength hourly and report to OIM (IM).',
            'Telecom Tech: Liaise with other facilities in the area to maintain information flow regarding weather conditions.',
            'ERT / Medic: Assist with evacuation on non-essential personnel as required.',
            'DIM Onshore: Initiate IMT response, coordinate helicopter contractor.',
            'DIM Onshore: Arrange accommodation for personnel coming onshore.'
        ]
    },
    GREEN: {
        title: 'GREEN ALERT CHECKLIST (1000 NM to 750 NM / < 48 hrs / Surveillance & Prep)',
        code: 'GREEN',
        color: '#10B981',
        items: [
            'OIM (IM): Declare GREEN ALERT condition; notify DIM onshore.',
            'OIM (IM): Inform onshore management and air operations to be on standby and all POB of the typhoon threat.',
            'OIM (IM): Inform VNHS helicopter services to be on standby ("Ready to take off" status).',
            'OIM (IM): Ensure all emergency communications are operational.',
            'OIM (IM): Production shutdown procedures are reviewed and ready.',
            'OIM (IM): Ensure helideck is safe for helicopter landing and refueling',
            'OIM (IM): Monitor typhoon path and strength 3 hourly - liaise / confirm with Telecom Technician.',
            'OIM (IM): Ensure all loose plant & equipment is secured in preparation for high winds / high sea state conditions.',
            'OIM (IM): Inform FSO PPS-01, standby vessels in field, and Shore Base of Green Alert status; forward plan possible evacuation. Shutdown off-take operations as appropriate.',
            'OIM (IM): Ensure helicopter services are aware of weather conditions and advise of possible non-essential personnel evacuation - inform no. of PAX deemed to be Non-essential personnel.',
            'OIM (IM): Review activities and minimize outside activity - keep personnel inside as necessary.',
            'OIM (IM): Prepare a contingency plan for personnel to remain onboard in the event that evacuation is not attainable for other reasons (e.g. helicopters may be grounded).',
            'On Duty CRT: Review Emergency Shutdown (ESD) and depressurizing procedures for RDP & BK-TNHA.',
            'Telecom Tech: Monitor typhoons path and strength - record weather indicators on a 3 hourly basis and report to OIM (IM).',
            'Telecom Tech: Liaise with other facilities in the area to maintain information flow regarding weather conditions.',
            'ERT / Medic: Secure medical room, ensure Medical supplies/ stretchers are kept in an immediate state of readiness.',
            'ERT / Medic: Liaise with OIM to confirm personnel identified as non-essential for initial evacuation as required.',
            'DIM Onshore: Initiate onshore emergency response, contacting the IMT and helicopter contractor.',
            'DIM Onshore: Confirm number of POB offshore and those deemed to be non-essential in case of evacuation operations as per Yellow alert.',
            'DIM Onshore: Establish evacuation plan in conjunction with OIM / PPS-01 Facility Manager for both Platform and FSO within the Rong Doi Field.'
        ]
    }
};

export const ROLE_STYLES = {
    'OIM (IM)': {
        name: 'OIM (IM)',
        color: '#38bdf8', // Vibrant Sky Blue
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.4)',
        icon: '🎖️'
    },
    'On Duty CRT': {
        name: 'On Duty CRT',
        color: '#fb923c', // Safety Orange
        bg: 'rgba(251, 146, 60, 0.12)',
        border: 'rgba(251, 146, 60, 0.4)',
        icon: '🕹️'
    },
    'OIM/FM & CRT': {
        name: 'OIM & CRT',
        color: '#22d3ee', // Bright Cyan
        bg: 'rgba(34, 211, 238, 0.12)',
        border: 'rgba(34, 211, 238, 0.4)',
        icon: '⚡'
    },
    'Telecom Tech': {
        name: 'Telecom Tech',
        color: '#c084fc', // Radio Purple
        bg: 'rgba(192, 132, 252, 0.12)',
        border: 'rgba(192, 132, 252, 0.4)',
        icon: '📡'
    },
    'ERT / Medic': {
        name: 'ERT / Medic',
        color: '#34d399', // Medical Emerald
        bg: 'rgba(52, 211, 153, 0.12)',
        border: 'rgba(52, 211, 153, 0.4)',
        icon: '⛑️'
    },
    'DIM Onshore': {
        name: 'DIM Onshore',
        color: '#f43f5e', // Onshore Rose Coral
        bg: 'rgba(244, 63, 94, 0.12)',
        border: 'rgba(244, 63, 94, 0.4)',
        icon: '🏢'
    }
};

/**
 * Parses raw checklist item into role and action description
 */
export function parseChecklistItem(rawText) {
    const colonIdx = rawText.indexOf(':');
    if (colonIdx !== -1) {
        const role = rawText.substring(0, colonIdx).trim();
        const action = rawText.substring(colonIdx + 1).trim();
        const style = ROLE_STYLES[role] || {
            name: role,
            color: '#94a3b8',
            bg: 'rgba(148, 163, 184, 0.12)',
            border: 'rgba(148, 163, 184, 0.3)',
            icon: '📋'
        };
        return { role, action, style, rawText };
    }
    return {
        role: 'OIM/FM',
        action: rawText,
        style: ROLE_STYLES['OIM/FM'],
        rawText
    };
}

/**
 * Web Audio Synthesizer for instant, bulletproof "Ting" chime
 */
class SoundEffects {
    constructor() {
        this.audioCtx = null;
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playChime() {
        try {
            this.init();
            if (!this.audioCtx) return;

            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now); // A5 note
            osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6 harmonic

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.5);
        } catch (e) {
            console.warn('Audio chime playback error:', e);
        }
    }

    playThunder() {
        const audio = new Audio('assets/audio/Tieng-Sam-Set.mp3');
        audio.volume = 0.7;
        audio.play().catch(() => console.log('Audio autoplay prevented'));
        return audio;
    }
}

export const sfx = new SoundEffects();

export class ChecklistManager {
    constructor(storageKey = 'rdp_storm_tracker_checklists', onStateChange = null) {
        this.storageKey = storageKey;
        this.onStateChange = onStateChange;
        this.states = this.loadStates();
    }

    loadStates() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : { RED: {}, YELLOW: {}, GREEN: {} };
        } catch (e) {
            return { RED: {}, YELLOW: {}, GREEN: {} };
        }
    }

    saveStates() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.states));
        } catch (e) {
            console.error('Failed to save checklist state', e);
        }
    }

    toggleItem(zone, index, operatorName = 'RDP OIM') {
        sfx.init();
        if (!this.states[zone]) this.states[zone] = {};

        const current = this.states[zone][index];
        if (current && current.completed) {
            delete this.states[zone][index];
        } else {
            this.states[zone][index] = {
                completed: true,
                timestamp: new Date().toISOString(),
                operator: operatorName
            };
            sfx.playChime();
        }

        this.saveStates();
        if (this.onStateChange) this.onStateChange(this.states);
        return this.states[zone][index];
    }

    getZoneStats(zone) {
        const total = CHECKLIST_DEFINITIONS[zone]?.items.length || 0;
        const completed = Object.keys(this.states[zone] || {}).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percent };
    }

    resetZone(zone) {
        this.states[zone] = {};
        this.saveStates();
        if (this.onStateChange) this.onStateChange(this.states);
    }

    resetAll() {
        this.states = { RED: {}, YELLOW: {}, GREEN: {} };
        this.saveStates();
        if (this.onStateChange) this.onStateChange(this.states);
    }
}
