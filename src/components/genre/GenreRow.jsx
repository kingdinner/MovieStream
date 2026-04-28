export default function GenreRow({ genres, onSelect }) {
  return (
    <div className="flex gap-4 overflow-x-auto px-12 py-6 scrollbar-hide">
      {genres.map(g => (
        <button
          key={g.id}
          tabIndex={0}
          onClick={() => onSelect(g)}
          className="
            px-6 py-3 bg-gray-800 text-white rounded-full text-lg
            focus:outline-none focus:ring-4 focus:ring-red-600
            whitespace-nowrap
          "
        >
          {g.name}
        </button>
      ))}
    </div>
  );
}
