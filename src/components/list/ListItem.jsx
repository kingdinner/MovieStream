import { Star } from 'lucide-react';
import { IMG_BASE_URL } from '../../api/tmdb';

export default function ListItem({ item, onSelect }) {
  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() => onSelect(item)}
      className="
        flex gap-6 items-center px-6 py-4
        border-b border-gray-800
        focus:bg-gray-800 focus:outline-none
      "
    >
      <img
        src={item.poster_path
          ? `${IMG_BASE_URL}${item.poster_path}`
          : 'https://via.placeholder.com/120x180'}
        className="w-24 h-36 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="text-white text-xl font-semibold">
          {item.title || item.name}
        </h3>

        <div className="flex items-center gap-2 text-gray-400 mt-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          {item.vote_average?.toFixed(1)}
        </div>

        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
          {item.overview}
        </p>
      </div>
    </div>
  );
}
