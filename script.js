const API = "/api/movies?page=";
const TOTAL_PAGES = 25;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

let allMovies = [];
let currentPage = 1;

let bestMovies = [];
let carouselIndex = 0;
let carouselCardsPerView = 5;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loader = document.getElementById("loader");

const loadingText =
    document.getElementById("loadingText");

const loadingProgress =
    document.getElementById("loadingProgress");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");

const searchWrapper =
    document.getElementById("searchWrapper");

const mobileSearchButton =
    document.getElementById("mobileSearchButton");

const mobileSearchClose =
    document.getElementById("mobileSearchClose");

const bestCarousel =
    document.getElementById("bestCarousel");

const recommendedMovie =
    document.getElementById("recommendedMovie");

const allMoviesContainer =
    document.getElementById("allMovies");

const movieCount =
    document.getElementById("movieCount");

const prevPageBtn =
    document.getElementById("prevPage");

const nextPageBtn =
    document.getElementById("nextPage");

const pageNumbers =
    document.getElementById("pageNumbers");

const bestPrevBtn =
    document.getElementById("bestPrev");

const bestNextBtn =
    document.getElementById("bestNext");

const modal =
    document.getElementById("movieModal");

const modalBody =
    document.getElementById("modalBody");

const modalClose =
    document.getElementById("modalClose");


/* =========================================================
   INITIAL LOADING STATE
========================================================= */

document.body.classList.add("loading");


/* =========================================================
   HELPERS
========================================================= */

function imageURL(url) {
    if (!url) {
        return "";
    }

    if (
        location.protocol === "https:" &&
        url.startsWith("http:")
    ) {
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

    return Number.isFinite(rating)
        ? rating
        : 0;
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


/* =========================================================
   LOADER CONTROL
========================================================= */

function hideLoader() {
    if (!loader) {
        document.body.classList.remove("loading");
        return;
    }

    loader.classList.add("hidden");

    setTimeout(() => {
        document.body.classList.remove("loading");
    }, 550);
}


/* =========================================================
   API
========================================================= */

async function fetchPage(page) {
    const cacheKey = `neonflix-page-${page}`;

    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            const parsed = JSON.parse(cached);

            if (
                parsed.expires &&
                parsed.expires > Date.now()
            ) {
                return parsed.data;
            }

            localStorage.removeItem(cacheKey);
        } catch {
            localStorage.removeItem(cacheKey);
        }
    }


    const targetUrl = `${API}${page}`;

    try {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 10000);


        const response = await fetch(
            targetUrl,
            {
                signal: controller.signal,
                headers: {
                    Accept: "application/json"
                }
            }
        );


        clearTimeout(timeout);


        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status}`
            );
        }


        const json = await response.json();


        try {
            localStorage.setItem(
                cacheKey,
                JSON.stringify({
                    data: json,
                    expires:
                        Date.now() +
                        CACHE_TTL_MS
                })
            );
        } catch {
            // Ignore localStorage errors.
        }


        return json;

    } catch (error) {
        throw error;
    }
}


/* =========================================================
   LOAD ALL MOVIES
========================================================= */

async function loadMovies() {
    let completed = 0;

    const requests = [];


    for (
        let page = 1;
        page <= TOTAL_PAGES;
        page++
    ) {
        requests.push(
            fetchPage(page)
                .then((data) => {
                    completed++;

                    const progress =
                        Math.round(
                            (
                                completed /
                                TOTAL_PAGES
                            ) * 100
                        );


                    if (loadingProgress) {
                        loadingProgress.style.width =
                            `${progress}%`;
                    }


                    if (loadingText) {
                        loadingText.textContent =
                            `Loading movies… ${progress}%`;
                    }


                    return Array.isArray(data?.data)
                        ? data.data
                        : [];
                })


                .catch((error) => {
                    completed++;

                    const progress =
                        Math.round(
                            (
                                completed /
                                TOTAL_PAGES
                            ) * 100
                        );


                    if (loadingProgress) {
                        loadingProgress.style.width =
                            `${progress}%`;
                    }


                    if (loadingText) {
                        loadingText.textContent =
                            `Loading movies… ${progress}%`;
                    }


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


    /*
       Remove duplicate movies.
    */

    const unique = new Map();


    merged.forEach((movie) => {
        if (
            movie &&
            movie.id != null &&
            !unique.has(movie.id)
        ) {
            unique.set(
                movie.id,
                movie
            );
        }
    });


    allMovies = [...unique.values()];


    if (!allMovies.length) {
        showLoadError();
        return false;
    }


    if (movieCount) {
        movieCount.textContent =
            `${allMovies.length} movies`;
    }


    /*
       Best movies from all pages.
    */

    bestMovies =
        [...allMovies]
            .sort(
                (a, b) =>
                    getRating(b) -
                    getRating(a)
            )
            .slice(0, 20);


    renderHero();
    renderBestMovies();
    renderRecommendation();
    renderPage(1);


    return true;
}


/* =========================================================
   LOAD ERROR
========================================================= */

function showLoadError() {
    if (loadingText) {
        loadingText.textContent =
            "Couldn't load movies. Please check your connection and refresh.";
    }


    if (loadingProgress) {
        loadingProgress.style.width = "0%";
    }
}


/* =========================================================
   MOVIE CARD
========================================================= */

function movieCard(movie) {
    if (!movie) {
        return "";
    }


    const poster =
        imageURL(movie.poster);


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


/* =========================================================
   HERO
========================================================= */

function renderHero() {
    const movie = bestMovies[0];

    if (!movie) {
        return;
    }


    const poster =
        imageURL(movie.poster);


    if (!poster) {
        return;
    }


    const heroImg = new Image();

    heroImg.referrerPolicy =
        "no-referrer";

    heroImg.src = poster;
}


/* =========================================================
   CAROUSEL
========================================================= */

function getCardsPerView() {
    const width = window.innerWidth;

    if (width >= 1400) {
        return 5;
    }

    if (width >= 1024) {
        return 4;
    }

    if (width >= 768) {
        return 3;
    }

    return 2;
}


function renderBestMovies() {
    if (!bestCarousel) {
        return;
    }


    bestCarousel.innerHTML =
        bestMovies
            .map(movieCard)
            .join("");


    attachCardEvents(bestCarousel);


    carouselIndex = 0;

    layoutCarousel();
}


function layoutCarousel() {
    if (!bestCarousel) {
        return;
    }


    const cards =
        bestCarousel.querySelectorAll(
            ".movie-card"
        );


    if (!cards.length) {
        return;
    }


    carouselCardsPerView =
        getCardsPerView();


    const viewport =
        bestCarousel.parentElement;


    if (!viewport) {
        return;
    }


    const viewportWidth =
        viewport.clientWidth;


    const gap =
        parseFloat(
            getComputedStyle(
                bestCarousel
            ).gap
        ) || 18;


    const cardWidth =
        (
            viewportWidth -
            gap *
            (
                carouselCardsPerView - 1
            )
        ) /
        carouselCardsPerView;


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
        (
            cardWidth +
            gap
        );


    bestCarousel.style.transform =
        `translate3d(-${offset}px, 0, 0)`;


    if (bestPrevBtn) {
        bestPrevBtn.disabled =
            carouselIndex <= 0;
    }


    if (bestNextBtn) {
        bestNextBtn.disabled =
            carouselIndex >= maxIndex;
    }
}


function moveCarousel(direction) {
    if (!bestCarousel) {
        return;
    }


    const cards =
        bestCarousel.querySelectorAll(
            ".movie-card"
        );


    if (!cards.length) {
        return;
    }


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


/* =========================================================
   CAROUSEL BUTTONS
========================================================= */

if (bestNextBtn) {
    bestNextBtn.addEventListener(
        "click",
        () => moveCarousel(1)
    );
}


if (bestPrevBtn) {
    bestPrevBtn.addEventListener(
        "click",
        () => moveCarousel(-1)
    );
}


/* =========================================================
   MOBILE CAROUSEL SWIPE
========================================================= */

let carouselTouchStartX = 0;
let carouselTouchStartY = 0;
let carouselTouchCurrentX = 0;
let carouselIsDragging = false;


if (bestCarousel) {
    bestCarousel.addEventListener(
        "touchstart",
        (event) => {
            if (!event.touches.length) {
                return;
            }


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


    bestCarousel.addEventListener(
        "touchmove",
        (event) => {
            if (!carouselIsDragging) {
                return;
            }


            if (!event.touches.length) {
                return;
            }


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
               اگر حرکت عمودی باشد،
               اجازه می‌دهیم صفحه عادی Scroll شود.
            */

            if (
                Math.abs(deltaY) >
                Math.abs(deltaX)
            ) {
                carouselIsDragging = false;

                bestCarousel.style.transition = "";
            }
        },
        {
            passive: true
        }
    );


    bestCarousel.addEventListener(
        "touchend",
        () => {
            if (!carouselIsDragging) {
                return;
            }


            carouselIsDragging = false;


            const deltaX =
                carouselTouchCurrentX -
                carouselTouchStartX;


            const swipeThreshold = 50;


            bestCarousel.style.transition = "";


            if (
                deltaX <
                -swipeThreshold
            ) {
                moveCarousel(1);
                return;
            }


            if (
                deltaX >
                swipeThreshold
            ) {
                moveCarousel(-1);
                return;
            }


            layoutCarousel();
        },
        {
            passive: true
        }
    );


    bestCarousel.addEventListener(
        "touchcancel",
        () => {
            carouselIsDragging = false;

            bestCarousel.style.transition = "";

            layoutCarousel();
        },
        {
            passive: true
        }
    );
}


window.addEventListener(
    "resize",
    debounce(
        layoutCarousel,
        150
    )
);


/* =========================================================
   DAILY RECOMMENDATION
========================================================= */

function getTodayKey() {
    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDailyMovie() {
    if (!allMovies.length) {
        return null;
    }


    const today =
        getTodayKey();


    const storageKey =
        "neonflix-daily-movie";


    const stored =
        localStorage.getItem(
            storageKey
        );


    if (stored) {
        try {
            const data =
                JSON.parse(stored);


            if (
                data.date === today &&
                data.id != null
            ) {
                const found =
                    allMovies.find(
                        (movie) =>
                            String(movie.id) ===
                            String(data.id)
                    );


                if (found) {
                    return found;
                }
            }
        } catch {
            localStorage.removeItem(
                storageKey
            );
        }
    }


    let hash = 0;


    for (const char of today) {
        hash =
            (
                hash * 31 +
                char.charCodeAt(0)
            ) >>> 0;
    }


    const index =
        hash %
        allMovies.length;


    const movie =
        allMovies[index];


    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                date: today,
                id: movie.id
            })
        );
    } catch {
        // Ignore storage errors.
    }


    return movie;
}


/* =========================================================
   DAILY RECOMMENDATION CARD
========================================================= */

function renderRecommendation() {
    const movie =
        getDailyMovie();


    if (
        !movie ||
        !recommendedMovie
    ) {
        return;
    }


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
            (event) => {
                event.preventDefault();
                event.stopPropagation();

                openModal(movie);
            };
    }
}


/* =========================================================
   PAGINATION
========================================================= */

const PAGE_SIZE = 10;


function renderPage(page) {
    currentPage = page;


    const start =
        (
            page - 1
        ) *
        PAGE_SIZE;


    const movies =
        allMovies.slice(
            start,
            start + PAGE_SIZE
        );


    if (!allMoviesContainer) {
        return;
    }


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

                    <br><br>

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
    if (!pageNumbers) {
        return;
    }


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
            page ===
            currentPage
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


        button.onclick =
            () => {
                renderPage(page);


                const section =
                    document.getElementById(
                        "allMoviesSection"
                    );


                if (section) {
                    section.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            };


        pageNumbers.appendChild(
            button
        );
    }


    if (prevPageBtn) {
        prevPageBtn.disabled =
            currentPage === 1;
    }


    if (nextPageBtn) {
        nextPageBtn.disabled =
            currentPage === totalPages;
    }
}


if (prevPageBtn) {
    prevPageBtn.onclick =
        () => {
            if (
                currentPage >
                1
            ) {
                renderPage(
                    currentPage - 1
                );
            }
        };
}


if (nextPageBtn) {
    nextPageBtn.onclick =
        () => {
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
}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {
    searchInput.addEventListener(
        "input",
        handleSearch
    );
}


function handleSearch() {
    if (
        !searchInput ||
        !searchResults
    ) {
        return;
    }


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!query) {
        searchResults.classList.remove(
            "active"
        );


        searchResults.innerHTML =
            "";


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
                            referrerpolicy="no-referrer"
                            onerror="
                                this.style.visibility='hidden'
                            "
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
        .forEach(
            (element) => {
                const openResult =
                    () => {
                        const id =
                            Number(
                                element.dataset.movieId
                            );


                        const movie =
                            allMovies.find(
                                (item) =>
                                    Number(item.id) ===
                                    id
                            );


                        if (movie) {
                            openModal(movie);
                        }


                        closeMobileSearch();


                        searchInput.value =
                            "";


                        searchResults.classList.remove(
                            "active"
                        );


                        searchInput.setAttribute(
                            "aria-expanded",
                            "false"
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
            }
        );
}


/* =========================================================
   SEARCH OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "pointerdown",
    (event) => {
        if (
            !searchWrapper ||
            searchWrapper.contains(
                event.target
            )
        ) {
            return;
        }


        if (searchResults) {
            searchResults.classList.remove(
                "active"
            );
        }


        if (searchInput) {
            searchInput.setAttribute(
                "aria-expanded",
                "false"
            );
        }


        if (
            searchWrapper &&
            searchWrapper.classList.contains(
                "mobile-open"
            )
        ) {
            closeMobileSearch();
        }
    }
);


/* =========================================================
   MOBILE SEARCH
========================================================= */

if (mobileSearchButton) {
    mobileSearchButton.onclick =
        () => {
            if (!searchWrapper) {
                return;
            }


            searchWrapper.classList.add(
                "mobile-open"
            );


            mobileSearchButton.style.display =
                "none";


            setTimeout(
                () => {
                    if (searchInput) {
                        searchInput.focus();
                    }
                },
                100
            );
        };
}


if (mobileSearchClose) {
    mobileSearchClose.onclick =
        closeMobileSearch;
}


function closeMobileSearch() {
    if (!searchWrapper) {
        return;
    }


    searchWrapper.classList.remove(
        "mobile-open"
    );


    if (mobileSearchButton) {
        mobileSearchButton.style.display =
            "";
    }


    if (searchInput) {
        searchInput.value = "";
    }


    if (searchResults) {
        searchResults.classList.remove(
            "active"
        );


        searchResults.innerHTML =
            "";
    }


    if (searchInput) {
        searchInput.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


/* =========================================================
   MODAL
========================================================= */

function openModal(movie) {
    if (
        !movie ||
        !modal ||
        !modalBody
    ) {
        return;
    }


    const genres =
        Array.isArray(movie.genres)
            ? movie.genres.filter(Boolean)
            : [];


    const images =
        Array.isArray(movie.images)
            ? movie.images.filter(
                (image) =>
                    typeof image === "string" &&
                    image.trim() !== ""
            )
            : [];


    const screenshotsHTML =
        images.length
            ? `
                <div class="screenshots">

                    ${images
                        .map(
                            (image) => `
                                <img
                                    src="${imageURL(image)}"
                                    alt="${escapeHTML(movie.title)} screenshot"
                                    loading="lazy"
                                    referrerpolicy="no-referrer"
                                    class="screenshot-image"
                                >
                            `
                        )
                        .join("")}

                </div>
            `
            : "";


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
                                        (genre) => `
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


        ${screenshotsHTML}
    `;


    modal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    if (modalClose) {
        modalClose.focus();
    }


    modal
        .querySelectorAll(
            ".screenshot-image"
        )
        .forEach(
            (img) => {
                img.addEventListener(
                    "click",
                    () => {
                        openFullscreenImage(
                            img.src
                        );
                    }
                );


                img.addEventListener(
                    "error",
                    () => {
                        img.remove();


                        const screenshotContainer =
                            modal.querySelector(
                                ".screenshots"
                            );


                        if (
                            screenshotContainer &&
                            !screenshotContainer.querySelector(
                                ".screenshot-image"
                            )
                        ) {
                            screenshotContainer.remove();
                        }
                    }
                );
            }
        );
}


/* =========================================================
   FULLSCREEN IMAGE
========================================================= */

function openFullscreenImage(src) {
    if (!src) {
        return;
    }


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

    image.referrerPolicy =
        "no-referrer";


    viewer.appendChild(
        image
    );


    document.body.appendChild(
        viewer
    );


    requestAnimationFrame(
        () => {
            viewer.classList.add(
                "active"
            );
        }
    );


    const closeViewer =
        () => {
            viewer.remove();

            document.removeEventListener(
                "keydown",
                escHandler
            );
        };


    viewer.addEventListener(
        "click",
        closeViewer
    );


    const escHandler =
        (event) => {
            if (
                event.key ===
                "Escape"
            ) {
                closeViewer();
            }
        };


    document.addEventListener(
        "keydown",
        escHandler
    );
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {
    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";
}


if (modalClose) {
    modalClose.onclick =
        closeModal;
}


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
            modal &&
            modal.classList.contains(
                "active"
            )
        ) {
            closeModal();
        }
    }
);


/* =========================================================
   CARD EVENTS
========================================================= */

function attachCardEvents(container) {
    if (!container) {
        return;
    }


    container
        .querySelectorAll(
            ".movie-card"
        )
        .forEach(
            (card) => {
                function openCard() {
                    const id =
                        Number(
                            card.dataset.movieId
                        );


                    const movie =
                        allMovies.find(
                            (item) =>
                                Number(item.id) ===
                                id
                        );


                    if (movie) {
                        openModal(movie);
                    }
                }


                card.onclick =
                    openCard;


                card.onkeydown =
                    (event) => {
                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {
                            event.preventDefault();

                            openCard();
                        }
                    };
            }
        );
}


/* =========================================================
   MOUSE FOLLOWING NEON GLOW
========================================================= */

document.addEventListener(
    "pointermove",
    (event) => {
        const card =
            event.target.closest(
                ".glow-card"
            );


        if (!card) {
            return;
        }


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


/* =========================================================
   AMBIENT PAGE GLOW
========================================================= */

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


/* =========================================================
   BROWSE BUTTON
========================================================= */

const browseButton =
    document.getElementById(
        "browseButton"
    );


if (browseButton) {
    browseButton.onclick =
        () => {
            const section =
                document.getElementById(
                    "allMoviesSection"
                );


            if (section) {
                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        };
}


/* =========================================================
   START
========================================================= */

async function startApp() {
    try {
        const success =
            await loadMovies();


        if (success) {
            /*
               همه محتوا Render شده.
               حالا Loader را محو کن.
            */

            hideLoader();

        } else {
            /*
               در صورت خطا هم صفحه قفل نماند.
            */

            setTimeout(
                hideLoader,
                1500
            );
        }

    } catch (error) {
        console.error(
            "CineVerse startup error:",
            error
        );


        showLoadError();


        /*
           حتی در صورت Error هم
           کاربر نباید تا ابد داخل Loader زندانی شود.
        */

        setTimeout(
            hideLoader,
            1500
        );
    }
}


startApp();
