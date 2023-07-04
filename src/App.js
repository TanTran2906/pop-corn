import { useEffect, useState } from "react";
import StarRating from "./StarRating"

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "b9d32c8b"


export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null)

  function handleSelectdMovie(id) {
    setSelectedId(selectedId => selectedId === id ? null : id)
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddMovie(movie) {
    setWatched(watched => [...watched, movie])
  }

  function handleDeleteMovie(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }

  useEffect(function () {
    //vai trò của AbortController là để hủy bỏ (abort) yêu cầu mạng (fetch) khi thành phần React được unmount hoặc khi giá trị của biến query thay đổi.
    const controller = new AbortController()

    async function fetchMovies() {
      try {
        setIsLoading(true)
        setError("")
        //Đến từ https://www.omdbapi.com/ OMDb API, gửi tín hiệu hủy bỏ đến yêu cầu fetch thông qua thuộc tính signal của fetch request.
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal })

        //Lỗi do internet, hoặc máy chủ
        if (!res.ok) throw new Error("Something went wrong with fetch movies")

        const data = await res.json()
        //Lỗi do data truy vấn không tồn tại
        if (data.Response === 'False') throw new Error("Movies not found")

        setMovies(data.Search)
        setError("")
      }
      catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
          console.log(err.message)
        }

      }
      finally {
        setIsLoading(false)
      }
    }
    //Không thực hiện tìm kiếm khi chuỗi query < 3
    if (query.length < 3) {
      setMovies([])
      setError("")
      return;
    }

    handleCloseMovie()
    fetchMovies()

    return function () {
      controller.abort() //Hủy bỏ yêu cầu fetch đang chờ xử lý
    }
  }, [query])

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectdMovie={handleSelectdMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ?
            <MovieDetail selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatchedMovie={handleAddMovie} watched={watched} /> :
            <>
              <Summary watched={watched} />
              <WatchedMovies watched={watched} onDeleteWatchedMovie={handleDeleteMovie} />
            </>}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>{message}
    </p>
  )
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({ query, setQuery }) {


  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  )
}

//Tái sử dụng
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box container">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  )
}

// function WatchedBox() {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <Summary watched={watched} />
//           <WatchedMovies watched={watched} />
//         </>
//       )}
//     </div>
//   )
// }

function MovieList({ movies, onSelectdMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectdMovie={onSelectdMovie} />
      ))}
    </ul>
  )
}

function Movie({ movie, onSelectdMovie }) {

  return (
    <li key={movie.imdbID} onClick={() => onSelectdMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetail({ selectedId, onCloseMovie, onAddWatchedMovie, watched }) {
  const [movie, setMovie] = useState({}) //{}: vì fetch về 1 {}
  const [isLoading, setIsLoading] = useState(false)
  const [movieRating, setMovieRating] = useState(0)

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId)
  const userRated = watched.find((movie) => selectedId === movie.imdbID)?.userRating

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating: movieRating,
    }

    onAddWatchedMovie(newWatchedMovie)
    onCloseMovie(null)
  }

  useEffect(function () {
    function callback(e) {
      if (e.code === 'Escape')
        onCloseMovie()
    }

    document.addEventListener('keydown', callback)

    // Sau khi component unmount hoặc khi giá trị của onCloseMovie thay đổi, event listener sẽ được gỡ bỏ
    return function () {
      document.removeEventListener('keydown', callback)
    }
  }, [onCloseMovie])

  // console.log(title, year)
  //Có thể xử lý lỗi nếu muốn: Ở đây, giả sử bỏ qua TH lỗi
  useEffect(function () {
    async function getMobieDetails() {
      setIsLoading(true)
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json()
      setMovie(data)
      setIsLoading(false)
    }
    getMobieDetails()
  }, [selectedId])

  useEffect(function () {
    if (!title) return;
    document.title = `Movie | ${title}`

    //Cleanup: Đặt lại trạng thái ban đầu cho title mỗi khi component unmount
    return function () {
      document.title = 'usePopcorn'
    }
  }, [title])


  return <div className="details">
    {isLoading ? <Loader /> :
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
          <img src={poster} alt={`Poster of ${movie} movie`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p>
              <span>⭐</span>
              {imdbRating} IMDb rating
            </p>
          </div>
        </header>

        <section>
          <div className="rating">
            {!isWatched ?
              <>
                <StarRating maxRating={10} size={24} onSetRating={setMovieRating} />
                {movieRating > 0 && <button className="btn-add" onClick={handleAdd}>+ Add to list</button>}
              </>
              :
              <p>You rated with movie {userRated}<span>⭐</span></p>
            }

          </div>
          <p><em>{plot}</em></p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>
        </section>
      </>}
  </div>
}


function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovies({ watched, onDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatchedMovie={onDeleteWatchedMovie} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatchedMovie }) {

  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => onDeleteWatchedMovie(movie.imdbID)}>X</button>
    </li>
  )
}