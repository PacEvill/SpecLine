import { Controller } from "@hotwired/stimulus"
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export default class extends Controller {
  static targets = ["editor", "toolbar", "bubbleMenu", "slashMenu", "input", "wordCount", "readingTime", "charCount"]

  connect() {
    const inputElement = this.hasInputTarget ? this.inputTarget : (this.element.querySelector("input[name*='content'], textarea[name*='content'], #document_content_hidden") || this.element.querySelector("input[type='hidden']"))
    if (!inputElement) {
      console.warn("TipTap: Input hidden element not found.")
      return
    }

    this.inputElement = inputElement
    const initialContent = inputElement.value || ''
    this.slashMenuOpen = false
    
    if (this.hasToolbarTarget) {
      this.toolbarTarget.classList.remove('hidden')
    }

    try {
      this.editor = new Editor({
        element: this.editorTarget,
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3]
            }
          }),
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'text-terracotta hover:underline cursor-pointer font-medium'
            }
          }),
          TaskList,
          TaskItem.configure({ nested: true }),
          Placeholder.configure({
            placeholder: 'Digite "/" para comandos rápidos ou comece a escrever...',
          })
        ],
        content: initialContent,
        editorProps: {
          attributes: {
            class: 'prose prose-ink dark:prose-invert max-w-none prose-p:text-[17px] prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-a:text-terracotta hover:prose-a:text-[#c26244] prose-img:rounded-2xl prose-pre:bg-[#1E1E24] prose-pre:text-[#F3F4F6] prose-pre:rounded-xl prose-pre:border prose-pre:border-ink/10 dark:prose-pre:border-white/10 prose-blockquote:border-l-terracotta prose-blockquote:font-serif prose-blockquote:italic min-h-[500px] outline-none focus:outline-none focus:ring-0 p-0 m-0 cursor-text',
          },
          handleKeyDown: (view, event) => {
            // Atalho Ctrl+S / Cmd+S para salvar imediatamente
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
              event.preventDefault()
              const autosaveEl = document.querySelector('[data-controller~="autosave"]')
              if (autosaveEl) {
                const autosaveCtrl = this.application.getControllerForElementAndIdentifier(autosaveEl, 'autosave')
                if (autosaveCtrl) autosaveCtrl.save()
              }
              return true
            }

            // Fechar menu slash com Escape
            if (event.key === 'Escape' && this.slashMenuOpen) {
              this.hideSlashMenu()
              return true
            }

            // Navegação por teclado no Slash Menu aberto
            if (this.slashMenuOpen) {
              const visibleItems = Array.from(this.slashMenuTarget.querySelectorAll('.slash-cmd-btn:not(.hidden)'))
              
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                this.navigateSlashMenu(visibleItems, 1)
                return true
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                this.navigateSlashMenu(visibleItems, -1)
                return true
              }
              if (event.key === 'Enter') {
                const active = this.slashMenuTarget.querySelector('.slash-cmd-btn.bg-terracotta\\/10, .slash-cmd-btn.dark\\:bg-white\\/10') || visibleItems[0]
                if (active && !active.classList.contains('hidden')) {
                  event.preventDefault()
                  active.click()
                  return true
                }
              }
            }

            return false
          }
        },
        onUpdate: ({ editor }) => {
          inputElement.value = editor.getHTML()
          inputElement.dispatchEvent(new Event('input', { bubbles: true }))
          this.updateToc()
          this.updateStats()
          this.checkSlashCommand()
        },
        onSelectionUpdate: () => {
          this.updateToolbarStates()
          this.updateFloatingBubbleMenu()
          this.checkSlashCommand()
        }
      })
    } catch (err) {
      console.error("TipTap init error:", err)
    }
    
    setTimeout(() => {
      this.updateToc()
      this.updateStats()
    }, 150)

    this.handleDocClick = (e) => {
      if (this.hasSlashMenuTarget && !this.slashMenuTarget.contains(e.target) && !this.editorTarget.contains(e.target)) {
        this.hideSlashMenu()
      }
    }
    document.addEventListener('click', this.handleDocClick)
  }

  checkSlashCommand() {
    if (!this.editor || !this.hasSlashMenuTarget) return

    const { state } = this.editor
    const { from, empty } = state.selection

    if (!empty) {
      this.hideSlashMenu()
      return
    }

    // Pega o texto da linha atual até a posição do cursor
    const $from = state.selection.$from
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n', '\0')
    const match = textBefore.match(/\/([a-zA-Z0-9áàâãéèêíïóôõöúçñ\-_]*)$/)

    if (match) {
      const query = match[1].toLowerCase()
      this.filterSlashCommands(query)
      this.positionSlashMenu()
      this.showSlashMenu()
    } else {
      // Se não há "/" antes do cursor (ou foi apagado com backspace), fecha o menu automaticamente!
      this.hideSlashMenu()
    }
  }

  showSlashMenu() {
    if (!this.hasSlashMenuTarget) return
    this.slashMenuTarget.classList.remove('hidden')
    this.slashMenuOpen = true
  }

  hideSlashMenu() {
    if (!this.hasSlashMenuTarget) return
    this.slashMenuTarget.classList.add('hidden')
    this.slashMenuOpen = false
    this.resetSlashSelection()
  }

  toggleSlashMenu() {
    if (!this.hasSlashMenuTarget) return
    if (this.slashMenuOpen) {
      this.hideSlashMenu()
    } else {
      this.positionSlashMenu()
      this.showSlashMenu()
    }
  }

  positionSlashMenu() {
    if (!this.hasSlashMenuTarget || !this.editor) return
    
    try {
      const { from } = this.editor.state.selection
      const coords = this.editor.view.coordsAtPos(from)
      
      if (coords && coords.top !== 0) {
        const menuWidth = 320
        const menuHeight = 360
        
        let left = coords.left
        let top = coords.bottom + 8
        
        // Prevent overflowing the right edge of viewport
        if (left + menuWidth > window.innerWidth - 16) {
          left = window.innerWidth - menuWidth - 16
        }
        if (left < 16) {
          left = 16
        }
        
        // If near bottom of viewport, flip upwards
        if (top + menuHeight > window.innerHeight - 16) {
          top = Math.max(16, coords.top - menuHeight - 8)
        }
        
        this.slashMenuTarget.style.position = 'fixed'
        this.slashMenuTarget.style.top = `${top}px`
        this.slashMenuTarget.style.left = `${left}px`
        return
      }
    } catch (e) {
      console.warn("Error getting coordsAtPos:", e)
    }

    // Fallback to selection range getBoundingClientRect
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (rect.top > 0) {
        this.slashMenuTarget.style.position = 'fixed'
        this.slashMenuTarget.style.top = `${rect.bottom + 8}px`
        this.slashMenuTarget.style.left = `${Math.min(Math.max(16, rect.left), window.innerWidth - 330)}px`
      }
    }
  }

  filterSlashCommands(query) {
    if (!this.hasSlashMenuTarget) return
    const items = this.slashMenuTarget.querySelectorAll('.slash-cmd-btn')
    let visibleCount = 0

    items.forEach((item, index) => {
      const searchTerms = (item.dataset.search || item.textContent).toLowerCase()
      const matches = searchTerms.includes(query) || query === ''
      item.classList.toggle('hidden', !matches)
      if (matches) visibleCount++
    })

    const emptyMsg = this.slashMenuTarget.querySelector('#slash-empty-msg')
    if (emptyMsg) {
      emptyMsg.classList.toggle('hidden', visibleCount > 0)
    }

    this.resetSlashSelection()
  }

  navigateSlashMenu(visibleItems, direction) {
    if (visibleItems.length === 0) return
    let activeIndex = visibleItems.findIndex(el => el.classList.contains('bg-terracotta/10') || el.classList.contains('dark:bg-white/10'))
    
    if (activeIndex >= 0) {
      visibleItems[activeIndex].classList.remove('bg-terracotta/10', 'dark:bg-white/10')
    }

    activeIndex = (activeIndex + direction + visibleItems.length) % visibleItems.length
    const nextItem = visibleItems[activeIndex]
    if (nextItem) {
      nextItem.classList.add('bg-terracotta/10', 'dark:bg-white/10')
      nextItem.scrollIntoView({ block: 'nearest' })
    }
  }

  resetSlashSelection() {
    if (!this.hasSlashMenuTarget) return
    const items = this.slashMenuTarget.querySelectorAll('.slash-cmd-btn')
    items.forEach((item, i) => {
      item.classList.remove('bg-terracotta/10', 'dark:bg-white/10')
      if (i === 0 && !item.classList.contains('hidden')) {
        item.classList.add('bg-terracotta/10', 'dark:bg-white/10')
      }
    })
  }

  insertBlock(event) {
    const type = event.currentTarget.dataset.type
    this.hideSlashMenu()

    if (!this.editor) return

    // Remove the leading '/query' text typed before selection
    const { state } = this.editor
    const { from } = state.selection
    const $from = state.selection.$from
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n', '\0')
    const match = textBefore.match(/\/([a-zA-Z0-9áàâãéèêíïóôõöúçñ\-_]*)$/)

    if (match) {
      const deleteLen = match[0].length
      this.editor.chain().focus().deleteRange({ from: from - deleteLen, to: from }).run()
    }

    switch(type) {
      case 'h1': this.toggleH1(); break;
      case 'h2': this.toggleH2(); break;
      case 'h3': this.toggleH3(); break;
      case 'bullet': this.toggleBulletList(); break;
      case 'ordered': this.toggleOrderedList(); break;
      case 'task': this.toggleTaskList(); break;
      case 'quote': this.toggleBlockquote(); break;
      case 'code': this.toggleCodeBlock(); break;
      case 'divider': this.setHorizontalRule(); break;
      case 'callout': this.insertCallout(); break;
      case 'warning': this.insertWarning(); break;
      case 'tip': this.insertTip(); break;
      case 'danger': this.insertDanger(); break;
      case 'table': this.insertTable(); break;
      case 'diagram': this.insertDiagram(); break;
      case 'issue': this.insertIssue(); break;
      case 'link': this.setLink(); break;
    }
  }

  insertDiagram() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<pre><code class="language-mermaid">graph TD\n  Client["Cliente Web"] --> API["Backend Core API"]\n  API --> DB[("PostgreSQL")]</code></pre>').run()
    }
  }

  insertIssue() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<blockquote><p>🎯 <strong>Issue Relacionada:</strong> Descreva o vínculo com a tarefa do projeto...</p></blockquote>').run()
    }
  }

  insertCallout() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<blockquote><p>💡 <strong>Nota:</strong> Escreva sua nota ou informação aqui...</p></blockquote>').run()
    }
  }

  insertWarning() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<blockquote><p>⚠️ <strong>Atenção:</strong> Escreva seu aviso de atenção ou cuidado aqui...</p></blockquote>').run()
    }
  }

  insertTip() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<blockquote><p>✅ <strong>Dica de Sucesso:</strong> Escreva uma boa prática ou dica aqui...</p></blockquote>').run()
    }
  }

  insertDanger() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<blockquote><p>🛑 <strong>Alerta Crítico:</strong> Escreva uma restrição ou ponto crítico aqui...</p></blockquote>').run()
    }
  }

  insertTable() {
    if (this.editor) {
      this.editor.chain().focus().insertContent('<pre><code>| Coluna 1 | Coluna 2 | Coluna 3 |\n| --- | --- | --- |\n| Item 1 | Detalhe | Concluído |</code></pre>').run()
    }
  }

  // Floating Selection Bubble Menu
  updateFloatingBubbleMenu() {
    if (!this.hasBubbleMenuTarget || !this.editor) return

    const { state } = this.editor
    const { from, to } = state.selection

    if (from === to) {
      this.bubbleMenuTarget.classList.add('hidden')
      return
    }

    try {
      const fromCoords = this.editor.view.coordsAtPos(from)
      const toCoords = this.editor.view.coordsAtPos(to)
      
      if (fromCoords && fromCoords.top !== 0) {
        const centerX = (fromCoords.left + toCoords.right) / 2
        const top = Math.max(12, fromCoords.top - 46)
        const left = Math.min(Math.max(150, centerX), window.innerWidth - 150)
        
        this.bubbleMenuTarget.style.position = 'fixed'
        this.bubbleMenuTarget.style.top = `${top}px`
        this.bubbleMenuTarget.style.left = `${left}px`
        this.bubbleMenuTarget.style.transform = 'translateX(-50%)'
        this.bubbleMenuTarget.classList.remove('hidden')
        return
      }
    } catch (e) {
      console.warn("Error getting bubble coordsAtPos:", e)
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      this.bubbleMenuTarget.classList.add('hidden')
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (rect.width === 0 && rect.height === 0) {
      this.bubbleMenuTarget.classList.add('hidden')
      return
    }

    this.bubbleMenuTarget.style.position = 'fixed'
    this.bubbleMenuTarget.style.top = `${Math.max(12, rect.top - 46)}px`
    this.bubbleMenuTarget.style.left = `${Math.min(Math.max(150, rect.left + rect.width / 2), window.innerWidth - 150)}px`
    this.bubbleMenuTarget.style.transform = 'translateX(-50%)'
    this.bubbleMenuTarget.classList.remove('hidden')
  }

  // Text formatting actions
  undo() { if (this.editor) this.editor.chain().focus().undo().run() }
  redo() { if (this.editor) this.editor.chain().focus().redo().run() }
  toggleBold() { if (this.editor) this.editor.chain().focus().toggleBold().run() }
  toggleItalic() { if (this.editor) this.editor.chain().focus().toggleItalic().run() }
  toggleStrike() { if (this.editor) this.editor.chain().focus().toggleStrike().run() }
  toggleCode() { if (this.editor) this.editor.chain().focus().toggleCode().run() }
  toggleCodeBlock() { if (this.editor) this.editor.chain().focus().toggleCodeBlock().run() }
  toggleH1() { if (this.editor) this.editor.chain().focus().toggleHeading({ level: 1 }).run() }
  toggleH2() { if (this.editor) this.editor.chain().focus().toggleHeading({ level: 2 }).run() }
  toggleH3() { if (this.editor) this.editor.chain().focus().toggleHeading({ level: 3 }).run() }
  setParagraph() { if (this.editor) this.editor.chain().focus().setParagraph().run() }
  toggleBulletList() { if (this.editor) this.editor.chain().focus().toggleBulletList().run() }
  toggleOrderedList() { if (this.editor) this.editor.chain().focus().toggleOrderedList().run() }
  toggleTaskList() { if (this.editor) this.editor.chain().focus().toggleTaskList().run() }
  toggleBlockquote() { if (this.editor) this.editor.chain().focus().toggleBlockquote().run() }
  setHorizontalRule() { if (this.editor) this.editor.chain().focus().setHorizontalRule().run() }

  setFontFamily(event) {
    const font = event.target.value
    if (!this.editor || !font) return
    const mainEl = this.element.querySelector('.prose')
    if (mainEl) {
      mainEl.style.fontFamily = font
    }
  }

  setFontSize(event) {
    const size = event.target.value
    if (!this.editor || !size) return
    const mainEl = this.element.querySelector('.prose')
    if (mainEl) {
      mainEl.style.fontSize = size
      const pElements = mainEl.querySelectorAll('p, li, blockquote')
      pElements.forEach(el => {
        el.style.fontSize = size
      })
    }
  }

  setLink() {
    if (!this.editor) return
    const previousUrl = this.editor.getAttributes('link').href
    const url = window.prompt('URL do Link:', previousUrl)

    if (url === null) return
    if (url === '') {
      this.editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  updateStats() {
    if (!this.editor) return
    const text = this.editor.state.doc.textContent || ''
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200))

    if (this.hasWordCountTarget) {
      this.wordCountTarget.textContent = `${words} palavras`
    }
    if (this.hasReadingTimeTarget) {
      this.readingTimeTarget.textContent = `${readingTimeMinutes} min de leitura`
    }
    if (this.hasCharCountTarget) {
      this.charCountTarget.textContent = `${chars} caracteres`
    }

    const liveStatsWord = document.getElementById('live-stats-words')
    if (liveStatsWord) liveStatsWord.textContent = `${words} palavras`

    const liveStatsRead = document.getElementById('live-stats-read')
    if (liveStatsRead) liveStatsRead.textContent = `${readingTimeMinutes} min leitura`

    const wordModeWords = document.getElementById('word-mode-stats-words')
    if (wordModeWords) wordModeWords.textContent = `${words.toLocaleString('pt-BR')} palavras`
  }

  updateToc() {
    if (!this.editor) return

    const headings = []
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs.level,
          text: node.textContent.trim(),
          pos: pos
        })
      }
    })

    const tocContainer = document.getElementById('document-toc')
    if (tocContainer) {
      if (headings.length === 0) {
        tocContainer.innerHTML = `
          <div class="px-3 py-4 rounded-xl border border-dashed border-ink/10 dark:border-white/10 text-center">
            <p class="text-xs text-ink-light/70 dark:text-white/40 mb-1 font-medium">Nenhum título no documento</p>
            <p class="text-[11px] text-ink-light/50 dark:text-white/30">Use H1, H2 ou H3 para estruturar o índice automaticamente.</p>
          </div>
        `
      } else {
        const html = headings.map((h) => {
          const padding = (h.level - 1) * 10
          const icon = h.level === 1 ? 'H1' : (h.level === 2 ? 'H2' : 'H3')
          const tagColor = h.level === 1 ? 'text-terracotta font-semibold' : 'text-ink-light/70 dark:text-white/50'
          
          return `
            <button type="button" 
                    data-action="click->tiptap#scrollToHeading" 
                    data-heading-pos="${h.pos}" 
                    class="group w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-ink-light dark:text-white/70 hover:text-ink dark:hover:text-fable cursor-pointer transition-all text-[13px]" 
                    style="padding-left: ${padding + 8}px">
              <span class="text-[10px] font-mono shrink-0 px-1 py-0.5 rounded bg-ink/5 dark:bg-white/5 ${tagColor}">${icon}</span>
              <span class="truncate flex-1 group-hover:translate-x-0.5 transition-transform">${h.text || 'Título sem nome'}</span>
            </button>
          `
        }).join('')

        tocContainer.innerHTML = `<div class="space-y-0.5">${html}</div>`
      }
    }

    this.updateWordToc(headings)
  }

  updateWordToc(headings) {
    const container = document.getElementById('word-mode-toc')
    if (!container) return

    if (headings.length === 0) {
      container.innerHTML = `
        <div class="px-3 py-6 text-center text-ink-light/50 dark:text-white/40 italic">
          <p class="text-xs">Nenhum título encontrado</p>
          <p class="text-[10px] text-ink-light/40 dark:text-white/30 mt-1">Adicione títulos H1, H2 ou H3 no documento</p>
        </div>
      `
      return
    }

    const html = headings.map((h, index) => {
      const paddingLeft = (h.level - 1) * 12 + 6
      const chevron = h.level === 1 ? '<span class="text-ink-light/50 dark:text-white/40 mr-1.5 text-xs font-mono">›</span>' : '<span class="text-ink-light/30 dark:text-white/20 mr-1.5 text-xs font-mono">·</span>'
      const activeClass = index === 0 ? 'text-terracotta dark:text-blue-400 font-semibold bg-terracotta/10 dark:bg-blue-500/10' : 'text-ink/80 dark:text-white/80 hover:text-ink dark:hover:text-white hover:bg-ink/5 dark:hover:bg-white/5'
      
      return `
        <button type="button" 
                data-action="click->tiptap#scrollToHeading" 
                data-heading-pos="${h.pos}" 
                class="word-toc-item w-full text-left flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-colors text-xs truncate ${activeClass}" 
                style="padding-left: ${paddingLeft}px"
                title="${h.text}">
          ${chevron}
          <span class="truncate">${h.text || 'Sem título'}</span>
        </button>
      `
    }).join('')

    container.innerHTML = `<div class="space-y-0.5">${html}</div>`
  }

  filterWordToc(event) {
    const query = (event.target.value || '').toLowerCase().trim()
    const items = document.querySelectorAll('#word-mode-toc .word-toc-item')
    items.forEach(item => {
      const text = item.textContent.toLowerCase()
      item.classList.toggle('hidden', query !== '' && !text.includes(query))
    })
  }

  scrollToHeading(event) {
    const pos = parseInt(event.currentTarget.dataset.headingPos, 10)
    if (isNaN(pos) || !this.editor) return
    
    this.editor.chain().focus().setTextSelection(pos).scrollIntoView().run()
  }

  updateToolbarStates() {
    if (!this.editor) return

    const updateInContainer = (container) => {
      if (!container) return
      const btns = container.querySelectorAll('button')
      btns.forEach(btn => {
        const action = btn.dataset.action?.split('#')[1]
        if (!action) return

        let isActive = false
        
        switch(action) {
          case 'toggleBold': isActive = this.editor.isActive('bold'); break;
          case 'toggleItalic': isActive = this.editor.isActive('italic'); break;
          case 'toggleStrike': isActive = this.editor.isActive('strike'); break;
          case 'toggleCode': isActive = this.editor.isActive('code'); break;
          case 'toggleCodeBlock': isActive = this.editor.isActive('codeBlock'); break;
          case 'toggleH1': isActive = this.editor.isActive('heading', { level: 1 }); break;
          case 'toggleH2': isActive = this.editor.isActive('heading', { level: 2 }); break;
          case 'toggleH3': isActive = this.editor.isActive('heading', { level: 3 }); break;
          case 'toggleBulletList': isActive = this.editor.isActive('bulletList'); break;
          case 'toggleOrderedList': isActive = this.editor.isActive('orderedList'); break;
          case 'toggleTaskList': isActive = this.editor.isActive('taskList'); break;
          case 'toggleBlockquote': isActive = this.editor.isActive('blockquote'); break;
        }

        if (isActive) {
          btn.classList.add('bg-ink/10', 'dark:bg-white/15', 'text-ink', 'dark:text-white', 'font-semibold')
          btn.classList.remove('text-ink-light', 'dark:text-white/60')
        } else {
          btn.classList.remove('bg-ink/10', 'dark:bg-white/15', 'text-ink', 'dark:text-white', 'font-semibold')
          btn.classList.add('text-ink-light', 'dark:text-white/60')
        }
      })
    }

    if (this.hasToolbarTarget) updateInContainer(this.toolbarTarget)
    if (this.hasBubbleMenuTarget) updateInContainer(this.bubbleMenuTarget)
  }

  disconnect() {
    document.removeEventListener('click', this.handleDocClick)
    if (this.editor) this.editor.destroy()
  }
}
