// TMDB API key is still required for searching movies via TMDB
const tmdbApiKey = '877452c457631e86d4943b8bf4c727af';

// Helper function to generate the vidsrc embed URL based on the movie's TMDB ID
function getEmbedUrl(tmdbId) {
    return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
}

// Set up the search functionality once the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const moviesListContainer = document.getElementById('movies-list');

    if (!searchInput || !searchButton || !moviesListContainer) {
        console.error('Required elements (search-input, search-button, movies-list) not found in the DOM.');
        return;
    }

    // Clear any pre-existing movies
    moviesListContainer.innerHTML = '';

    // When the search button is clicked, perform a search using the TMDB API
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            moviesListContainer.innerHTML = '<p>Please enter a search term.</p>';
            return;
        }

        try {
            const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`;
            const response = await fetch(tmdbUrl);
            const data = await response.json();
            
            // Clear previous results
            moviesListContainer.innerHTML = '';

            if (!data.results || data.results.length === 0) {
                moviesListContainer.innerHTML = '<p>No movies found.</p>';
                return;
            }

            // For each movie in the results, embed the movie using its TMDB id
            data.results.forEach(movie => {
                const embedUrl = getEmbedUrl(movie.id);
                const movieElem = document.createElement('div');
                movieElem.className = 'movie-embed';
                // Create an iframe for embedding
                movieElem.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%; height:400px;"></iframe>`;
                moviesListContainer.appendChild(movieElem);
            });
        } catch (error) {
            console.error('Error fetching data from TMDB:', error);
            moviesListContainer.innerHTML = '<p>Error loading movies. Please try again later.</p>';
        }
    });
});