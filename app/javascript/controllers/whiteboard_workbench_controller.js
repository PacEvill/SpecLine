import { Controller } from "@hotwired/stimulus"
import mermaid from "mermaid"

export default class extends Controller {
  static targets = [
    "perspectiveBtn", "viewCanvas", "viewMermaid", "viewEmbed",
    "canvasWorld", "canvasViewport", "canvasGridLayer", "zoomIndicator",
    "cableClientProxy", "cableProxyRails", "cableRailsPostgres", "cableRailsWorker",
    "inspectorTitleInput", "inspectorMeta",
    "mermaidPresetBtn", "mermaidInput", "mermaidOutput",
    "embedCard", "embedSyncIndicator", "docSyncStatusBadge",
    "toast", "toastMsg"
  ]

  connect() {
    this.currentPerspective = "canvas"
    this.currentZoom = 1.0
    this.activeDragEl = null
    this.dragStartX = 0
    this.dragStartY = 0
    this.initialElX = 0
    this.initialElY = 0
    this.selectedNode = null
    this.extraNodeCount = 0
    this.stickyCount = 1
    this.inputTimeout = null

    this.presets = {
      arch: `graph TD
  A[Cliente Web / WASM] -->|WebSocket| B(Edge Proxy Traefik)
  B -->|HTTP/2 Proxy| C{Rails 8 Core}
  C -->|PubSub| D[(Solid Cable)]
  C -->|Async Task| E[[Solid Queue Worker]]
  C -->|ACID Storage| F[(PostgreSQL 16)]
  E -.->|Gera Preview| F`,

      state: `stateDiagram-v2
  [*] --> Backlog : Tarefa Criada
  Backlog --> EmProgresso : Assumida pelo Dev
  EmProgresso --> EmRevisao : Pull Request Aberto
  EmRevisao --> EmProgresso : Mudanças Solicitadas
  EmRevisao --> Concluido : Revisão Aprovada
  Concluido --> [*] : Fechado no Release`,

      sequence: `sequenceDiagram
  autonumber
  actor User as Desenvolvedor
  participant Client as SpecLine App
  participant Auth as OAuth Provider
  participant API as Rails 8 Backend

  User->>Client: Clica em "Entrar com GitHub"
  Client->>Auth: Inicia Fluxo PKCE
  Auth-->>User: Solicita Confirmação 2FA
  User->>Auth: Autorizado
  Auth-->>Client: Código de Acesso Temporário
  Client->>API: Valida Código e Cria Sessão
  API-->>Client: Token de Sessão Emitido`
    }

    this.initDraggableNodes()

    // Initialize Mermaid engine
    try {
      const isDark = document.documentElement.classList.contains("dark")
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "neutral",
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif"
      })
    } catch (e) {
      console.warn("Mermaid init warning:", e)
    }

    // Select default node
    const defaultNode = document.getElementById("node-client")
    if (defaultNode) {
      this.selectNode(defaultNode)
    }
    this.updateAllCables()
  }

  disconnect() {
    clearTimeout(this.inputTimeout)
  }

  // --- 1. PERSPECTIVE SWITCHING ---
  switchPerspective(event) {
    const perspective = event.currentTarget.dataset.view
    this.currentPerspective = perspective

    this.perspectiveBtnTargets.forEach(btn => {
      if (btn.dataset.view === perspective) {
        btn.className = "perspective-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-semibold rounded shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      } else {
        btn.className = "perspective-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
      }
    })

    if (this.hasViewCanvasTarget) {
      if (perspective === "canvas") {
        this.viewCanvasTarget.classList.remove("hidden")
        this.viewCanvasTarget.classList.add("animate-pop-in")
        setTimeout(() => this.updateAllCables(), 60)
      } else {
        this.viewCanvasTarget.classList.add("hidden")
      }
    }

    if (this.hasViewMermaidTarget) {
      if (perspective === "mermaid") {
        this.viewMermaidTarget.classList.remove("hidden")
        this.viewMermaidTarget.classList.add("animate-pop-in")
        this.renderMermaid()
      } else {
        this.viewMermaidTarget.classList.add("hidden")
      }
    }

    if (this.hasViewEmbedTarget) {
      if (perspective === "embed") {
        this.viewEmbedTarget.classList.remove("hidden")
        this.viewEmbedTarget.classList.add("animate-pop-in")
      } else {
        this.viewEmbedTarget.classList.add("hidden")
      }
    }
  }

  // Switch to canvas programmatically from another tab
  openCanvasTab() {
    const canvasBtn = this.perspectiveBtnTargets.find(btn => btn.dataset.view === "canvas")
    if (canvasBtn) {
      canvasBtn.click()
    }
  }

  // --- 2. DRAG & DROP & SELECTION ---
  initDraggableNodes() {
    const nodes = this.element.querySelectorAll(".canvas-draggable-node")
    nodes.forEach(node => this.attachNodeListeners(node))
  }

  attachNodeListeners(el) {
    el.addEventListener("pointerdown", (e) => {
      if (e.target.isContentEditable || e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") {
        return
      }

      this.activeDragEl = el
      el.setPointerCapture(e.pointerId)
      this.selectNode(el)

      this.dragStartX = e.clientX
      this.dragStartY = e.clientY

      this.initialElX = parseFloat(el.style.left) || el.offsetLeft
      this.initialElY = parseFloat(el.style.top) || el.offsetTop

      el.style.cursor = "grabbing"
    })

    el.addEventListener("pointermove", (e) => {
      if (this.activeDragEl !== el) return
      const deltaX = (e.clientX - this.dragStartX) / this.currentZoom
      const deltaY = (e.clientY - this.dragStartY) / this.currentZoom

      const newX = Math.max(10, this.initialElX + deltaX)
      const newY = Math.max(10, this.initialElY + deltaY)

      el.style.left = `${newX}px`
      el.style.top = `${newY}px`

      this.updateAllCables()
    })

    el.addEventListener("pointerup", (e) => {
      if (this.activeDragEl === el) {
        this.activeDragEl = null
        try {
          el.releasePointerCapture(e.pointerId)
        } catch (_) {}
        el.style.cursor = "grab"
        this.updateAllCables()
      }
    })
  }

  selectNode(el) {
    if (this.selectedNode) {
      this.selectedNode.classList.remove("node-selected-ring")
    }
    this.selectedNode = el
    el.classList.add("node-selected-ring")

    const title = el.dataset.title || el.querySelector(".font-bold")?.innerText || "Elemento"
    const meta = el.dataset.meta || "NÓ"

    if (this.hasInspectorTitleInputTarget) {
      this.inspectorTitleInputTarget.value = title
    }
    if (this.hasInspectorMetaTarget) {
      this.inspectorMetaTarget.innerText = meta
    }
  }

  onSelectedTitleChange(event) {
    const newVal = event.target.value
    if (!this.selectedNode) return
    this.selectedNode.dataset.title = newVal
    const titleDisplay = this.selectedNode.querySelector(".node-title-label") || this.selectedNode.querySelector(".font-bold")
    if (titleDisplay) {
      titleDisplay.innerText = newVal
    }
  }

  updateSelectedColor(event) {
    const colorHex = event.currentTarget.dataset.color
    if (!this.selectedNode) {
      this.showToast("Clique em um bloco para selecionar antes de trocar a cor.")
      return
    }
    this.selectedNode.style.borderColor = colorHex
    const tag = this.selectedNode.querySelector("span")
    if (tag) tag.style.color = colorHex
    this.showToast("Cor do bloco atualizada!")
  }

  deleteSelectedNode() {
    if (!this.selectedNode) return
    const el = this.selectedNode
    el.classList.add("scale-75", "opacity-0", "transition-all", "duration-200")
    setTimeout(() => {
      el.remove()
      this.selectedNode = null
      this.updateAllCables()
      this.showToast("Nó removido do canvas.")
    }, 200)
  }

  // --- 3. DYNAMIC BEZIER SVG CABLES ---
  updateCable(cableId, sourceId, targetId) {
    const cable = document.getElementById(cableId)
    const source = document.getElementById(sourceId)
    const target = document.getElementById(targetId)

    if (!cable || !source || !target) {
      if (cable) cable.setAttribute("d", "")
      return
    }

    const sx = (parseFloat(source.style.left) || source.offsetLeft) + source.offsetWidth
    const sy = (parseFloat(source.style.top) || source.offsetTop) + (source.offsetHeight / 2)

    const tx = parseFloat(target.style.left) || target.offsetLeft
    const ty = (parseFloat(target.style.top) || target.offsetTop) + (target.offsetHeight / 2)

    const dx = Math.abs(tx - sx) * 0.5
    const d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`
    cable.setAttribute("d", d)
  }

  updateAllCables() {
    this.updateCable("cable-client-proxy", "node-client", "node-proxy")
    this.updateCable("cable-proxy-rails", "node-proxy", "node-rails")
    this.updateCable("cable-rails-postgres", "node-rails", "node-postgres")
    this.updateCable("cable-rails-worker", "node-rails", "node-worker")
  }

  // --- 4. CREATING NODES & STICKIES ---
  addNode(event) {
    const type = event.currentTarget.dataset.nodeType || "service"
    this.extraNodeCount++
    if (!this.hasCanvasWorldTarget) return

    const isDecision = type === "decision"
    const node = document.createElement("div")
    const posX = 140 + (this.extraNodeCount * 35) % 260
    const posY = 170 + (this.extraNodeCount * 25) % 190

    node.id = `node-custom-${this.extraNodeCount}`
    node.style.left = `${posX}px`
    node.style.top = `${posY}px`
    
    const borderColor = isDecision ? "border-ocean" : "border-ochre"
    const textColor = isDecision ? "text-ocean" : "text-ochre"
    const tagText = isDecision ? "DECISÃO" : "SERVIÇO"
    const titleText = isDecision ? `Regra de Roteamento #${this.extraNodeCount}` : `Micro-Serviço #${this.extraNodeCount}`

    node.className = `canvas-draggable-node absolute z-20 w-48 p-4 rounded-xl bg-white dark:bg-ink-paper border-2 ${borderColor} shadow-lg cursor-grab hover:shadow-2xl animate-pop-in`
    node.dataset.title = titleText
    node.dataset.desc = isDecision ? "Regra condicional para roteamento de requisições." : "Novo serviço modular adicionado ao canvas."
    node.dataset.meta = isDecision ? `RULE-0${this.extraNodeCount}` : `SRV-0${this.extraNodeCount}`

    node.innerHTML = `
      <div class="flex items-center justify-between pb-1 text-[10px] font-mono ${textColor} font-bold pointer-events-none">
        <span>${tagText}</span>
        <span class="w-2 h-2 rounded-full ${isDecision ? 'bg-ocean' : 'bg-ochre'}"></span>
      </div>
      <div class="node-title-label font-sans font-bold text-xs text-ink dark:text-white pointer-events-none">${titleText}</div>
      <div class="text-[10px] font-mono text-ink-light/60 dark:text-white/50 mt-1 pointer-events-none">${isDecision ? 'If / Else Condicional' : 'Porta :808' + this.extraNodeCount}</div>
    `

    this.canvasWorldTarget.appendChild(node)
    this.attachNodeListeners(node)
    this.selectNode(node)
    this.showToast(`Bloco '${titleText}' adicionado!`)
  }

  addSticky() {
    this.stickyCount++
    if (!this.hasCanvasWorldTarget) return

    const colors = [
      { bg: "#FFF7D1", border: "#FDE047", text: "#713F12" },
      { bg: "#E2F0D9", border: "#A5B5A1", text: "#274E13" },
      { bg: "#E0F2FE", border: "#7DD3FC", text: "#0369A1" },
      { bg: "#FCE7F3", border: "#F472B6", text: "#831843" }
    ]
    const color = colors[this.stickyCount % colors.length]

    const note = document.createElement("div")
    note.id = `sticky-custom-${this.stickyCount}`
    const posX = 110 + (this.stickyCount * 40) % 280
    const posY = 150 + (this.stickyCount * 30) % 180

    note.style.left = `${posX}px`
    note.style.top = `${posY}px`
    note.style.backgroundColor = color.bg
    note.style.borderColor = color.border
    note.style.color = color.text
    note.style.transform = `rotate(${(this.stickyCount % 5) - 2}deg)`
    note.className = "canvas-draggable-node absolute z-20 w-48 p-3 rounded-lg shadow-xl font-sans text-xs border cursor-grab animate-pop-in"
    note.dataset.title = `Post-it #${this.stickyCount}`
    note.dataset.desc = "Nota adesiva editável com clique direto."
    note.dataset.meta = "POST-IT"

    note.innerHTML = `
      <div class="flex justify-between items-center font-mono text-[9px] font-bold uppercase opacity-70 mb-1 pointer-events-none">
        <span>📌 Post-it #${this.stickyCount}</span>
        <button type="button" onclick="this.closest('.canvas-draggable-node').remove()" class="hover:opacity-100 cursor-pointer pointer-events-auto">✕</button>
      </div>
      <p contenteditable="true" class="leading-tight outline-none rounded p-0.5">Clique para escrever sua anotação aqui...</p>
    `

    this.canvasWorldTarget.appendChild(note)
    this.attachNodeListeners(note)
    this.selectNode(note)
    this.showToast(`Post-it #${this.stickyCount} adicionado!`)
  }

  // --- 5. RESET & CONTROLS ---
  resetCanvas() {
    const client = document.getElementById("node-client")
    const proxy = document.getElementById("node-proxy")
    const rails = document.getElementById("node-rails")
    const postgres = document.getElementById("node-postgres")
    const worker = document.getElementById("node-worker")

    if (client) { client.style.left = "48px"; client.style.top = "120px" }
    if (proxy) { proxy.style.left = "360px"; proxy.style.top = "120px" }
    if (rails) { rails.style.left = "690px"; rails.style.top = "120px" }
    if (postgres) { postgres.style.left = "360px"; postgres.style.top = "340px" }
    if (worker) { worker.style.left = "690px"; worker.style.top = "340px" }

    this.currentZoom = 1.0
    this.updateZoomTransform()
    this.updateAllCables()
    this.showToast("Posições do canvas reiniciadas.")
  }

  toggleGrid() {
    if (this.hasCanvasGridLayerTarget) {
      this.canvasGridLayerTarget.classList.toggle("hidden")
      const isHidden = this.canvasGridLayerTarget.classList.contains("hidden")
      this.showToast(isHidden ? "Grade de fundo oculta" : "Grade de fundo visível")
    }
  }

  zoomIn() {
    this.adjustZoom(0.15)
  }

  zoomOut() {
    this.adjustZoom(-0.15)
  }

  adjustZoom(delta) {
    this.currentZoom = Math.min(1.8, Math.max(0.5, this.currentZoom + delta))
    this.updateZoomTransform()
  }

  updateZoomTransform() {
    if (this.hasCanvasWorldTarget) {
      this.canvasWorldTarget.style.transform = `scale(${this.currentZoom})`
    }
    if (this.hasZoomIndicatorTarget) {
      this.zoomIndicatorTarget.innerText = `${Math.round(this.currentZoom * 100)}%`
    }
    this.updateAllCables()
  }

  downloadCanvasSvg() {
    this.showToast("Exportação SVG (Demo): No workspace, exporta o vetor completo.")
  }

  // --- 6. MERMAID COMPILER & PRESETS ---
  loadPreset(event) {
    const presetKey = event.currentTarget.dataset.preset
    this.mermaidPresetBtnTargets.forEach(btn => {
      if (btn.dataset.preset === presetKey) {
        btn.className = "mermaid-preset-btn px-2.5 py-1 text-[10px] bg-ochre text-ink font-bold rounded shadow-sm transition-all cursor-pointer"
      } else {
        btn.className = "mermaid-preset-btn px-2.5 py-1 text-[10px] border border-ink/20 dark:border-white/20 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer"
      }
    })

    if (this.hasMermaidInputTarget && this.presets[presetKey]) {
      this.mermaidInputTarget.value = this.presets[presetKey]
      this.renderMermaid()
      this.showToast(`Preset '${presetKey}' carregado!`)
    }
  }

  onMermaidInput() {
    clearTimeout(this.inputTimeout)
    this.inputTimeout = setTimeout(() => this.renderMermaid(), 300)
  }

  renderMermaid() {
    if (!this.hasMermaidInputTarget || !this.hasMermaidOutputTarget) return
    const code = this.mermaidInputTarget.value
    const isDark = document.documentElement.classList.contains("dark")

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "neutral",
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif"
      })

      const id = "mermaid-svg-" + Math.round(Math.random() * 10000)
      mermaid.render(id, code).then(({ svg }) => {
        if (this.hasMermaidOutputTarget) {
          this.mermaidOutputTarget.innerHTML = svg
        }
      }).catch(err => {
        if (this.hasMermaidOutputTarget) {
          this.mermaidOutputTarget.innerHTML = `<div class="p-4 text-xs font-mono text-terracotta bg-terracotta/10 border border-terracotta/30 rounded-lg">Erro de sintaxe no Mermaid: ${err.message || err}</div>`
        }
      })
    } catch (err) {
      if (this.hasMermaidOutputTarget) {
        this.mermaidOutputTarget.innerHTML = `<div class="p-4 text-xs font-mono text-terracotta bg-terracotta/10 border border-terracotta/30 rounded-lg">Erro ao compilar: ${err}</div>`
      }
    }
  }

  copyMermaid() {
    if (this.hasMermaidInputTarget) {
      navigator.clipboard.writeText("```mermaid\n" + this.mermaidInputTarget.value + "\n```")
      this.showToast("Código Mermaid copiado em Markdown!")
    }
  }

  downloadMermaidSvg() {
    this.showToast("Exportação Mermaid (Demo): No workspace, exporta o SVG em alta resolução.")
  }

  // --- 7. DOC EMBED LIVE SYNC SIMULATION ---
  simulateDocSync() {
    if (this.hasEmbedCardTarget) {
      this.embedCardTarget.classList.add("ring-4", "ring-ochre", "scale-[1.01]")
      setTimeout(() => {
        this.embedCardTarget.classList.remove("ring-4", "ring-ochre", "scale-[1.01]")
      }, 700)
    }

    if (this.hasEmbedSyncIndicatorTarget) {
      this.embedSyncIndicatorTarget.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-ochre animate-ping"></span><span class="text-ochre">Sincronizando...</span>'
      setTimeout(() => {
        this.embedSyncIndicatorTarget.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-sage"></span><span class="text-sage font-bold">Sincronizado v2.4</span>'
      }, 800)
    }

    if (this.hasDocSyncStatusBadgeTarget) {
      this.docSyncStatusBadgeTarget.classList.add("bg-ochre/20", "text-ochre")
      setTimeout(() => {
        this.docSyncStatusBadgeTarget.classList.remove("bg-ochre/20", "text-ochre")
      }, 800)
    }

    this.showToast("Sincronização em tempo real: O documento refletiu a versão mais recente do Whiteboard #04!")
  }

  // --- 8. TOAST SYSTEM ---
  showToast(msg) {
    if (this.hasToastTarget && this.hasToastMsgTarget) {
      this.toastMsgTarget.innerText = msg
      this.toastTarget.classList.remove("hidden")
      clearTimeout(this.toastTimeout)
      this.toastTimeout = setTimeout(() => {
        this.toastTarget.classList.add("hidden")
      }, 2500)
    }
  }
}
