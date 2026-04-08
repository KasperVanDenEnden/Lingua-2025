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

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
    this.close.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
