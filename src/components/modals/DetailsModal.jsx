import { useEffect, useState } from "react";
import "../../components/modal.css";
import EpisodeList from "../list/EpisodeList";

export default function DetailsModal({ item, onClose }) {
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState(1);

  useEffect(() => {
    if (item.media_type !== "tv") return;

    fetch(
      `https://api.themoviedb.org/3/tv/${item.id}?api_key=YOUR_TMDB_KEY`
    )
      .then(res => res.json())
      .then(data => setSeasons(data.seasons || []));
  }, [item]);

  return (
    <div className="modal-backdrop">
      <div
        className="modal-big"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`
        }}
      >
        <button className="close" onClick={onClose}>✕</button>

        <div className="modal-content">
          <h1>{item.title || item.name}</h1>
          <p>{item.overview}</p>

          <div className="buttons">
            <a
              href={`/watch/${item.media_type}/${item.id}/${season}/1`}
              className="play"
            >
              ▶ Play
            </a>
          </div>

          {/* SEASONS */}
          {item.media_type === "tv" && (
            <>
              <h3>Episodes</h3>

              <select
                value={season}
                onChange={e => setSeason(e.target.value)}
              >
                {seasons.map(s => (
                  <option key={s.id} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))}
              </select>

              <EpisodeList
                tvId={item.id}
                season={season}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
