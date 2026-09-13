import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "monthlyPrice", "annualPrice", "monthlyBtn", "annualBtn", "slider" ]

  connect() {
    this.isAnnual = true
    requestAnimationFrame(() => {
      this.updateView(false)
    })
    window.addEventListener("resize", this.handleResize)
  }

  disconnect() {
    window.removeEventListener("resize", this.handleResize)
  }

  handleResize = () => {
    this.updateSlider(false)
  }

  setMonthly() {
    if (!this.isAnnual) return
    this.isAnnual = false
    this.updateView(true)
  }

  setAnnual() {
    if (this.isAnnual) return
    this.isAnnual = true
    this.updateView(true)
  }

  updateView(animatePrices = true) {
    if (this.isAnnual) {
      this.monthlyPriceTargets.forEach(el => el.classList.add("hidden"))
      this.annualPriceTargets.forEach(el => {
        el.classList.remove("hidden")
        if (animatePrices) {
          el.classList.remove("animate-pop-in")
          void el.offsetWidth
          el.classList.add("animate-pop-in")
        }
      })

      // Annual is ACTIVE (Always white text in light mode, always dark ink text in dark mode, even on hover)
      if (this.hasAnnualBtnTarget) {
        this.annualBtnTarget.className = "relative z-10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-white dark:text-ink hover:text-white dark:hover:text-ink transition-colors duration-300 flex items-center gap-2 active:scale-95 cursor-pointer"
      }

      // Monthly is INACTIVE (Muted, turns sharper on hover)
      if (this.hasMonthlyBtnTarget) {
        this.monthlyBtnTarget.className = "relative z-10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-colors duration-300 active:scale-95 cursor-pointer"
      }
    } else {
      this.annualPriceTargets.forEach(el => el.classList.add("hidden"))
      this.monthlyPriceTargets.forEach(el => {
        el.classList.remove("hidden")
        if (animatePrices) {
          el.classList.remove("animate-pop-in")
          void el.offsetWidth
          el.classList.add("animate-pop-in")
        }
      })

      // Monthly is ACTIVE (Always white text in light mode, always dark ink text in dark mode, even on hover)
      if (this.hasMonthlyBtnTarget) {
        this.monthlyBtnTarget.className = "relative z-10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-white dark:text-ink hover:text-white dark:hover:text-ink transition-colors duration-300 active:scale-95 cursor-pointer"
      }

      // Annual is INACTIVE (Muted, turns sharper on hover)
      if (this.hasAnnualBtnTarget) {
        this.annualBtnTarget.className = "relative z-10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-colors duration-300 flex items-center gap-2 active:scale-95 cursor-pointer"
      }
    }

    this.updateSlider(true)
  }

  updateSlider(withTransition = true) {
    if (!this.hasSliderTarget) return
    const activeBtn = this.isAnnual ? this.annualBtnTarget : this.monthlyBtnTarget
    if (!activeBtn) return

    if (!withTransition) {
      this.sliderTarget.style.transition = "none"
    } else {
      this.sliderTarget.style.transition = "left 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.35s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s ease, top 0.35s ease"
    }

    this.sliderTarget.style.left = `${activeBtn.offsetLeft}px`
    this.sliderTarget.style.width = `${activeBtn.offsetWidth}px`
    this.sliderTarget.style.height = `${activeBtn.offsetHeight}px`
    this.sliderTarget.style.top = `${activeBtn.offsetTop}px`
  }
}
