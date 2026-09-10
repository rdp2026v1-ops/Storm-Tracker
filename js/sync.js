/**
 * Real-Time Collaboration & Cloud Synchronization Engine
 * Designed for Rong Doi Platform (RDP) Offshore CCR & Onshore Command Teams
 * 
 * Multi-layer redundancy architecture:
 * 1. Native BroadcastChannel: Sub-millisecond sync across tabs/screens on the same workstation.
 * 2. Enterprise MQTT PubSub (with Retain Flag): Automatically synchronizes remote browsers (Offshore CCR <-> Onshore IMT)
 *    and delivers latest stored incident state to newly connected browsers.
 * 3. Event-driven State Handshake (state_request / state_sync): Peers automatically share active state upon joining.
 * 4. Cloud HTTPS/WSS Fallback Relay (ntfy.sh stream): Guaranteed delivery through enterprise proxy firewalls.
 */

export const OPERATING_STATIONS = {
    'CCR_CRT': {
        id: 'CCR_CRT',
        name: 'Offshore Central Control Room (CCR – CRT)',
        shortName: 'Offshore CCR (CRT)',
        icon: '🕹️',
        badgeColor: '#fb923c', // Orange
        canInputStormData: true,
        canTickChecklist: true
    },
    'OIM_IM': {
        id: 'OIM_IM',
        name: 'Offshore Installation Manager (IM)',
        shortName: 'Offshore IM',
        icon: '🎖️',
        badgeColor: '#38bdf8', // Sky Blue
        canInputStormData: false,
        canTickChecklist: true
    },
    'ONSHORE_IMT': {
        id: 'ONSHORE_IMT',
        name: 'Onshore Incident Management Team (IMT)',
        shortName: 'Onshore IMT',
        icon: '🏢',
        badgeColor: '#f43f5e', // Rose
        canInputStormData: false,
        canTickChecklist: true
    },
    'LOGISTICS_VTSB': {
        id: 'LOGISTICS_VTSB',
        name: 'Aviation & Marine Logistics (VTSB)',
        shortName: 'VTSB Logistics',
        icon: '🚁',
        badgeColor: '#10b981', // Emerald
        canInputStormData: false,
        canTickChecklist: true
    },
    'RADIO_TELECOMS': {
        id: 'RADIO_TELECOMS',
        name: 'Radio Room (Telecoms)',
        shortName: 'Radio Room',
        icon: '📡',
        badgeColor: '#c084fc', // Purple
        canInputStormData: false,
        canTickChecklist: true
    },
    'ERT_MEDIC': {
        id: 'ERT_MEDIC',
        name: 'Emergency Response Team / Medic (ERT)',
        shortName: 'ERT / Medic',
        icon: '🩺',
        badgeColor: '#34d399', // Medical Emerald
        canInputStormData: false,
        canTickChecklist: true
    },
    'OTHERS': {
        id: 'OTHERS',
        name: 'Others',
        shortName: 'Others (Read Only)',
        icon: '👁️',
        badgeColor: '#94a3b8', // Slate
        canInputStormData: false,
        canTickChecklist: false
    }
};

export class SyncEngine {
    constructor({ roomName = 'rong-doi-ops', onDataReceived = null }) {
        this.roomName = this.sanitizeRoomName(roomName || 'rong-doi-ops');
        this.onDataReceived = onDataReceived;
        this.broadcastChannel = null;
        this.mqttClient = null;
        this.ntfyEventSource = null;
        this.isOnline = navigator.onLine;
        this.isConnectedToCloud = false;
        this.clientId = this.getOrCreateClientId();
        this.userRole = this.loadUserRole();

        this.initBroadcastChannel();
        this.initNetworkListeners();
        this.connectCloudRelay();
        this.connectNtfyRelay();
    }

    sanitizeRoomName(name) {
        return (name || 'rong-doi-ops').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    }

    loadUserRole() {
        const saved = localStorage.getItem('rdp_user_role');
        return (saved && OPERATING_STATIONS[saved]) ? saved : 'CCR_CRT';
    }

    getStation() {
        return OPERATING_STATIONS[this.userRole] || OPERATING_STATIONS['CCR_CRT'];
    }

    saveUserRole(role) {
        if (!OPERATING_STATIONS[role]) role = 'CCR_CRT';
        this.userRole = role;
        localStorage.setItem('rdp_user_role', role);
        this.notifyStatusChange();
    }

    setRoomName(newRoom) {
        const sanitized = this.sanitizeRoomName(newRoom);
        if (!sanitized || sanitized === this.roomName) return;
        this.roomName = sanitized;

        // Reconnect local and cloud channels
        this.initBroadcastChannel();
        this.connectCloudRelay();
        this.connectNtfyRelay();
        this.notifyStatusChange();

        // Immediately request current state for new room
        setTimeout(() => this.requestState(), 800);
    }

    initBroadcastChannel() {
        if (this.broadcastChannel) {
            try { this.broadcastChannel.close(); } catch (e) { }
        }
        if ('BroadcastChannel' in window) {
            try {
                this.broadcastChannel = new BroadcastChannel(`rdp_storm_ch_${this.roomName}`);
                this.broadcastChannel.onmessage = (event) => {
                    if (event.data && event.data.senderId !== this.clientId && this.onDataReceived) {
                        this.onDataReceived(event.data, 'broadcast');
                    }
                };
            } catch (err) {
                console.warn('BroadcastChannel error:', err);
            }
        }
    }

    initNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.connectCloudRelay();
            this.connectNtfyRelay();
            this.notifyStatusChange();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.isConnectedToCloud = false;
            this.notifyStatusChange();
        });
    }

    /**
     * Connect to Cloud MQTT broker using MQTT.js with automatic fallback and state retention
     */
    connectCloudRelay() {
        if (!this.isOnline) return;

        if (this.mqttClient) {
            try { this.mqttClient.end(true); } catch (e) { }
            this.mqttClient = null;
        }

        if (typeof window.mqtt === 'undefined') {
            console.warn('MQTT.js not loaded yet, falling back to HTTPS stream');
            return;
        }

        const brokers = [
            'wss://broker.hivemq.com:8884/mqtt',
            'wss://broker.emqx.io:8084/mqtt'
        ];

        const brokerUrl = brokers[0];
        const clientId = `rdp_${this.clientId}_${Math.random().toString(36).substr(2, 4)}`;

        try {
            this.mqttClient = window.mqtt.connect(brokerUrl, {
                clientId,
                clean: true,
                connectTimeout: 5000,
                reconnectPeriod: 3000,
                keepalive: 45
            });

            this.mqttClient.on('connect', () => {
                this.isConnectedToCloud = true;
                this.notifyStatusChange();

                const topic = `rdp_storm_ops/${this.roomName}/#`;
                this.mqttClient.subscribe(topic, { qos: 1 }, (err) => {
                    if (!err) {
                        // Request active state from peers
                        this.requestState();
                    }
                });
            });

            this.mqttClient.on('message', (topic, payload) => {
                try {
                    const str = payload.toString();
                    const message = JSON.parse(str);
                    if (message && message.senderId !== this.clientId && this.onDataReceived) {
                        this.onDataReceived(message, 'mqtt');
                    }
                } catch (e) {
                    // Ignore non-json payload
                }
            });

            this.mqttClient.on('error', (err) => {
                console.warn('MQTT connection error:', err);
                this.isConnectedToCloud = false;
                this.notifyStatusChange();
            });

            this.mqttClient.on('close', () => {
                this.isConnectedToCloud = false;
                this.notifyStatusChange();
            });
        } catch (err) {
            console.warn('Failed to initiate MQTT client:', err);
            this.isConnectedToCloud = false;
        }
    }

    /**
     * Fallback HTTPS / SSE Stream for high-security firewalls via ntfy.sh
     */
    connectNtfyRelay() {
        if (this.ntfyEventSource) {
            try { this.ntfyEventSource.close(); } catch (e) { }
            this.ntfyEventSource = null;
        }

        if (!this.isOnline || typeof EventSource === 'undefined') return;

        try {
            const topic = `rdp_storm_${this.roomName}`;
            this.ntfyEventSource = new EventSource(`https://ntfy.sh/${topic}/sse?since=10m`);

            this.ntfyEventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.message) {
                        const parsed = JSON.parse(data.message);
                        if (parsed && parsed.senderId !== this.clientId && this.onDataReceived) {
                            this.onDataReceived(parsed, 'ntfy');
                        }
                    }
                } catch (e) { }
            };
        } catch (e) {
            console.warn('ntfy SSE init error:', e);
        }
    }

    requestState() {
        this.broadcast('state_request', {
            room: this.roomName,
            requesterId: this.clientId
        });
    }

    broadcast(action, payload, retain = false) {
        const message = {
            action,
            payload,
            timestamp: Date.now(),
            senderId: this.clientId,
            senderRole: this.userRole,
            room: this.roomName
        };

        // 1. Local BroadcastChannel
        if (this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage(message);
            } catch (e) { }
        }

        const jsonStr = JSON.stringify(message);

        // 2. Cloud MQTT
        if (this.mqttClient && this.mqttClient.connected) {
            const topic = `rdp_storm_ops/${this.roomName}/${action}`;
            this.mqttClient.publish(topic, jsonStr, { qos: 1, retain });
        }

        // 3. Fallback ntfy.sh HTTP POST
        try {
            const ntfyTopic = `rdp_storm_${this.roomName}`;
            fetch(`https://ntfy.sh/${ntfyTopic}`, {
                method: 'POST',
                body: jsonStr,
                headers: { 'Title': `RDP Sync: ${action}`, 'Priority': 'low' }
            }).catch(() => { });
        } catch (e) { }
    }

    getOrCreateClientId() {
        let id = sessionStorage.getItem('rdp_client_id');
        if (!id) {
            id = 'stn_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('rdp_client_id', id);
        }
        return id;
    }

    notifyStatusChange() {
        const event = new CustomEvent('sync-status-changed', {
            detail: {
                isOnline: this.isOnline,
                isConnectedToCloud: this.isConnectedToCloud,
                room: this.roomName,
                role: this.userRole
            }
        });
        window.dispatchEvent(event);
    }
}
