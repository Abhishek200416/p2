/**
 * GitHub API utilities for portfolio auto-sync
 */

const GITHUB_USERNAME = 'Abhishek200416';
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetches repositories from GitHub API
 * @param {string} sort - Sort parameter (updated, created, pushed, full_name)
 * @returns {Promise<Array>} Array of repository objects
 */
export const fetchGitHubRepos = async (sort = 'updated') => {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=${sort}&per_page=30`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }
    
    const repos = await response.json();
    
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      title: formatRepoTitle(repo.name),
      description: repo.description || 'No description available',
      language: repo.language,
      url: repo.html_url,
      updated: repo.updated_at,
      created: repo.created_at,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isRecent: isRecentRepo(repo.updated_at)
    }));
  } catch (error) {
    console.warn('Failed to fetch GitHub repos:', error.message);
    return [];
  }
};

/**
 * Formats repository name into a human-readable title
 */
const formatRepoTitle = (name) => {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a repository was updated recently (within 30 days)
 */
const isRecentRepo = (updatedAt) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(updatedAt) > thirtyDaysAgo;
};

/**
 * Merges GitHub repos with curated featured projects
 * @param {Array} githubRepos - Array of GitHub repositories
 * @param {Array} featuredProjects - Array of curated featured projects
 * @returns {Array} Merged and deduplicated array
 */
export const mergeWithFeatured = (githubRepos, featuredProjects) => {
  const merged = [...featuredProjects];
  
  // Add GitHub repos that aren't already featured
  githubRepos.forEach(repo => {
    const existingProject = featuredProjects.find(
      project => 
        project.slug === repo.name.toLowerCase() ||
        project.title.toLowerCase().includes(repo.title.toLowerCase()) ||
        project.links?.repo === repo.url
    );
    
    if (!existingProject) {
      // Convert GitHub repo to project format
      merged.push({
        slug: repo.name.toLowerCase(),
        title: repo.title,
        story: repo.description,
        stack: [repo.language].filter(Boolean),
        links: {
          repo: repo.url,
          demo: ""
        },
        updated: repo.updated,
        isFromGitHub: true,
        isRecent: repo.isRecent,
        stars: repo.stars,
        forks: repo.forks
      });
    } else {
      // Update existing project with GitHub data
      existingProject.updated = repo.updated;
      existingProject.isRecent = repo.isRecent;
      existingProject.stars = repo.stars;
      existingProject.forks = repo.forks;
      if (!existingProject.links?.repo) {
        existingProject.links = { ...existingProject.links, repo: repo.url };
      }
    }
  });
  
  // Sort by update date (most recent first)
  return merged.sort((a, b) => new Date(b.updated) - new Date(a.updated));
};

/**
 * Gets user profile information from GitHub
 */
export const fetchGitHubProfile = async () => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
    
    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }
    
    const profile = await response.json();
    
    return {
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      avatar: profile.avatar_url,
      url: profile.html_url,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Failed to fetch GitHub profile:', error.message);
    return null;
  }
};

/**
 * Checks GitHub API rate limit status
 */
export const checkRateLimit = async () => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`);
    
    if (!response.ok) {
      return { remaining: 0, limit: 60 };
    }
    
    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.warn('Failed to check rate limit:', error.message);
    return { remaining: 0, limit: 60 };
  }
};

export default {
  fetchGitHubRepos,
  mergeWithFeatured,
  fetchGitHubProfile,
  checkRateLimit
};