import { SupportTicketEntity } from '../../../shared/domain/model/safehome-state.entity';
import { SupportTicketApiResource } from '../services/support-ticket-api.service';

/**
 * @summary Converts backend SupportTicketApiResource to frontend SupportTicketEntity.
 * @author SofTech
 */
export class SupportTicketAssembler {

  static toEntity(resource: SupportTicketApiResource, userEmail?: string, userName?: string): SupportTicketEntity {
    return {
      id: resource.id,
      name: userName ?? '',
      email: userEmail ?? '',
      category: resource.priority ?? 'MEDIUM',
      subject: resource.subject ?? '',
      message: resource.description ?? '',
      createdAt: resource.createdAt
        ? new Date(resource.createdAt).toLocaleString()
        : new Date().toLocaleString(),
      status: resource.status,
      priority: resource.priority
    };
  }

  static toEntities(resources: SupportTicketApiResource[], userEmail?: string, userName?: string): SupportTicketEntity[] {
    return resources.map(r => SupportTicketAssembler.toEntity(r, userEmail, userName));
  }
}
