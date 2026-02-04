import { ContributorStats } from '../domain/entities/ForumEntities';
import { ForumGateway } from '../domain/ports/ForumGateway';

export class GetTopContributorsUseCase {
    constructor(private gateway: ForumGateway) { }

    async execute(limit: number = 10, month?: number, year?: number): Promise<ContributorStats[]> {
        return await this.gateway.getTopContributors(limit, month, year);
    }
}
