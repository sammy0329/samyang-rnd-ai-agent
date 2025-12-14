import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';

export interface Report {
  id: string;
  type: 'daily_trend' | 'creator_match' | 'content_idea';
  title: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

interface ReportsFilters {
  type?: 'daily_trend' | 'creator_match' | 'content_idea';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  showAll?: boolean;
}

interface ReportsResponse {
  success: boolean;
  data: {
    reports: Report[];
    total: number;
    filters: ReportsFilters;
  };
}

/**
 * Fetch reports from API
 */
async function fetchReports(filters: ReportsFilters): Promise<ReportsResponse> {
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());
  if (filters.showAll !== undefined) params.append('showAll', filters.showAll.toString());

  const response = await fetch(`/api/reports?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch reports');
  }

  return response.json();
}

/**
 * Create a new report
 */
async function createReport(type: 'daily_trend' | 'creator_match' | 'content_idea'): Promise<Report> {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create report');
  }

  const result = await response.json();
  return result.data;
}

/**
 * React Query hook for reports list
 */
export function useReports(
  filters: ReportsFilters = {}
): UseQueryResult<ReportsResponse, Error> {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => fetchReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query mutation hook for creating reports
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
