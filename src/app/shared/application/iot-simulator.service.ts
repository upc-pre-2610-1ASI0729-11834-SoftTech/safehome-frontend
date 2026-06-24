import { Injectable, inject, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SafeHomeStore } from './safehome.store';
import { SecurityEventEntity } from '../../monitoring/domain/model/security-event.entity';
import { DeviceEntity } from '../../devices/domain/model/device.entity';

/**
 * @summary Simulates IoT events from active devices at random intervals (1–5 min).
 * Motion/intrusion events are excluded — reserved for the physical PIR device.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class IoTSimulatorService implements OnDestroy {
    private store = inject(SafeHomeStore);
    private timer: ReturnType<typeof setTimeout> | null = null;
    private running = false;

    /** Callback invoked when a new simulated event is generated. */
    onEvent: ((event: SecurityEventEntity) => void) | null = null;

    // NOTE: 'intrusion' / motion type is intentionally excluded here.
    // It will be handled by the real physical PIR device integration.
    private readonly EVENT_TEMPLATES: {
        type: SecurityEventEntity['type'];
        deviceTypes: DeviceEntity['type'][];
        severity: SecurityEventEntity['severity'];
        titles: string[];
        descriptions: string[];
    }[] = [
        {
            type: 'smoke',
            deviceTypes: ['smoke'],
            severity: 'critical',
            titles: ['Smoke detected', 'Fire alert', 'High temperature detected'],
            descriptions: [
                'Smoke concentration above safe levels was registered.',
                'The temperature in the zone rose rapidly.',
                'Possible fire risk detected. Please check the area.'
            ]
        },
        {
            type: 'camera',
            deviceTypes: ['camera'],
            severity: 'medium',
            titles: ['Camera activity', 'Visual alert', 'Camera triggered'],
            descriptions: [
                'The camera detected an unusual movement in its field of view.',
                'A new face was registered by the surveillance camera.',
                'Activity was recorded outside normal hours.'
            ]
        },
        {
            type: 'lock',
            deviceTypes: ['lock'],
            severity: 'medium',
            titles: ['Lock tampered', 'Lock activity', 'Door access attempt'],
            descriptions: [
                'An access attempt was registered on the smart lock.',
                'The lock reported an unusual interaction.',
                'Multiple failed unlock attempts detected.'
            ]
        },
        {
            type: 'battery',
            deviceTypes: ['camera', 'lock', 'smoke', 'window'],
            severity: 'info',
            titles: ['Low battery warning', 'Battery check needed', 'Power level low'],
            descriptions: [
                'The device battery is below 20%. Consider charging it soon.',
                'Battery level has dropped to a critical point.',
                'Low power detected. Device may go offline soon.'
            ]
        },
        {
            type: 'system',
            deviceTypes: ['window'],
            severity: 'medium',
            titles: ['Window opened', 'Window sensor alert', 'Unexpected window activity'],
            descriptions: [
                'A window was opened while the system was armed.',
                'The window sensor registered an unexpected change.',
                'Window contact was broken outside of scheduled hours.'
            ]
        }
    ];

    /**
     * @summary Starts the simulator with a random interval between minMs and maxMs.
     * Defaults to 1–5 minutes.
     */
    /**
     * @summary Starts the IoT simulator. No-op in production (environment.enableIotSimulator = false).
     * In production, real device telemetry comes from the physical device layer.
     */
    start(minMs = 180_000, maxMs = 1_800_000): void {
        if (!environment.enableIotSimulator) return;
        if (this.running) return;
        this.running = true;
        this.schedule(minMs, maxMs);
    }

    /** @summary Stops the simulator and clears pending timers. */
    stop(): void {
        this.running = false;
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    ngOnDestroy(): void {
        this.stop();
    }

    // ─── Private ────────────────────────────────────────────────────────────────

    private schedule(minMs: number, maxMs: number): void {
        const delay = minMs + Math.random() * (maxMs - minMs);
        this.timer = setTimeout(() => {
            if (!this.running) return;
            this.emit();
            this.schedule(minMs, maxMs);
        }, delay);
    }

    private emit(): void {
        // Only fire for active non-motion devices
        const activeDevices = this.store
            .devices()
            .filter((d) => d.status === 'active' && d.type !== 'motion');

        if (!activeDevices.length) return;

        const device = activeDevices[Math.floor(Math.random() * activeDevices.length)];

        const matching = this.EVENT_TEMPLATES.filter((t) =>
            t.deviceTypes.includes(device.type)
        );
        if (!matching.length) return;

        const template = matching[Math.floor(Math.random() * matching.length)];
        const title = template.titles[Math.floor(Math.random() * template.titles.length)];
        const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
        const now = new Date();
        const createdAt = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const nextId = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const event: SecurityEventEntity = {
            id: nextId,
            title,
            device: device.name,
            zone: device.zone,
            type: template.type,
            severity: template.severity,
            status: 'active',
            createdAt,
            description
        };

        this.store.addSimulatedEvent(event);
        this.onEvent?.(event);
    }
}
