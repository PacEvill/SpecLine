import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { delay: { type: Number, default: 800 } }

  connect() {
    this.save = this.save.bind(this)
    this.updateTitleHeight()
  }

  updateTitleHeight() {
    const titleInput = this.element.querySelector('textarea[name="document[title]"]')
    if (titleInput) {
      titleInput.style.height = 'auto'
      titleInput.style.height = `${titleInput.scrollHeight}px`
    }
  }

  schedule() {
    clearTimeout(this.timeout)
    const statusEl = document.getElementById("autosave-status")
    if (statusEl) {
      statusEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-light/60 dark:text-white/40"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Pendente...</span>`
    }
    
    this.timeout = setTimeout(this.save, this.delayValue)
  }

  async save() {
    const statusEl = document.getElementById("autosave-status")
    if (statusEl) {
      statusEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-light/60 dark:text-white/40"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>Salvando...</span>`
    }

    const form = this.element
    const formData = new FormData(form)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken
        }
      })
      
      if (response.ok) {
        if (statusEl) {
          statusEl.innerHTML = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>Salvo</span>`
        }
        
        // Update breadcrumb title if changed
        const titleVal = formData.get("document[title]")
        const breadcrumbTitle = document.getElementById("breadcrumb-document-title")
        if (breadcrumbTitle && titleVal) {
          breadcrumbTitle.textContent = titleVal
        }
      } else {
        if (statusEl) {
          statusEl.innerHTML = `<span class="text-[11px] font-medium text-red-500 dark:text-red-400">Falha ao salvar</span>`
        }
      }
    } catch(e) {
      if (statusEl) {
        statusEl.innerHTML = `<span class="text-[11px] font-medium text-amber-500">Erro de conexão</span>`
      }
    }
  }

  disconnect() {
    clearTimeout(this.timeout)
  }
}
