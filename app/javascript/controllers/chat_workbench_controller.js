import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "perspectiveBtn", "threadView", "channelView", "inboxView",
    "filterBtn", "chatBubble", "chatInput", "chatStream",
    "inboxItem", "inboxCount", "inboxEmpty", "toast"
  ]

  // 1. Perspective Switcher (Thread da Tarefa / Canal de Decisão / Inbox de Triagem)
  switchPerspective(event) {
    const perspective = event.currentTarget.dataset.view

    this.perspectiveBtnTargets.forEach(btn => {
      if (btn.dataset.view === perspective) {
        btn.className = "chat-view-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-semibold rounded shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      } else {
        btn.className = "chat-view-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      }
    })

    if (this.hasThreadViewTarget) {
      if (perspective === "thread") {
        this.threadViewTarget.classList.remove("hidden")
        this.threadViewTarget.classList.add("animate-pop-in")
      } else {
        this.threadViewTarget.classList.add("hidden")
      }
    }

    if (this.hasChannelViewTarget) {
      if (perspective === "channel") {
        this.channelViewTarget.classList.remove("hidden")
        this.channelViewTarget.classList.add("animate-pop-in")
      } else {
        this.channelViewTarget.classList.add("hidden")
      }
    }

    if (this.hasInboxViewTarget) {
      if (perspective === "inbox") {
        this.inboxViewTarget.classList.remove("hidden")
        this.inboxViewTarget.classList.add("animate-pop-in")
      } else {
        this.inboxViewTarget.classList.add("hidden")
      }
    }
  }

  // 2. Filter Messages (All / Decisions / Code & PRs)
  filterChat(event) {
    const filterType = event.currentTarget.dataset.filter

    this.filterBtnTargets.forEach(btn => {
      if (btn.dataset.filter === filterType) {
        btn.className = "chat-filter-btn px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider bg-ink/10 dark:bg-white/10 text-ink dark:text-white font-bold rounded border border-ink/20 dark:border-white/20 transition-all cursor-pointer"
      } else {
        btn.className = "chat-filter-btn px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/50 dark:text-white/40 hover:text-ink dark:hover:text-white transition-all cursor-pointer"
      }
    })

    this.chatBubbleTargets.forEach(msg => {
      const isDecision = msg.dataset.isDecision === "true"
      const hasCode = msg.dataset.hasCode === "true"

      if (filterType === "all") {
        msg.classList.remove("hidden")
      } else if (filterType === "decisions") {
        if (isDecision) msg.classList.remove("hidden")
        else msg.classList.add("hidden")
      } else if (filterType === "code") {
        if (hasCode) msg.classList.remove("hidden")
        else msg.classList.add("hidden")
      }
    })
  }

  // 3. Send Demo Message
  sendMessage(event) {
    if (event) event.preventDefault()
    if (!this.hasChatInputTarget || !this.hasChatStreamTarget) return

    const text = this.chatInputTarget.value.trim()
    if (!text) return

    const newMsg = document.createElement("div")
    newMsg.className = "chat-bubble-item flex gap-3 p-3.5 rounded-xl bg-terracotta/5 border border-terracotta/20 animate-pop-in"
    newMsg.dataset.chatWorkbenchTarget = "chatBubble"
    newMsg.dataset.isDecision = "false"
    newMsg.dataset.hasCode = "false"

    newMsg.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
        EU
      </div>
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs text-ink dark:text-white">Você</span>
            <span class="text-[9px] font-mono bg-terracotta/15 text-terracotta px-1.5 py-0.2 rounded font-semibold uppercase">Agora</span>
          </div>
          <span class="text-[10px] font-mono text-ink-light/50 dark:text-white/40">Agora mesmo</span>
        </div>
        <p class="font-sans text-xs text-ink/90 dark:text-white/90 leading-relaxed">${text}</p>
      </div>
    `

    this.chatStreamTarget.appendChild(newMsg)
    this.chatInputTarget.value = ""
    this.chatStreamTarget.scrollTop = this.chatStreamTarget.scrollHeight
  }

  // 4. Convert message to Task (Kanban)
  convertToTask(event) {
    const btn = event.currentTarget
    const taskId = btn.dataset.taskId || "#SPEC-115"

    btn.innerHTML = `
      <span class="text-sage font-bold flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ✓ Tarefa ${taskId} Criada no Kanban!
      </span>
    `
    btn.classList.add("bg-sage/10", "border-sage/40")

    if (this.hasToastTarget) {
      this.toastTarget.classList.remove("hidden")
      setTimeout(() => {
        this.toastTarget.classList.add("hidden")
      }, 3000)
    }
  }

  // 5. Resolve Inbox Item
  resolveInbox(event) {
    const item = event.currentTarget.closest(".inbox-item-row")
    if (!item) return

    item.classList.add("opacity-0", "scale-95", "transition-all", "duration-300")
    setTimeout(() => {
      item.remove()
      if (this.hasInboxCountTarget) {
        let current = parseInt(this.inboxCountTarget.innerText) || 1
        current = Math.max(0, current - 1)
        this.inboxCountTarget.innerText = current

        if (current === 0 && this.hasInboxEmptyTarget) {
          this.inboxEmptyTarget.classList.remove("hidden")
        }
      }
    }, 300)
  }
}
