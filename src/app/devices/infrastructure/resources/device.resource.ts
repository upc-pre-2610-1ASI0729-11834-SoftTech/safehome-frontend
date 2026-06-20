/**
 * @summary Resource shape for device records.
 * @author SofTech
 */
export interface DeviceResource {
  id: number;
  name: string;
  code: string;
  type: string;
  zone: string;
  status: string;
  battery: number;
  lastSeen: string;
  description: string;
}
