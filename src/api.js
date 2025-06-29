const API_URL = 'http://localhost:5000/api';

export const getPodcasts = async () => {
  const response = await fetch(`${API_URL}/podcasts`);
  return response.json();
};

export const addPodcast = async (rssFeed) => {
  const response = await fetch(`${API_URL}/podcasts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rssFeed })
  });
  return response.json();
};

export const setCurrentPodcast = async (podcastId, episodeIndex = 0) => {
  const response = await fetch(`${API_URL}/podcasts/current`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ podcastId, episodeIndex })
  });
  return response.json();
};

export const getCurrentPodcast = async () => {
  const response = await fetch(`${API_URL}/podcasts/current`);
  return response.json(); 
};

export const deletePodcast = async (id) => {
  const response = await fetch(`${API_URL}/podcasts/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};