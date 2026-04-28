import { useEffect, useState } from "react";
import { TMDB_API_KEY, TMDB_BASE_URL } from "../../api/tmdb";


export default function EpisodeList({ tvId, season }) {
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    if (!tvId || !season) return;

    fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${season}?api_key=${TMDB_API_KEY}`
    )
      .then(res => res.json())
      .then(data => setEpisodes(data.episodes || []));
  }, [tvId, season]);

  return (
    <div className="episode-list">
      {episodes.map(ep => (
        <a
          key={ep.id}
          href={`/watch/tv/${tvId}/${season}/${ep.episode_number}`}
          className="episode"
        >
          <strong>
            S{season} · E{ep.episode_number}
          </strong>
          <span>{ep.name}</span>
        </a>
      ))}
    </div>
  );
}
