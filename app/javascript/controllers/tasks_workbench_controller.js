import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "viewKanban", "viewList", "viewTimeline", "viewBtn",
    "filterBtn", "kanbanCard", "listRow", "timelineRow",
    "drawer", "drawerId", "drawerTitle", "drawerDoc",
    "drawerProgressLabel", "drawerProgressBar", "drawerCheck",
    "teamBtn", "teamContent", "interactiveCard", "doneCol"
  ]

  connect() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
    document.addEventListener("keydown", this.handleKeyDown)
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown(event) {
    if (event.key === "Escape") {
      this.closeDrawer()
    }
  }

  // 1. View Switching Logic (Kanban vs List vs Timeline)
  switchView(event) {
    const viewName = event.currentTarget.dataset.view
    
    this.viewBtnTargets.forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.className = "view-toggle-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-semibold rounded shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      } else {
        btn.className = "view-toggle-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      }
    })

    if (this.hasViewKanbanTarget) {
      if (viewName === "kanban") {
        this.viewKanbanTarget.classList.remove("hidden")
        this.viewKanbanTarget.classList.add("animate-pop-in")
      } else {
        this.viewKanbanTarget.classList.add("hidden")
      }
    }

    if (this.hasViewListTarget) {
      if (viewName === "list") {
        this.viewListTarget.classList.remove("hidden")
        this.viewListTarget.classList.add("animate-pop-in")
      } else {
        this.viewListTarget.classList.add("hidden")
      }
    }

    if (this.hasViewTimelineTarget) {
      if (viewName === "timeline") {
        this.viewTimelineTarget.classList.remove("hidden")
        this.viewTimelineTarget.classList.add("animate-pop-in")
      } else {
        this.viewTimelineTarget.classList.add("hidden")
      }
    }
  }

  // 2. Filter Logic (All / Urgent / With Docs)
  filterTasks(event) {
    const filterType = event.currentTarget.dataset.filter

    this.filterBtnTargets.forEach(btn => {
      if (btn.dataset.filter === filterType) {
        btn.className = "filter-btn px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider bg-ink/10 dark:bg-white/10 text-ink dark:text-white font-bold rounded border border-ink/20 dark:border-white/20 transition-all cursor-pointer"
      } else {
        btn.className = "filter-btn px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-white/40 hover:text-ink dark:hover:text-white transition-all cursor-pointer"
      }
    })

    // Kanban Cards
    this.kanbanCardTargets.forEach(card => {
      const matches = (filterType === "all") ||
                      (filterType === "urgent" && card.dataset.priority === "urgent") ||
                      (filterType === "docs" && card.dataset.hasDoc === "true")
      if (matches) {
        card.classList.remove("hidden")
        card.classList.add("animate-pop-in")
      } else {
        card.classList.add("hidden")
        card.classList.remove("animate-pop-in")
      }
    })

    // List Rows
    this.listRowTargets.forEach(row => {
      const matches = (filterType === "all") ||
                      (filterType === "urgent" && row.dataset.priority === "urgent") ||
                      (filterType === "docs" && row.dataset.hasDoc === "true")
      if (matches) {
        row.classList.remove("hidden")
        row.classList.add("animate-pop-in")
      } else {
        row.classList.add("hidden")
        row.classList.remove("animate-pop-in")
      }
    })

    // Timeline Rows
    this.timelineRowTargets.forEach(track => {
      const matches = (filterType === "all") ||
                      (filterType === "urgent" && track.dataset.priority === "urgent") ||
                      (filterType === "docs" && track.dataset.hasDoc === "true")
      if (matches) {
        track.classList.remove("opacity-25")
        track.classList.add("opacity-100")
      } else {
        track.classList.add("opacity-25")
        track.classList.remove("opacity-100")
      }
    })
  }

  // 3. Task Drawer Slide-over
  openDrawer(event) {
    const el = event.currentTarget
    const taskId = el.dataset.taskId || "#T-104"
    const title = el.dataset.title || "Tarefa Selecionada"
    const docLink = el.dataset.docLink || "Nenhum documento vinculado"

    if (this.hasDrawerIdTarget) this.drawerIdTarget.innerText = taskId
    if (this.hasDrawerTitleTarget) this.drawerTitleTarget.innerText = title
    if (this.hasDrawerDocTarget) this.drawerDocTarget.innerText = docLink

    if (this.hasDrawerTarget) {
      this.drawerTarget.classList.remove("hidden")
    }
  }

  closeDrawer() {
    if (this.hasDrawerTarget) {
      this.drawerTarget.classList.add("hidden")
    }
  }

  // 4. Checklist Progress Inside Drawer
  toggleDrawerCheck() {
    const checks = this.drawerCheckTargets
    let completed = 0
    checks.forEach(c => { if (c.checked) completed++ })

    const pct = checks.length > 0 ? Math.round((completed / checks.length) * 100) : 0
    if (this.hasDrawerProgressLabelTarget) {
      this.drawerProgressLabelTarget.innerText = `${completed}/${checks.length} (${pct}%)`
    }
    if (this.hasDrawerProgressBarTarget) {
      this.drawerProgressBarTarget.style.width = `${pct}%`
    }
  }

  // 5. Move Sample Card to Done Column
  moveSampleCard(event) {
    if (event) event.stopPropagation()

    if (this.hasInteractiveCardTarget && this.hasDoneColTarget) {
      this.doneColTarget.prepend(this.interactiveCardTarget)
      this.interactiveCardTarget.classList.add("animate-pop-in", "border-sage")
      const badge = this.interactiveCardTarget.querySelector(".status-badge")
      if (badge) {
        badge.className = "status-badge inline-flex items-center gap-1 text-[9px] font-mono tracking-wider bg-sage/20 text-sage px-2 py-0.5 rounded font-bold uppercase"
        badge.innerHTML = "✓ CONCLUÍDO"
      }
    }
  }

  // 6. Workflow Specialty Team Tabs
  switchWorkflowTeam(event) {
    const team = event.currentTarget.dataset.team

    this.teamBtnTargets.forEach(btn => {
      if (btn.dataset.team === team) {
        btn.className = "team-tab-btn px-4 py-2 font-mono text-xs uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-bold rounded shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      } else {
        btn.className = "team-tab-btn px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      }
    })

    this.teamContentTargets.forEach(content => {
      if (content.id === `workflow-${team}`) {
        content.classList.remove("hidden")
        content.classList.add("animate-pop-in")
      } else {
        content.classList.add("hidden")
        content.classList.remove("animate-pop-in")
      }
    })
  }
}
