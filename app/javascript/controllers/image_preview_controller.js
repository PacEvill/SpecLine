import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "preview", "placeholder"]

  preview(event) {
    this.update(event)
  }

  update(event) {
    const input = event?.target || (this.hasInputTarget ? this.inputTarget : null)
    const file = input?.files?.[0]
    if (file) {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl)
      }
      this.previewUrl = URL.createObjectURL(file)
      if (this.hasPreviewTarget) {
        this.previewTarget.src = this.previewUrl
        this.previewTarget.classList.remove("hidden")
      }
      if (this.hasPlaceholderTarget) {
        this.placeholderTarget.classList.add("hidden")
      }
    }
  }

  disconnect() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
    }
  }
}
