import { Controller } from "@hotwired/stimulus"
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import BubbleMenu from '@tiptap/extension-bubble-menu'

export default class extends Controller {
  static targets = ["editor", "bubbleMenu"]

  connect() {
    const inputElement = this.element.querySelector("input[type='hidden']")
    if (!inputElement) return;

    // Esconde o motor original Trix (se o rails ainda carregar)
    const trix = this.element.querySelector('trix-editor')
    const trixToolbar = this.element.querySelector('trix-toolbar')
    if (trix) trix.style.display = 'none'
    if (trixToolbar) trixToolbar.style.display = 'none'

    const initialContent = inputElement.value
    
    // Tira as classes hidden do Bubble Menu para ele existir no DOM mas ser controlado pelo Tiptap
    if (this.hasBubbleMenuTarget) {
      this.bubbleMenuTarget.classList.remove('hidden')
    }

    this.editor = new Editor({
      element: this.editorTarget,
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: 'Pressione "/" para comandos ou comece a digitar...',
        }),
        BubbleMenu.configure({
          element: this.hasBubbleMenuTarget ? this.bubbleMenuTarget : null,
          tippyOptions: { duration: 150 },
        }),
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class: 'prose prose-ink dark:prose-invert max-w-none prose-p:text-[17px] prose-p:leading-loose prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-a:text-terracotta hover:prose-a:text-[#c26244] prose-img:rounded-xl prose-pre:bg-ink-paper prose-pre:border prose-pre:border-white/10 min-h-[500px] outline-none focus:outline-none focus:ring-0 p-0 m-0',
        },
      },
      onUpdate: ({ editor }) => {
        inputElement.value = editor.getHTML()
      },
      onSelectionUpdate: () => {
        this.updateBubbleMenuStates()
      }
    })
  }

  // Ações chamadas pelos botões do menu
  toggleBold() { this.editor.chain().focus().toggleBold().run() }
  toggleItalic() { this.editor.chain().focus().toggleItalic().run() }
  toggleStrike() { this.editor.chain().focus().toggleStrike().run() }
  toggleCode() { this.editor.chain().focus().toggleCode().run() }
  toggleH1() { this.editor.chain().focus().toggleHeading({ level: 1 }).run() }
  toggleH2() { this.editor.chain().focus().toggleHeading({ level: 2 }).run() }
  toggleBulletList() { this.editor.chain().focus().toggleBulletList().run() }
  toggleBlockquote() { this.editor.chain().focus().toggleBlockquote().run() }

  updateBubbleMenuStates() {
    if (!this.hasBubbleMenuTarget) return
    
    const btns = this.bubbleMenuTarget.querySelectorAll('button')
    btns.forEach(btn => {
      const action = btn.dataset.action.split('#')[1]
      let isActive = false
      
      switch(action) {
        case 'toggleBold': isActive = this.editor.isActive('bold'); break;
        case 'toggleItalic': isActive = this.editor.isActive('italic'); break;
        case 'toggleStrike': isActive = this.editor.isActive('strike'); break;
        case 'toggleCode': isActive = this.editor.isActive('code'); break;
        case 'toggleH1': isActive = this.editor.isActive('heading', { level: 1 }); break;
        case 'toggleH2': isActive = this.editor.isActive('heading', { level: 2 }); break;
        case 'toggleBulletList': isActive = this.editor.isActive('bulletList'); break;
        case 'toggleBlockquote': isActive = this.editor.isActive('blockquote'); break;
      }

      if (isActive) {
        btn.classList.add('bg-ink/10', 'dark:bg-white/10', 'text-ink', 'dark:text-white')
        btn.classList.remove('text-ink-light', 'dark:text-white/60')
      } else {
        btn.classList.remove('bg-ink/10', 'dark:bg-white/10', 'text-ink', 'dark:text-white')
        btn.classList.add('text-ink-light', 'dark:text-white/60')
      }
    })
  }

  disconnect() {
    if (this.editor) this.editor.destroy()
  }
}
