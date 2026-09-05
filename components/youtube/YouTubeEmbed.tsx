interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

export default function YouTubeEmbed({
  videoId,
  title = 'YouTube video',
  className = '',
}: YouTubeEmbedProps) {
  // Use privacy-enhanced mode by default
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden border border-gold/30 ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}