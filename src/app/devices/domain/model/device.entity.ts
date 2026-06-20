/**
 * @summary Entity that represents a home security device.
 * @author SofTech
 */
export interface DeviceEntity {
  id: string;
  name: string;
  code: string;
  type: 'motion' | 'camera' | 'lock' | 'smoke' | 'window';
  zone: string;
  status: 'active' | 'inactive' | 'warning' | 'offline';
  battery: number;
  lastSeen: string;
  description: string;
}
