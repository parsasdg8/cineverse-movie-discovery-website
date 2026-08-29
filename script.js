/* =========================================================
   NEONFLIX — APP
========================================================= */

const API = "http://moviesapi.ir/api/v1/movies?page=";
const TOTAL_PAGES = 25;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

/*
   moviesapi.ir does not send an Access-Control-Allow-Origin header,
   so a direct browser fetch() is blocked by CORS.

   We try the direct request first, then use a public CORS proxy.
*/
const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => url,
];

let allMovies = [];
let currentPage = 1;

let bestMovies = [];
let carouselIndex = 0;
let carouselCardsPerView = 5;


/* =========================
   DOM
========================= */

const loader = document.getElementById("loader");
const loadingText = document.getElementById("loadingText");
const loadingProgress = document.getElementById("loadingProgress");

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchWrapper = document.getElementById("searchWrapper");

const mobileSearchButton = document.getElementById("mobileSearchButton");
const mobileSearchClose = document.getElementById("mobileSearchClose");

const bestCarousel = document.getElementById("bestCarousel");
const recommendedMovie = document.getElementById("recommendedMovie");

const allMoviesContainer = document.getElementById("allMovies");
const movieCount = document.getElementById("movieCount");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumbers = document.getElementById("pageNumbers");

const bestPrevBtn = document.getElementById("bestPrev");
const bestNextBtn = document.getElementById("bestNext");

const modal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");


/* =========================
   HELPERS
========================= */

function imageURL(url) {
    if (!url) return "";

    // API serves images over HTTP.
    // Upgrade to HTTPS when the website itself uses HTTPS.
    if (location.protocol === "https:" && url.startsWith("http:")) {
        return url.replace("http:", "https:");
    }

    return url;
}


function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function getRating(movie) {
    const rating = parseFloat(movie?.imdb_rating);
    return Number.isFinite(rating) ? rating : 0;
}


function debounce(fn, wait) {
    let timeout;

    return (...args) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            fn(...args);
        }, wait);
    };
}


/* =========================
   API
========================= */

async function fetchPage(page) {

    const cacheKey = `neonflix-page-${page}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {

        try {

            const parsed = JSON.parse(cached);

            if (parsed.expires && parsed.expires > Date.now()) {
                return parsed.data;
            }

            localStorage.removeItem(cacheKey);

        } catch {

            localStorage.removeItem(cacheKey);

        }
    }

    const targetUrl = `${API}${page}`;

    let json = null;
    let lastError = null;

    for (const buildUrl of CORS_PROXIES) {

        try {

            const controller = new AbortController();

            const timeout = setTimeout(() => {
                controller.abort();
            }, 8000);

            const response = await fetch(
                buildUrl(targetUrl),
                {
                    signal: controller.signal
                }
            );

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            json = await response.json();

            break;

        } catch (error) {

            lastError = error;

        }
    }

    if (!json) {
        throw lastError || new Error("Failed to fetch movies.");
    }

    try {

        localStorage.setItem(
            cacheKey,
            JSON.stringify({
                data: json,
                expires: Date.now() + CACHE_TTL_MS
            })
        );

    } catch {
        // localStorage unavailable/full.
    }

    return json;
}


async function loadMovies() {

    let completed = 0;

    const requests = [];

    for (let page = 1; page <= TOTAL_PAGES; page++) {

        requests.push(

            fetchPage(page)

                .then((data) => {

                    completed += 1;

                    const progress = Math.round(
                        (completed / TOTAL_PAGES) * 100
                    );

                    loadingProgress.style.width = `${progress}%`;

                    loadingText.textContent =
                        `Loading movies… ${progress}%`;

                    return Array.isArray(data?.data)
                        ? data.data
                        : [];

                })

                .catch((error) => {

                    completed += 1;

                    console.error(
                        `Page ${page} failed:`,
                        error
                    );

                    return [];

                })

        );
    }

    const pages = await Promise.all(requests);

    const merged = pages.flat();

    // Remove duplicates by ID.
    const unique = new Map();

    merged.forEach((movie) => {

        if (
            movie &&
            movie.id != null &&
            !unique.has(movie.id)
        ) {
            unique.set(movie.id, movie);
        }

    });

    allMovies = [...unique.values()];

    if (!allMovies.length) {
        showLoadError();
        return;
    }

    movieCount.textContent =
        `${allMovies.length} movies`;

    // Best movies from ALL pages.
    bestMovies = [...allMovies]
        .sort(
            (a, b) =>
                getRating(b) - getRating(a)
        )
        .slice(0, 20);

    renderHero();
    renderBestMovies();
    renderRecommendation();
    renderPage(1);

    setTimeout(() => {
        loader.classList.add("hidden");
    }, 400);
}


function showLoadError() {

    loadingText.textContent =
        "Couldn't load movies. Please check your connection and refresh.";

    loadingProgress.style.width = "0%";
}


/* =========================
   CARD
========================= */

function movieCard(movie) {

    const poster = imageURL(movie.poster);

    return `
        <article
            class="movie-card glow-card"
            data-movie-id="${movie.id}"
            tabindex="0"
            role="button"
            aria-label="${escapeHTML(movie.title)}"
        >

            <div class="movie-poster">

                ${
                    poster

                        ? `
                            <img
                                src="${poster}"
                                alt="${escapeHTML(movie.title)}"
                                loading="lazy"
                                referrerpolicy="no-referrer"
                                onerror="
                                    this.onerror=null;
                                    this.closest('.movie-poster').innerHTML='<div class=&quot;no-poster&quot;>No Image</div>'
                                "
                            >
                        `

                        : `
                            <div class="no-poster">
                                No Image
                            </div>
                        `
                }

            </div>

            <div class="movie-info">

                <div class="movie-title">
                    ${escapeHTML(movie.title)}
                </div>

                <div class="movie-meta">

                    <span>
                        ${escapeHTML(movie.year || "—")}
                    </span>

                    <span class="movie-rating">
                        ★ ${getRating(movie).toFixed(1)}
                    </span>

                </div>

            </div>

        </article>
    `;
}


/* =========================
   HERO
========================= */

function renderHero() {

    const movie = bestMovies[0];

    if (!movie) return;

    const poster = imageURL(movie.poster);

    const heroImg = new Image();

    heroImg.referrerPolicy = "no-referrer";

    heroImg.src = poster;
}


/* =========================
   BEST MOVIES CAROUSEL
========================= */

function getCardsPerView() {

    const width = window.innerWidth;

    if (width >= 1400) return 5;

    if (width >= 1024) return 4;

    if (width >= 768) return 3;

    return 2;
}


function renderBestMovies() {

    bestCarousel.innerHTML =
        bestMovies.map(movieCard).join("");

    attachCardEvents(bestCarousel);

    carouselIndex = 0;

    layoutCarousel();
}


function layoutCarousel() {

    const cards =
        bestCarousel.querySelectorAll(".movie-card");

    if (!cards.length) return;

    carouselCardsPerView =
        getCardsPerView();

    const viewport =
        bestCarousel.parentElement;

    const viewportWidth =
        viewport.clientWidth;

    const gap =
        parseFloat(
            getComputedStyle(bestCarousel).gap
        ) || 18;

    const cardWidth =
        (
            viewportWidth -
            gap * (carouselCardsPerView - 1)
        ) / carouselCardsPerView;

    cards.forEach((card) => {

        card.style.width =
            `${cardWidth}px`;

    });

    const maxIndex =
        Math.max(
            0,
            cards.length -
            carouselCardsPerView
        );

    carouselIndex =
        Math.min(
            carouselIndex,
            maxIndex
        );

    const offset =
        carouselIndex *
        (cardWidth + gap);

    bestCarousel.style.transform =
        `translateX(-${offset}px)`;

    bestPrevBtn.disabled =
        carouselIndex <= 0;

    bestNextBtn.disabled =
        carouselIndex >= maxIndex;
}


/*
   Desktop / Button carousel
*/

function moveCarousel(direction) {

    const cards =
        bestCarousel.querySelectorAll(".movie-card");

    if (!cards.length) return;

    const maxIndex =
        Math.max(
            0,
            cards.length -
            carouselCardsPerView
        );

    carouselIndex =
        Math.max(
            0,
            Math.min(
                carouselIndex +
                direction *
                carouselCardsPerView,
                maxIndex
            )
        );

    layoutCarousel();
}


/* =========================
   CAROUSEL BUTTONS
========================= */

bestNextBtn.addEventListener(
    "click",
    () => moveCarousel(1)
);

bestPrevBtn.addEventListener(
    "click",
    () => moveCarousel(-1)
);


/* =========================
   MOBILE CAROUSEL SWIPE
========================= */

let carouselTouchStartX = 0;
let carouselTouchStartY = 0;

let carouselTouchCurrentX = 0;

let carouselIsDragging = false;


/*
   Start touch
*/

bestCarousel.addEventListener(
    "touchstart",
    (event) => {

        if (!event.touches.length) return;

        carouselTouchStartX =
            event.touches[0].clientX;

        carouselTouchStartY =
            event.touches[0].clientY;

        carouselTouchCurrentX =
            carouselTouchStartX;

        carouselIsDragging = true;

        bestCarousel.style.transition =
            "none";

    },
    {
        passive: true
    }
);


/*
   Track finger
*/

bestCarousel.addEventListener(
    "touchmove",
    (event) => {

        if (!carouselIsDragging) return;

        if (!event.touches.length) return;

        carouselTouchCurrentX =
            event.touches[0].clientX;

        const currentY =
            event.touches[0].clientY;

        const deltaX =
            carouselTouchCurrentX -
            carouselTouchStartX;

        const deltaY =
            currentY -
            carouselTouchStartY;

        /*
           If the movement is mostly vertical,
           let the page scroll normally.
        */

        if (
            Math.abs(deltaY) >
            Math.abs(deltaX)
        ) {
            carouselIsDragging = false;

            bestCarousel.style.transition =
                "";

            return;
        }

    },
    {
        passive: true
    }
);


/*
   Finish touch
*/

bestCarousel.addEventListener(
    "touchend",
    () => {

        if (!carouselIsDragging) return;

        carouselIsDragging = false;

        const deltaX =
            carouselTouchCurrentX -
            carouselTouchStartX;

        const swipeThreshold = 50;

        /*
           Restore normal transition.
        */

        bestCarousel.style.transition =
            "";

        /*
           Swipe LEFT
           -> next cards
        */

        if (deltaX < -swipeThreshold) {

            moveCarousel(1);

            return;
        }

        /*
           Swipe RIGHT
           -> previous cards
        */

        if (deltaX > swipeThreshold) {

            moveCarousel(-1);

            return;
        }

        /*
           Small movement:
           return to normal position.
        */

        layoutCarousel();

    },
    {
        passive: true
    }
);


/*
   If touch is cancelled.
*/

bestCarousel.addEventListener(
    "touchcancel",
    () => {

        carouselIsDragging = false;

        bestCarousel.style.transition =
            "";

        layoutCarousel();

    },
    {
        passive: true
    }
);


/*
   Resize
*/

window.addEventListener(
    "resize",
    debounce(
        layoutCarousel,
        150
    )
);


/* =========================
   DAILY RECOMMENDATION
========================= */

function getDailyMovie() {

    if (!allMovies.length) return null;

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    const stored =
        localStorage.getItem(
            "neonflix-daily-movie"
        );

    if (stored) {

        try {

            const data =
                JSON.parse(stored);

            if (data.date === today) {

                const found =
                    allMovies.find(
                        (movie) =>
                            movie.id === data.id
                    );

                if (found) return found;
            }

        } catch {
            // Select another movie.
        }
    }

    // Deterministic random movie.
    let hash = 0;

    for (const char of today) {

        hash =
            (
                hash * 31 +
                char.charCodeAt(0)
            ) >>> 0;
    }

    const index =
        hash % allMovies.length;

    const movie =
        allMovies[index];

    localStorage.setItem(
        "neonflix-daily-movie",
        JSON.stringify({
            date: today,
            id: movie.id
        })
    );

    return movie;
}


function renderRecommendation() {

    const movie =
        getDailyMovie();

    if (!movie) return;

    recommendedMovie.innerHTML =
        movieCard(movie);

    attachCardEvents(
        recommendedMovie
    );

    const recommendationButton =
        document.getElementById(
            "recommendationButton"
        );

    if (recommendationButton) {

        recommendationButton.onclick =
            () => openModal(movie);

    }
}


/* =========================
   PAGINATION
========================= */

const PAGE_SIZE = 10;


function renderPage(page) {

    currentPage = page;

    const start =
        (page - 1) *
        PAGE_SIZE;

    const movies =
        allMovies.slice(
            start,
            start + PAGE_SIZE
        );

    allMoviesContainer.innerHTML =
        movies.length

            ? movies
                .map(movieCard)
                .join("")

            : `
                <div class="empty-state">

                    <strong>
                        No movies here
                    </strong>

                    Try a different page
                    or search instead.

                </div>
            `;

    attachCardEvents(
        allMoviesContainer
    );

    renderPagination();
}


function renderPagination() {

    pageNumbers.innerHTML = "";

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                allMovies.length /
                PAGE_SIZE
            )
        );

    const start =
        Math.max(
            1,
            currentPage - 2
        );

    const end =
        Math.min(
            totalPages,
            currentPage + 2
        );

    for (
        let page = start;
        page <= end;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "page-number";

        button.type =
            "button";

        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

            button.setAttribute(
                "aria-current",
                "page"
            );
        }

        button.textContent =
            page;

        button.onclick = () => {

            renderPage(page);

            document
                .getElementById(
                    "allMoviesSection"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        };

        pageNumbers.appendChild(
            button
        );
    }

    prevPageBtn.disabled =
        currentPage === 1;

    nextPageBtn.disabled =
        currentPage === totalPages;
}


prevPageBtn.onclick = () => {

    if (currentPage > 1) {

        renderPage(
            currentPage - 1
        );

    }
};


nextPageBtn.onclick = () => {

    const totalPages =
        Math.ceil(
            allMovies.length /
            PAGE_SIZE
        );

    if (
        currentPage <
        totalPages
    ) {

        renderPage(
            currentPage + 1
        );

    }
};


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    handleSearch
);


function handleSearch() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!query) {

        searchResults.classList.remove(
            "active"
        );

        searchResults.innerHTML = "";

        searchInput.setAttribute(
            "aria-expanded",
            "false"
        );

        return;
    }

    const results =
        allMovies
            .filter(
                (movie) =>
                    movie.title
                        ?.toLowerCase()
                        .includes(query)
            )
            .slice(0, 8);

    if (!results.length) {

        searchResults.innerHTML =
            `
                <div class="search-empty">
                    No movies found
                </div>
            `;

        searchResults.classList.add(
            "active"
        );

        searchInput.setAttribute(
            "aria-expanded",
            "true"
        );

        return;
    }

    searchResults.innerHTML =
        results
            .map(
                (movie) => `
                    <div
                        class="search-result"
                        data-movie-id="${movie.id}"
                        role="option"
                        tabindex="0"
                    >

                        <img
                            src="${imageURL(movie.poster)}"
                            alt=""
                            loading="lazy"
                            onerror="this.style.visibility='hidden'"
                        >

                        <div class="search-result-info">

                            <div class="search-result-title">
                                ${escapeHTML(movie.title)}
                            </div>

                            <div class="search-result-rating">
                                ★ ${getRating(movie).toFixed(1)}
                            </div>

                        </div>

                    </div>
                `
            )
            .join("");

    searchResults.classList.add(
        "active"
    );

    searchInput.setAttribute(
        "aria-expanded",
        "true"
    );


    searchResults
        .querySelectorAll(
            ".search-result"
        )
        .forEach((element) => {

            const openResult = () => {

                const id =
                    Number(
                        element.dataset.movieId
                    );

                const movie =
                    allMovies.find(
                        (item) =>
                            item.id === id
                    );

                if (movie) {
                    openModal(movie);
                }

                closeMobileSearch();

                searchInput.value = "";

                searchResults.classList.remove(
                    "active"
                );

            };


            element.onclick =
                openResult;


            element.onkeydown =
                (event) => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        openResult();

                    }

                };

        });
}


/* =========================
   CLOSE SEARCH OUTSIDE
========================= */

/*
   Important:

   pointerdown works for both:
   - mouse click
   - mobile touch

   If the user touches/clicks outside
   the search wrapper, the search closes.
*/

document.addEventListener(
    "pointerdown",
    (event) => {

        if (
            !searchWrapper.contains(
                event.target
            )
        ) {

            searchResults.classList.remove(
                "active"
            );

            searchInput.setAttribute(
                "aria-expanded",
                "false"
            );

            /*
               If mobile search is open,
               close the entire mobile search.
            */

            if (
                searchWrapper.classList.contains(
                    "mobile-open"
                )
            ) {

                closeMobileSearch();

            }

        }

    }
);


/* =========================
   MOBILE SEARCH
========================= */

mobileSearchButton.onclick = () => {

    searchWrapper.classList.add(
        "mobile-open"
    );

    mobileSearchButton.style.display =
        "none";

    setTimeout(() => {

        searchInput.focus();

    }, 100);

};


mobileSearchClose.onclick =
    closeMobileSearch;


function closeMobileSearch() {

    searchWrapper.classList.remove(
        "mobile-open"
    );

    mobileSearchButton.style.display =
        "";

    searchInput.value = "";

    searchResults.classList.remove(
        "active"
    );

    searchInput.setAttribute(
        "aria-expanded",
        "false"
    );
}


/* =========================
   MODAL
========================= */

function openModal(movie) {

    const genres =
        Array.isArray(movie.genres)
            ? movie.genres
            : [];

    const images =
        Array.isArray(movie.images)
            ? movie.images.filter(Boolean)
            : [];


    modalBody.innerHTML = `

        <div class="modal-hero">

            ${
                movie.poster

                    ? `
                        <img
                            class="modal-poster"
                            src="${imageURL(movie.poster)}"
                            alt="${escapeHTML(movie.title)}"
                            referrerpolicy="no-referrer"
                            onerror="this.remove()"
                        >
                    `

                    : ""
            }


            <div class="modal-info">

                <span class="section-kicker">
                    Movie Details
                </span>

                <h2 id="modalTitleSlot">
                    ${escapeHTML(movie.title)}
                </h2>


                <div class="modal-meta">

                    <span>
                        ★
                        <strong>
                            ${getRating(movie).toFixed(1)}
                        </strong>
                    </span>

                    <span>
                        ${escapeHTML(
                            movie.year ||
                            "Unknown"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            movie.country ||
                            "Unknown"
                        )}
                    </span>

                </div>


                ${
                    genres.length

                        ? `
                            <div class="genre-list">

                                ${genres
                                    .map(
                                        (genre) =>
                                            `
                                                <span class="genre">
                                                    ${escapeHTML(genre)}
                                                </span>
                                            `
                                    )
                                    .join("")}

                            </div>
                        `

                        : ""
                }


                <p class="modal-description">

                    ${escapeHTML(
                        movie.description ||
                        movie.plot ||
                        "No additional description available for this movie."
                    )}

                </p>

            </div>

        </div>


        ${
            images.length

                ? `
                    <div class="screenshots">

                        ${images
                            .map(
                                (image) =>
                                    `
                                        <img
                                            src="${imageURL(image)}"
                                            alt="${escapeHTML(movie.title)} screenshot"
                                            loading="lazy"
                                            class="screenshot-image"
                                            onerror="this.remove()"
                                        >
                                    `
                            )
                            .join("")}

                    </div>
                `

                : ""
        }

    `;


    modal.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

    modalClose.focus();


    modal
        .querySelectorAll(
            ".screenshot-image"
        )
        .forEach((img) => {

            img.onclick = () => {

                openFullscreenImage(
                    img.src
                );

            };

        });
}


/* =========================
   FULLSCREEN IMAGE
========================= */

function openFullscreenImage(src) {

    const viewer =
        document.createElement(
            "div"
        );

    viewer.className =
        "fullscreen-viewer";


    const image =
        document.createElement(
            "img"
        );

    image.src =
        src;

    image.alt =
        "";


    viewer.appendChild(
        image
    );


    viewer.onclick = () => {
        viewer.remove();
    };


    document.body.appendChild(
        viewer
    );


    requestAnimationFrame(() => {

        viewer.classList.add(
            "active"
        );

    });


    const escHandler =
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                viewer.remove();

                document.removeEventListener(
                    "keydown",
                    escHandler
                );

            }

        };


    document.addEventListener(
        "keydown",
        escHandler
    );
}


/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

    modal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";
}


modalClose.onclick =
    closeModal;


const modalBackdrop =
    document.querySelector(
        ".modal-backdrop"
    );

if (modalBackdrop) {

    modalBackdrop.onclick =
        closeModal;

}


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            modal.classList.contains(
                "active"
            )
        ) {

            closeModal();

        }

    }
);


/* =========================
   CARD EVENTS
========================= */

function attachCardEvents(
    container
) {

    container
        .querySelectorAll(
            ".movie-card"
        )
        .forEach((card) => {

            const openCard = () => {

                const id =
                    Number(
                        card.dataset.movieId
                    );

                const movie =
                    allMovies.find(
                        (item) =>
                            item.id === id
                    );

                if (movie) {
                    openModal(movie);
                }

            };


            card.onclick =
                openCard;


            card.onkeydown =
                (event) => {

                    if (
                        event.key ===
                            "Enter" ||
                        event.key ===
                            " "
                    ) {

                        event.preventDefault();

                        openCard();

                    }

                };

        });
}


/* =========================
   MOUSE FOLLOWING GLOW
========================= */

document.addEventListener(
    "pointermove",
    (event) => {

        const card =
            event.target.closest(
                ".glow-card"
            );

        if (!card) return;

        const rect =
            card.getBoundingClientRect();


        card.style.setProperty(
            "--card-x",
            `${event.clientX - rect.left}px`
        );


        card.style.setProperty(
            "--card-y",
            `${event.clientY - rect.top}px`
        );

    }
);


/* =========================
   AMBIENT PAGE GLOW
========================= */

document.addEventListener(
    "pointermove",
    (event) => {

        document.documentElement.style.setProperty(
            "--mx",
            `${event.clientX}px`
        );

        document.documentElement.style.setProperty(
            "--my",
            `${event.clientY}px`
        );

    }
);


/* =========================
   BROWSE BUTTON
========================= */

const browseButton =
    document.getElementById(
        "browseButton"
    );


if (browseButton) {

    browseButton.onclick = () => {

        document
            .getElementById(
                "allMoviesSection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

    };

}


/* =========================
   START
========================= */

loadMovies().catch(
    (error) => {

        console.error(
            error
        );

        showLoadError();

    }
);