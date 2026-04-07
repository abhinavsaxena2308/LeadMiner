const APIFY_BASE_URL = 'https://api.apify.com/v2';
const ACTOR_ID = 'compass~crawler-google-places';

export const validateApifyKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${APIFY_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

export interface ScrapeFilters {
  query: string;
  location: string;
  maxResults: number;
  noWebsite: boolean;
  minRating: number;
  hasPhone: boolean;
  hasEmail: boolean;
  openNow: boolean;
}

export const startScrapeJob = async (apiKey: string, filters: ScrapeFilters): Promise<string> => {
  const searchQuery = filters.location ? `${filters.query} in ${filters.location}` : filters.query;

  // Input schema for compass~google-maps-scraper
  const input = {
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: filters.maxResults,
    language: 'en',
    includeWebResults: false,
  };

  const response = await fetch(`${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs?token=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let apifyMessage = 'Failed to start scrape job';
    try {
      const errData = await response.json();
      apifyMessage = errData?.error?.message || errData?.message || apifyMessage;
    } catch {
      // ignore parse errors
    }
    throw new Error(`Apify error (${response.status}): ${apifyMessage}`);
  }

  const data = await response.json();
  return data.data.id; // Returns the Run ID
};

export const checkScrapeStatus = async (apiKey: string, runId: string) => {
  const response = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check status');
  }

  const data = await response.json();
  return {
    status: data.data.status, // e.g., 'READY', 'RUNNING', 'SUCCEEDED', 'FAILED'
    datasetId: data.data.defaultDatasetId,
  };
};

export const fetchDatasetItems = async (apiKey: string, datasetId: string): Promise<any[]> => {
  const response = await fetch(`${APIFY_BASE_URL}/datasets/${datasetId}/items`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dataset items');
  }

  const data = await response.json();
  return data;
};
