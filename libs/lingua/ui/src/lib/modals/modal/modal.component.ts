import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lingua-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Confirm action!';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.closed .emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
  