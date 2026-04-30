import { memo } from 'react';
import ContentCard from '../content/ContentCard';

const SearchResults = memo(({ query, results, filterAvailable, onSelect, onPlay, onToggleList, myList }) => (
  <div style={{ padding: '90px 4% 40px' }}>
    <h2 style={{
      color: '#fff', fontFamily: "'DM Sans',sans-serif",
      fontSize: 24, fontWeight: 700, marginBottom: 22,
    }}>
      Results for "{query}"
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
      {filterAvailable(results).map(item => (
        <ContentCard
          key={item.id} item={item}
          onSelect={onSelect} onPlay={onPlay}
          onToggleList={onToggleList} inList={myList.has(item.id)}
        />
      ))}
    </div>
  </div>
));

SearchResults.displayName = 'SearchResults';
export default SearchResults;
