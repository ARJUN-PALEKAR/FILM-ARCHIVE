const apiKey = '4e01bc1be90197f061eca835f0aad603';
const searchButton = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const resultsContainer = document.getElementById('results');
const recommendationContainer = document.getElementById('recommendation-container');
const trailerModal = document.getElementById('trailer-modal');
const trailerModalContent = document.getElementById('trailer-modal-content');
const closeTrailerButton = document.getElementById('close-trailer');

closeTrailerButton.addEventListener('click', () => {
    trailerModal.style.display = 'none';
    trailerModalContent.innerHTML = '';
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    } else {
        alert('Please enter a movie name');
    }
});

getRecommendedMovies();

function searchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayMovies(data.results, resultsContainer))
        .catch(error => {
            console.error('Error fetching data from TMDB API:', error);
        });
}

function displayMovies(movies, container) {
    container.innerHTML = '';

    if (movies.length === 0) {
        container.innerHTML = '<p>No movies found. Try another search.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');

        const posterPath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : 'placeholder.jpg';

        movieElement.innerHTML = `
            <img src="${posterPath}" alt="${movie.title} poster" class="movie-poster" data-movie-id="${movie.id}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date || 'N/A'}</p>
        `;

        container.appendChild(movieElement);

        
        movieElement.querySelector('.movie-poster').addEventListener('click', () => {
            fetchTrailer(movie.id);
            fetchMovieDetails(movie.id);  
        });
    });
}

function fetchTrailer(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
            if (trailer) {
                playTrailer(trailer.key);
            } else {
                alert('No trailer available for this movie.');
            }
        })
        .catch(error => {
            console.error('Error fetching trailer:', error);
        });
}

function playTrailer(trailerKey) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${trailerKey}`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    trailerModalContent.innerHTML = '';
    trailerModalContent.appendChild(iframe);
    trailerModal.style.display = 'block';
}

function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos,external_ids`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayMovieDetails(data);
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
        });
}

function displayMovieDetails(movie) {
    const overview = document.createElement('p');
    overview.id = 'movie-overview';
    overview.textContent = `Overview: ${movie.overview || 'No overview available.'}`;
    
    const rating = document.createElement('p');
    rating.id = 'rating';
    rating.textContent = `IMDb Rating: ${movie.vote_average || 'N/A'}`;
    
    const platforms = document.createElement('div');
    platforms.id = 'available-on';
    platforms.innerHTML = `
        Available on: 
        <a href="https://www.imdb.com/title/${movie.external_ids.imdb_id}" target="_blank">IMDb</a>
        ${movie.homepage ? ` | <a href="${movie.homepage}" target="_blank">Official Site</a>` : ''}
    `;
    
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('movie-details');
    detailsContainer.appendChild(overview);
    detailsContainer.appendChild(rating);
    detailsContainer.appendChild(platforms);
    
    trailerModalContent.appendChild(detailsContainer);
}


function getRecommendedMovies() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => displayMovies(data.results, recommendationContainer))  
        .catch(error => {
            console.error('Error fetching recommended movies:', error);
        });
}
