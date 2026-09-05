import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import YouTubeNodeView from './YouTubeNodeView';

export interface YouTubeEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtubeEmbed: {
      /**
       * Insert a YouTube embed
       */
      setYouTubeEmbed: (options: {
        videoId: string;
        nocookie?: boolean;
        rel?: boolean;
        autoplay?: boolean;
        startSeconds?: number;
        align?: 'left' | 'center' | 'right';
        caption?: string;
      }) => ReturnType;
    };
  }
}

const YouTubeEmbed = Node.create<YouTubeEmbedOptions>({
  name: 'youtubeEmbed',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      videoId: {
        default: '',
      },
      nocookie: {
        default: true,
      },
      rel: {
        default: false,
      },
      autoplay: {
        default: false,
      },
      startSeconds: {
        default: 0,
      },
      align: {
        default: 'center',
      },
      caption: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="youtube-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { videoId, nocookie, rel, autoplay, startSeconds, align, caption } = HTMLAttributes;

    const domain = nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
    const params = new URLSearchParams();

    if (autoplay) params.set('autoplay', '1');
    if (startSeconds) params.set('start', String(startSeconds));
    if (!rel) params.set('rel', '0');

    const queryString = params.toString();
    const src = `https://${domain}/embed/${videoId}${queryString ? `?${queryString}` : ''}`;

    const figcaption = caption
      ? ['figcaption', { class: 'text-stardust text-sm text-center mt-2' }, caption]
      : ['figcaption', { style: 'display: none' }, ''];

    return [
      'figure',
      {
        'data-type': 'youtube-embed',
        class: `youtube-embed youtube-embed--${align}`,
        style: `margin: 1.5rem 0; ${align === 'left' ? 'margin-right: auto;' : ''}${align === 'right' ? 'margin-left: auto;' : ''}${align === 'center' ? 'margin-left: auto; margin-right: auto;' : ''}`,
      },
      [
        'div',
        { class: 'youtube-embed__wrapper', style: 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 0.75rem; border: 1px solid rgba(240, 192, 64, 0.3);' },
        [
          'iframe',
          {
            src,
            style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: 'true',
            loading: 'lazy',
          },
        ],
      ],
      figcaption,
    ];
  },

  addCommands() {
    return {
      setYouTubeEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeNodeView);
  },
});

export default YouTubeEmbed;