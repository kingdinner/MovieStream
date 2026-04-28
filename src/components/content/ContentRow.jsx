import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import ContentCard from './ContentCard';

export default function ContentRow({ title, items, onSelect }) {
  const ref = useRef(null);

  const scroll = dir => {
    ref.current.scrollBy({ left: dir === 'left' ? -800 : 800, behavior: 'smooth' });
  };

  return (
    <section className="mb-8">
      <h3 className="text-white text-2xl font-bold px-12 mb-4">{title}</h3>
      <div className="relative group">
        <button onClick={() => scroll('left')} className="row-btn left-0">
          <ChevronLeft />
        </button>

        <div ref={ref} className="flex gap-4 overflow-x-auto px-12 scrollbar-hide">
          {items.map(i => (
            <ContentCard key={i.id} item={i} onSelect={onSelect} />
          ))}
        </div>

        <button onClick={() => scroll('right')} className="row-btn right-0">
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
