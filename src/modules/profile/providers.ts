// Profile Module Providers (Dependency Injection)

import { ProfileApiGateway } from './infrastructure/ProfileApiGateway';
import { ProfileService } from './domain/services/ProfileService';

// Singleton instances
const profileGateway = new ProfileApiGateway();
const profileService = new ProfileService(profileGateway);

export function getProfileService(): ProfileService {
    return profileService;
}
