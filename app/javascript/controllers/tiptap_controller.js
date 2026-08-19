import { Controller } from "@hotwired/stimulus"
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export default class extends Controller {
  static targets = ["editor"]

  connect() {
    // Pegar o input oculto gerado pelo ActionText
    const inputElement = this.element.querySelector("input[type='hidden']")
    if (!inputElement) return;

    // Esconder o Trix original completamente
    const trix = this.element.querySelector('trix-editor')
    const trixToolbar = this.element.querySelector('trix-toolbar')
    if (trix) trix.style.display = 'none'
    if (trixToolbar) trixToolbar.style.display = 'none'

    const initialContent = inputElement.value

    this.editor = new Editor({
      element: this.editorTarget,
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Placeholder.configure({
          placeholder: 'Pressione "/" para comandos ou comece a digitar...',
        }),
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class: 'prose prose-ink dark:prose-invert max-w-none prose-p:text-[16px] prose-p:leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-terracotta hover:prose-a:text-[#c26244] prose-img:rounded-xl prose-pre:bg-ink-paper prose-pre:border prose-pre:border-white/10 min-h-[500px] outline-none focus:outline-none focus:ring-0 p-0 m-0',
        },
      },
      onUpdate: ({ editor }) => {
        inputElement.value = editor.getHTML()
      },
    })
  }

  disconnect() {
    if (this.editor) {
      this.editor.destroy()
    }
  }
}
