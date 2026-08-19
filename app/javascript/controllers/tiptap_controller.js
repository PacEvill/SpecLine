import { Controller } from "@hotwired/stimulus"
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export default class extends Controller {
  static targets = ["editor", "toolbar"]

  connect() {
    const inputElement = this.element.querySelector("input[type='hidden']")
    if (!inputElement) return;

    // Remove Trix
    const trix = this.element.querySelector('trix-editor')
    const trixToolbar = this.element.querySelector('trix-toolbar')
    if (trix) trix.style.display = 'none'
    if (trixToolbar) trixToolbar.style.display = 'none'

    // Lemos o valor do hidden_field (que agora vai ser HTML puro do atributo value)
    const initialContent = inputElement.value
    
    if (this.hasToolbarTarget) {
      this.toolbarTarget.classList.remove('hidden')
    }

    this.editor = new Editor({
      element: this.editorTarget,
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({
          placeholder: 'Comece a digitar...',
        })
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class: 'prose prose-ink dark:prose-invert max-w-none prose-p:text-[17px] prose-p:leading-loose prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-a:text-terracotta hover:prose-a:text-[#c26244] prose-img:rounded-xl prose-pre:bg-ink-paper prose-pre:border prose-pre:border-white/10 min-h-[500px] outline-none focus:outline-none focus:ring-0 p-0 m-0',
        },
      },
      onUpdate: ({ editor }) => {
        inputElement.value = editor.getHTML()
        inputElement.dispatchEvent(new Event('input', { bubbles: true }))
        this.updateToc()
      },
      onSelectionUpdate: () => {
        this.updateToolbarStates()
      }
    })
    
    // Initial TOC render
    setTimeout(() => this.updateToc(), 100)
  }

  // Ações chamadas pelos botões
  toggleBold() { this.editor.chain().focus().toggleBold().run() }
  toggleItalic() { this.editor.chain().focus().toggleItalic().run() }
  toggleStrike() { this.editor.chain().focus().toggleStrike().run() }
  toggleCode() { this.editor.chain().focus().toggleCode().run() }
  toggleH1() { this.editor.chain().focus().toggleHeading({ level: 1 }).run() }
  toggleH2() { this.editor.chain().focus().toggleHeading({ level: 2 }).run() }
  toggleH3() { this.editor.chain().focus().toggleHeading({ level: 3 }).run() }
  toggleBulletList() { this.editor.chain().focus().toggleBulletList().run() }
  toggleOrderedList() { this.editor.chain().focus().toggleOrderedList().run() }
  toggleBlockquote() { this.editor.chain().focus().toggleBlockquote().run() }

  updateToc() {
    const tocContainer = document.getElementById('document-toc')
    if (!tocContainer) return

    const headings = []
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs.level,
          text: node.textContent,
          pos: pos
        })
      }
    })

    if (headings.length === 0) {
      tocContainer.innerHTML = '<div class="text-ink/40 dark:text-white/40 italic px-2 text-[13px]">Nenhum título ainda...</div>'
      return
    }

    const html = headings.map(h => {
      const padding = (h.level - 1) * 12
      return `<div class="truncate py-1 rounded hover:text-ink dark:hover:text-fable cursor-pointer transition-colors text-[13px]" style="padding-left: ${padding + 8}px">${h.text || 'Sem título'}</div>`
    }).join('')

    tocContainer.innerHTML = html
  }

  updateToolbarStates() {
    if (!this.hasToolbarTarget) return
    
    const btns = this.toolbarTarget.querySelectorAll('button')
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
        case 'toggleH3': isActive = this.editor.isActive('heading', { level: 3 }); break;
        case 'toggleBulletList': isActive = this.editor.isActive('bulletList'); break;
        case 'toggleOrderedList': isActive = this.editor.isActive('orderedList'); break;
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
