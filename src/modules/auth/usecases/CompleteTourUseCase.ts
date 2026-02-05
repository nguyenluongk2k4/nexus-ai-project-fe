// Auth Module - Complete Tour Use Case

export class CompleteTourUseCase {
    constructor(private authGateway: any) { }

    async execute(phase?: string): Promise<void> {
        await this.authGateway.completeTour(phase);
    }
}
