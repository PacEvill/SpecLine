import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "bar", "text", "checklist", "requirementLength", "requirementLetter", "requirementNumber", "requirementSpecial"]

  connect() {
    if (this.hasInputTarget) {
      this.checkStrength()
    }
  }

  checkStrength() {
    const password = this.inputTarget.value
    let score = 0
    let text = ""
    let colorClass = "bg-ink/10"
    let width = "0%"
    let textColorClass = "text-ink-light"

    // Requirements logic
    const hasLength = password.length >= 6
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    if (hasLength) score += 1
    if (hasLetter) score += 1
    if (hasNumber) score += 1
    if (hasSpecial) score += 1

    if (password.length === 0) {
      width = "0%"
      colorClass = "bg-ink/10"
      textColorClass = "text-ink-light"
      text = ""
      if (this.hasChecklistTarget) {
        this.checklistTarget.classList.add("hidden")
      }
    } else {
      if (this.hasChecklistTarget) {
        this.checklistTarget.classList.remove("hidden")
      }
      
      if (score <= 2) {
        width = "33%"
        colorClass = "bg-red-500"
        textColorClass = "text-red-500"
        text = "Fraca"
      } else if (score === 3) {
        width = "66%"
        colorClass = "bg-yellow-500"
        textColorClass = "text-yellow-600"
        text = "Média"
      } else if (score === 4) {
        width = "100%"
        colorClass = "bg-green-500"
        textColorClass = "text-green-600"
        text = "Forte"
      }
    }

    this.toggleRequirement(this.hasRequirementLengthTarget ? this.requirementLengthTarget : null, hasLength, textColorClass)
    this.toggleRequirement(this.hasRequirementLetterTarget ? this.requirementLetterTarget : null, hasLetter, textColorClass)
    this.toggleRequirement(this.hasRequirementNumberTarget ? this.requirementNumberTarget : null, hasNumber, textColorClass)
    this.toggleRequirement(this.hasRequirementSpecialTarget ? this.requirementSpecialTarget : null, hasSpecial, textColorClass)

    if (this.hasBarTarget) {
      this.barTarget.className = `h-full rounded-full transition-all duration-500 ease-out ${colorClass}`
      this.barTarget.style.width = width
    }
    
    if (this.hasTextTarget) {
      this.textTarget.textContent = text
      this.textTarget.className = `text-xs font-medium ml-2 transition-colors duration-300 ${textColorClass}`
    }
  }

  toggleRequirement(target, isValid, activeColorClass) {
    if (!target) return;
    
    const iconCheck = target.querySelector('.icon-check')
    const iconCross = target.querySelector('.icon-cross')
    const iconCircle = target.querySelector('.icon-circle')
    
    // Remove all possible color classes
    target.classList.remove("text-ink-light", "text-red-500", "text-yellow-600", "text-green-600")
    
    if (isValid) {
      target.classList.add(activeColorClass)
      if (iconCheck) iconCheck.classList.remove('hidden')
      if (iconCross) iconCross.classList.add('hidden')
      if (iconCircle) iconCircle.classList.add('hidden')
    } else {
      target.classList.add("text-ink-light")
      if (iconCheck) iconCheck.classList.add('hidden')
      if (this.inputTarget.value.length > 0) {
        if (iconCross) iconCross.classList.remove('hidden')
        if (iconCircle) iconCircle.classList.add('hidden')
      } else {
        if (iconCross) iconCross.classList.add('hidden')
        if (iconCircle) iconCircle.classList.remove('hidden')
      }
    }
  }
}
