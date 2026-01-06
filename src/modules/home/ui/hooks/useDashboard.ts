import { useState, useEffect } from 'react';
import { DashboardData } from '../../domain/entities/DashboardData';
import { getDashboardDataUseCase } from '../../providers';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardDataUseCase.execute();
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
