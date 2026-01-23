# Phase 8: P2P Sync (Optional)

**Status:** 📋 PLANNED

**Goal:** Direct device-to-device sync when on same network

**Dependencies:** Phase 6 (HTTP Sync)

**Note:** This phase is optional. HTTP sync (Phase 6) covers most use cases. P2P is an enhancement for faster sync and reduced server dependency.

---

## Overview

P2P sync enables direct device-to-device communication:
1. Discover family devices on local network
2. Sync directly without server round-trip
3. Fall back to HTTP when P2P unavailable
4. Reduced latency and server load

---

## UI Wireframes: Before & After

### Sync Status Indicator (Updated for P2P)

**BEFORE (HTTP only from Phase 6):**
```
┌─────────────────────────────────────┐
│  SaborSpin    [☁️ ✓]  [🏠 Silva ▼] │
├─────────────────────────────────────┤

Sync States:
┌─────────────────────────────────────┐
│  [☁️ ✓]     = Synced (HTTP)        │
│  [☁️ 🔄]    = Syncing...            │
│  [☁️ 3]     = 3 changes pending     │
│  [☁️ ⚠️]    = Offline               │
└─────────────────────────────────────┘
```

**AFTER (P2P + HTTP):**
```
┌─────────────────────────────────────┐
│  SaborSpin   [📡 2✓]  [🏠 Silva ▼] │  ← P2P icon + device count
├─────────────────────────────────────┤

Sync States:
┌─────────────────────────────────────┐
│  [📡 2✓]    = P2P with 2 devices    │  ← Direct connection
│  [☁️ ✓]     = HTTP only (no P2P)    │
│  [📡 🔄]    = P2P syncing...        │
│  [📡 ⚠️]    = P2P unavailable       │
└─────────────────────────────────────┘
```

### Sync Status Detail (Updated for P2P)

**BEFORE (HTTP only):**
```
┌─────────────────────────────────────┐
│  Sync Status                    [X] │
├─────────────────────────────────────┤
│                                     │
│  ☁️ Last synced: 2 minutes ago      │
│                                     │
│  Silva Household:                   │
│  ┌─────────────────────────────────┐│
│  │ ✓ Up to date                    ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         [Sync Now]              ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER (P2P + HTTP):**
```
┌─────────────────────────────────────┐
│  Sync Status                    [X] │
├─────────────────────────────────────┤
│                                     │
│  📡 P2P Active                      │  ← NEW section
│  ┌─────────────────────────────────┐│
│  │ Connected to 2 devices:         ││
│  │ • Maria's iPhone       [●]      ││  ← Green = connected
│  │ • Pedro's Android      [●]      ││
│  └─────────────────────────────────┘│
│                                     │
│  ☁️ Last HTTP sync: 5 minutes ago   │
│                                     │
│  Silva Household:                   │
│  ┌─────────────────────────────────┐│
│  │ ✓ Up to date                    ││
│  │   Synced via P2P                ││  ← Shows sync method
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         [Sync Now]              ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Settings - Sync Options (Updated for P2P)

**BEFORE (HTTP only):**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Sync                               │
│  ┌─────────────────────────────────┐│
│  │ Auto-sync on app open   [====○]││
│  │                                 ││
│  │ Last sync: 2 min ago            ││
│  │ Pending changes: 0              ││
│  │                                 ││
│  │ [Sync Now]                      ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER (P2P + HTTP):**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Sync                               │
│  ┌─────────────────────────────────┐│
│  │ Auto-sync on app open   [====○]││
│  │                                 ││
│  │ P2P sync (same network) [====○]││  ← NEW toggle
│  │                                 ││
│  │ ─────────────────────────────── ││
│  │                                 ││
│  │ Connection Status:              ││  ← NEW section
│  │ 📡 P2P: 2 devices connected     ││
│  │ ☁️ HTTP: Available              ││
│  │                                 ││
│  │ Last sync: 2 min ago (P2P)      ││
│  │ Pending changes: 0              ││
│  │                                 ││
│  │ [Sync Now]                      ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### P2P Connection States

**P2P AVAILABLE & CONNECTED:**
```
┌─────────────────────────────────────┐
│  📡 P2P Active                      │
│  ┌─────────────────────────────────┐│
│  │ ● Maria's iPhone     Connected  ││
│  │ ● Pedro's Android    Connected  ││
│  │ ○ Ana's iPad         Offline    ││  ← Gray = not on network
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**P2P CONNECTING:**
```
┌─────────────────────────────────────┐
│  📡 P2P Connecting...               │
│  ┌─────────────────────────────────┐│
│  │ 🔄 Maria's iPhone    Connecting ││
│  │ ○ Pedro's Android    Searching  ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**P2P UNAVAILABLE (using HTTP):**
```
┌─────────────────────────────────────┐
│  ☁️ HTTP Sync (P2P unavailable)     │
│  ┌─────────────────────────────────┐│
│  │ No family devices on network    ││
│  │ Using server sync               ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Architecture

```
┌─────────────┐         ┌─────────────┐
│  Device A   │◄───────►│  Device B   │
│   (João)    │  WebRTC │   (Maria)   │
└──────┬──────┘  (P2P)  └──────┬──────┘
       │                       │
       │    ┌─────────────┐    │
       └────►  Signaling  ◄────┘
            │   Server    │
            │  (for P2P   │
            │   setup)    │
            └─────────────┘
```

**Sync Priority:**
1. Try P2P first (if devices on same network)
2. Fall back to HTTP if P2P unavailable

---

## Technology

### WebRTC for React Native

**Library:** `react-native-webrtc`

```bash
npm install react-native-webrtc
```

**Capabilities:**
- Peer-to-peer data channels
- Works on local network and internet
- Encrypted by default
- Handles NAT traversal

---

## Implementation

### 8.1 Signaling Server

**Purpose:** Help devices find each other and establish P2P connection.

**Endpoints:**

```typescript
// WebSocket connection for signaling
ws://server/signal

// Messages:
// { type: 'register', familyId, userId, deviceId }
// { type: 'offer', familyId, toDeviceId, sdp }
// { type: 'answer', familyId, toDeviceId, sdp }
// { type: 'ice-candidate', familyId, toDeviceId, candidate }
// { type: 'device-online', familyId, deviceId }
// { type: 'device-offline', familyId, deviceId }
```

**Flow:**
1. Device connects to signaling server
2. Registers with familyId, userId, deviceId
3. Gets notified when other family devices come online
4. Initiates WebRTC connection via signaling
5. Once connected, data flows directly P2P

---

### 8.2 P2P Connection Setup

```typescript
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

class P2PConnection {
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null = null;

  constructor(private onMessage: (data: any) => void) {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN server for fallback
      ],
    });

    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  async createOffer(): Promise<RTCSessionDescription> {
    this.dataChannel = this.pc.createDataChannel('sync');
    this.setupDataChannel();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(offer: RTCSessionDescription): Promise<RTCSessionDescription> {
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    await this.pc.setRemoteDescription(answer);
  }

  async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    await this.pc.addIceCandidate(candidate);
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };
  }

  send(data: any): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }
}
```

---

### 8.3 P2P Sync Manager

```typescript
class P2PSyncManager {
  private connections: Map<string, P2PConnection> = new Map();
  private signaling: WebSocket;

  async connect(familyId: string): Promise<void> {
    // Connect to signaling server
    this.signaling = new WebSocket('wss://server/signal');

    this.signaling.onopen = () => {
      this.signaling.send(JSON.stringify({
        type: 'register',
        familyId,
        userId: getCurrentUser().id,
        deviceId: getDeviceId(),
      }));
    };

    this.signaling.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.handleSignalingMessage(msg);
    };
  }

  private async handleSignalingMessage(msg: any): Promise<void> {
    switch (msg.type) {
      case 'device-online':
        await this.initiateConnection(msg.deviceId);
        break;
      case 'offer':
        await this.handleIncomingOffer(msg.fromDeviceId, msg.sdp);
        break;
      case 'answer':
        await this.handleIncomingAnswer(msg.fromDeviceId, msg.sdp);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(msg.fromDeviceId, msg.candidate);
        break;
    }
  }

  private async initiateConnection(deviceId: string): Promise<void> {
    const conn = new P2PConnection((data) => this.handleP2PMessage(deviceId, data));
    this.connections.set(deviceId, conn);

    const offer = await conn.createOffer();
    this.signaling.send(JSON.stringify({
      type: 'offer',
      toDeviceId: deviceId,
      sdp: offer,
    }));

    // Collect and send ICE candidates
    conn.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send(JSON.stringify({
          type: 'ice-candidate',
          toDeviceId: deviceId,
          candidate: event.candidate,
        }));
      }
    };
  }

  async syncViaP2P(familyId: string, data: SyncPayload): Promise<boolean> {
    const connectedDevices = Array.from(this.connections.entries())
      .filter(([_, conn]) => conn.dataChannel?.readyState === 'open');

    if (connectedDevices.length === 0) {
      return false;  // No P2P available, fall back to HTTP
    }

    for (const [deviceId, conn] of connectedDevices) {
      conn.send({
        type: 'sync',
        payload: data,
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  }

  private handleP2PMessage(deviceId: string, data: any): void {
    if (data.type === 'sync') {
      // Merge incoming data
      mergeIntoLocal(data.payload, data.timestamp);
    }
  }
}
```

---

### 8.4 Hybrid Sync Logic

```typescript
async function syncFamily(familyId: string): Promise<SyncResult> {
  const p2pManager = getP2PSyncManager();
  const localChanges = await getLocalChanges(familyId);

  // Try P2P first
  if (localChanges.length > 0) {
    const p2pSuccess = await p2pManager.syncViaP2P(familyId, localChanges);

    if (p2pSuccess) {
      console.log('Synced via P2P');
      return { method: 'p2p', success: true };
    }
  }

  // Fall back to HTTP
  console.log('P2P unavailable, falling back to HTTP');
  return await syncViaHTTP(familyId);
}
```

---

### 8.5 Local Network Discovery

**mDNS/Bonjour (Optional Enhancement):**

For same-network discovery without signaling server:

```typescript
import { Zeroconf } from 'react-native-zeroconf';

const zeroconf = new Zeroconf();

// Advertise this device
zeroconf.publishService('saborspin', 'tcp', 'local.', familyId, 8080);

// Discover other devices
zeroconf.on('resolved', (service) => {
  if (service.name.startsWith('saborspin-')) {
    // Found family device on local network
    connectDirectly(service.host, service.port);
  }
});

zeroconf.scan('saborspin', 'tcp', 'local.');
```

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit, Playwright E2E, Maestro |
| 2 | Run quality baseline | ~30 min | test:mutation, arch:test, lint:dead-code, lint:duplicates, security:scan |
| 3 | Set up WebRTC library | ~2 hours | Installation, config |
| 4 | Implement signaling server | ~4 hours | WebSocket server |
| 5 | Write unit tests for signaling server | ~1.5 hours | Test message routing |
| 6 | Implement P2P connection class | ~4 hours | WebRTC wrapper |
| 7 | Write unit tests for P2P connection | ~1.5 hours | Test offer/answer flow |
| 8 | Implement signaling client | ~3 hours | Connect, register |
| 9 | Write unit tests for signaling client | ~1 hour | Test connection states |
| 10 | Implement P2P sync manager | ~4 hours | Connection management |
| 11 | Write unit tests for P2PSyncManager | ~1.5 hours | Test sync via P2P |
| 12 | Integrate with existing sync | ~3 hours | Hybrid logic |
| 13 | Write unit tests for hybrid fallback | ~1 hour | Test P2P → HTTP fallback |
| 14 | Add connection status UI | ~2 hours | "Connected to 2 devices" |
| 15 | Write Playwright E2E test for P2P status display | ~1 hour | Test connection indicator UI |
| 16 | Write Maestro test for P2P status display | ~1 hour | Mirror Playwright test for mobile |
| 17 | Write Playwright E2E test for P2P toggle in settings | ~1 hour | Test enable/disable P2P |
| 18 | Write Maestro test for P2P toggle in settings | ~1 hour | Mirror Playwright test for mobile |
| 19 | Run full test suites | ~20 min | Unit + Playwright + Maestro, verify no regressions |
| 20 | Run quality checks and compare | ~30 min | Compare to baseline; create remediation plan if worse |
| 21 | Integration testing with multiple devices | ~4 hours | Real device P2P testing |
| 22 | (Optional) mDNS discovery | ~4 hours | Local network |
| 23 | Document learning notes | ~30 min | Capture unexpected errors, workarounds, fixes |

**Total Estimated Effort:** ~43.5 hours (including unit + Playwright + Maestro tests + quality checks)

---

## Challenges & Considerations

### NAT Traversal
- WebRTC handles most NAT scenarios
- May need TURN server for restrictive networks
- TURN adds latency but ensures connectivity

### Battery & Performance
- Keep connections alive efficiently
- Disconnect when app backgrounded
- Reconnect when app foregrounded

### Security
- WebRTC encrypts data in transit
- Still use our encryption layer for data at rest
- Verify device identity via signatures

---

## Testing Strategy

### Unit Tests
- [ ] P2P connection setup
- [ ] Data channel messaging
- [ ] Hybrid sync fallback logic

### Integration Tests
- [ ] Two devices connect via signaling
- [ ] Data syncs P2P between devices
- [ ] Falls back to HTTP when P2P fails

### Manual Testing
- [ ] Test on same WiFi network
- [ ] Test with one device on cellular
- [ ] Test reconnection after disconnect

---

## Files to Create/Modify

**New Files:**
- `lib/p2p/P2PConnection.ts` - WebRTC wrapper
- `lib/p2p/P2PSyncManager.ts` - P2P sync orchestration
- `lib/p2p/signalingClient.ts` - Signaling server client
- `server/signaling.ts` - Signaling server (WebSocket)
- `components/P2PStatusIndicator.tsx` - Connection status
- `docs/learning/epic04_feature_enhancement/PHASE8_LEARNING_NOTES.md` - Learning notes

**Modified Files:**
- `lib/sync/syncManager.ts` - Add P2P integration
- `app/(tabs)/settings.tsx` - P2P status/toggle

---

## Success Criteria

Phase 8 is complete when:
- [ ] Devices can discover each other
- [ ] P2P connections established via signaling
- [ ] Data syncs directly between devices
- [ ] Falls back to HTTP when P2P unavailable
- [ ] Connection status visible to user
- [ ] All tests pass

---

## Decision: Implement or Skip?

**Consider skipping if:**
- HTTP sync meets all needs
- Time constraints
- P2P complexity not worth the benefit

**Consider implementing if:**
- Want faster sync on local network
- Reduce server dependency
- Better offline/local experience
- Learning opportunity (WebRTC)

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 8 Learning Notes →](./PHASE8_LEARNING_NOTES.md)**

---

## Reference

See [Approach 2: Family Kitchen - Section 2.4](../../product_info/meals-randomizer-exploration.md#24-technical-architecture-pear-lite-hybrid) for P2P architecture design.
