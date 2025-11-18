document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('content');
    const navHome = document.getElementById('nav-home');
    const navGames = document.getElementById('nav-games');
    const navMovies = document.getElementById('nav-movies');

    function clearActive() {
        document.querySelectorAll('.nav-link').forEach(a => {
            a.classList.remove('active');
        });
    }

    function fadeOut(callback) {
        content.style.opacity = 1;
        let fadeEffect = setInterval(() => {
            if (!content.style.opacity) content.style.opacity = 1;
            if (content.style.opacity > 0) {
                content.style.opacity -= 0.1;
            } else {
                clearInterval(fadeEffect);
                callback();
            }
        }, 30);
    }

    function fadeIn() {
        let opacity = 0;
        content.style.opacity = 0;
        let fadeEffect = setInterval(() => {
            if (opacity < 1) {
                opacity += 0.1;
                content.style.opacity = opacity;
            } else {
                clearInterval(fadeEffect);
            }
        }, 30);
    }

    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        clearActive();
        navHome.classList.add('active');
        fadeOut(loadHome);
    });

    navGames.addEventListener('click', function(e) {
        e.preventDefault();
        clearActive();
        navGames.classList.add('active');
        fadeOut(loadGames);
    });

    navMovies.addEventListener('click', function(e) {
        e.preventDefault();
        clearActive();
        navMovies.classList.add('active');
        fadeOut(loadMovies);
    });

    function loadHome() {
        content.innerHTML = `
            <h2>Welcome to THE UNBLOCKED BLENDER</h2>
            <p>Enjoy retro games and streaming content with a neon twist! Explore our collection of handpicked retro games and immerse yourself in a truly nostalgic experience.</p>
        `;
        fadeIn();
    }

    let allGames = [];
    let currentGameIndex = 0;
    const gamesPerPage = 12;
    const placeholderSvg = "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='20'>No image</text></svg>";
    const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(placeholderSvg);
    
    function renderGameBatch(games, startIdx, count) {
        let html = '';
        for (let i = startIdx; i < Math.min(startIdx + count, games.length); i++) {
            const game = games[i];
            const safeName = (game.name || '').replace(/'/g, "\\'");
            const entryPath = game.entry ? encodeURI(game.entry) : ('assets/games/games/' + encodeURIComponent(game.folder) + '/page.html');
            html += `
                    <div class="game-item" onclick="showGame('${entryPath}', '${safeName}')">
                        <img class="game-icon lazy-img" data-src="${game.icon || placeholder}" alt="${safeName}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${placeholder}';" />
                        <h3>${game.name}</h3>
                    </div>
            `;
        }
        return html;
    }
    
    function setupLazyLoad() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '50px' });
        
        document.querySelectorAll('.lazy-img[data-src]').forEach(img => observer.observe(img));
    }
    
    function setupInfiniteScroll() {
        const sentinel = document.getElementById('games-sentinel');
        if (!sentinel) return;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && currentGameIndex < allGames.length) {
                const gamesList = document.querySelector('.games-list');
                const html = renderGameBatch(allGames, currentGameIndex, gamesPerPage);
                gamesList.innerHTML += html;
                currentGameIndex += gamesPerPage;
                setupLazyLoad();
            }
        }, { threshold: 0.1 });
        
        observer.observe(sentinel);
    }

    function loadGames() {
        console.log('Fetching games from assets/games/games.js');
        fetch('assets/games/games.js')
            .then(response => response.json())
            .then(games => {
                allGames = games.filter(g => g.folder !== '.git'); // Skip .git folder
                let html = `<h2>Games (${allGames.length})</h2><div class="games-list">`;
                html += renderGameBatch(allGames, 0, gamesPerPage);
                html += `</div><div id="games-sentinel"></div>`;
                currentGameIndex = gamesPerPage;
                content.innerHTML = html;
                setupLazyLoad();
                setupInfiniteScroll();
                fadeIn();
            })
            .catch(err => {
                content.innerHTML = `<p>Error loading games.</p>`;
                fadeIn();
            });
    }

    function loadMovies() {
        content.innerHTML = `
            <h2>Movies & TV Shows</h2>
            <input type="text" id="movieSearch" placeholder="Search for a movie or TV show..." />
            <div id="searchResults"></div>
        `;
        fadeIn();

        const searchInput = document.getElementById('movieSearch');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' && searchInput.value.trim().length > 0) {
                searchResults.innerHTML = '<p>Searching...</p>';
                const query = encodeURIComponent(searchInput.value.trim());
                fetch(`https://api.themoviedb.org/3/search/multi?api_key=877452c457631e86d4943b8bf4c727af&query=${query}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.results && data.results.length > 0) {
                            let html = '<div class="movies-list">';
                            data.results.forEach(item => {
                                // Only allow movies and TV shows
                                if (item.media_type === 'movie' || item.media_type === 'tv') {
                                    const title = item.title || item.name;
                                    const year = (item.release_date || item.first_air_date || '').split('-')[0];
                                    const tmdbId = item.id;
                                    const type = item.media_type;
                                    html += `
                                        <div class="movie-item" onclick="showMovieOrTV(${tmdbId}, '${type}', '${title.replace(/'/g, "\\'")}')">
                                            <h3>${title} ${year ? '(' + year + ')' : ''}</h3>
                                            <p>${item.overview || ''}</p>
                                        </div>
                                    `;
                                }
                            });
                            html += '</div>';
                            searchResults.innerHTML = html;
                        } else {
                            searchResults.innerHTML = '<p>No results found.</p>';
                        }
                    })
                    .catch(() => {
                        searchResults.innerHTML = '<p>Error searching TMDB.</p>';
                    });
            }
        });
    }

    window.showGame = function(path, name) {
        const gameHTML = `
            <div class="game-container fade-in">
                <h2>${name}</h2>
                <div class="controls">
                    <button onclick="goBack()">Back to Games</button>
                    <button onclick="makeFullScreen()">Fullscreen</button>
                </div>
                <iframe id="gameFrame" src="${path}" title="${name}"></iframe>
            </div>
        `;
        content.innerHTML = gameHTML;
    };

    window.goBack = function() {
        fadeOut(loadGames);
    };

    window.makeFullScreen = function() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.mozRequestFullScreen) {
            gameContainer.mozRequestFullScreen();
        } else if (gameContainer.webkitRequestFullscreen) {
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.msRequestFullscreen) {
            gameContainer.msRequestFullscreen();
        }
    };

    window.showMovieOrTV = function(tmdbId, type, title) {
        // Use 'movie' or 'tv' for vidsrc
        const vidsrcType = type === 'movie' ? 'movie' : 'tv';
        const embedUrl = `https://vidsrc.cc/v2/embed/${vidsrcType}/${tmdbId}`;
        const movieHTML = `
            <div class="movie-container fade-in">
                <h2>${title}</h2>
                <div class="controls">
                    <button onclick="goBackToMovies()">Back to Movies/TV</button>
                    <button onclick="makeMovieFullScreen()">Fullscreen</button>
                </div>
                <iframe id="movieFrame" src="${embedUrl}" title="${title}" allowfullscreen></iframe>
            </div>
        `;
        content.innerHTML = movieHTML;
    };

    window.goBackToMovies = function() {
        fadeOut(loadMovies);
    };

    window.makeMovieFullScreen = function() {
        const movieFrame = document.getElementById('movieFrame');
        if (movieFrame.requestFullscreen) {
            movieFrame.requestFullscreen();
        } else if (movieFrame.mozRequestFullScreen) {
            movieFrame.mozRequestFullScreen();
        } else if (movieFrame.webkitRequestFullscreen) {
            movieFrame.webkitRequestFullscreen();
        } else if (movieFrame.msRequestFullscreen) {
            movieFrame.msRequestFullscreen();
        }
    };

    navHome.classList.add('active');
    loadHome();
}); // Closing brace added here
