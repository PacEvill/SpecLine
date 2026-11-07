import { Controller } from "@hotwired/stimulus"

// Dispara a caixa de impressão do navegador (que também serve para
// "Salvar como PDF"). O valor auto=1 imprime assim que a página carrega.
export default class extends Controller {
  static values = { auto: { type: Boolean, default: false } }

  connect() {
    if (this.autoValue) {
      // Pequena pausa para o layout assentar; sem isso o Chrome pode
      // imprimir uma página em branco.
      setTimeout(() => this.print(), 500)
    }
  }

  print() {
    window.print()
  }
}
