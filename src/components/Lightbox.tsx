export function Lightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="close">
        ✕
      </button>
      <img className="lightbox-img" src={src} alt={alt} />
      {caption && <div className="lightbox-caption">{caption}</div>}
    </div>
  );
}
