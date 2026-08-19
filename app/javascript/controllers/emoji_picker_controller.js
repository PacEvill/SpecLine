import { Controller } from "@hotwired/stimulus"
import 'emoji-picker-element';

export default class extends Controller {
  static targets = ["input", "button", "pickerContainer"]

  connect() {
    this.picker = document.createElement('emoji-picker');
    // Adicionar suporte a dark mode automático ou herdado do app
    if (document.documentElement.classList.contains('dark')) {
      this.picker.classList.add('dark');
    } else {
      this.picker.classList.add('light');
    }
    
    this.pickerContainerTarget.appendChild(this.picker);
    
    this.picker.addEventListener('emoji-click', event => {
      this.inputTarget.value = event.detail.unicode;
      this.buttonTarget.innerText = event.detail.unicode;
      this.inputTarget.dispatchEvent(new Event('input', { bubbles: true }));
      this.closePicker();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target)) {
        this.closePicker();
      }
    });
  }

  togglePicker() {
    this.pickerContainerTarget.classList.toggle('hidden');
  }

  closePicker() {
    this.pickerContainerTarget.classList.add('hidden');
  }
}
