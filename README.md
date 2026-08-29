<div align="center">

# 🎬 CineVerse

### Modern Movie Discovery Website

<p>
  Discover movies, explore top-rated titles, search through the collection,
  and get a daily movie recommendation.
</p>

<br>

<a href="https://cineverse-demo.netlify.app/">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20CineVerse-7C3AED?style=for-the-badge" alt="Live Demo">
</a>

<br><br>

<a href="README-fa.md">
  <img src="https://img.shields.io/badge/🇮🇷%20فارسی-README--fa-18181B?style=for-the-badge" alt="Persian README">
</a>
<a href="README.md">
  <img src="https://img.shields.io/badge/🇬🇧%20English-README-7C3AED?style=for-the-badge" alt="English README">
</a>

</div>

---

## 📖 About

**CineVerse** is a modern movie discovery website built with **HTML, CSS, and Vanilla JavaScript**.

The project is designed to provide a smooth and visually engaging way to discover movies through a modern **glassmorphism, glowing, and responsive interface**.

Instead of simply displaying a list of movies, CineVerse provides several ways to explore the collection, including top-rated movies, a daily recommendation, search functionality, pagination, movie details, and an interactive carousel.

Movie data is provided by **MoviesAPI.ir**.

---

## 🚀 Live Demo

Want to see CineVerse in action?

### 👉 [Open CineVerse Live Demo](https://cineverse-demo.netlify.app/)

---

## ✨ Features

### 🎬 Movie Discovery
- Browse a collection of movies fetched from the API.
- Display movie posters, titles, years, and IMDb ratings.
- Automatically remove duplicate movies.
- Load movies from multiple API pages.

### ⭐ Top-Rated Movies
- Automatically find the highest-rated movies.
- Display the best movies in an interactive carousel.
- Responsive number of cards depending on screen size.
- Desktop navigation buttons.
- Mobile touch/swipe support.

### 🎯 Daily Movie Recommendation
- A movie is selected as the daily recommendation.
- The recommendation remains consistent throughout the day.
- The selected movie is stored using `localStorage`.
- A deterministic selection system is used based on the current date.

### 🔎 Movie Search
- Search movies by title.
- Search results update while typing.
- Displays up to 8 matching results.
- Search results can be opened directly in the movie details modal.
- Mobile-friendly search interface.

### 📄 Pagination
- Movies are displayed in pages.
- 10 movies are displayed per page.
- Previous and next navigation.
- Dynamic page number buttons.
- Smooth scrolling to the movie section after changing pages.

### 🪟 Movie Details Modal
Clicking a movie opens a detailed modal containing:

- Movie title
- IMDb rating
- Release year
- Country
- Genres
- Description / plot
- Movie poster
- Screenshots

Screenshots can also be opened in a fullscreen image viewer.

### 💾 Local Storage Caching
API responses are cached using `localStorage`.

The cache is kept for **6 hours**, reducing unnecessary API requests and improving the loading experience.

### 📱 Responsive Design
The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The movie carousel automatically adjusts the number of visible cards based on screen width.

### ✨ Modern Visual Effects
The UI uses a combination of:

- Glassmorphism
- Glowing elements
- Dynamic mouse-following card glow
- Ambient page lighting
- Smooth transitions
- Modern cards
- Responsive layouts

### ♿ Accessibility
The project also includes several accessibility-focused features:

- Keyboard-accessible movie cards
- `aria-label`
- `aria-current`
- `aria-expanded`
- Keyboard support for interactive elements
- Focus management for the movie modal

---

## 🛠️ Technologies

| Technology | Usage |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling, responsive design, glassmorphism and effects |
| JavaScript | Application logic and interactivity |
| MoviesAPI.ir | Movie data source |
| Fetch API | API requests |
| LocalStorage | Client-side caching and daily recommendation |
| Netlify | Live deployment |

---

## 🔌 API

CineVerse uses:

**MoviesAPI.ir**

API endpoint:

`http://moviesapi.ir/api/v1/movies?page=`

The application loads multiple pages of movie data and combines them into a single collection.

### CORS Handling

Because the API does not provide the required `Access-Control-Allow-Origin` header for direct browser requests, the application attempts a direct request first and falls back to a public CORS proxy when necessary.

The application also includes request timeouts and error handling to prevent failed API requests from blocking the entire application.

---

## ⚡ How It Works

The general application flow is:

```text
Load Website
     │
     ▼
Fetch Movie Data
     │
     ├── LocalStorage Cache
     │
     └── API Request
             │
             ▼
       Multiple Pages
             │
             ▼
       Merge Movie Data
             │
             ▼
       Remove Duplicates
             │
             ├── Top-Rated Movies
             ├── Daily Recommendation
             ├── Movie Pagination
             └── Search
📁 Project Structure

The project is intentionally kept simple and uses a vanilla frontend structure.

cineverse-movie-discovery/
│
├── index.html
├── style.css
├── script.js
│
├── README.md
└── README-fa.md

The exact structure may vary depending on the final project files.

💻 Running Locally
1. Clone the repository
git clone https://github.com/parsasdg8/cineverse-movie-discovery.git
2. Open the project

Open the project folder in your preferred code editor.

3. Run with a local server

Because the application uses fetch() and external API resources, it is recommended to run the project using a local development server.

For example, with VS Code Live Server:

Right Click → Open with Live Server

Then open the local address provided by the development server.

🧠 Main JavaScript Concepts Used

The project demonstrates several practical JavaScript concepts, including:

async / await
Fetch API
Promises
Promise.all()
Array methods
map()
filter()
sort()
slice()
flat()
find()
Map
DOM manipulation
Event listeners
Event handling
Debouncing
localStorage
JSON parsing and serialization
AbortController
Responsive JavaScript behavior
💡 Performance Considerations

Several techniques are used to improve the user experience:

API response caching
Lazy loading movie images
Request timeout handling
Parallel API requests with Promise.all()
Duplicate removal
Debounced resize handling
Limited search results
Progressive loading indicator
📌 Project Purpose

This project was created as a practical frontend project to work with:

External APIs
Asynchronous JavaScript
DOM manipulation
Responsive UI
Modern CSS effects
Client-side storage
Interactive components

The main goal was to combine these concepts into a complete movie discovery experience rather than a simple static movie page.
</div> 
```


👨‍💻 Creator
<div align="start">
Parsa Sadeghi
</div>


 <div align="center> 
<a href="https://github.com/parsasdg8"> <img src="https://img.shields.io/badge/GitHub-parsasdg8-181717?style=for-the-badge&logo=github" alt="GitHub"> </a>
<a href="https://www.linkedin.com/in/parsa-sadeghi-141a0b389?utm_source=share_via&utm_content=profile&utm_medium=member_android"> <img src="https://img.shields.io/badge/LinkedIn-Parsa%20Sadeghi-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"> </a> 
</div> 


<div align="start">
⭐ If you found this project interesting, consider giving it a star.
</div>

