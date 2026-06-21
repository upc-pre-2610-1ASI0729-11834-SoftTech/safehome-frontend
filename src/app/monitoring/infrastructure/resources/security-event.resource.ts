/**
 * @summary Resource shape for alert and event records.
 * @author SofTech
 */
export interface SecurityEventResource {
  id: string;
  title: string;
  device: string;
  zone: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
  description: string;
  deviceName?: string;
  locationArea?: string;
}
