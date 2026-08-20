import { Controller } from "@hotwired/stimulus"
import mermaid from "mermaid"

export default class extends Controller {
  static targets = [
    "canvas", "stage", "svgLayer", "nodesLayer", "guidelinesLayer",
    "toolBtn", "propertiesPanel", "propTypeBadge", "propTextContainer",
    "propTextInput", "propConvertIssueContainer", "propMermaidContainer",
    "propFillContainer", "propStrokeContainer", "saveStatus", "zoomLabel",
    "coordLabel", "elementCountLabel", "mermaidEditor", "mermaidInput",
    "mermaidPreview", "mermaidError", "shortcutsModal",
    "minimapContainer", "minimapSvg", "minimapViewport", "minimapStage",
    "snapToggleBtn", "imageFileInput"
  ]

  static values = {
    id: Number,
    workspaceId: Number,
    projectId: Number,
    saveUrl: String,
    newIssueUrl: String
  }

  connect() {
    this.elements = []
    this.selectedElementIds = []
    this.activeTool = "select"
    this.gridMode = "dots"
    this.snapEnabled = false
    this.snapSize = 10
    
    // Viewport State
    this.zoom = 1
    this.scrollX = 0
    this.scrollY = 0
    this.isPanning = false
    this.panStartX = 0
    this.panStartY = 0
    this.isSpacePressed = false
    this.lastPointerX = 200
    this.lastPointerY = 200

    // Dragging & Interaction State
    this.isDrawing = false
    this.currentPath = null
    this.isDraggingElement = false
    this.dragStartX = 0
    this.dragStartY = 0
    this.dragInitialPositions = new Map()

    // Arrow specific handle dragging
    this.activeArrowElement = null
    this.activeArrowHandle = null

    // Marquee Multi-Select State
    this.isMarqueeSelecting = false
    this.marqueeStartX = 0
    this.marqueeStartY = 0
    this.marqueeCurrentX = 0
    this.marqueeCurrentY = 0

    // Resizing State
    this.isResizing = false
    this.resizingElement = null
    this.resizeHandle = null
    this.resizeInitialWidth = 0
    this.resizeInitialHeight = 0
    this.resizeInitialX = 0
    this.resizeInitialY = 0

    // History (Undo / Redo)
    this.history = []
    this.historyIndex = -1

    // Defaults for styling
    this.currentStroke = "#FFFFFF"
    this.currentFill = "#2A2A2B"
    this.currentStrokeWidth = 2
    this.currentStickyColor = "#FEF08A"

    // Initialize Mermaid
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        suppressErrorRendering: true,
        flowchart: { curve: 'basis', htmlLabels: true },
        sequence: { showSequenceNumbers: true }
      })
    } catch (e) {
      console.warn("Mermaid init error:", e)
    }

    this.loadInitialContent()
    this.bindEvents()
    this.updateViewport()
    this.updateStatusBar()
    this.saveStateToHistory()
  }

  disconnect() {
    this.unbindEvents()
    this.cleanupMermaidErrorElements()
  }

  cleanupMermaidErrorElements() {
    document.querySelectorAll("svg[id^='dmermaid']").forEach(el => el.remove())
  }

  loadInitialContent() {
    const rawContent = this.element.dataset.whiteboardContent
    if (rawContent && rawContent.trim() !== "" && rawContent.trim() !== "{}") {
      try {
        const parsed = JSON.parse(rawContent)
        if (parsed.elements && Array.isArray(parsed.elements)) {
          this.elements = parsed.elements
        }
        if (parsed.viewport) {
          this.zoom = parsed.viewport.zoom || 1
          this.scrollX = parsed.viewport.scrollX || 0
          this.scrollY = parsed.viewport.scrollY || 0
        }
      } catch (e) {
        console.warn("Error parsing canvas JSON:", e)
      }
    }

    const rawMermaid = this.element.dataset.whiteboardMermaid
    if (!this.elements.length && rawMermaid && rawMermaid.trim() !== "") {
      this.elements.push({
        id: 'mermaid-main',
        type: 'mermaid',
        code: rawMermaid,
        x: 120,
        y: 100,
        width: 580,
        height: 380
      })
    }

    this.renderAll()
  }

  bindEvents() {
    this.handleKeyDown = this.onKeyDown.bind(this)
    this.handleKeyUp = this.onKeyUp.bind(this)
    this.handleWheel = this.onWheel.bind(this)
    this.handleMouseMove = this.onGlobalMouseMove.bind(this)
    this.handlePaste = this.onClipboardPaste.bind(this)
    
    window.addEventListener("keydown", this.handleKeyDown)
    window.addEventListener("keyup", this.handleKeyUp)
    window.addEventListener("mousemove", this.handleMouseMove)
    window.addEventListener("paste", this.handlePaste)

    if (this.hasCanvasTarget) {
      this.canvasTarget.addEventListener("wheel", this.handleWheel, { passive: false })
    }
  }

  unbindEvents() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
    window.removeEventListener("mousemove", this.handleMouseMove)
    window.removeEventListener("paste", this.handlePaste)

    if (this.hasCanvasTarget) {
      this.canvasTarget.removeEventListener("wheel", this.handleWheel)
    }
  }

  setTool(event) {
    const tool = event.currentTarget.dataset.tool
    this.activeTool = tool

    this.toolBtnTargets.forEach(btn => {
      if (btn.dataset.tool === tool) {
        btn.classList.add("bg-terracotta", "text-white")
        btn.classList.remove("text-white/60", "hover:bg-white/10")
      } else {
        btn.classList.remove("bg-terracotta", "text-white")
        btn.classList.add("text-white/60", "hover:bg-white/10")
      }
    })

    if (tool === "select") {
      this.canvasTarget.style.cursor = "default"
    } else if (tool === "pan") {
      this.canvasTarget.style.cursor = "grab"
    } else {
      this.canvasTarget.style.cursor = "crosshair"
    }
  }

  setToolDirectly(tool) {
    const btn = this.toolBtnTargets.find(b => b.dataset.tool === tool)
    if (btn) btn.click()
  }

  // Convert Note/Card to Real Issue (SpecLine Ecosystem Link)
  convertToIssue() {
    if (!this.selectedElementIds.length) return
    const el = this.elements.find(e => e.id === this.selectedElementIds[0])
    if (!el) return

    const title = el.text || el.title || "Nova Tarefa do Quadro"
    if (this.hasNewIssueUrlValue && this.newIssueUrlValue) {
      window.open(`${this.newIssueUrlValue}?title=${encodeURIComponent(title)}`, "_blank")
    }
  }

  // Image Upload, Paste and Drag & Drop
  openImagePicker() {
    if (this.hasImageFileInputTarget) {
      this.imageFileInputTarget.click()
    }
  }

  onImageFileSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      const img = new Image()
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight
        const width = Math.min(480, img.naturalWidth)
        const height = Math.round(width / aspect)

        const rect = this.canvasTarget.getBoundingClientRect()
        const { x, y } = this.screenToCanvas(rect.left + rect.width / 2, rect.top + rect.height / 2)

        const newImage = {
          id: 'img-' + Date.now(),
          type: 'image',
          src: dataUrl,
          title: file.name || 'Imagem',
          x: Math.round(x - width / 2),
          y: Math.round(y - height / 2),
          width,
          height
        }

        this.elements.push(newImage)
        this.selectedElementIds = [newImage.id]
        this.renderAll()
        this.showPropertiesPanel()
        this.updateStatusBar()
        this.updateMinimap()
        this.saveStateToHistory()
        this.autoSave()
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  onClipboardPaste(event) {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable) {
      return
    }

    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile()
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target.result
          const img = new Image()
          img.onload = () => {
            const aspect = img.naturalWidth / img.naturalHeight
            const width = Math.min(480, Math.max(160, img.naturalWidth))
            const height = Math.round(width / aspect)

            const { x, y } = this.screenToCanvas(this.lastPointerX, this.lastPointerY)

            const newImage = {
              id: 'img-' + Date.now(),
              type: 'image',
              src: dataUrl,
              title: 'Imagem Colada',
              x: Math.round(x - width / 2),
              y: Math.round(y - height / 2),
              width,
              height
            }

            this.elements.push(newImage)
            this.selectedElementIds = [newImage.id]
            this.renderAll()
            this.showPropertiesPanel()
            this.updateStatusBar()
            this.updateMinimap()
            this.saveStateToHistory()
            this.autoSave()
          }
          img.src = dataUrl
        }
        reader.readAsDataURL(blob)
        event.preventDefault()
        return
      }
    }
  }

  onCanvasDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  onCanvasDrop(event) {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (!files || !files.length) return

    const file = files[0]
    if (file.type.startsWith("image/")) {
      const { x, y } = this.screenToCanvas(event.clientX, event.clientY)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target.result
        const img = new Image()
        img.onload = () => {
          const aspect = img.naturalWidth / img.naturalHeight
          const width = Math.min(480, img.naturalWidth)
          const height = Math.round(width / aspect)

          const newImage = {
            id: 'img-' + Date.now(),
            type: 'image',
            src: dataUrl,
            title: file.name,
            x: Math.round(x - width / 2),
            y: Math.round(y - height / 2),
            width,
            height
          }

          this.elements.push(newImage)
          this.selectedElementIds = [newImage.id]
          this.renderAll()
          this.showPropertiesPanel()
          this.updateStatusBar()
          this.updateMinimap()
          this.saveStateToHistory()
          this.autoSave()
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    }
  }

  insertStamp(event) {
    const emoji = event.currentTarget.dataset.emoji
    const rect = this.canvasTarget.getBoundingClientRect()
    const { x, y } = this.screenToCanvas(rect.left + rect.width / 2, rect.top + rect.height / 2)

    const newStamp = {
      id: 'stamp-' + Date.now(),
      type: 'stamp',
      emoji: emoji,
      x: Math.round(x - 24),
      y: Math.round(y - 24),
      width: 48,
      height: 48
    }

    this.elements.push(newStamp)
    this.selectedElementIds = [newStamp.id]
    this.renderAll()
    this.showPropertiesPanel()
    this.updateStatusBar()
    this.updateMinimap()
    this.saveStateToHistory()
    this.autoSave()
  }

  toggleGrid() {
    if (this.gridMode === "dots") {
      this.gridMode = "lines"
      this.canvasTarget.style.backgroundImage = "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)"
      this.canvasTarget.style.backgroundSize = "32px 32px"
    } else if (this.gridMode === "lines") {
      this.gridMode = "none"
      this.canvasTarget.style.backgroundImage = "none"
    } else {
      this.gridMode = "dots"
      this.canvasTarget.style.backgroundImage = "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)"
      this.canvasTarget.style.backgroundSize = "24px 24px"
    }
  }

  toggleSnap() {
    this.snapEnabled = !this.snapEnabled
    if (this.hasSnapToggleBtnTarget) {
      if (this.snapEnabled) {
        this.snapToggleBtnTarget.textContent = "Snap: 10px Ativo"
        this.snapToggleBtnTarget.classList.add("text-terracotta", "font-bold")
        this.snapToggleBtnTarget.classList.remove("text-white/50")
      } else {
        this.snapToggleBtnTarget.textContent = "Snap: Desligado"
        this.snapToggleBtnTarget.classList.remove("text-terracotta", "font-bold")
        this.snapToggleBtnTarget.classList.add("text-white/50")
      }
    }
  }

  toggleMinimap() {
    if (this.hasMinimapContainerTarget) {
      this.minimapContainerTarget.classList.toggle("hidden")
      if (!this.minimapContainerTarget.classList.contains("hidden")) {
        this.updateMinimap()
      }
    }
  }

  toggleShortcutsModal() {
    if (this.hasShortcutsModalTarget) {
      this.shortcutsModalTarget.classList.toggle("hidden")
    }
  }

  onGlobalMouseMove(event) {
    this.lastPointerX = event.clientX
    this.lastPointerY = event.clientY

    if (!this.hasCanvasTarget) return
    const { x, y } = this.screenToCanvas(event.clientX, event.clientY)
    if (this.hasCoordLabelTarget) {
      this.coordLabelTarget.textContent = `X: ${Math.round(x)} Y: ${Math.round(y)}`
    }
  }

  // Pointer Interaction
  onPointerDown(event) {
    if (event.target.closest("#properties-panel") || event.target.closest("#mermaid-editor-modal") || event.target.closest("#top-toolbar") || event.target.closest("#tools-dock") || event.target.closest("footer") || event.target.closest("[data-whiteboard-target='minimapContainer']")) {
      return
    }

    const { x, y } = this.screenToCanvas(event.clientX, event.clientY)

    if (this.isSpacePressed || event.button === 1 || this.activeTool === "pan") {
      this.isPanning = true
      this.panStartX = event.clientX - this.scrollX
      this.panStartY = event.clientY - this.scrollY
      this.canvasTarget.style.cursor = "grabbing"
      return
    }

    if (this.activeTool === "select") {
      const arrowHandle = this.getArrowHandleAt(x, y)
      if (arrowHandle) {
        this.activeArrowElement = arrowHandle.element
        this.activeArrowHandle = arrowHandle.handle
        this.dragStartX = x
        this.dragStartY = y
        return
      }

      const clickedElement = this.getElementAt(x, y)

      if (clickedElement) {
        if (event.shiftKey) {
          if (this.selectedElementIds.includes(clickedElement.id)) {
            this.selectedElementIds = this.selectedElementIds.filter(id => id !== clickedElement.id)
          } else {
            this.selectedElementIds.push(clickedElement.id)
          }
        } else {
          if (!this.selectedElementIds.includes(clickedElement.id)) {
            this.selectedElementIds = [clickedElement.id]
          }
        }

        this.startDraggingSelection(x, y)
        this.renderAll()
        this.showPropertiesPanel()
      } else {
        if (!event.shiftKey) {
          this.deselectAll()
        }
        this.isMarqueeSelecting = true
        this.marqueeStartX = x
        this.marqueeStartY = y
        this.marqueeCurrentX = x
        this.marqueeCurrentY = y
      }
    } else if (this.activeTool === "pen") {
      this.isDrawing = true
      const newPath = {
        id: 'pen-' + Date.now(),
        type: 'pen',
        points: [{ x, y }],
        stroke: this.currentStroke,
        strokeWidth: this.currentStrokeWidth
      }
      this.elements.push(newPath)
      this.currentPath = newPath
      this.renderAll()
    } else if (["rect", "circle", "diamond", "sticky", "text", "arrow", "mermaid", "frame"].includes(this.activeTool)) {
      this.createElementAt(this.activeTool, x, y)
    }
  }

  onPointerMove(event) {
    if (this.isPanning) {
      this.scrollX = event.clientX - this.panStartX
      this.scrollY = event.clientY - this.panStartY
      this.updateViewport()
      this.updateMinimap()
      return
    }

    const { x, y } = this.screenToCanvas(event.clientX, event.clientY)

    if (this.isDrawing && this.currentPath) {
      this.currentPath.points.push({ x, y })
      this.renderAll()
      return
    }

    if (this.isMarqueeSelecting) {
      this.marqueeCurrentX = x
      this.marqueeCurrentY = y
      this.updateMarqueeSelection()
      this.renderMarqueeBox()
      return
    }

    if (this.activeArrowElement && this.activeArrowHandle) {
      let targetX = x
      let targetY = y
      if (this.snapEnabled) {
        targetX = Math.round(targetX / this.snapSize) * this.snapSize
        targetY = Math.round(targetY / this.snapSize) * this.snapSize
      }

      if (this.activeArrowHandle === "start") {
        this.activeArrowElement.startX = targetX
        this.activeArrowElement.startY = targetY
      } else if (this.activeArrowHandle === "end") {
        this.activeArrowElement.endX = targetX
        this.activeArrowElement.endY = targetY
      }
      this.renderAll()
      return
    }

    if (this.isResizing && this.resizingElement) {
      const dx = x - this.dragStartX
      const dy = y - this.dragStartY
      
      let newW = Math.max(60, this.resizeInitialWidth + dx)
      let newH = Math.max(40, this.resizeInitialHeight + dy)

      if (this.snapEnabled) {
        newW = Math.round(newW / this.snapSize) * this.snapSize
        newH = Math.round(newH / this.snapSize) * this.snapSize
      }
      
      this.resizingElement.width = Math.round(newW)
      this.resizingElement.height = Math.round(newH)
      this.renderAll()
      return
    }

    if (this.isDraggingElement && this.dragInitialPositions.size > 0) {
      let dx = x - this.dragStartX
      let dy = y - this.dragStartY

      if (this.snapEnabled) {
        dx = Math.round(dx / this.snapSize) * this.snapSize
        dy = Math.round(dy / this.snapSize) * this.snapSize
      }

      if (this.selectedElementIds.length === 1) {
        this.checkAlignmentGuidelines(this.selectedElementIds[0], dx, dy)
      }

      this.selectedElementIds.forEach(id => {
        const el = this.elements.find(e => e.id === id)
        const initial = this.dragInitialPositions.get(id)
        if (el && initial) {
          if (el.type === "arrow") {
            el.startX = Math.round(initial.startX + dx)
            el.startY = Math.round(initial.startY + dy)
            el.endX = Math.round(initial.endX + dx)
            el.endY = Math.round(initial.endY + dy)
          } else if (el.type === "pen") {
            if (initial.points) {
              el.points = initial.points.map(p => ({
                x: Math.round(p.x + dx),
                y: Math.round(p.y + dy)
              }))
            }
          } else {
            el.x = Math.round(initial.x + dx)
            el.y = Math.round(initial.y + dy)
          }
        }
      })

      this.renderAll()
    }
  }

  onPointerUp(event) {
    if (this.isPanning) {
      this.isPanning = false
      this.canvasTarget.style.cursor = this.isSpacePressed ? "grab" : (this.activeTool === "pan" ? "grab" : "default")
    }

    if (this.isDrawing) {
      this.isDrawing = false
      this.currentPath = null
      this.saveStateToHistory()
      this.autoSave()
      this.updateStatusBar()
      this.updateMinimap()
    }

    if (this.isMarqueeSelecting) {
      this.isMarqueeSelecting = false
      this.clearMarqueeBox()
      this.renderAll()
      this.showPropertiesPanel()
    }

    if (this.activeArrowElement) {
      this.activeArrowElement = null
      this.activeArrowHandle = null
      this.saveStateToHistory()
      this.autoSave()
      this.updateMinimap()
    }

    if (this.isResizing) {
      this.isResizing = false
      this.resizingElement = null
      this.saveStateToHistory()
      this.autoSave()
      this.updateMinimap()
    }

    if (this.isDraggingElement) {
      this.isDraggingElement = false
      this.dragInitialPositions.clear()
      this.clearGuidelines()
      this.saveStateToHistory()
      this.autoSave()
      this.updateMinimap()
    }
  }

  onCanvasDoubleClick(event) {
    if (event.target.closest("#properties-panel") || event.target.closest("#mermaid-editor-modal") || event.target.closest("#top-toolbar") || event.target.closest("#tools-dock") || event.target.closest("footer")) {
      return
    }

    const { x, y } = this.screenToCanvas(event.clientX, event.clientY)
    const clickedElement = this.getElementAt(x, y)

    if (clickedElement) {
      if (clickedElement.type === "mermaid") {
        this.openMermaidEditor(clickedElement.id)
      } else if (clickedElement.type === "sticky" || clickedElement.type === "text" || clickedElement.type === "frame") {
        const node = this.nodesLayerTarget.querySelector(`[data-element-id="${clickedElement.id}"] [contenteditable="true"]`)
        if (node) node.focus()
      } else if (["rect", "circle", "diamond"].includes(clickedElement.type)) {
        if (this.hasPropTextInputTarget) {
          this.propTextInputTarget.focus()
          this.propTextInputTarget.select()
        }
      }
    }
  }

  startDraggingSelection(canvasX, canvasY) {
    this.isDraggingElement = true
    this.dragStartX = canvasX
    this.dragStartY = canvasY
    this.dragInitialPositions.clear()

    this.selectedElementIds.forEach(id => {
      const el = this.elements.find(e => e.id === id)
      if (el) {
        if (el.type === "arrow") {
          this.dragInitialPositions.set(id, {
            startX: el.startX,
            startY: el.startY,
            endX: el.endX,
            endY: el.endY
          })
        } else if (el.type === "pen") {
          this.dragInitialPositions.set(id, {
            points: el.points ? el.points.map(p => ({ ...p })) : []
          })
        } else {
          this.dragInitialPositions.set(id, {
            x: el.x,
            y: el.y
          })
        }
      }
    })
  }

  startResizingElement(el, canvasX, canvasY, handle) {
    this.resizingElement = el
    this.isResizing = true
    this.resizeHandle = handle
    this.dragStartX = canvasX
    this.dragStartY = canvasY
    this.resizeInitialWidth = el.width
    this.resizeInitialHeight = el.height
    this.resizeInitialX = el.x
    this.resizeInitialY = el.y
  }

  getArrowHandleAt(x, y) {
    for (const id of this.selectedElementIds) {
      const el = this.elements.find(e => e.id === id && e.type === "arrow")
      if (el) {
        const distStart = Math.hypot(x - el.startX, y - el.startY)
        const distEnd = Math.hypot(x - el.endX, y - el.endY)
        if (distStart <= 12) return { element: el, handle: "start" }
        if (distEnd <= 12) return { element: el, handle: "end" }
      }
    }
    return null
  }

  // Marquee Selection Logic
  updateMarqueeSelection() {
    const minX = Math.min(this.marqueeStartX, this.marqueeCurrentX)
    const maxX = Math.max(this.marqueeStartX, this.marqueeCurrentX)
    const minY = Math.min(this.marqueeStartY, this.marqueeCurrentY)
    const maxY = Math.max(this.marqueeStartY, this.marqueeCurrentY)

    const newlySelected = []

    this.elements.forEach(el => {
      let elMinX, elMaxX, elMinY, elMaxY
      if (el.type === "arrow") {
        elMinX = Math.min(el.startX, el.endX)
        elMaxX = Math.max(el.startX, el.endX)
        elMinY = Math.min(el.startY, el.endY)
        elMaxY = Math.max(el.startY, el.endY)
      } else if (el.type === "pen") {
        if (el.points && el.points.length) {
          const xs = el.points.map(p => p.x)
          const ys = el.points.map(p => p.y)
          elMinX = Math.min(...xs)
          elMaxX = Math.max(...xs)
          elMinY = Math.min(...ys)
          elMaxY = Math.max(...ys)
        } else {
          return
        }
      } else {
        elMinX = el.x
        elMaxX = el.x + (el.width || 100)
        elMinY = el.y
        elMaxY = el.y + (el.height || 60)
      }

      if (elMinX <= maxX && elMaxX >= minX && elMinY <= maxY && elMaxY >= minY) {
        newlySelected.push(el.id)
      }
    })

    this.selectedElementIds = newlySelected
  }

  renderMarqueeBox() {
    if (!this.hasSvgLayerTarget) return
    let box = this.svgLayerTarget.querySelector(".marquee-selection-box")
    if (!box) {
      box = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      box.setAttribute("class", "marquee-selection-box pointer-events-none")
      box.setAttribute("fill", "rgba(217, 122, 94, 0.15)")
      box.setAttribute("stroke", "#D97A5E")
      box.setAttribute("stroke-width", "1")
      box.setAttribute("stroke-dasharray", "4 4")
      this.svgLayerTarget.appendChild(box)
    }

    const minX = Math.min(this.marqueeStartX, this.marqueeCurrentX)
    const maxX = Math.max(this.marqueeStartX, this.marqueeCurrentX)
    const minY = Math.min(this.marqueeStartY, this.marqueeCurrentY)
    const maxY = Math.max(this.marqueeStartY, this.marqueeCurrentY)

    box.setAttribute("x", minX)
    box.setAttribute("y", minY)
    box.setAttribute("width", Math.max(1, maxX - minX))
    box.setAttribute("height", Math.max(1, maxY - minY))
  }

  clearMarqueeBox() {
    if (!this.hasSvgLayerTarget) return
    const box = this.svgLayerTarget.querySelector(".marquee-selection-box")
    if (box) box.remove()
  }

  // Alignment Guidelines
  checkAlignmentGuidelines(activeId, dx, dy) {
    if (!this.hasGuidelinesLayerTarget) return
    this.guidelinesLayerTarget.innerHTML = ""

    const activeEl = this.elements.find(e => e.id === activeId)
    if (!activeEl || !activeEl.x) return

    const initial = this.dragInitialPositions.get(activeId)
    if (!initial) return

    const currentCenterX = (initial.x + dx) + (activeEl.width || 100) / 2
    const currentCenterY = (initial.y + dy) + (activeEl.height || 60) / 2
    const threshold = 6

    this.elements.forEach(other => {
      if (other.id === activeId || !other.x) return
      const otherCenterX = other.x + (other.width || 100) / 2
      const otherCenterY = other.y + (other.height || 60) / 2

      if (Math.abs(currentCenterX - otherCenterX) < threshold) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttribute("x1", otherCenterX)
        line.setAttribute("y1", "-2000")
        line.setAttribute("x2", otherCenterX)
        line.setAttribute("y2", "6000")
        line.setAttribute("stroke", "#D97A5E")
        line.setAttribute("stroke-width", "1")
        line.setAttribute("stroke-dasharray", "4 4")
        this.guidelinesLayerTarget.appendChild(line)
      }

      if (Math.abs(currentCenterY - otherCenterY) < threshold) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttribute("x1", "-2000")
        line.setAttribute("y1", otherCenterY)
        line.setAttribute("x2", "6000")
        line.setAttribute("y2", otherCenterY)
        line.setAttribute("stroke", "#D97A5E")
        line.setAttribute("stroke-width", "1")
        line.setAttribute("stroke-dasharray", "4 4")
        this.guidelinesLayerTarget.appendChild(line)
      }
    })
  }

  clearGuidelines() {
    if (this.hasGuidelinesLayerTarget) {
      this.guidelinesLayerTarget.innerHTML = ""
    }
  }

  // Mini-map Radar
  updateMinimap() {
    if (!this.hasMinimapContainerTarget || this.minimapContainerTarget.classList.contains("hidden")) return
    if (!this.hasMinimapSvgTarget || !this.hasMinimapViewportTarget) return

    this.minimapSvgTarget.innerHTML = ""
    if (!this.elements.length) return

    let minX = -1000, minY = -1000, maxX = 3000, maxY = 3000

    this.elements.forEach(el => {
      if (el.x) {
        minX = Math.min(minX, el.x - 200)
        maxX = Math.max(maxX, el.x + (el.width || 100) + 200)
        minY = Math.min(minY, el.y - 200)
        maxY = Math.max(maxY, el.y + (el.height || 60) + 200)
      }
    })

    const worldW = maxX - minX
    const worldH = maxY - minY
    this.minimapSvgTarget.setAttribute("viewBox", `${minX} ${minY} ${worldW} ${worldH}`)

    this.elements.forEach(el => {
      if (el.x && el.width) {
        const r = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        r.setAttribute("x", el.x)
        r.setAttribute("y", el.y)
        r.setAttribute("width", el.width)
        r.setAttribute("height", el.height)
        r.setAttribute("fill", el.type === "sticky" ? "#FEF08A" : (el.type === "image" ? "#38BDF8" : (el.type === "frame" ? "#C084FC" : "#D97A5E")))
        r.setAttribute("opacity", "0.7")
        r.setAttribute("rx", "4")
        this.minimapSvgTarget.appendChild(r)
      }
    })

    const canvasRect = this.canvasTarget.getBoundingClientRect()
    const viewX = (-this.scrollX) / this.zoom
    const viewY = (-this.scrollY) / this.zoom
    const viewW = canvasRect.width / this.zoom
    const viewH = canvasRect.height / this.zoom

    const normLeft = ((viewX - minX) / worldW) * 100
    const normTop = ((viewY - minY) / worldH) * 100
    const normW = (viewW / worldW) * 100
    const normH = (viewH / worldH) * 100

    this.minimapViewportTarget.style.left = `${Math.max(0, Math.min(90, normLeft))}%`
    this.minimapViewportTarget.style.top = `${Math.max(0, Math.min(90, normTop))}%`
    this.minimapViewportTarget.style.width = `${Math.max(8, Math.min(100, normW))}%`
    this.minimapViewportTarget.style.height = `${Math.max(8, Math.min(100, normH))}%`
  }

  onMinimapClick(event) {
    const rect = this.minimapStageTarget.getBoundingClientRect()
    const clickX = (event.clientX - rect.left) / rect.width
    const clickY = (event.clientY - rect.top) / rect.height

    let minX = -1000, minY = -1000, maxX = 3000, maxY = 3000
    this.elements.forEach(el => {
      if (el.x) {
        minX = Math.min(minX, el.x - 200)
        maxX = Math.max(maxX, el.x + (el.width || 100) + 200)
        minY = Math.min(minY, el.y - 200)
        maxY = Math.max(maxY, el.y + (el.height || 60) + 200)
      }
    })

    const targetCanvasX = minX + clickX * (maxX - minX)
    const targetCanvasY = minY + clickY * (maxY - minY)

    const canvasRect = this.canvasTarget.getBoundingClientRect()
    this.scrollX = (canvasRect.width / 2) - (targetCanvasX * this.zoom)
    this.scrollY = (canvasRect.height / 2) - (targetCanvasY * this.zoom)
    this.updateViewport()
    this.updateMinimap()
  }

  // Preset Blocks Inserter
  insertPresetBlock(event) {
    const preset = event.currentTarget.dataset.preset
    const rect = this.canvasTarget.getBoundingClientRect()
    const { x, y } = this.screenToCanvas(rect.left + rect.width / 2, rect.top + rect.height / 2)
    const baseId = Date.now()

    switch (preset) {
      case "quadrant":
        this.elements.push(
          { id: `swot-${baseId}-1`, type: "rect", x: x - 190, y: y - 130, width: 180, height: 120, text: "Forças", fill: "#1E3A2F", stroke: "#10B981", strokeWidth: 2, rx: 12 },
          { id: `swot-${baseId}-2`, type: "rect", x: x + 10, y: y - 130, width: 180, height: 120, text: "Fraquezas", fill: "#3A1E1E", stroke: "#EF4444", strokeWidth: 2, rx: 12 },
          { id: `swot-${baseId}-3`, type: "rect", x: x - 190, y: y + 10, width: 180, height: 120, text: "Oportunidades", fill: "#1E2A3A", stroke: "#3B82F6", strokeWidth: 2, rx: 12 },
          { id: `swot-${baseId}-4`, type: "rect", x: x + 10, y: y + 10, width: 180, height: 120, text: "Ameaças", fill: "#3A301E", stroke: "#F59E0B", strokeWidth: 2, rx: 12 }
        )
        break

      case "kanban":
        this.elements.push(
          { id: `kb-${baseId}-1`, type: "rect", x: x - 270, y: y - 140, width: 160, height: 260, text: "A Fazer", fill: "#1E1E22", stroke: "#6B7280", strokeWidth: 2, rx: 16 },
          { id: `kb-${baseId}-2`, type: "rect", x: x - 80, y: y - 140, width: 160, height: 260, text: "Em Progresso", fill: "#1E2530", stroke: "#3B82F6", strokeWidth: 2, rx: 16 },
          { id: `kb-${baseId}-3`, type: "rect", x: x + 110, y: y - 140, width: 160, height: 260, text: "Concluído", fill: "#1E2E24", stroke: "#10B981", strokeWidth: 2, rx: 16 }
        )
        break

      case "architecture":
        this.elements.push(
          { id: `arch-${baseId}-1`, type: "mermaid", x: x - 260, y: y - 160, width: 520, height: 320, code: "graph TD\n  Web[\"Frontend Next.js\"] --> API[\"Backend Rails API\"]\n  API --> DB[(\"PostgreSQL Main\")]\n  API --> Cache[(\"Redis Cache\")]\n  API --> S3[(\"Cloud Storage\")]" }
        )
        break

      case "brainstorm":
        this.elements.push(
          { id: `bs-${baseId}-1`, type: "sticky", x: x - 170, y: y - 110, width: 150, height: 130, text: "Ideia Principal #1", fill: "#FEF08A", textColor: "#1C1917" },
          { id: `bs-${baseId}-2`, type: "sticky", x: x + 20, y: y - 110, width: 150, height: 130, text: "Ponto Crítico #2", fill: "#BAE6FD", textColor: "#1C1917" },
          { id: `bs-${baseId}-3`, type: "sticky", x: x - 170, y: y + 40, width: 150, height: 130, text: "Oportunidade #3", fill: "#BBF7D0", textColor: "#1C1917" },
          { id: `bs-${baseId}-4`, type: "sticky", x: x + 20, y: y + 40, width: 150, height: 130, text: "Próximos Passos #4", fill: "#FECDD3", textColor: "#1C1917" }
        )
        break

      case "frame_wireframe":
        this.elements.push(
          { id: `frm-${baseId}-1`, type: "frame", x: x - 250, y: y - 180, width: 500, height: 360, text: "Fluxo de Cadastro & Autenticação", stroke: "#A855F7" }
        )
        break
    }

    this.renderAll()
    this.updateStatusBar()
    this.updateMinimap()
    this.saveStateToHistory()
    this.autoSave()
  }

  createElementAt(type, x, y) {
    const id = 'el-' + Date.now()
    let newElement = null

    if (this.snapEnabled) {
      x = Math.round(x / this.snapSize) * this.snapSize
      y = Math.round(y / this.snapSize) * this.snapSize
    }

    switch (type) {
      case "frame":
        newElement = {
          id,
          type: "frame",
          x: Math.round(x - 200),
          y: Math.round(y - 150),
          width: 400,
          height: 300,
          text: "Nova Seção / Frame",
          stroke: "#8B5CF6"
        }
        break

      case "sticky":
        newElement = {
          id,
          type: "sticky",
          x: Math.round(x - 90),
          y: Math.round(y - 70),
          width: 180,
          height: 150,
          text: "Nova Nota Adesiva",
          fill: this.currentStickyColor || "#FEF08A",
          textColor: "#1C1917"
        }
        break

      case "rect":
        newElement = {
          id,
          type: "rect",
          x: Math.round(x - 80),
          y: Math.round(y - 50),
          width: 160,
          height: 100,
          text: "Retângulo",
          stroke: this.currentStroke,
          fill: this.currentFill,
          strokeWidth: this.currentStrokeWidth,
          rx: 12
        }
        break

      case "circle":
        newElement = {
          id,
          type: "circle",
          x: Math.round(x - 60),
          y: Math.round(y - 60),
          width: 120,
          height: 120,
          text: "Círculo",
          stroke: this.currentStroke,
          fill: this.currentFill,
          strokeWidth: this.currentStrokeWidth
        }
        break

      case "diamond":
        newElement = {
          id,
          type: "diamond",
          x: Math.round(x - 70),
          y: Math.round(y - 50),
          width: 140,
          height: 100,
          text: "Decisão?",
          stroke: this.currentStroke,
          fill: this.currentFill,
          strokeWidth: this.currentStrokeWidth
        }
        break

      case "arrow":
        newElement = {
          id,
          type: "arrow",
          startX: Math.round(x - 80),
          startY: Math.round(y),
          endX: Math.round(x + 80),
          endY: Math.round(y),
          stroke: this.currentStroke,
          strokeWidth: this.currentStrokeWidth
        }
        break

      case "text":
        newElement = {
          id,
          type: "text",
          x: Math.round(x - 60),
          y: Math.round(y - 20),
          width: 160,
          height: 40,
          text: "Texto descritivo...",
          textColor: "#FFFFFF",
          fontSize: 16
        }
        break

      case "mermaid":
        newElement = {
          id,
          type: "mermaid",
          x: Math.round(x - 220),
          y: Math.round(y - 140),
          width: 460,
          height: 300,
          code: "graph TD\n  A[\"Início\"] --> B[\"Processamento\"]\n  B --> C[\"Concluído\"]"
        }
        break
    }

    if (newElement) {
      this.elements.push(newElement)
      this.selectedElementIds = [newElement.id]
      this.setToolDirectly("select")
      this.renderAll()
      this.showPropertiesPanel()
      this.updateStatusBar()
      this.updateMinimap()
      this.saveStateToHistory()
      this.autoSave()
    }
  }

  getElementAt(x, y) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i]
      if (el.type === "arrow") {
        const minX = Math.min(el.startX, el.endX) - 15
        const maxX = Math.max(el.startX, el.endX) + 15
        const minY = Math.min(el.startY, el.endY) - 15
        const maxY = Math.max(el.startY, el.endY) + 15
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) return el
      } else if (el.type === "pen") {
        if (el.points && el.points.length > 0) {
          const xs = el.points.map(p => p.x)
          const ys = el.points.map(p => p.y)
          if (x >= Math.min(...xs) - 15 && x <= Math.max(...xs) + 15 &&
              y >= Math.min(...ys) - 15 && y <= Math.max(...ys) + 15) return el
        }
      } else {
        if (x >= el.x && x <= el.x + (el.width || 100) && y >= el.y && y <= el.y + (el.height || 60)) {
          return el
        }
      }
    }
    return null
  }

  deselectAll() {
    this.selectedElementIds = []
    this.renderAll()
    this.hidePropertiesPanel()
  }

  duplicateSelected() {
    if (!this.selectedElementIds.length) return
    const newlyCreatedIds = []

    this.selectedElementIds.forEach(id => {
      const el = this.elements.find(e => e.id === id)
      if (el) {
        const newId = 'el-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
        const cloned = JSON.parse(JSON.stringify(el))
        cloned.id = newId

        if (cloned.type === "arrow") {
          cloned.startX += 20
          cloned.startY += 20
          cloned.endX += 20
          cloned.endY += 20
        } else if (cloned.type === "pen") {
          cloned.points = cloned.points.map(p => ({ x: p.x + 20, y: p.y + 20 }))
        } else {
          cloned.x += 20
          cloned.y += 20
        }

        this.elements.push(cloned)
        newlyCreatedIds.push(newId)
      }
    })

    this.selectedElementIds = newlyCreatedIds
    this.renderAll()
    this.showPropertiesPanel()
    this.updateStatusBar()
    this.updateMinimap()
    this.saveStateToHistory()
    this.autoSave()
  }

  deleteSelected() {
    if (!this.selectedElementIds.length) return
    this.elements = this.elements.filter(el => !this.selectedElementIds.includes(el.id))
    this.selectedElementIds = []
    this.renderAll()
    this.hidePropertiesPanel()
    this.updateStatusBar()
    this.updateMinimap()
    this.saveStateToHistory()
    this.autoSave()
  }

  bringToFront() {
    if (!this.selectedElementIds.length) return
    const moving = []
    const remaining = []

    this.elements.forEach(el => {
      if (this.selectedElementIds.includes(el.id)) {
        moving.push(el)
      } else {
        remaining.push(el)
      }
    })

    this.elements = [...remaining, ...moving]
    this.renderAll()
    this.autoSave()
  }

  sendToBack() {
    if (!this.selectedElementIds.length) return
    const moving = []
    const remaining = []

    this.elements.forEach(el => {
      if (this.selectedElementIds.includes(el.id)) {
        moving.push(el)
      } else {
        remaining.push(el)
      }
    })

    this.elements = [...moving, ...remaining]
    this.renderAll()
    this.autoSave()
  }

  showPropertiesPanel() {
    if (!this.hasPropertiesPanelTarget) return
    if (!this.selectedElementIds.length) {
      this.hidePropertiesPanel()
      return
    }

    const firstId = this.selectedElementIds[0]
    const el = this.elements.find(e => e.id === firstId)
    if (!el) return

    this.propertiesPanelTarget.classList.remove("hidden")

    const typeNames = {
      sticky: "Nota Adesiva",
      image: "Imagem",
      frame: "Quadro / Seção",
      stamp: "Carimbo",
      rect: "Retângulo",
      circle: "Círculo",
      diamond: "Decisão",
      arrow: "Seta Conectora",
      pen: "Traçado Livre",
      text: "Texto",
      mermaid: "Diagrama Mermaid"
    }

    if (this.hasPropTypeBadgeTarget) {
      if (this.selectedElementIds.length > 1) {
        this.propTypeBadgeTarget.textContent = `${this.selectedElementIds.length} Itens Selecionados`
      } else {
        this.propTypeBadgeTarget.textContent = typeNames[el.type] || "Elemento"
      }
    }

    if (this.hasPropTextContainerTarget && this.hasPropTextInputTarget) {
      if (this.selectedElementIds.length === 1 && ["sticky", "rect", "circle", "diamond", "text", "frame"].includes(el.type)) {
        this.propTextContainerTarget.classList.remove("hidden")
        this.propTextInputTarget.value = el.text || ""
      } else {
        this.propTextContainerTarget.classList.add("hidden")
      }
    }

    if (this.hasPropConvertIssueContainerTarget) {
      if (this.selectedElementIds.length === 1 && ["sticky", "text", "rect", "circle", "diamond"].includes(el.type)) {
        this.propConvertIssueContainerTarget.classList.remove("hidden")
      } else {
        this.propConvertIssueContainerTarget.classList.add("hidden")
      }
    }

    if (this.hasPropMermaidContainerTarget) {
      if (this.selectedElementIds.length === 1 && el.type === "mermaid") {
        this.propMermaidContainerTarget.classList.remove("hidden")
      } else {
        this.propMermaidContainerTarget.classList.add("hidden")
      }
    }

    if (this.hasPropFillContainerTarget) {
      if (this.selectedElementIds.some(id => {
        const item = this.elements.find(e => e.id === id)
        return item && ["sticky", "rect", "circle", "diamond"].includes(item.type)
      })) {
        this.propFillContainerTarget.classList.remove("hidden")
      } else {
        this.propFillContainerTarget.classList.add("hidden")
      }
    }

    if (this.hasPropStrokeContainerTarget) {
      if (this.selectedElementIds.some(id => {
        const item = this.elements.find(e => e.id === id)
        return item && ["rect", "circle", "diamond", "arrow", "pen", "frame"].includes(item.type)
      })) {
        this.propStrokeContainerTarget.classList.remove("hidden")
      } else {
        this.propStrokeContainerTarget.classList.add("hidden")
      }
    }
  }

  hidePropertiesPanel() {
    if (!this.hasPropertiesPanelTarget) return
    this.propertiesPanelTarget.classList.add("hidden")
  }

  onPropTextInput(event) {
    if (this.selectedElementIds.length === 1) {
      const el = this.elements.find(e => e.id === this.selectedElementIds[0])
      if (el) {
        el.text = event.target.value
        this.renderAll()
        this.autoSave()
      }
    }
  }

  openSelectedMermaidEditor() {
    if (this.selectedElementIds.length === 1) {
      this.openMermaidEditor(this.selectedElementIds[0])
    }
  }

  updateSelectedFill(event) {
    const color = event.currentTarget.dataset.color
    this.selectedElementIds.forEach(id => {
      const el = this.elements.find(e => e.id === id)
      if (el) {
        el.fill = color
        if (el.type === "sticky") el.fill = color
      }
    })
    this.currentFill = color
    this.renderAll()
    this.updateMinimap()
    this.autoSave()
  }

  updateSelectedStroke(event) {
    const color = event.currentTarget.dataset.color
    this.selectedElementIds.forEach(id => {
      const el = this.elements.find(e => e.id === id)
      if (el) el.stroke = color
    })
    this.currentStroke = color
    this.renderAll()
    this.autoSave()
  }

  updateSelectedStrokeWidth(event) {
    const width = parseInt(event.currentTarget.dataset.width, 10)
    this.selectedElementIds.forEach(id => {
      const el = this.elements.find(e => e.id === id)
      if (el) el.strokeWidth = width
    })
    this.currentStrokeWidth = width
    this.renderAll()
    this.autoSave()
  }

  // Rendering Engine
  renderAll() {
    if (!this.hasSvgLayerTarget || !this.hasNodesLayerTarget) return

    this.svgLayerTarget.innerHTML = ""
    this.nodesLayerTarget.innerHTML = ""

    this.elements.forEach(el => {
      const isSelected = this.selectedElementIds.includes(el.id)

      if (el.type === "image") {
        this.renderImageNode(el, isSelected)
      } else if (el.type === "frame") {
        this.renderFrameNode(el, isSelected)
      } else if (el.type === "stamp") {
        this.renderStampNode(el, isSelected)
      } else if (el.type === "sticky") {
        this.renderStickyNode(el, isSelected)
      } else if (el.type === "mermaid") {
        this.renderMermaidNode(el, isSelected)
      } else if (el.type === "text") {
        this.renderTextNode(el, isSelected)
      } else if (el.type === "pen") {
        this.renderPenStroke(el, isSelected)
      } else if (el.type === "arrow") {
        this.renderArrow(el, isSelected)
      } else if (["rect", "circle", "diamond"].includes(el.type)) {
        this.renderShape(el, isSelected)
      }
    })
  }

  renderImageNode(el, isSelected) {
    const node = document.createElement("div")
    node.className = `absolute pointer-events-auto select-none rounded-2xl shadow-xl transition-all cursor-move overflow-hidden border border-white/10 ${isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#121214] scale-[1.01]' : 'hover:border-white/20'}`
    node.style.left = `${el.x}px`
    node.style.top = `${el.y}px`
    node.style.width = `${el.width}px`
    node.style.height = `${el.height}px`
    node.dataset.elementId = el.id

    const img = document.createElement("img")
    img.src = el.src
    img.className = "w-full h-full object-cover pointer-events-none rounded-2xl"
    img.alt = el.title || "Imagem"

    if (isSelected && this.selectedElementIds.length === 1) {
      const resizeHandle = document.createElement("div")
      resizeHandle.className = "absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-sky-400 border-2 border-white rounded-full cursor-nwse-resize z-30"
      resizeHandle.addEventListener("pointerdown", (e) => {
        e.stopPropagation()
        const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
        this.startResizingElement(el, x, y, "se")
      })
      node.appendChild(resizeHandle)
    }

    node.appendChild(img)

    node.addEventListener("pointerdown", (e) => {
      if (!e.shiftKey && !this.selectedElementIds.includes(el.id)) {
        this.selectedElementIds = [el.id]
      }
      this.renderAll()
      this.showPropertiesPanel()
      const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
      this.startDraggingSelection(x, y)
    })

    this.nodesLayerTarget.appendChild(node)
  }

  renderFrameNode(el, isSelected) {
    const node = document.createElement("div")
    node.className = `absolute pointer-events-auto rounded-3xl border-2 border-dashed border-purple-500/40 bg-purple-500/5 transition-all p-3 flex flex-col justify-between cursor-move ${isSelected ? 'border-purple-400 ring-2 ring-purple-400/40 shadow-2xl' : ''}`
    node.style.left = `${el.x}px`
    node.style.top = `${el.y}px`
    node.style.width = `${el.width}px`
    node.style.height = `${el.height}px`
    node.dataset.elementId = el.id

    const header = document.createElement("div")
    header.className = "flex items-center justify-between pb-1 text-xs text-purple-300 font-bold uppercase tracking-wider select-none cursor-move"
    header.innerHTML = `
      <div class="flex items-center gap-1.5">
        <span>⊞</span>
        <span class="outline-none font-mono text-[11px] cursor-text" contenteditable="true">${el.text || 'Quadro / Seção'}</span>
      </div>
      <button type="button" class="delete-btn p-0.5 hover:text-red-400 text-purple-300/40 rounded transition-colors cursor-pointer">✕</button>
    `
    const titleSpan = header.querySelector("span[contenteditable='true']")
    titleSpan.addEventListener("pointerdown", (e) => e.stopPropagation())
    titleSpan.addEventListener("input", (e) => {
      el.text = e.target.innerText
      this.autoSave()
    })
    header.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation()
      this.selectedElementIds = [el.id]
      this.deleteSelected()
    })

    if (isSelected && this.selectedElementIds.length === 1) {
      const resizeHandle = document.createElement("div")
      resizeHandle.className = "absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-purple-500 border-2 border-white rounded-full cursor-nwse-resize z-30"
      resizeHandle.addEventListener("pointerdown", (e) => {
        e.stopPropagation()
        const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
        this.startResizingElement(el, x, y, "se")
      })
      node.appendChild(resizeHandle)
    }

    node.appendChild(header)

    node.addEventListener("pointerdown", (e) => {
      if (e.target === titleSpan || e.target.closest(".delete-btn")) return
      if (!e.shiftKey && !this.selectedElementIds.includes(el.id)) {
        this.selectedElementIds = [el.id]
      }
      this.renderAll()
      this.showPropertiesPanel()
      const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
      this.startDraggingSelection(x, y)
    })

    this.nodesLayerTarget.appendChild(node)
  }

  renderStampNode(el, isSelected) {
    const node = document.createElement("div")
    node.className = `absolute pointer-events-auto select-none rounded-2xl flex items-center justify-center cursor-move transition-transform ${isSelected ? 'ring-2 ring-amber-400 scale-110' : 'hover:scale-105'}`
    node.style.left = `${el.x}px`
    node.style.top = `${el.y}px`
    node.style.width = `${el.width || 48}px`
    node.style.height = `${el.height || 48}px`
    node.style.fontSize = `${(el.width || 48) * 0.65}px`
    node.textContent = el.emoji || "★"
    node.dataset.elementId = el.id

    node.addEventListener("pointerdown", (e) => {
      if (!e.shiftKey && !this.selectedElementIds.includes(el.id)) {
        this.selectedElementIds = [el.id]
      }
      this.renderAll()
      this.showPropertiesPanel()
      const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
      this.startDraggingSelection(x, y)
    })

    this.nodesLayerTarget.appendChild(node)
  }

  renderStickyNode(el, isSelected) {
    const node = document.createElement("div")
    node.className = `absolute pointer-events-auto select-none p-3.5 rounded-2xl shadow-lg transition-all flex flex-col justify-between cursor-move ${isSelected ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-[#121214] shadow-2xl scale-[1.01]' : 'hover:shadow-xl'}`
    node.style.left = `${el.x}px`
    node.style.top = `${el.y}px`
    node.style.width = `${el.width}px`
    node.style.height = `${el.height}px`
    node.style.backgroundColor = el.fill || "#FEF08A"
    node.style.color = el.textColor || "#1C1917"
    node.dataset.elementId = el.id

    const header = document.createElement("div")
    header.className = "flex items-center justify-between opacity-60 hover:opacity-100 text-[10px] pb-1 border-b border-black/10 select-none cursor-move"
    header.innerHTML = `
      <span class="font-mono uppercase font-bold tracking-wider text-[9px]">Post-it</span>
      <button type="button" class="delete-btn p-0.5 hover:text-red-600 rounded cursor-pointer transition-colors" title="Excluir">✕</button>
    `
    header.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation()
      this.selectedElementIds = [el.id]
      this.deleteSelected()
    })

    const textDiv = document.createElement("div")
    textDiv.className = "flex-1 outline-none text-xs font-sans font-medium whitespace-pre-wrap overflow-y-auto mt-1 cursor-text select-text"
    textDiv.contentEditable = "true"
    textDiv.textContent = el.text || ""
    textDiv.addEventListener("pointerdown", (e) => e.stopPropagation())
    textDiv.addEventListener("input", (e) => {
      el.text = e.target.innerText
      if (this.hasPropTextInputTarget && this.selectedElementIds.includes(el.id)) {
        this.propTextInputTarget.value = el.text
      }
      this.autoSave()
    })

    if (isSelected && this.selectedElementIds.length === 1) {
      const resizeHandle = document.createElement("div")
      resizeHandle.className = "absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-terracotta border-2 border-white rounded-full cursor-nwse-resize z-30"
      resizeHandle.addEventListener("pointerdown", (e) => {
        e.stopPropagation()
        const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
        this.startResizingElement(el, x, y, "se")
      })
      node.appendChild(resizeHandle)
    }

    node.appendChild(header)
    node.appendChild(textDiv)

    node.addEventListener("pointerdown", (e) => {
      if (e.target === textDiv || e.target.closest(".delete-btn")) return
      if (!e.shiftKey && !this.selectedElementIds.includes(el.id)) {
        this.selectedElementIds = [el.id]
      }
      this.renderAll()
      this.showPropertiesPanel()
      const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
      this.startDraggingSelection(x, y)
    })

    this.nodesLayerTarget.appendChild(node)
  }

  renderTextNode(el, isSelected) {
    const node = document.createElement("div")
    node.className = `absolute pointer-events-auto select-none px-3 py-1.5 rounded-xl cursor-move transition-all ${isSelected ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-[#121214] bg-white/5' : 'hover:bg-white/5'}`
    node.style.left = `${el.x}px`
    node.style.top = `${el.y}px`
    node.style.minWidth = `${el.width || 120}px`
    node.dataset.elementId = el.id

    const textDiv = document.createElement("div")
    textDiv.className = "outline-none text-sm font-sans font-semibold text-white whitespace-pre-wrap cursor-text select-text"
    textDiv.contentEditable = "true"
    textDiv.textContent = el.text || ""
    textDiv.addEventListener("pointerdown", (e) => e.stopPropagation())
    textDiv.addEventListener("input", (e) => {
      el.text = e.target.innerText
      if (this.hasPropTextInputTarget && this.selectedElementIds.includes(el.id)) {
        this.propTextInputTarget.value = el.text
      }
      this.autoSave()
    })

    node.appendChild(textDiv)

    node.addEventListener("pointerdown", (e) => {
      if (e.target === textDiv) return
      if (!e.shiftKey && !this.selectedElementIds.includes(el.id)) {
        this.selectedElementIds = [el.id]
      }
      this.renderAll()
      this.showPropertiesPanel()
      const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
      this.startDraggingSelection(x, y)
    })

    this.nodesLayerTarget.appendChild(node)
  }

  async renderMermaidNode(el, isSelected) {
    const node = document.createElement("div")
    node.className = `absolute pointer-events-auto rounded-3xl bg-[#1C1C20] border border-white/10 shadow-2xl p-4 cursor-move overflow-hidden flex flex-col justify-between transition-all ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#121214]' : 'hover:border-white/20'}`
    node.style.left = `${el.x}px`
    node.style.top = `${el.y}px`
    node.style.width = `${el.width}px`
    node.style.minHeight = `${el.height}px`
    node.dataset.elementId = el.id

    const header = document.createElement("div")
    header.className = "flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs shrink-0 select-none cursor-move"
    header.innerHTML = `
      <div class="flex items-center gap-1.5 font-bold text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
        <span>Diagrama Mermaid</span>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" class="edit-code-btn px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 text-[11px] text-white/80 transition-colors font-medium cursor-pointer">
          Editar Código
        </button>
        <button type="button" class="delete-btn p-1 text-white/40 hover:text-red-400 rounded transition-colors cursor-pointer" title="Excluir">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </div>
    `
    header.querySelector(".edit-code-btn").addEventListener("click", (e) => {
      e.stopPropagation()
      this.openMermaidEditor(el.id)
    })
    header.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation()
      this.selectedElementIds = [el.id]
      this.deleteSelected()
    })

    const svgContainer = document.createElement("div")
    svgContainer.className = "mermaid-svg-target flex-1 flex items-center justify-center overflow-auto p-2 cursor-pointer"
    svgContainer.id = `mermaid-target-${el.id}`

    if (isSelected && this.selectedElementIds.length === 1) {
      const resizeHandle = document.createElement("div")
      resizeHandle.className = "absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full cursor-nwse-resize z-30"
      resizeHandle.addEventListener("pointerdown", (e) => {
        e.stopPropagation()
        const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
        this.startResizingElement(el, x, y, "se")
      })
      node.appendChild(resizeHandle)
    }

    node.appendChild(header)
    node.appendChild(svgContainer)

    node.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".edit-code-btn") || e.target.closest(".delete-btn")) return
      if (!e.shiftKey && !this.selectedElementIds.includes(el.id)) {
        this.selectedElementIds = [el.id]
      }
      this.renderAll()
      this.showPropertiesPanel()
      const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
      this.startDraggingSelection(x, y)
    })

    this.nodesLayerTarget.appendChild(node)

    try {
      const cleanCode = (el.code || "graph TD\n  A[\"Início\"] --> B[\"Fim\"]").trim()
      const renderId = `mermaid_svg_${el.id.toString().replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
      const { svg } = await mermaid.render(renderId, cleanCode)
      svgContainer.innerHTML = svg
      this.cleanupMermaidErrorElements()
    } catch (err) {
      this.cleanupMermaidErrorElements()
      svgContainer.innerHTML = `<div class="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">Formato para editar. Clique em "Editar Código".</div>`
    }
  }

  renderPenStroke(el, isSelected) {
    if (!el.points || el.points.length < 2) return
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    let d = `M ${el.points[0].x} ${el.points[0].y}`
    for (let i = 1; i < el.points.length; i++) {
      d += ` L ${el.points[i].x} ${el.points[i].y}`
    }
    path.setAttribute("d", d)
    path.setAttribute("stroke", isSelected ? "#D97A5E" : (el.stroke || "#FFFFFF"))
    path.setAttribute("stroke-width", isSelected ? 3 : (el.strokeWidth || 2))
    path.setAttribute("fill", "none")
    path.setAttribute("stroke-linecap", "round")
    path.setAttribute("stroke-linejoin", "round")
    path.setAttribute("class", "cursor-pointer")
    this.svgLayerTarget.appendChild(path)
  }

  renderArrow(el, isSelected) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute("class", "cursor-pointer")

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", el.startX)
    line.setAttribute("y1", el.startY)
    line.setAttribute("x2", el.endX)
    line.setAttribute("y2", el.endY)
    line.setAttribute("stroke", isSelected ? "#D97A5E" : (el.stroke || "#FFFFFF"))
    line.setAttribute("stroke-width", isSelected ? 3 : (el.strokeWidth || 2))
    line.setAttribute("stroke-linecap", "round")

    const angle = Math.atan2(el.endY - el.startY, el.endX - el.startX)
    const arrowLength = 14
    const arrowX1 = el.endX - arrowLength * Math.cos(angle - Math.PI / 6)
    const arrowY1 = el.endY - arrowLength * Math.sin(angle - Math.PI / 6)
    const arrowX2 = el.endX - arrowLength * Math.cos(angle + Math.PI / 6)
    const arrowY2 = el.endY - arrowLength * Math.sin(angle + Math.PI / 6)

    const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    head.setAttribute("points", `${el.endX},${el.endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`)
    head.setAttribute("fill", isSelected ? "#D97A5E" : (el.stroke || "#FFFFFF"))

    g.appendChild(line)
    g.appendChild(head)

    if (isSelected) {
      const startHandle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      startHandle.setAttribute("cx", el.startX)
      startHandle.setAttribute("cy", el.startY)
      startHandle.setAttribute("r", "6")
      startHandle.setAttribute("fill", "#D97A5E")
      startHandle.setAttribute("stroke", "#FFFFFF")
      startHandle.setAttribute("stroke-width", "2")
      startHandle.setAttribute("class", "cursor-move")

      const endHandle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      endHandle.setAttribute("cx", el.endX)
      endHandle.setAttribute("cy", el.endY)
      endHandle.setAttribute("r", "6")
      endHandle.setAttribute("fill", "#D97A5E")
      endHandle.setAttribute("stroke", "#FFFFFF")
      endHandle.setAttribute("stroke-width", "2")
      endHandle.setAttribute("class", "cursor-move")

      g.appendChild(startHandle)
      g.appendChild(endHandle)
    }

    this.svgLayerTarget.appendChild(g)
  }

  renderShape(el, isSelected) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute("class", "cursor-pointer")
    g.setAttribute("data-element-id", el.id)

    let shape
    if (el.type === "rect") {
      shape = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      shape.setAttribute("x", el.x)
      shape.setAttribute("y", el.y)
      shape.setAttribute("width", el.width)
      shape.setAttribute("height", el.height)
      shape.setAttribute("rx", el.rx || 12)
    } else if (el.type === "circle") {
      shape = document.createElementNS("http://www.w3.org/2000/svg", "ellipse")
      shape.setAttribute("cx", el.x + el.width / 2)
      shape.setAttribute("cy", el.y + el.height / 2)
      shape.setAttribute("rx", el.width / 2)
      shape.setAttribute("ry", el.height / 2)
    } else if (el.type === "diamond") {
      shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
      const cx = el.x + el.width / 2
      const cy = el.y + el.height / 2
      shape.setAttribute("points", `${cx},${el.y} ${el.x + el.width},${cy} ${cx},${el.y + el.height} ${el.x},${cy}`)
    }

    if (shape) {
      shape.setAttribute("fill", el.fill === "transparent" ? "none" : (el.fill || "#2A2A2B"))
      shape.setAttribute("stroke", isSelected ? "#D97A5E" : (el.stroke || "#FFFFFF"))
      shape.setAttribute("stroke-width", isSelected ? 3 : (el.strokeWidth || 2))
      g.appendChild(shape)

      if (el.text) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("x", el.x + el.width / 2)
        text.setAttribute("y", el.y + el.height / 2 + 5)
        text.setAttribute("fill", "#FFFFFF")
        text.setAttribute("font-size", "13")
        text.setAttribute("font-weight", "600")
        text.setAttribute("font-family", "sans-serif")
        text.setAttribute("text-anchor", "middle")
        text.setAttribute("pointer-events", "none")
        text.textContent = el.text
        g.appendChild(text)
      }

      if (isSelected && this.selectedElementIds.length === 1) {
        const resizeHandle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        resizeHandle.setAttribute("cx", el.x + el.width)
        resizeHandle.setAttribute("cy", el.y + el.height)
        resizeHandle.setAttribute("r", "6")
        resizeHandle.setAttribute("fill", "#D97A5E")
        resizeHandle.setAttribute("stroke", "#FFFFFF")
        resizeHandle.setAttribute("stroke-width", "2")
        resizeHandle.setAttribute("class", "cursor-nwse-resize")
        resizeHandle.addEventListener("pointerdown", (e) => {
          e.stopPropagation()
          const { x, y } = this.screenToCanvas(e.clientX, e.clientY)
          this.startResizingElement(el, x, y, "se")
        })
        g.appendChild(resizeHandle)
      }
    }

    this.svgLayerTarget.appendChild(g)
  }

  // Mermaid Live Modal Editor
  openMermaidEditor(elementId) {
    const el = this.elements.find(e => e.id === elementId)
    if (!el) return

    this.editingMermaidElementId = elementId
    if (this.hasMermaidInputTarget) {
      this.mermaidInputTarget.value = el.code || ""
    }
    if (this.hasMermaidEditorTarget) {
      this.mermaidEditorTarget.classList.remove("hidden")
      this.compileMermaidPreview()
    }
  }

  closeMermaidEditor() {
    if (this.hasMermaidEditorTarget) {
      this.mermaidEditorTarget.classList.add("hidden")
    }
    this.cleanupMermaidErrorElements()
  }

  async compileMermaidPreview() {
    if (!this.hasMermaidInputTarget || !this.hasMermaidPreviewTarget) return
    const code = this.mermaidInputTarget.value.trim()

    if (!code) {
      this.mermaidPreviewTarget.innerHTML = `<span class="text-xs text-white/40">Digite um código Mermaid para visualizar.</span>`
      return
    }

    try {
      const renderId = `mermaid_preview_${Date.now()}`
      const { svg } = await mermaid.render(renderId, code)
      this.mermaidPreviewTarget.innerHTML = svg
      if (this.hasMermaidErrorTarget) this.mermaidErrorTarget.classList.add("hidden")
      this.cleanupMermaidErrorElements()
    } catch (err) {
      this.cleanupMermaidErrorElements()
      if (this.hasMermaidErrorTarget) {
        this.mermaidErrorTarget.textContent = err.message || "Erro de sintaxe no código Mermaid."
        this.mermaidErrorTarget.classList.remove("hidden")
      }
    }
  }

  saveMermaidCode() {
    const el = this.elements.find(e => e.id === this.editingMermaidElementId)
    if (el && this.hasMermaidInputTarget) {
      el.code = this.mermaidInputTarget.value.trim()
      this.renderAll()
      this.closeMermaidEditor()
      this.saveStateToHistory()
      this.autoSave()
    }
  }

  insertMermaidSnippet(event) {
    const snippet = event.currentTarget.dataset.snippet
    if (!this.hasMermaidInputTarget) return

    let template = ""
    switch (snippet) {
      case "flowchart":
        template = "graph TD\n  A[\"Início do Fluxo\"] --> B{\"Decisão\"}\n  B -->|\"Sim\"| C[\"Executar Ação 1\"]\n  B -->|\"Não\"| D[\"Executar Ação 2\"]\n  C --> E[\"Finalizado\"]\n  D --> E"
        break
      case "sequence":
        template = "sequenceDiagram\n  autonumber\n  actor User as Usuario\n  participant Client as Frontend\n  participant API as Backend Core\n  participant DB as Banco de Dados\n\n  User->>Client: Clica no botão\n  Client->>API: POST /api/v1/auth\n  API->>DB: Consulta credenciais\n  DB-->>API: Retorna usuário\n  API-->>Client: Token JWT 200 OK\n  Client-->>User: Redireciona"
        break
      case "er":
        template = "erDiagram\n  WORKSPACE ||--o{ PROJECT : contains\n  PROJECT ||--o{ DOCUMENT : has\n  PROJECT ||--o{ WHITEBOARD : includes\n  PROJECT ||--o{ ISSUE : tracks\n  USER ||--o{ WORKSPACE : owns"
        break
      case "class":
        template = "classDiagram\n  class Workspace {\n    +String name\n    +createProject()\n  }\n  class Project {\n    +String title\n    +addIssue()\n  }\n  Workspace --> Project"
        break
      case "git":
        template = "gitGraph\n  commit\n  branch develop\n  checkout develop\n  commit\n  branch feature\n  checkout feature\n  commit\n  checkout develop\n  merge feature\n  checkout main\n  merge develop tag: \"v1.0.0\""
        break
    }

    this.mermaidInputTarget.value = template
    this.compileMermaidPreview()
  }

  // Undo / Redo
  saveStateToHistory() {
    const state = JSON.stringify(this.elements)
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }
    this.history.push(state)
    this.historyIndex++
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      this.elements = JSON.parse(this.history[this.historyIndex])
      this.renderAll()
      this.updateStatusBar()
      this.updateMinimap()
      this.autoSave()
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.elements = JSON.parse(this.history[this.historyIndex])
      this.renderAll()
      this.updateStatusBar()
      this.updateMinimap()
      this.autoSave()
    }
  }

  // Auto-Save Persistence
  autoSave() {
    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      this.executeSave()
    }, 500)
  }

  async executeSave() {
    if (this.hasSaveStatusTarget) {
      this.saveStatusTarget.textContent = "Salvando..."
    }

    const payload = {
      whiteboard: {
        content: JSON.stringify({
          elements: this.elements,
          viewport: { zoom: this.zoom, scrollX: this.scrollX, scrollY: this.scrollY }
        })
      }
    }

    try {
      const csrfToken = document.querySelector("meta[name='csrf-token']")?.content
      const response = await fetch(this.saveUrlValue, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        if (this.hasSaveStatusTarget) {
          this.saveStatusTarget.textContent = "Salvo"
        }
      }
    } catch (e) {
      console.warn("Save failed:", e)
      if (this.hasSaveStatusTarget) {
        this.saveStatusTarget.textContent = "Erro ao salvar"
      }
    }
  }

  // Zoom & Viewport
  screenToCanvas(clientX, clientY) {
    const rect = this.canvasTarget.getBoundingClientRect()
    const x = (clientX - rect.left - this.scrollX) / this.zoom
    const y = (clientY - rect.top - this.scrollY) / this.zoom
    return { x, y }
  }

  updateViewport() {
    if (this.hasStageTarget) {
      this.stageTarget.style.transform = `translate(${this.scrollX}px, ${this.scrollY}px) scale(${this.zoom})`
      this.stageTarget.style.transformOrigin = "0 0"
    }
    if (this.hasZoomLabelTarget) {
      this.zoomLabelTarget.textContent = `${Math.round(this.zoom * 100)}%`
    }
  }

  updateStatusBar() {
    if (this.hasElementCountLabelTarget) {
      this.elementCountLabelTarget.textContent = `${this.elements.length} ${this.elements.length === 1 ? 'elemento' : 'elementos'}`
    }
  }

  zoomIn() {
    this.zoom = Math.min(4.0, this.zoom * 1.2)
    this.updateViewport()
    this.updateMinimap()
  }

  zoomOut() {
    this.zoom = Math.max(0.15, this.zoom / 1.2)
    this.updateViewport()
    this.updateMinimap()
  }

  resetZoom() {
    this.zoom = 1.0
    this.scrollX = 0
    this.scrollY = 0
    this.updateViewport()
    this.updateMinimap()
  }

  zoomToFit() {
    if (!this.elements.length) {
      this.resetZoom()
      return
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    this.elements.forEach(el => {
      if (el.type === "arrow") {
        minX = Math.min(minX, el.startX, el.endX)
        maxX = Math.max(maxX, el.startX, el.endX)
        minY = Math.min(minY, el.startY, el.endY)
        maxY = Math.max(maxY, el.startY, el.endY)
      } else if (el.type === "pen") {
        if (el.points && el.points.length) {
          el.points.forEach(p => {
            minX = Math.min(minX, p.x)
            maxX = Math.max(maxX, p.x)
            minY = Math.min(minY, p.y)
            maxY = Math.max(maxY, p.y)
          })
        }
      } else {
        minX = Math.min(minX, el.x)
        maxX = Math.max(maxX, el.x + (el.width || 100))
        minY = Math.min(minY, el.y)
        maxY = Math.max(maxY, el.y + (el.height || 60))
      }
    })

    const padding = 80
    const boundsW = Math.max(100, maxX - minX + padding * 2)
    const boundsH = Math.max(100, maxY - minY + padding * 2)
    const canvasRect = this.canvasTarget.getBoundingClientRect()

    const scaleX = canvasRect.width / boundsW
    const scaleY = canvasRect.height / boundsH
    this.zoom = Math.min(Math.max(0.2, Math.min(scaleX, scaleY)), 2.0)

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    this.scrollX = (canvasRect.width / 2) - (centerX * this.zoom)
    this.scrollY = (canvasRect.height / 2) - (centerY * this.zoom)
    this.updateViewport()
    this.updateMinimap()
  }

  // Keyboard Handlers
  onWheel(event) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.min(Math.max(0.15, this.zoom * zoomFactor), 4.0)
      
      const rect = this.canvasTarget.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      this.scrollX = mouseX - (mouseX - this.scrollX) * (newZoom / this.zoom)
      this.scrollY = mouseY - (mouseY - this.scrollY) * (newZoom / this.zoom)
      this.zoom = newZoom
      
      this.updateViewport()
      this.updateMinimap()
    } else {
      this.scrollX -= event.deltaX
      this.scrollY -= event.deltaY
      this.updateViewport()
      this.updateMinimap()
    }
  }

  onKeyDown(event) {
    if (event.code === "Space" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && !document.activeElement.isContentEditable) {
      this.isSpacePressed = true
      this.canvasTarget.style.cursor = "grab"
    }

    if (event.key === "Escape") {
      if (this.hasMermaidEditorTarget && !this.mermaidEditorTarget.classList.contains("hidden")) {
        this.closeMermaidEditor()
      } else if (this.hasShortcutsModalTarget && !this.shortcutsModalTarget.classList.contains("hidden")) {
        this.toggleShortcutsModal()
      } else {
        this.deselectAll()
        this.setToolDirectly("select")
      }
      return
    }

    if (event.key === "?" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && !document.activeElement.isContentEditable) {
      this.toggleShortcutsModal()
      return
    }

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && this.selectedElementIds.length > 0) {
      if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && !document.activeElement.isContentEditable) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        const deltaX = event.key === "ArrowLeft" ? -step : (event.key === "ArrowRight" ? step : 0)
        const deltaY = event.key === "ArrowUp" ? -step : (event.key === "ArrowDown" ? step : 0)

        this.selectedElementIds.forEach(id => {
          const el = this.elements.find(e => e.id === id)
          if (el) {
            if (el.type === "arrow") {
              el.startX += deltaX
              el.startY += deltaY
              el.endX += deltaX
              el.endY += deltaY
            } else if (el.type === "pen") {
              if (el.points) {
                el.points.forEach(p => { p.x += deltaX; p.y += deltaY })
              }
            } else {
              el.x += deltaX
              el.y += deltaY
            }
          }
        })
        this.renderAll()
        this.autoSave()
        return
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "1") {
      event.preventDefault()
      this.zoomToFit()
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && this.selectedElementIds.length > 0) {
      event.preventDefault()
      this.duplicateSelected()
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "]") {
      event.preventDefault()
      this.bringToFront()
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "[") {
      event.preventDefault()
      this.sendToBack()
      return
    }

    if ((event.key === "Delete" || event.key === "Backspace") && this.selectedElementIds.length > 0) {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable) {
        return
      }
      event.preventDefault()
      this.deleteSelected()
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable) {
        return
      }
      event.preventDefault()
      if (event.shiftKey) {
        this.redo()
      } else {
        this.undo()
      }
      return
    }

    if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && !document.activeElement.isContentEditable) {
      const key = event.key.toLowerCase()
      if (key === "v") this.setToolDirectly("select")
      if (key === "h") this.setToolDirectly("pan")
      if (key === "i") this.openImagePicker()
      if (key === "f") this.setToolDirectly("frame")
      if (key === "s") this.setToolDirectly("sticky")
      if (key === "r") this.setToolDirectly("rect")
      if (key === "o") this.setToolDirectly("circle")
      if (key === "d") this.setToolDirectly("diamond")
      if (key === "a") this.setToolDirectly("arrow")
      if (key === "p") this.setToolDirectly("pen")
      if (key === "t") this.setToolDirectly("text")
      if (key === "m") this.setToolDirectly("mermaid")
    }
  }

  onKeyUp(event) {
    if (event.code === "Space") {
      this.isSpacePressed = false
      this.canvasTarget.style.cursor = this.activeTool === "pan" ? "grab" : (this.activeTool === "select" ? "default" : "crosshair")
    }
  }

  // Export Suite
  exportPNG() {
    if (!this.elements.length) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    this.elements.forEach(el => {
      if (el.type === "arrow") {
        minX = Math.min(minX, el.startX, el.endX)
        maxX = Math.max(maxX, el.startX, el.endX)
        minY = Math.min(minY, el.startY, el.endY)
        maxY = Math.max(maxY, el.startY, el.endY)
      } else if (el.type === "pen") {
        if (el.points && el.points.length) {
          el.points.forEach(p => {
            minX = Math.min(minX, p.x)
            maxX = Math.max(maxX, p.x)
            minY = Math.min(minY, p.y)
            maxY = Math.max(maxY, p.y)
          })
        }
      } else {
        minX = Math.min(minX, el.x)
        maxX = Math.max(maxX, el.x + (el.width || 120))
        minY = Math.min(minY, el.y)
        maxY = Math.max(maxY, el.y + (el.height || 80))
      }
    })

    const pad = 40
    const w = Math.max(200, maxX - minX + pad * 2)
    const h = Math.max(200, maxY - minY + pad * 2)

    const svgClone = this.svgLayerTarget.cloneNode(true)
    svgClone.setAttribute("width", w)
    svgClone.setAttribute("height", h)
    svgClone.setAttribute("viewBox", `${minX - pad} ${minY - pad} ${w} ${h}`)

    const svgString = new XMLSerializer().serializeToString(svgClone)
    const img = new Image()
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = w * 2
      canvas.height = h * 2
      const ctx = canvas.getContext("2d")
      ctx.scale(2, 2)
      ctx.fillStyle = "#121214"
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0)

      const pngUrl = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = pngUrl
      a.download = "canvas-diagram.png"
      a.click()
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  exportSVG() {
    const svgData = new XMLSerializer().serializeToString(this.svgLayerTarget)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", "canvas-export.svg")
    a.click()
  }

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.elements, null, 2))
    const a = document.createElement("a")
    a.setAttribute("href", dataStr)
    a.setAttribute("download", "canvas-export.json")
    a.click()
  }
}
