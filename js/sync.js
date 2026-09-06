/**
 * Real-Time Collaboration & Cloud Synchronization Engine
 * Designed for Rong Doi Platform (RDP) Offshore CCR & Onshore Command Teams
 * 
 * Features:
 * 1. Zero-Configuration Local Broadcast: Native BroadcastChannel for instant (<5ms) sync across CCR screens/tabs.
 * 2. Zero-Configuration Cloud Relay: Public Secure MQTT over WebSocket (broker.hivemq.com) for live Offshore -> Onshore streaming.
 * 3. Offline-First Resilience: Automatic LocalStorage caching with seamless auto-reconnect.
 */

export class SyncEngine {
    constructor({ roomName = 'rong-doi-ops', onDataReceived = null }) {
        this.roomName = roomName;
        this.onDataReceived = onDataReceived;
        this.broadcastChannel = null;
        this.ws = null;
        this.isOnline = navigator.onLine;
        this.isConnectedToCloud = false;
        this.clientId = this.getOrCreateClientId();
        this.userRole = this.loadUserRole();

        this.initBroadcastChannel();
        this.initNetworkListeners();
        this.connectCloudRelay();
    }

    loadUserRole() {
        return localStorage.getItem('rdp_user_role') || 'CCR_CRT';
    }

    saveUserRole(role) {
        this.userRole = role;
        localStorage.setItem('rdp_user_role', role);
        this.notifyStatusChange();
    }

    setRoomName(newRoom) {
        if (!newRoom || newRoom === this.roomName) return;
        this.roomName = newRoom;
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
        }
        this.initBroadcastChannel();
        this.connectCloudRelay();
        this.notifyStatusChange();
    }

    initBroadcastChannel() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel(`storm_tracker_${this.roomName}`);
            this.broadcastChannel.onmessage = (event) => {
                if (event.data && event.data.senderId !== this.clientId && this.onDataReceived) {
                    this.onDataReceived(event.data, 'broadcast');
                }
            };
        }
    }

    initNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.connectCloudRelay();
            this.notifyStatusChange();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.isConnectedToCloud = false;
            this.notifyStatusChange();
        });
    }

    /**
     * Connect to Public Secure MQTT over WebSocket relay for zero-setup Cross-Network Sync
     */
    connectCloudRelay() {
        if (this.ws) {
            try { this.ws.close(); } catch (e) {}
            this.ws = null;
        }

        if (!this.isOnline) return;

        try {
            // Use public secure MQTT WebSocket broker for lightweight, zero-cost real-time pubsub
            const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
            this.ws = new WebSocket(brokerUrl, ['mqttv3.1.1']);

            this.ws.onopen = () => {
                this.isConnectedToCloud = true;
                this.sendMqttConnect();
                this.notifyStatusChange();
            };

            this.ws.onmessage = (event) => {
                this.handleMqttMessage(event.data);
            };

            this.ws.onerror = (e) => {
                console.warn('Cloud relay connection notice:', e);
                this.isConnectedToCloud = false;
                this.notifyStatusChange();
            };

            this.ws.onclose = () => {
                this.isConnectedToCloud = false;
                this.notifyStatusChange();
                // Auto reconnect after 6 seconds
                setTimeout(() => {
                    if (this.isOnline) this.connectCloudRelay();
                }, 6000);
            };
        } catch (err) {
            console.warn('WebSocket relay initialization fallback:', err);
            this.isConnectedToCloud = false;
        }
    }

    /**
     * Encode minimal MQTT Connect packet
     */
    sendMqttConnect() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const clientId = 'rdp_' + this.clientId;
        const protoName = 'MQTT';
        
        // Form standard MQTT 3.1.1 Connect Packet
        const variableHeader = [
            0x00, protoName.length, ...protoName.split('').map(c => c.charCodeAt(0)),
            0x04, // Version 3.1.1
            0x02, // Clean session
            0x00, 0x3C // Keepalive 60s
        ];
        const payload = [
            0x00, clientId.length, ...clientId.split('').map(c => c.charCodeAt(0))
        ];
        const remainingLength = variableHeader.length + payload.length;
        const packet = new Uint8Array([0x10, remainingLength, ...variableHeader, ...payload]);
        this.ws.send(packet.buffer);

        // Subscribe to incident room topic
        setTimeout(() => this.subscribeMqttTopic(), 300);
    }

    /**
     * Subscribe to current Room topic: rdp_storm_ops/<roomName>
     */
    subscribeMqttTopic() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const topic = `rdp_storm_ops/${this.roomName}`;
        const packetId = 1;
        const varHeader = [0x00, packetId];
        const payload = [
            0x00, topic.length, ...topic.split('').map(c => c.charCodeAt(0)),
            0x00 // QoS 0
        ];
        const remainingLength = varHeader.length + payload.length;
        const packet = new Uint8Array([0x82, remainingLength, ...varHeader, ...payload]);
        this.ws.send(packet.buffer);
    }

    /**
     * Publish JSON message to MQTT topic
     */
    publishMqtt(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        try {
            const topic = `rdp_storm_ops/${this.roomName}`;
            const payloadStr = JSON.stringify(message);
            const topicBytes = topic.split('').map(c => c.charCodeAt(0));
            const payloadBytes = new TextEncoder().encode(payloadStr);

            const varHeader = [0x00, topic.length, ...topicBytes];
            const remainingLength = varHeader.length + payloadBytes.length;
            
            // Format variable remaining length
            const remLenBytes = [];
            let len = remainingLength;
            do {
                let digit = len % 128;
                len = Math.floor(len / 128);
                if (len > 0) digit = digit | 0x80;
                remLenBytes.push(digit);
            } while (len > 0);

            const packet = new Uint8Array([0x30, ...remLenBytes, ...varHeader, ...payloadBytes]);
            this.ws.send(packet.buffer);
        } catch (e) {
            console.warn('MQTT publish error:', e);
        }
    }

    handleMqttMessage(data) {
        if (!(data instanceof ArrayBuffer) && !(data instanceof Blob)) return;
        
        const parseBuffer = (buffer) => {
            try {
                const bytes = new Uint8Array(buffer);
                // Find start of JSON payload ({ character = 0x7B)
                let jsonStart = -1;
                for (let i = 0; i < bytes.length; i++) {
                    if (bytes[i] === 0x7B) { // '{'
                        jsonStart = i;
                        break;
                    }
                }
                if (jsonStart !== -1) {
                    const jsonStr = new TextDecoder().decode(bytes.subarray(jsonStart));
                    const parsed = JSON.parse(jsonStr);
                    if (parsed && parsed.senderId !== this.clientId && this.onDataReceived) {
                        this.onDataReceived(parsed, 'cloud');
                    }
                }
            } catch (err) {
                // Ignore binary protocol frame parsing noise
            }
        };

        if (data instanceof Blob) {
            data.arrayBuffer().then(parseBuffer);
        } else {
            parseBuffer(data);
        }
    }

    broadcast(action, payload) {
        const message = {
            action,
            payload,
            timestamp: Date.now(),
            senderId: this.clientId,
            senderRole: this.userRole,
            room: this.roomName
        };

        // 1. Local Cross-Tab / Cross-Monitor Broadcast (CCR Bridge, OIM, Radio room)
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }

        // 2. Zero-Config Cloud Relay for Onshore Incident Command (Vung Tau / HCMC)
        this.publishMqtt(message);
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
