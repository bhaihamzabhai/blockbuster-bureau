'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Send,
  Image as ImageIcon,
  Youtube,
  Upload,
  X,
  Star,
  Settings,
  Eye,
  Loader2,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { createPost, updatePost, generateSlug } from '@/lib/firestore';
import { Post, Category, CATEGORIES, CATEGORY_LABELS } from '@/types';
import YouTubeEmbed from '@/lib/tiptap/YouTubeExtension';
import EditorToolbar from './EditorToolbar';
import LinkModal from './modals/LinkModal';
import ImageModal from './modals/ImageModal';
import YouTubeModal from './modals/YouTubeModal';
import EmbedModal from './modals/EmbedModal';

const lowlight = createLowlight(common);

interface PostEditorProps {
  initialData?: Post | null;
  postId?: string;
}

interface EditorFormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: Category;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  featured: boolean;
  youtubeVideoId: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

export default function PostEditor({ initialData, postId }: PostEditorProps) {
  const [formState, setFormState] = useState<EditorFormState>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    body: initialData?.body || '',
    coverImage: initialData?.coverImage || '',
    category: initialData?.category || 'upcoming-movies',
    tags: initialData?.tags || [],
    author: initialData?.author || '',
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    youtubeVideoId: initialData?.youtubeVideoId || '',
    seo: {
      metaTitle: initialData?.seo?.metaTitle || '',
      metaDescription: initialData?.seo?.metaDescription || '',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [coverImageProgress, setCoverImageProgress] = useState(0);
  const [seoOpen, setSeoOpen] = useState(false);

  // Modal states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  // Track the Firestore document id — after the first save of a brand-new
  // post, all subsequent saves/publishes must UPDATE it, not create duplicates.
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-nova underline hover:text-gold',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg mx-auto my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount.configure({
        limit: 50000,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-void border border-white/10 rounded-lg p-4 font-mono text-sm',
        },
      }),
      YouTubeEmbed,
    ],
    content: initialData?.body || '',
    onUpdate: ({ editor }) => {
      setFormState((prev) => ({
        ...prev,
        body: editor.getHTML(),
      }));
      setIsDirty(true);
    },
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isDirty || !postId) return;

    const interval = setInterval(async () => {
      handleSaveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [isDirty, postId, formState]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Update document title with unsaved indicator
  useEffect(() => {
    const baseTitle = formState.title || 'New Post';
    document.title = isDirty ? `● ${baseTitle} | Blockbuster Bureau` : `${baseTitle} | Blockbuster Bureau`;
  }, [isDirty, formState.title]);

  const updateFormState = (updates: Partial<EditorFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    setFormState((prev) => ({ ...prev, title, slug }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    if (!editor) return;
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const data = {
        ...formState,
        body: editor.getHTML(),
        status: 'draft' as const,
      };

      if (currentPostId) {
        await updatePost(currentPostId, data);
      } else {
        const newId = await createPost(data);
        if (newId) {
          setCurrentPostId(newId);
          // Update URL without reload
          window.history.replaceState({}, '', `/dashboard/posts/${newId}/edit`);
        }
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!editor) return;
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const data = {
        ...formState,
        body: editor.getHTML(),
        status: 'published' as const,
        publishedAt: Timestamp.now(),
      };

      if (currentPostId) {
        await updatePost(currentPostId, data);
      } else {
        await createPost(data);
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Publish error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    setCoverImageUploading(true);
    setCoverImageProgress(0);

    const fileName = `posts/covers/${currentPostId || 'temp'}-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setCoverImageProgress(Math.round(progress));
      },
      (error) => {
        console.error('Upload error:', error);
        setCoverImageUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updateFormState({ coverImage: downloadURL });
          setCoverImageUploading(false);
        } catch (error) {
          console.error('Failed to get download URL:', error);
          setCoverImageUploading(false);
        }
      }
    );
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formState.tags.includes(tag)) {
      updateFormState({ tags: [...formState.tags, tag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormState({ tags: formState.tags.filter((t) => t !== tagToRemove) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleLinkInsert = (data: { href: string; text?: string; newTab: boolean; nofollow: boolean }) => {
    if (!editor) return;

    if (!data.href) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .setLink({
        href: data.href,
        target: data.newTab ? '_blank' : undefined,
        rel: data.nofollow ? 'nofollow' : undefined,
      })
      .run();
  };

  const handleImageInsert = (data: { src: string; alt: string; width: string }) => {
    if (!editor) return;

    const widthStyle =
      data.width === 'medium' ? '60%' : data.width === 'small' ? '40%' : '100%';

    editor
      .chain()
      .focus()
      .setImage({
        src: data.src,
        alt: data.alt,
      })
      .updateAttributes('image', {
        style: `width: ${widthStyle}; display: block; margin: 1.5rem auto;`,
      })
      .run();
  };

  const handleYouTubeInsert = (data: {
    videoId: string;
    nocookie: boolean;
    rel: boolean;
    autoplay: boolean;
    startSeconds: number;
    align: 'left' | 'center' | 'right';
    caption: string;
  }) => {
    if (!editor) return;

    editor.chain().focus().setYouTubeEmbed(data).run();
  };

  const handleEmbedInsert = (embedHtml: string) => {
    if (!editor) return;
    // Insert embed as raw HTML
    editor.chain().focus().insertContent(embedHtml).run();
  };

  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  };

  const getReadTime = () => {
    const words = getWordCount();
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Column - Editor */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title..."
                className="w-full bg-transparent text-white text-display text-4xl placeholder-stardust/50 focus:outline-none border-b border-white/10 pb-2"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-stardust/50 text-sm">/blog/</span>
                <input
                  type="text"
                  value={formState.slug}
                  onChange={(e) => updateFormState({ slug: e.target.value })}
                  className="bg-transparent text-white text-sm focus:outline-none border-b border-transparent focus:border-gold/50"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <textarea
                value={formState.excerpt}
                onChange={(e) => updateFormState({ excerpt: e.target.value })}
                placeholder="Short excerpt shown in post cards and SEO description (max 160 chars)..."
                rows={2}
                className="w-full bg-nebula/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-stardust/50 focus:outline-none focus:border-gold/50 resize-none"
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    formState.excerpt.length > 160 ? 'text-red-400' : 'text-stardust/50'
                  }`}
                >
                  {formState.excerpt.length}/160
                </span>
              </div>
            </div>

            {/* Toolbar */}
            <EditorToolbar
              editor={editor}
              onLinkClick={() => setLinkModalOpen(true)}
              onImageClick={() => setImageModalOpen(true)}
              onYouTubeClick={() => setYoutubeModalOpen(true)}
              onEmbedClick={() => setEmbedModalOpen(true)}
            />

            {/* Editor Canvas */}
            <div className="bg-nebula/30 border border-white/10 rounded-b-lg border-t-0">
              <EditorContent
                editor={editor}
                className="prose-editor min-h-[500px] p-6 focus:outline-none"
              />
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
                <span className="text-stardust/50 text-sm">
                  {getWordCount()} words | {getReadTime()} min read
                </span>
                <span className="text-stardust/50 text-sm">
                  {editor?.storage.characterCount.characters?.() || 0} characters
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-4">
            {/* Save Status */}
            <div className="bg-nebula rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-stardust text-sm">
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'saved' && 'All changes saved'}
                  {saveStatus === 'error' && 'Error saving'}
                  {saveStatus === 'idle' && (lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved yet')}
                </span>
                {isDirty && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-void border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gold text-void font-medium rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Publish
                </button>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-nebula rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold" />
                Cover Image
              </h3>
              {formState.coverImage ? (
                <div className="relative">
                  <img
                    src={formState.coverImage}
                    alt="Cover"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    onClick={() => updateFormState({ coverImage: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverImageInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-gold/50 transition-colors"
                >
                  {coverImageUploading ? (
                    <div className="space-y-2">
                      <Loader2 className="w-6 h-6 text-gold mx-auto animate-spin" />
                      <p className="text-stardust text-sm">{coverImageProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-stardust mx-auto mb-2" />
                      <p className="text-stardust text-sm">Click to upload cover image</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverImageUpload(file);
                }}
                className="hidden"
              />
            </div>

            {/* Post Settings */}
            <div className="bg-nebula rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-gold" />
                Post Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-stardust text-sm mb-1">Category</label>
                  <select
                    value={formState.category}
                    onChange={(e) => updateFormState({ category: e.target.value as Category })}
                    className="w-full px-3 py-2 bg-void border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stardust text-sm mb-1">Author</label>
                  <input
                    type="text"
                    value={formState.author}
                    onChange={(e) => updateFormState({ author: e.target.value })}
                    placeholder="Author name"
                    className="w-full px-3 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust/50 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-stardust text-sm mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formState.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gold/20 text-gold rounded text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type tag and press Enter"
                    className="w-full px-3 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust/50 focus:outline-none focus:border-gold/50"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) => updateFormState({ featured: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-void text-gold focus:ring-gold/50"
                  />
                  <Star className="w-4 h-4 text-gold" />
                  <span className="text-stardust text-sm">Featured post</span>
                </label>
              </div>
            </div>

            {/* YouTube Hero Video */}
            <div className="bg-nebula rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-gold" />
                Hero Video (Optional)
              </h3>
              <p className="text-stardust/50 text-xs mb-3">
                Featured video displayed at the top of the post
              </p>
              {formState.youtubeVideoId ? (
                <div className="relative">
                  <img
                    src={`https://img.youtube.com/vi/${formState.youtubeVideoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    onClick={() => updateFormState({ youtubeVideoId: '' })}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={formState.youtubeVideoId}
                  onChange={(e) => updateFormState({ youtubeVideoId: e.target.value })}
                  placeholder="YouTube video ID"
                  className="w-full px-3 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust/50 focus:outline-none focus:border-gold/50"
                />
              )}
            </div>

            {/* SEO Settings */}
            <div className="bg-nebula rounded-xl border border-white/10 p-4">
              <button
                onClick={() => setSeoOpen(!seoOpen)}
                className="w-full flex items-center justify-between text-white font-medium"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gold" />
                  SEO & Sharing
                </span>
                <span className="text-stardust text-sm">{seoOpen ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {seoOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      <div>
                        <label className="block text-stardust text-sm mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={formState.seo.metaTitle}
                          onChange={(e) =>
                            updateFormState({
                              seo: { ...formState.seo, metaTitle: e.target.value },
                            })
                          }
                          placeholder={formState.title || 'Meta title'}
                          className="w-full px-3 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust/50 focus:outline-none focus:border-gold/50"
                        />
                        <div className="flex justify-end mt-1">
                          <span
                            className={`text-xs ${
                              formState.seo.metaTitle.length > 60 ? 'text-red-400' : 'text-stardust/50'
                            }`}
                          >
                            {formState.seo.metaTitle.length}/60
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-stardust text-sm mb-1">Meta Description</label>
                        <textarea
                          value={formState.seo.metaDescription}
                          onChange={(e) =>
                            updateFormState({
                              seo: { ...formState.seo, metaDescription: e.target.value },
                            })
                          }
                          placeholder={formState.excerpt || 'Meta description'}
                          rows={3}
                          className="w-full px-3 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust/50 focus:outline-none focus:border-gold/50 resize-none"
                        />
                        <div className="flex justify-end mt-1">
                          <span
                            className={`text-xs ${
                              formState.seo.metaDescription.length > 160 ? 'text-red-400' : 'text-stardust/50'
                            }`}
                          >
                            {formState.seo.metaDescription.length}/160
                          </span>
                        </div>
                      </div>
                      {/* Google Preview */}
                      <div>
                        <p className="text-stardust text-sm mb-2">Google Preview</p>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-blue-700 text-lg truncate">
                            {formState.seo.metaTitle || formState.title || 'Page Title'}
                          </p>
                          <p className="text-green-700 text-sm">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/blog/{formState.slug || 'slug'}
                          </p>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {formState.seo.metaDescription || formState.excerpt || 'Page description will appear here...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onInsert={handleLinkInsert}
      />
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsert={handleImageInsert}
      />
      <YouTubeModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onInsert={handleYouTubeInsert}
      />
      <EmbedModal
        isOpen={embedModalOpen}
        onClose={() => setEmbedModalOpen(false)}
        onInsert={handleEmbedInsert}
      />
    </div>
  );
}