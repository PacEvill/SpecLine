import { Controller } from "@hotwired/stimulus"
import 'emoji-picker-element';

export default class extends Controller {
  static targets = ["input", "button", "pickerContainer"]

  connect() {
    this.picker = document.createElement('emoji-picker');
    this.updateTheme();
    
    this.pickerContainerTarget.innerHTML = '';
    this.pickerContainerTarget.appendChild(this.picker);
    
    this.picker.addEventListener('emoji-click', event => {
      const emoji = event.detail.unicode;
      this.inputTarget.value = emoji;
      this.buttonTarget.innerText = emoji;
      this.inputTarget.dispatchEvent(new Event('input', { bubbles: true }));
      this.closePicker();
    });

    this.handleOutsideClick = (e) => {
      if (!this.element.contains(e.target)) {
        this.closePicker();
      }
    };
    document.addEventListener('click', this.handleOutsideClick);
  }

  updateTheme() {
    if (!this.picker) return;
    if (document.documentElement.classList.contains('dark')) {
      this.picker.classList.add('dark');
      this.picker.classList.remove('light');
    } else {
      this.picker.classList.add('light');
      this.picker.classList.remove('dark');
    }
  }

  togglePicker() {
    this.updateTheme();
    this.pickerContainerTarget.classList.toggle('hidden');
  }

  closePicker() {
    this.pickerContainerTarget.classList.add('hidden');
  }

  disconnect() {
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
