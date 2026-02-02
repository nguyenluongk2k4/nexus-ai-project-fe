import { CoinsGateway } from '../domain/ports/CoinsGateway';

export class GetBalanceUseCase {
    constructor(private gateway: CoinsGateway) { }
    async execute() {
        return this.gateway.getBalance();
    }
}

export class GetMissionsUseCase {
    constructor(private gateway: CoinsGateway) { }
    async execute() {
        const [available, userProgress] = await Promise.all([
            this.gateway.getAvailableMissions(),
            this.gateway.getUserMissions()
        ]);
        return { available, userProgress };
    }
}

export class ClaimMissionRewardUseCase {
    constructor(private gateway: CoinsGateway) { }
    async execute(missionId: string) {
        return this.gateway.claimMissionReward(missionId);
    }
}
