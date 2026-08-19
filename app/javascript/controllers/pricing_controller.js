import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "toggle", "monthlyPrice", "annualPrice" ]

  connect() {
    this.isAnnual = false
  }

  toggle() {
    this.isAnnual = !this.isAnnual
    
    if (this.isAnnual) {
      this.toggleTarget.classList.add("translate-x-6")
      
      this.monthlyPriceTargets.forEach(el => {
        el.classList.remove("translate-y-0", "opacity-100", "pointer-events-auto")
        el.classList.add("-translate-y-4", "opacity-0", "pointer-events-none")
      })
      
      this.annualPriceTargets.forEach(el => {
        el.classList.remove("translate-y-4", "opacity-0", "pointer-events-none")
        el.classList.add("translate-y-0", "opacity-100", "pointer-events-auto")
      })
    } else {
      this.toggleTarget.classList.remove("translate-x-6")
      
      this.monthlyPriceTargets.forEach(el => {
        el.classList.remove("-translate-y-4", "opacity-0", "pointer-events-none")
        el.classList.add("translate-y-0", "opacity-100", "pointer-events-auto")
      })
      
      this.annualPriceTargets.forEach(el => {
        el.classList.remove("translate-y-0", "opacity-100", "pointer-events-auto")
        el.classList.add("translate-y-4", "opacity-0", "pointer-events-none")
      })
    }
  }
}
