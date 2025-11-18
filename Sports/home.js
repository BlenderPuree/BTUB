const homeContent = `
  <div class="home">
    <h1>Welcome to The Unblocked Blender!</h1>
    <p>Your ultimate destination for games and streaming.</p>
    <p>Explore our collection of games and movies/TV shows, all unblocked and ready for you to enjoy!</p>
  </div>
`;

document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = homeContent;
});