import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["gridButton", "listButton", "gridView", "listView"]

  connect() {
    const preferredView = localStorage.getItem("workspaceViewPreference") || "grid"
    this.setView(preferredView)
  }

  showGrid() {
    this.setView("grid")
    localStorage.setItem("workspaceViewPreference", "grid")
  }

  showList() {
    this.setView("list")
    localStorage.setItem("workspaceViewPreference", "list")
  }

  setView(view) {
    if (view === "grid") {
      this.gridViewTarget.classList.remove("hidden")
      this.listViewTarget.classList.add("hidden")
      
      this.gridButtonTarget.classList.add("text-terracotta", "bg-terracotta/10")
      this.gridButtonTarget.classList.remove("text-ink-light", "hover:text-ink", "hover:bg-ink/5")
      
      this.listButtonTarget.classList.remove("text-terracotta", "bg-terracotta/10")
      this.listButtonTarget.classList.add("text-ink-light", "hover:text-ink", "hover:bg-ink/5")
    } else {
      this.gridViewTarget.classList.add("hidden")
      this.listViewTarget.classList.remove("hidden")
      
      this.listButtonTarget.classList.add("text-terracotta", "bg-terracotta/10")
      this.listButtonTarget.classList.remove("text-ink-light", "hover:text-ink", "hover:bg-ink/5")
      
      this.gridButtonTarget.classList.remove("text-terracotta", "bg-terracotta/10")
      this.gridButtonTarget.classList.add("text-ink-light", "hover:text-ink", "hover:bg-ink/5")
    }
  }
}
