'use client';

import { Editor } from '@tiptap/react';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Superscript,
  Subscript,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  CodeSquare,
  Table,
  Link,
  Image,
  Youtube,
  FileCode,
  Eraser,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  onLinkClick: () => void;
  onImageClick: () => void;
  onYouTubeClick: () => void;
  onEmbedClick: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
        isActive
          ? 'bg-gold/20 text-gold'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-white/10 mx-1" />;
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1 px-2 py-1 bg-gold/10 rounded">{children}</div>;
}

export default function EditorToolbar({
  editor,
  onLinkClick,
  onImageClick,
  onYouTubeClick,
  onEmbedClick,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="bg-nebula rounded-t-lg border border-white/10 border-b-0 p-2 flex flex-wrap items-center gap-1">
      {/* Group 1: History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Group 2: Block Type */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else if (value.startsWith('heading')) {
            const level = parseInt(value.replace('heading', ''));
            editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
          }
        }}
        value={
          editor.isActive('heading', { level: 1 })
            ? 'heading1'
            : editor.isActive('heading', { level: 2 })
            ? 'heading2'
            : editor.isActive('heading', { level: 3 })
            ? 'heading3'
            : editor.isActive('heading', { level: 4 })
            ? 'heading4'
            : 'paragraph'
        }
        className="h-8 px-2 bg-void border border-white/10 rounded text-white text-sm focus:outline-none focus:border-gold/50"
      >
        <option value="paragraph">Paragraph</option>
        <option value="heading1">Heading 1</option>
        <option value="heading2">Heading 2</option>
        <option value="heading3">Heading 3</option>
        <option value="heading4">Heading 4</option>
      </select>

      <ToolbarDivider />

      {/* Group 3: Font Family */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'default') {
            editor.chain().focus().unsetFontFamily().run();
          } else {
            editor.chain().focus().setFontFamily(value).run();
          }
        }}
        value={editor.getAttributes('textStyle').fontFamily || 'default'}
        className="h-8 px-2 bg-void border border-white/10 rounded text-white text-sm focus:outline-none focus:border-gold/50"
      >
        <option value="default">Inter (Default)</option>
        <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="Arial, sans-serif">Arial</option>
      </select>

      <ToolbarDivider />

      {/* Group 4: Font Size */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'default') {
            editor.chain().focus().unsetMark('textStyle').run();
          } else {
            editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
          }
        }}
        value={editor.getAttributes('textStyle').fontSize || 'default'}
        className="h-8 px-2 bg-void border border-white/10 rounded text-white text-sm focus:outline-none focus:border-gold/50"
      >
        <option value="default">Normal</option>
        <option value="14px">Small</option>
        <option value="20px">Large</option>
        <option value="24px">X-Large</option>
      </select>

      <ToolbarDivider />

      {/* Group 5: Inline Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive('superscript')}
        title="Superscript"
      >
        <Superscript className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive('subscript')}
        title="Subscript"
      >
        <Subscript className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Group 6: Text Color */}
      <input
        type="color"
        onInput={(e) =>
          editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
        }
        value={editor.getAttributes('textStyle').color || '#ffffff'}
        className="w-8 h-8 rounded cursor-pointer bg-transparent"
        title="Text Color"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetColor().run()}
        title="Remove Color"
      >
        <span className="text-xs">✕</span>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Group 7: Text Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Group 8: Lists & Structure */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <CodeSquare className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Group 9: Table */}
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      >
        <Table className="w-4 h-4" />
      </ToolbarButton>
      {editor.isActive('table') && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row"
          >
            <span className="text-xs">+R</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Delete Row"
          >
            <span className="text-xs">-R</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column"
          >
            <span className="text-xs">+C</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Delete Column"
          >
            <span className="text-xs">-C</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Table"
          >
            <span className="text-xs">✕</span>
          </ToolbarButton>
        </>
      )}

      <ToolbarDivider />

      {/* Group 10: Media & Embeds */}
      <ToolbarGroup>
        <ToolbarButton onClick={onLinkClick} isActive={editor.isActive('link')} title="Insert Link">
          <Link className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onImageClick} title="Insert Image">
          <Image className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onYouTubeClick} isActive={editor.isActive('youtubeEmbed')} title="Insert YouTube Video">
          <Youtube className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onEmbedClick} title="Embed Code">
          <FileCode className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Group 11: Clear Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
        <Eraser className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}