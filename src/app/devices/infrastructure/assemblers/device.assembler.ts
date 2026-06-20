import { DeviceEntity } from '../../domain/model/device.entity';
import { DeviceApiResource, DeviceApiRequest } from '../services/device-api.service';

/**
 * @summary Converts between backend DeviceApiResource and frontend DeviceEntity.
 * @author SofTech
 */
export class DeviceAssembler {

  static toEntity(resource: DeviceApiResource): DeviceEntity {
    const typeMap: Record<string, DeviceEntity['type']> = {
      MOTION: 'motion', CAMERA: 'camera', LOCK: 'lock', SMOKE: 'smoke', WINDOW: 'window',
      motion: 'motion', camera: 'camera', lock: 'lock', smoke: 'smoke', window: 'window'
    };
    const statusMap: Record<string, DeviceEntity['status']> = {
      ACTIVE: 'active', INACTIVE: 'inactive', WARNING: 'warning', OFFLINE: 'offline', DISCONNECTED: 'offline',
      active: 'active', inactive: 'inactive', warning: 'warning', offline: 'offline'
    };

    return {
      id: resource.id,
      name: resource.name ?? 'Device',
      code: resource.qrCode ?? resource.id.slice(0, 12).toUpperCase(),
      type: typeMap[resource.deviceType] ?? 'motion',
      zone: resource.locationArea ?? 'Unassigned',
      status: statusMap[resource.status] ?? 'inactive',
      battery: resource.battery ?? 100,
      lastSeen: resource.lastSeenAt
        ? new Date(resource.lastSeenAt).toLocaleString()
        : 'Unknown',
      description: resource.description ?? ''
    };
  }

  static toEntities(resources: DeviceApiResource[]): DeviceEntity[] {
    return resources.map(r => DeviceAssembler.toEntity(r));
  }

  static toRequest(entity: Omit<DeviceEntity, 'id'>, propertyId?: string): DeviceApiRequest {
    const typeMap: Record<string, string> = {
      motion: 'MOTION', camera: 'CAMERA', lock: 'LOCK', smoke: 'SMOKE', window: 'WINDOW'
    };
    const statusMap: Record<string, string> = {
      active: 'ACTIVE', inactive: 'INACTIVE', warning: 'WARNING', offline: 'OFFLINE'
    };

    return {
      propertyId,
      name: entity.name,
      deviceType: typeMap[entity.type] ?? 'MOTION',
      locationArea: entity.zone,
      status: statusMap[entity.status] ?? 'ACTIVE',
      qrCode: entity.code,
      battery: entity.battery,
      description: entity.description
    };
  }
}
