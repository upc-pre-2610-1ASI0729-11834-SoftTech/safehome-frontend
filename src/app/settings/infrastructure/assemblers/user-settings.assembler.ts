import { SafeSettingsEntity } from '../../../shared/domain/model/safehome-state.entity';
import { UserSettingsApiResource, UserSettingsApiRequest } from '../services/user-settings-api.service';

/**
 * @summary Converts between backend UserSettingsApiResource and frontend SafeSettingsEntity.
 * @author SofTech
 */
export class UserSettingsAssembler {

  static toEntity(resource: UserSettingsApiResource): SafeSettingsEntity {
    return {
      homeName:             resource.homeName             ?? '',
      emailNotifications:   resource.emailEnabled         ?? true,
      pushNotifications:    resource.pushEnabled          ?? true,
      systemNotifications:  resource.notificationsEnabled ?? true,
      emailSummary:         resource.emailSummary         ?? false,
      autoArm:              resource.autoArm              ?? false,
      darkMode:             resource.darkMode             ?? false,
      twoFactor:            resource.twoFactor            ?? false,
      autoLogout:           resource.autoLogout           ?? true,
      loginAlerts:          resource.loginAlerts          ?? true,
      sensibility:          (resource.alertSensitivity?.toLowerCase()) ?? 'medium',
      updateTime:           resource.updateTime           ?? '30 seconds',
      sessionDuration:      resource.sessionDuration      ?? '8 hours',
      zoneReviewInterval:   resource.zoneReviewInterval   ?? '6 hours',
      historyRetention:     resource.historyRetention     ?? '6 months',
      hiddenSensors:        resource.hiddenSensors        ?? false,
      language:             (resource.language as 'en' | 'es') ?? 'en'
    };
  }

  static toRequest(entity: SafeSettingsEntity, userId: string): UserSettingsApiRequest {
    return {
      userId,
      homeName:             entity.homeName,
      emailEnabled:         entity.emailNotifications,
      pushEnabled:          entity.pushNotifications,
      notificationsEnabled: entity.systemNotifications,
      emailSummary:         entity.emailSummary,
      autoArm:              entity.autoArm,
      darkMode:             entity.darkMode,
      twoFactor:            entity.twoFactor,
      autoLogout:           entity.autoLogout,
      loginAlerts:          entity.loginAlerts,
      alertSensitivity:     entity.sensibility.toUpperCase(),
      updateTime:           entity.updateTime,
      sessionDuration:      entity.sessionDuration,
      zoneReviewInterval:   entity.zoneReviewInterval,
      historyRetention:     entity.historyRetention,
      hiddenSensors:        entity.hiddenSensors,
      language:             entity.language
    };
  }
}
