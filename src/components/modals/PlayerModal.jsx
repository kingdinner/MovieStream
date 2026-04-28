import { X } from 'lucide-react';

export default function PlayerModal({ content, onClose }) {
  return (
    <div className="fixed inset-0 bg-black z-50">
      <button onClick={onClose} className="absolute top-4 right-4">
        <X className="text-white w-8 h-8" />
      </button>

      <iframe
        title={`${content.title || content.name} player`}   // ✅ REQUIRED
        src={`https://vidsrc.xyz/embed/${content.media_type || 'movie'}/${content.id}`}
        className="w-full h-full"
        allow="autoplay; fullscreen"
        allowFullScreen
      />

    </div>
  );
}
