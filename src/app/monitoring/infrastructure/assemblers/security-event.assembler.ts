import { SecurityEventEntity } from '../../domain/model/security-event.entity';
import { SecurityEventResource } from '../resources/security-event.resource';
import { SecurityEventApiResource } from '../services/security-event-api.service';

/**
 * @summary Converts security event resources into domain entities.
 * @author SofTech
 */
export class SecurityEventAssembler {
  /**
   * @summary Maps a local resource to a security event entity.
   */
  static toEntity(resource: SecurityEventResource): SecurityEventEntity {
    return {
      id: resource.id,
      title: resource.title,
      device: resource.device,
      zone: resource.zone,
      type: resource.type as SecurityEventEntity['type'],
      severity: resource.severity as SecurityEventEntity['severity'],
      status: resource.status as SecurityEventEntity['status'],
      createdAt: resource.createdAt,
      description: resource.description
    };
  }

  /**
   * @summary Maps a backend API resource to a security event entity.
   */
  static fromApi(resource: SecurityEventApiResource): SecurityEventEntity {
    const typeMap: Record<string, SecurityEventEntity['type']> = {
      INTRUSION: 'intrusion',
      MOTION_DETECTED: 'intrusion',
      BATTERY: 'battery',
      CAMERA: 'camera',
      LOCK: 'lock',
      SYSTEM: 'system',
      SMOKE: 'smoke',
      GAS_LEAK: 'smoke',
      SMOKE_DETECTED: 'smoke',
      DOOR_OPENED: 'lock',

      intrusion: 'intrusion',
      battery: 'battery',
      camera: 'camera',
      lock: 'lock',
      system: 'system',
      smoke: 'smoke'
    };

    const severityMap: Record<string, SecurityEventEntity['severity']> = {
      CRITICAL: 'critical',
      HIGH: 'critical',
      MEDIUM: 'medium',
      LOW: 'info',
      INFO: 'info',
      RESOLVED: 'resolved',

      critical: 'critical',
      high: 'critical',
      medium: 'medium',
      low: 'info',
      info: 'info',
      resolved: 'resolved'
    };

    const statusMap: Record<string, SecurityEventEntity['status']> = {
      PENDING: 'active',
      ACTIVE: 'active',
      ATTENDED: 'attended',
      ACKNOWLEDGED: 'attended',
      RESOLVED: 'resolved',
      REACTIVATED: 'active',

      active: 'active',
      attended: 'attended',
      acknowledged: 'attended',
      resolved: 'resolved'
    };

    return {
      id: resource.id,
      title: resource.title ?? 'Security Event',
      device: resource.deviceName ?? resource.deviceId,
      zone: resource.locationArea ?? 'Unknown',
      type: typeMap[resource.eventType] ?? 'system',
      severity: severityMap[resource.severity] ?? 'info',
      status: statusMap[resource.status] ?? 'active',
      createdAt: resource.detectedAt
          ? new Date(resource.detectedAt).toLocaleString()
          : new Date().toLocaleString(),
      description: resource.description ?? ''
    };
  }

  /**
   * @summary Maps an array of backend API resources.
   */
  static toEntities(resources: SecurityEventApiResource[]): SecurityEventEntity[] {
    return resources.map(resource => SecurityEventAssembler.fromApi(resource));
  }
}