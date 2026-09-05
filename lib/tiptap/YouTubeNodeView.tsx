'use client';

import { NodeViewWrapper } from '@tiptap/react';

interface YouTubeAttrs {
  videoId?: string;
  nocookie?: boolean;
  rel?: boolean;
  autoplay?: boolean;
  startSeconds?: number;
  align?: 'left' | 'center' | 'right';
  caption?: string;
}

// Props are intentionally loose: Tiptap passes generic Attrs to node views.
interface YouTubeNodeViewProps {
  node: { attrs: Record<string, unknown> };
  selected: boolean;
}

export default function YouTubeNodeView({
  node,
  selected,
}: YouTubeNodeViewProps) {
  const attrs = node.attrs as YouTubeAttrs;
  const {
    videoId = '',
    nocookie = true,
    rel = false,
    autoplay = false,
    startSeconds = 0,
    align = 'center',
    caption = '',
  } = attrs;

  const domain = nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  const params = new URLSearchParams();

  if (autoplay) params.set('autoplay', '1');
  if (startSeconds) params.set('start', String(startSeconds));
  if (!rel) params.set('rel', '0');

  const queryString = params.toString();
  const src = `https://${domain}/embed/${videoId}${queryString ? `?${queryString}` : ''}`;

  return (
    <NodeViewWrapper
      className={`youtube-embed youtube-embed--${align} ${selected ? 'youtube-embed--selected' : ''}`}
      style={{
        margin: '1.5rem 0',
        ...(align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
        ...(align === 'left' ? { marginRight: 'auto' } : {}),
        ...(align === 'right' ? { marginLeft: 'auto' } : {}),
      }}
    >
      <div
        className="youtube-embed__wrapper"
        style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          borderRadius: '0.75rem',
          border: selected ? '2px solid #F0C040' : '1px solid rgba(240, 192, 64, 0.3)',
          transition: 'border-color 0.2s ease',
        }}
      >
        <iframe
          src={src}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-stardust text-sm text-center mt-2">
          {caption}
        </figcaption>
      )}
    </NodeViewWrapper>
  );
}