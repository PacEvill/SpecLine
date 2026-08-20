import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["treeContainer", "filterInput", "node", "childrenContainer", "toggleIcon", "dropRootZone", "moveModal"]
  static values = {
    workspaceId: Number,
    projectId: Number,
    currentDocumentId: Number
  }

  connect() {
    this.restoreCollapsedState()
    this.hoverExpandTimer = null
    this.currentDraggedId = null
    this.activeMoveDocId = null
    this.scrollInterval = null

    this.handleKeyDown = this.handleKeyDown.bind(this)
    document.addEventListener("keydown", this.handleKeyDown)
  }

  disconnect() {
    if (this.hoverExpandTimer) clearTimeout(this.hoverExpandTimer)
    if (this.scrollInterval) clearInterval(this.scrollInterval)
    document.removeEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown(event) {
    if (event.key === "Escape") {
      this.closeMoveModal()
    }
  }

  // =========================================================================
  // TREE FOLDER EXPAND / COLLAPSE
  // =========================================================================

  toggleNode(event) {
    event.stopPropagation()
    const target = event.currentTarget
    const docId = target.dataset.docId
    this.toggleFolderById(docId)
  }

  toggleFolderById(docId, forceState = null) {
    const container = this.element.querySelector(`[data-children-for="${docId}"]`)
    const iconWrapper = this.element.querySelector(`[data-doc-id="${docId}"] svg`)

    if (!container) return

    const shouldCollapse = forceState !== null ? forceState : !container.classList.contains('hidden')
    
    if (shouldCollapse) {
      container.classList.add('hidden')
      if (iconWrapper) iconWrapper.style.transform = 'rotate(0deg)'
      localStorage.setItem(`doc_tree_collapsed_${this.projectIdValue}_${docId}`, 'true')
    } else {
      container.classList.remove('hidden')
      if (iconWrapper) iconWrapper.style.transform = 'rotate(90deg)'
      localStorage.removeItem(`doc_tree_collapsed_${this.projectIdValue}_${docId}`)
    }
  }

  restoreCollapsedState() {
    this.element.querySelectorAll('[data-children-for]').forEach(container => {
      const docId = container.dataset.childrenFor
      const key = `doc_tree_collapsed_${this.projectIdValue}_${docId}`
      const isCollapsed = localStorage.getItem(key) === 'true'
      this.toggleFolderById(docId, isCollapsed)
    })
  }

  // Quick live search / filter in document tree sidebar
  filter(event) {
    const query = event.target.value.toLowerCase().trim()
    const items = this.element.querySelectorAll('[data-doc-title]')

    items.forEach(item => {
      const title = item.dataset.docTitle.toLowerCase()
      const matches = title.includes(query)
      const wrapper = item.closest('.tree-node-wrapper')
      if (wrapper) {
        wrapper.style.display = matches || query === '' ? '' : 'none'
      }
    })
  }

  // =========================================================================
  // PRECISION DRAG & DROP ENGINE (VS CODE / NOTION CALIBER)
  // =========================================================================

  dragStart(event) {
    const nodeEl = event.currentTarget
    const docId = nodeEl.dataset.nodeId
    const isFolder = nodeEl.dataset.isFolder === 'true'
    const parentId = nodeEl.dataset.parentId || ''

    this.currentDraggedId = docId

    event.dataTransfer.setData('application/json', JSON.stringify({
      id: docId,
      isFolder: isFolder,
      parentId: parentId
    }))
    event.dataTransfer.setData('text/plain', docId)
    event.dataTransfer.effectAllowed = 'move'
    
    // Tactile visual feedback on dragged item
    nodeEl.classList.add('opacity-40', 'scale-[0.98]', 'ring-2', 'ring-terracotta/50', 'bg-terracotta/10')

    // Disable dropping on descendants of the dragged item
    const subtree = this.element.querySelector(`[data-children-for="${docId}"]`)
    if (subtree) {
      subtree.querySelectorAll('[data-node-id]').forEach(childNode => {
        childNode.classList.add('opacity-40', 'pointer-events-none')
      })
    }

    // Show root dropzones (top and bottom) with smooth reveal
    this.element.querySelectorAll('[data-document-tree-target="dropRootZone"]').forEach(zone => {
      zone.classList.remove('hidden')
      zone.classList.add('animate-[scale-in_0.15s_ease-out_forwards]')
    })
  }

  dragEnd(event) {
    const nodeEl = event.currentTarget
    nodeEl.classList.remove('opacity-40', 'scale-[0.98]', 'ring-2', 'ring-terracotta/50', 'bg-terracotta/10')
    
    // Re-enable all subtree nodes
    this.element.querySelectorAll('.pointer-events-none').forEach(el => {
      el.classList.remove('pointer-events-none', 'opacity-40')
    })

    // Hide root dropzones
    this.element.querySelectorAll('[data-document-tree-target="dropRootZone"]').forEach(zone => {
      zone.classList.add('hidden')
      zone.classList.remove('animate-[scale-in_0.15s_ease-out_forwards]')
    })

    this.clearDragOverStyles()
    this.currentDraggedId = null

    if (this.hoverExpandTimer) {
      clearTimeout(this.hoverExpandTimer)
      this.hoverExpandTimer = null
    }

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval)
      this.scrollInterval = null
    }
  }

  dragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'

    const targetNode = event.currentTarget
    const targetId = targetNode.dataset.nodeId

    // Cannot drop on itself
    if (this.currentDraggedId && this.currentDraggedId.toString() === targetId?.toString()) {
      return
    }

    // Handle auto-scrolling sidebar when dragging near edges
    this.handleAutoScroll(event)
    
    const rect = targetNode.getBoundingClientRect()
    const relativeY = event.clientY - rect.top
    const height = rect.height

    this.clearDragOverStyles(targetNode)

    // Top 25%: Drop BEFORE (sibling)
    if (relativeY < height * 0.25) {
      targetNode.classList.add('drop-indicator-top')
      targetNode.dataset.dropMode = 'before'
    } 
    // Bottom 25%: Drop AFTER (sibling)
    else if (relativeY > height * 0.75) {
      targetNode.classList.add('drop-indicator-bottom')
      targetNode.dataset.dropMode = 'after'
    } 
    // Middle 50%: Drop INSIDE (nest inside folder or document)
    else {
      targetNode.classList.add('drop-indicator-inside')
      targetNode.dataset.dropMode = 'inside'

      // Auto-expand closed container on hover after 350ms (VS Code behavior)
      if (!this.hoverExpandTimer && targetId) {
        const container = this.element.querySelector(`[data-children-for="${targetId}"]`)
        if (container && container.classList.contains('hidden')) {
          this.hoverExpandTimer = setTimeout(() => {
            this.toggleFolderById(targetId, false)
            this.hoverExpandTimer = null
          }, 350)
        }
      }
    }
  }

  dragLeave(event) {
    const targetNode = event.currentTarget
    if (event.relatedTarget && targetNode.contains(event.relatedTarget)) {
      return
    }

    this.clearNodeStyles(targetNode)
    if (this.hoverExpandTimer) {
      clearTimeout(this.hoverExpandTimer)
      this.hoverExpandTimer = null
    }
  }

  async drop(event) {
    event.preventDefault()
    event.stopPropagation()
    
    if (this.hoverExpandTimer) {
      clearTimeout(this.hoverExpandTimer)
      this.hoverExpandTimer = null
    }

    const targetNode = event.currentTarget
    const dropMode = targetNode.dataset.dropMode || 'inside'
    this.clearDragOverStyles()

    let dragData = null
    try {
      dragData = JSON.parse(event.dataTransfer.getData('application/json'))
    } catch {
      const rawId = event.dataTransfer.getData('text/plain')
      if (rawId) dragData = { id: rawId }
    }

    if (!dragData || !dragData.id) return

    const draggedDocId = dragData.id
    const targetDocId = targetNode.dataset.nodeId
    const targetParentId = targetNode.dataset.parentId || null
    const targetPosition = parseInt(targetNode.dataset.position || '0', 10)

    if (draggedDocId.toString() === targetDocId?.toString()) return

    let newParentId = null
    let newPosition = 0

    if (dropMode === 'inside') {
      newParentId = targetDocId
      newPosition = 0
    } else if (dropMode === 'before') {
      newParentId = targetParentId
      newPosition = Math.max(0, targetPosition - 1)
    } else if (dropMode === 'after') {
      newParentId = targetParentId
      newPosition = targetPosition + 1
    }

    await this.moveDocument(draggedDocId, newParentId, newPosition)
  }

  async dropOnRoot(event) {
    event.preventDefault()
    event.stopPropagation()
    this.clearDragOverStyles()

    let dragData = null
    try {
      dragData = JSON.parse(event.dataTransfer.getData('application/json'))
    } catch {
      const rawId = event.dataTransfer.getData('text/plain')
      if (rawId) dragData = { id: rawId }
    }

    if (!dragData || !dragData.id) return

    await this.moveDocument(dragData.id, null, 0)
  }

  // =========================================================================
  // BREADCRUMB DROP TARGET HANDLERS
  // =========================================================================

  dragOverBreadcrumb(event) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'
    event.currentTarget.classList.add('bg-terracotta/20', 'text-terracotta', 'ring-1', 'ring-terracotta/50')
  }

  dragLeaveBreadcrumb(event) {
    event.currentTarget.classList.remove('bg-terracotta/20', 'text-terracotta', 'ring-1', 'ring-terracotta/50')
  }

  async dropOnBreadcrumb(event) {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.classList.remove('bg-terracotta/20', 'text-terracotta', 'ring-1', 'ring-terracotta/50')

    const parentId = event.currentTarget.dataset.parentId || null
    let dragData = null
    try {
      dragData = JSON.parse(event.dataTransfer.getData('application/json'))
    } catch {
      const rawId = event.dataTransfer.getData('text/plain')
      if (rawId) dragData = { id: rawId }
    }

    if (!dragData || !dragData.id) return
    await this.moveDocument(dragData.id, parentId, 0)
  }

  clearDragOverStyles(exceptNode = null) {
    this.element.querySelectorAll('[data-node-id], [data-document-tree-target="dropRootZone"]').forEach(el => {
      if (el !== exceptNode) {
        this.clearNodeStyles(el)
      }
    })
  }

  clearNodeStyles(el) {
    el.classList.remove('drop-indicator-top', 'drop-indicator-bottom', 'drop-indicator-inside')
    delete el.dataset.dropMode
  }

  handleAutoScroll(event) {
    const scrollContainer = this.element.closest('.overflow-y-auto') || document.querySelector('#document-right-sidebar .overflow-y-auto')
    if (!scrollContainer) return

    const rect = scrollContainer.getBoundingClientRect()
    const edgeThreshold = 45
    const scrollSpeed = 8

    if (event.clientY < rect.top + edgeThreshold) {
      scrollContainer.scrollTop -= scrollSpeed
    } else if (event.clientY > rect.bottom - edgeThreshold) {
      scrollContainer.scrollTop += scrollSpeed
    }
  }

  // =========================================================================
  // "MOVER PARA..." INTERACTIVE MODAL SYSTEM
  // =========================================================================

  openMoveModal(event) {
    event?.preventDefault()
    // Default to the current open document ID or tree document
    const currentDoc = this.element.querySelector('[data-doc-id]')
    const docId = this.hasCurrentDocumentIdValue ? this.currentDocumentIdValue : (currentDoc?.dataset.docId || null)
    this.openMoveModalForDoc(docId, "Documento Atual")
  }

  openMoveModalFor(event) {
    event?.preventDefault()
    event?.stopPropagation()
    const target = event.currentTarget
    const docId = target.dataset.docId
    const docTitle = target.dataset.docTitle || "Item Selecionado"
    this.openMoveModalForDoc(docId, docTitle)
  }

  openMoveModalForDoc(docId, docTitle) {
    this.activeMoveDocId = docId
    const modal = document.getElementById('move-document-modal')
    if (!modal) return

    // Update active label in modal
    const nameEl = document.getElementById('move-modal-active-name')
    if (nameEl && docTitle) {
      nameEl.textContent = docTitle
    }

    // Reset and enable destinations
    modal.querySelectorAll('.move-destination-btn').forEach(btn => {
      btn.removeAttribute('disabled')
      btn.classList.remove('opacity-30', 'pointer-events-none', 'bg-terracotta/10')
      btn.closest('.destination-node-wrapper')?.classList.remove('opacity-30', 'pointer-events-none')
    })

    // Disable self and descendants as invalid destinations
    if (docId) {
      const selfDestination = modal.querySelector(`[data-destination-id="${docId}"]`)
      if (selfDestination) {
        selfDestination.classList.add('opacity-30', 'pointer-events-none')
      }

      // Disable any descendant nodes in tree
      const treeSubtree = this.element.querySelector(`[data-children-for="${docId}"]`)
      if (treeSubtree) {
        treeSubtree.querySelectorAll('[data-node-id]').forEach(childNode => {
          const childId = childNode.dataset.nodeId
          const childDest = modal.querySelector(`[data-destination-id="${childId}"]`)
          if (childDest) {
            childDest.classList.add('opacity-30', 'pointer-events-none')
          }
        })
      }
    }

    // Clear search input
    const filterInput = document.getElementById('move-modal-filter-input')
    if (filterInput) {
      filterInput.value = ''
      this.filterMoveDestinations({ target: filterInput })
    }

    modal.classList.remove('hidden')
    modal.classList.add('flex')

    // Auto-focus search input
    setTimeout(() => {
      filterInput?.focus()
    }, 50)
  }

  closeMoveModal(event) {
    event?.preventDefault()
    const modal = document.getElementById('move-document-modal')
    if (modal) {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
    }
    this.activeMoveDocId = null
  }

  closeMoveModalBackground(event) {
    if (event.target.id === 'move-document-modal') {
      this.closeMoveModal()
    }
  }

  filterMoveDestinations(event) {
    const query = event.target.value.toLowerCase().trim()
    const modal = document.getElementById('move-document-modal')
    if (!modal) return

    modal.querySelectorAll('.destination-node-wrapper').forEach(wrapper => {
      const title = wrapper.dataset.destinationTitle || ''
      const matches = title.includes(query)
      wrapper.style.display = matches || query === '' ? '' : 'none'
    })
  }

  async selectMoveDestination(event) {
    event.preventDefault()
    const btn = event.currentTarget
    const targetParentId = btn.dataset.parentId || null
    const docId = this.activeMoveDocId || (this.hasCurrentDocumentIdValue ? this.currentDocumentIdValue : null)

    if (!docId) {
      this.closeMoveModal()
      return
    }

    // Visual button loading state
    const originalText = btn.innerHTML
    btn.innerHTML = `<span class="text-xs text-terracotta font-medium flex items-center gap-2"><svg class="animate-spin h-3.5 w-3.5 text-terracotta" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Movendo...</span>`

    this.closeMoveModal()
    await this.moveDocument(docId, targetParentId, 0)
  }

  // =========================================================================
  // CORE API MOVE CALL & SMOOTH FEEDBACK
  // =========================================================================

  async moveDocument(documentId, newParentId, position = 0) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
    const moveUrl = `/workspaces/${this.workspaceIdValue}/projects/${this.projectIdValue}/documents/${documentId}/move`

    try {
      const response = await fetch(moveUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          parent_id: newParentId,
          position: position
        })
      })

      if (response.ok) {
        // If moved into a parent (folder or document), ensure that parent is expanded in tree
        if (newParentId) {
          localStorage.removeItem(`doc_tree_collapsed_${this.projectIdValue}_${newParentId}`)
        }
        
        this.showToast("Item transferido com sucesso!", "success")
        
        setTimeout(() => {
          window.location.reload()
        }, 300)
      } else {
        const data = await response.json()
        this.showToast(data.message || "Não foi possível mover o documento.", "error")
      }
    } catch (err) {
      console.error("Error moving document:", err)
      this.showToast("Erro ao conectar com o servidor.", "error")
    }
  }

  showToast(message, type = "success") {
    // Remove existing toast if any
    document.getElementById('specline-floating-toast')?.remove()

    const toast = document.createElement('div')
    toast.id = 'specline-floating-toast'
    toast.className = `fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl transition-all duration-300 transform scale-95 opacity-0 animate-[scale-in_0.2s_ease-out_forwards] ${
      type === 'success' 
        ? 'bg-ink/95 dark:bg-fable text-white dark:text-ink border-white/10 dark:border-ink/10' 
        : 'bg-red-600 text-white border-red-700'
    }`

    const icon = type === 'success'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-400 dark:text-emerald-600 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`

    toast.innerHTML = `
      ${icon}
      <span class="text-xs font-medium">${message}</span>
    `

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add('opacity-0', 'scale-90')
      setTimeout(() => toast.remove(), 300)
    }, 2800)
  }
}

