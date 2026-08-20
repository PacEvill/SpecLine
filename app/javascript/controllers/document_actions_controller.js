import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["coverContainer", "coverInput", "coverPicker", "copyButton", "rightSidebar", "zenButton", "sidebarToggleBtn"]

  connect() {
    this.updateCoverDisplay()
    this.restoreSidebarState()
    
    this.handleKeyDown = this.handleKeyDown.bind(this)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  disconnect() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown(event) {
    if (event.key === "Escape" && document.body.classList.contains('zen-mode-active')) {
      this.toggleZenMode()
    }
  }

  updateCoverDisplay() {
    if (!this.hasCoverInputTarget || !this.hasCoverContainerTarget) return
    const coverUrl = this.coverInputTarget.value

    if (coverUrl && coverUrl.trim() !== '') {
      this.coverContainerTarget.style.display = 'block'
      this.coverContainerTarget.style.background = coverUrl
      this.coverContainerTarget.style.backgroundSize = 'cover'
      this.coverContainerTarget.style.backgroundPosition = 'center'
    } else {
      this.coverContainerTarget.style.display = 'none'
    }
  }

  toggleCoverPicker() {
    if (this.hasCoverPickerTarget) {
      this.coverPickerTarget.classList.toggle('hidden')
    }
  }

  setPresetCover(event) {
    const gradient = event.currentTarget.dataset.gradient
    if (this.hasCoverInputTarget) {
      this.coverInputTarget.value = gradient
      this.coverInputTarget.dispatchEvent(new Event('input', { bubbles: true }))
      this.updateCoverDisplay()
      this.closeCoverPicker()
    }
  }

  removeCover() {
    if (this.hasCoverInputTarget) {
      this.coverInputTarget.value = ''
      this.coverInputTarget.dispatchEvent(new Event('input', { bubbles: true }))
      this.updateCoverDisplay()
      this.closeCoverPicker()
    }
  }

  closeCoverPicker() {
    if (this.hasCoverPickerTarget) {
      this.coverPickerTarget.classList.add('hidden')
    }
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (this.hasCopyButtonTarget) {
        const originalHtml = this.copyButtonTarget.innerHTML
        this.copyButtonTarget.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span class="text-emerald-500 font-medium">Copiado!</span>
        `
        setTimeout(() => {
          this.copyButtonTarget.innerHTML = originalHtml
        }, 2000)
      }
    })
  }

  toggleZenMode() {
    const isZen = document.body.classList.toggle('zen-mode-active')

    if (this.hasZenButtonTarget) {
      this.zenButtonTarget.classList.toggle('text-terracotta', isZen)
      this.zenButtonTarget.classList.toggle('bg-terracotta/15', isZen)
      this.zenButtonTarget.classList.toggle('ring-1', isZen)
      this.zenButtonTarget.classList.toggle('ring-terracotta/40', isZen)
    }
  }

  toggleRightSidebar() {
    const rightSidebar = document.getElementById('document-right-sidebar')
    if (!rightSidebar) return

    rightSidebar.classList.toggle('is-collapsed')
    const isCollapsed = rightSidebar.classList.contains('is-collapsed')
    
    if (isCollapsed) {
      localStorage.setItem('doc_right_sidebar_collapsed', 'true')
    } else {
      localStorage.removeItem('doc_right_sidebar_collapsed')
    }
    this.updateSidebarButtons(!isCollapsed)
  }

  restoreSidebarState() {
    const isCollapsed = localStorage.getItem('doc_right_sidebar_collapsed') === 'true'
    const rightSidebar = document.getElementById('document-right-sidebar')
    if (rightSidebar && isCollapsed) {
      rightSidebar.classList.add('is-collapsed')
    }
    this.updateSidebarButtons(!isCollapsed)
  }

  updateSidebarButtons(isOpen) {
    if (this.hasSidebarToggleBtnTarget) {
      this.sidebarToggleBtnTargets.forEach(btn => {
        btn.classList.toggle('text-terracotta', isOpen)
        btn.classList.toggle('bg-terracotta/10', isOpen)
        btn.classList.toggle('dark:bg-terracotta/20', isOpen)
      })
    }
  }
}
