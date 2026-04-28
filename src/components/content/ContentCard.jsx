import { Star } from 'lucide-react';
import { IMG_BASE_URL } from '../../api/tmdb';

export default function ContentCard({ item, onSelect }) {
  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() => onSelect(item)}
      className="flex-shrink-0 w-48 transition focus:scale-110"
    >
      <img
        src={item.poster_path
          ? `${IMG_BASE_URL}${item.poster_path}`
          : 'https://via.placeholder.com/200x300'}
        className="w-full h-72 object-cover rounded-lg"
      />
      <h4 className="text-white text-sm mt-2 truncate">
        {item.title || item.name}
      </h4>
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        {item.vote_average?.toFixed(1)}
      </div>
    </div>
  );
}
