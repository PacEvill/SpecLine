import { Turbo } from "@hotwired/turbo-rails"
import "./controllers"

const customConfirm = (message, element) => {
  return new Promise((resolve) => {
    const isDestructive = element.hasAttribute('data-turbo-method') && element.getAttribute('data-turbo-method') === 'delete'
    const confirmText = element.getAttribute('data-confirm-text') || (isDestructive ? 'Excluir' : 'Confirmar')
    const cancelText = element.getAttribute('data-cancel-text') || 'Cancelar'
    
    // Create the backdrop
    const backdrop = document.createElement('div')
    backdrop.className = 'fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-200'
    
    // Create the modal container
    const modal = document.createElement('div')
    modal.className = 'bg-white dark:bg-ink-paper border border-ink/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-95 transition-transform duration-200'
    
    const buttonBg = isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-terracotta hover:bg-[#c26244]'
    
    modal.innerHTML = `
      <div class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div class="w-12 h-12 rounded-full ${isDestructive ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-ink/5 dark:bg-white/10 text-ink dark:text-fable'} flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            ${isDestructive 
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'}
          </div>
          <div class="mt-2 sm:mt-0">
            <h3 class="text-xl font-serif font-medium text-ink dark:text-fable mb-2">Confirmação Necessária</h3>
            <p class="text-sm text-ink-light dark:text-white/60 leading-relaxed">${message}</p>
          </div>
        </div>
      </div>
      <div class="bg-ink/[0.02] dark:bg-ink-darker px-6 py-4 border-t border-ink/5 dark:border-white/5 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
        <button id="turbo-confirm-cancel" class="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-ink-light dark:text-white/60 hover:text-ink dark:hover:text-fable hover:bg-ink/5 dark:hover:bg-white/5 transition-colors rounded-xl cursor-pointer">${cancelText}</button>
        <button id="turbo-confirm-accept" class="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white ${buttonBg} transition-colors rounded-xl shadow-sm cursor-pointer">${confirmText}</button>
      </div>
    `
    
    backdrop.appendChild(modal)
    document.body.appendChild(backdrop)
    
    // Trigger animations
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0')
      modal.classList.remove('scale-95')
    })
    
    const close = (result) => {
      backdrop.classList.add('opacity-0')
      modal.classList.add('scale-95')
      setTimeout(() => {
        backdrop.remove()
        resolve(result)
      }, 200)
    }
    
    backdrop.querySelector('#turbo-confirm-cancel').addEventListener('click', () => close(false))
    backdrop.querySelector('#turbo-confirm-accept').addEventListener('click', () => close(true))
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(false)
    })
  })
}

if (Turbo.config && Turbo.config.forms) {
  Turbo.config.forms.confirm = customConfirm
} else if (Turbo.setConfirmMethod) {
  Turbo.setConfirmMethod(customConfirm)
}
