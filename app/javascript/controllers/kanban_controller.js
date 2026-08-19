import { Controller } from "@hotwired/stimulus"
import Sortable from "sortablejs"

export default class extends Controller {
  static targets = ["list", "card", "board", "column"]
  static values = {
    moveUrl: String
  }

  connect() {
    this.initSortable()
    this.initColumnSortable()
  }

  initSortable() {
    this.listTargets.forEach((list) => {
      new Sortable(list, {
        group: 'shared', // set both lists to same group
        animation: 150,
        ghostClass: 'opacity-50',
        dragClass: 'rotate-2',
        fallbackTolerance: 3, // Permite mover o mouse 3px sem iniciar o drag (ajuda no click de links)
        filter: "a, button", // Evita drag se o usuário clicar no link
        preventOnFilter: false, // Permite o evento de click disparar no link
        onEnd: this.onDrop.bind(this)
      })
    })
  }

  initColumnSortable() {
    if (this.hasBoardTarget) {
      new Sortable(this.boardTarget, {
        group: 'columns',
        animation: 150,
        ghostClass: 'opacity-50',
        dragClass: 'rotate-1',
        handle: '.column-drag-handle', // Define que só o header arrasta a coluna
        filter: "a, button, details", // Evita que clicks em menus dropdown da coluna iniciem drag
        onEnd: this.onColumnDrop.bind(this)
      })
    }
  }

  async onColumnDrop(event) {
    const item = event.item
    const statusId = item.dataset.statusId
    const newIndex = event.newIndex

    const formData = new FormData()
    formData.append("position", newIndex)
    
    const token = document.querySelector('meta[name="csrf-token"]').content

    try {
      const response = await fetch(`${this.moveUrlValue}/issue_statuses/${statusId}/move`, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": token
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("Failed to move column")
      }
    } catch (error) {
      console.error(error)
      window.location.reload()
    }
  }

  async onDrop(event) {
    const item = event.item
    const issueId = item.dataset.issueId
    const newStatusId = event.to.dataset.statusId
    
    // Find previous and next cards in the new list to calculate position
    // Since we don't have LexoRank implemented yet, we'll just send the order position and server handles it
    const newIndex = event.newIndex

    const formData = new FormData()
    formData.append("status_id", newStatusId)
    formData.append("position", newIndex)
    
    // Se tiver agrupado por assignee, o list terá um dataset assigneeId
    const newAssigneeId = event.to.dataset.assigneeId
    if (newAssigneeId !== undefined) {
      formData.append("assignee_id", newAssigneeId)
    }

    // Se tiver agrupado por board, o list terá um dataset boardId
    const newBoardId = event.to.dataset.boardId
    if (newBoardId !== undefined) {
      formData.append("board_id", newBoardId)
    }

    // Se estiver movendo para outro projeto
    const newProjectId = event.to.dataset.projectId
    if (newProjectId !== undefined) {
      formData.append("new_project_id", newProjectId)
    }
    
    // CSRF token
    const token = document.querySelector('meta[name="csrf-token"]').content

    try {
      const response = await fetch(`${this.moveUrlValue}/issues/${issueId}/move`, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": token
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("Failed to move issue")
      }
      
      // Update badge count dynamically
      this.updateCounts()
    } catch (error) {
      console.error(error)
      // Revert move on failure (reload page for simplicity)
      window.location.reload()
    }
  }

  updateCounts() {
    // A simple implementation to update the counts in headers based on the cards in the DOM
    const columns = document.querySelectorAll('[data-kanban-target="column"]')
    columns.forEach(col => {
      const list = col.querySelector('[data-kanban-target="list"]')
      const countBadge = col.querySelector('span.rounded-full')
      if (list && countBadge) {
        const cards = list.querySelectorAll('[data-kanban-target="card"]')
        countBadge.textContent = cards.length
      }
    })
  }
}
