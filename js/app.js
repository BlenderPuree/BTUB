document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('content');
    const navHome = document.getElementById('nav-home');
    const navGames = document.getElementById('nav-games');
    const navMovies = document.getElementById('nav-movies');
    const navChat = document.getElementById('nav-chat');

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

    navChat.addEventListener('click', function(e) {
        e.preventDefault();
        clearActive();
        navChat.classList.add('active');
        fadeOut(loadChat);
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

    function loadProxy() {
        }

    function loadChat() {
        const chatHTML = `
            <style>
                #chat-container { width: 100%; height: 100%; display: flex; flex-direction: column; }
                .chat-header { background: #383c3f; padding: 12px 20px; border-bottom: 2px solid #4dffa6; display:flex; align-items:center; justify-content:space-between; gap:10px }
                .chat-header h1 { margin: 0; color: #fff; font-size: 20px; }
                .chatbox { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; background: #303336; }
                .chat-message { display: flex; gap: 10px; animation: fadeIn 0.3s ease-in; }
                .chat-message.user { justify-content: flex-end; }
                .chat-message.bot { justify-content: flex-start; }
                .message-content { max-width: 70%; padding: 12px 16px; border-radius: 12px; word-wrap: break-word; }
                .chat-message.user .message-content { background: #ff6161; color: #fff; }
                .chat-message.bot .message-content { background: #4a4e51; color: #fff; border: 2px solid #4dffa6; }
                .chat-message.bot .avatar { width: 32px; height: 32px; background: #ff6161; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
                .loading { display: flex; gap: 5px; padding: 12px 16px; }
                .loading span { width: 8px; height: 8px; background: #4dffa6; border-radius: 50%; animation: bounce 1.4s infinite; }
                .loading span:nth-child(2) { animation-delay: 0.2s; }
                .loading span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .chat-input-area { background: #383c3f; padding: 12px 15px; border-top: 2px solid #4dffa6; display: flex; gap: 10px; }
                .input-wrapper { flex: 1; display: flex; align-items: flex-end; gap: 10px; }
                .chat-input-area textarea { flex: 1; background: #52565b; border: 2px solid #666; color: #e8eaed; border-radius: 8px; padding: 10px 12px; font-family: Arial; font-size: 14px; resize: none; max-height: 100px; }
                .chat-input-area textarea:focus { outline: none; border-color: #4dffa6; }
                .send-btn { background: #4dffa6; border: none; color: #1e1e1e; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
                .send-btn:hover { background: #5ce891; }
                .hf-key { background: #2b2d2f; border: 1px solid #4dffa6; color: #fff; padding:6px 8px; border-radius:6px; margin-left:8px; width:320px }
                .hf-actions button { margin-left:6px; padding:6px 8px; border-radius:6px; border:none; cursor:pointer }
                .hf-actions .save { background:#4dffa6 }
                .hf-actions .clear { background:#ff6161 }
                #content { background: #202124 !important; }
            </style>
            <div id="chat-container">
                <div class="chat-header">
                    <h1>🤖 T_U_B AI Chat</h1>
                    <div class="hf-actions">
                        <input id="hfKeyInput" class="hf-key" placeholder="Hugging Face API key (optional, paste and Save)" />
                        <button class="save" id="saveHfKey">Save</button>
                        <button class="clear" id="clearHfKey">Clear</button>
                    </div>
                </div>
                <div class="chatbox" id="chatbox">
                    <div class="chat-message bot">
                        <div class="avatar">🤖</div>
                        <div class="message-content">Hi! I'm T_U_B AI. How can I help you today?</div>
                    </div>
                </div>
                <div class="chat-input-area">
                    <div class="input-wrapper">
                        <textarea id="messageInput" placeholder="Type your message..." rows="1"></textarea>
                        <button class="send-btn" onclick="window.sendChatMessage()">📤</button>
                    </div>
                </div>
            </div>
        `;
        content.innerHTML = chatHTML;
        fadeIn();

        const hfInput = document.getElementById('hfKeyInput');
        const saved = localStorage.getItem('hf_api_key');
        if (saved) hfInput.value = saved;
        document.getElementById('saveHfKey').addEventListener('click', function() {
            const val = hfInput.value.trim();
            if (val) {
                localStorage.setItem('hf_api_key', val);
                alert('Hugging Face API key saved locally.');
            }
        });
        document.getElementById('clearHfKey').addEventListener('click', function() {
            localStorage.removeItem('hf_api_key');
            hfInput.value = '';
            alert('Saved Hugging Face API key cleared.');
        });

        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });

        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.sendChatMessage();
            }
        });
    }

    window.sendChatMessage = async function() {
        const messageInput = document.getElementById('messageInput');
        const chatbox = document.getElementById('chatbox');
        const text = messageInput.value.trim();
        if (!text) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerHTML = `<div class="message-content">${text}</div>`;
        chatbox.appendChild(userMsg);

        messageInput.value = '';
        messageInput.style.height = 'auto';
        chatbox.scrollTop = chatbox.scrollHeight;

        // Add loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'chat-message bot';
        loadingMsg.innerHTML = `<div class="avatar">🤖</div><div class="loading"><span></span><span></span><span></span></div>`;
        chatbox.appendChild(loadingMsg);
        chatbox.scrollTop = chatbox.scrollHeight;

        // Try Hugging Face Inference if user provided an API key (free tier available)
        const hfKey = localStorage.getItem('hf_api_key');
        if (hfKey) {
            try {
                const resp = await fetch('https://api-inference.huggingface.co/models/gpt2', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + hfKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inputs: text, options: { wait_for_model: true }, parameters: { max_new_tokens: 150 } })
                });

                if (!resp.ok) {
                    const errBody = await resp.text();
                    throw new Error('HF API error: ' + errBody);
                }

                const data = await resp.json();
                loadingMsg.remove();

                // HF inference may return array or object depending on model
                let reply = null;
                if (Array.isArray(data) && data[0] && data[0].generated_text) reply = data[0].generated_text;
                else if (data.generated_text) reply = data.generated_text;

                if (reply) {
                    // Trim original prompt if model echoes it
                    if (reply.toLowerCase().startsWith(text.toLowerCase())) {
                        reply = reply.substring(text.length).trim();
                    }
                    const botMsg = document.createElement('div');
                    botMsg.className = 'chat-message bot';
                    botMsg.innerHTML = `<div class="avatar">🤖</div><div class="message-content">${reply}</div>`;
                    chatbox.appendChild(botMsg);
                } else {
                    throw new Error('Unexpected response from HF Inference.');
                }
                chatbox.scrollTop = chatbox.scrollHeight;
                return;
            } catch (err) {
                console.error('Hugging Face error:', err);
                // fall through to fallback
            }
        }

        // Fallback local responses (deterministic + keyword-based)
        loadingMsg.remove();
        const lowerText = text.toLowerCase();
        const canned = {
            'hello': "Hi there! How can I help you today?",
            'hi': "Hello! What would you like to chat about?",
            'how are you': "I'm doing great — ready to help!",
            'what is your name': "I'm T_U_B AI, your friendly assistant.",
            'help': "I can answer questions about the site, games, and movies. Ask away!",
            'thanks': "You're welcome!"
        };

        let reply = canned[lowerText];
        if (!reply) {
            if (lowerText.includes('game')) reply = 'We have lots of retro games — try the Games page.';
            else if (lowerText.includes('movie') || lowerText.includes('tv')) reply = 'Try the Movies/TV search to find titles.';
            else if (lowerText.includes('proxy')) reply = 'The proxy was removed, but I can help with site navigation.';
            else if (lowerText.includes('?')) reply = "That's an interesting question — can you give more details?";
            else reply = "Tell me more — I'm listening.";
        }

        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
        botMsg.innerHTML = `<div class="avatar">🤖</div><div class="message-content">${reply}</div>`;
        chatbox.appendChild(botMsg);
        chatbox.scrollTop = chatbox.scrollHeight;
    };

    navHome.classList.add('active');
    loadHome();
}); // Closing brace added here
