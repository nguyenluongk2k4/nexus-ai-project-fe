import { useState, useEffect } from 'react';
import { ContributorStats } from '../../domain/entities/ForumEntities';
import { getTopContributorsUseCase } from '../../providers';

export const useTopContributors = (limit: number = 10) => {
    const [contributors, setContributors] = useState<ContributorStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContributors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getTopContributorsUseCase.execute(limit);
                setContributors(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch contributors');
                console.error('Failed to fetch top contributors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContributors();
    }, [limit]);

    return { contributors, loading, error };
};
