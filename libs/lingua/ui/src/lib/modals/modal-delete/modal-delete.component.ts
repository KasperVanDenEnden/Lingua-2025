import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lingua-modal-delete',
  imports: [],
  templateUrl: './modal-delete.component.html',
  styleUrl: './modal-delete.component.css',
})
export class ModalDeleteComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Deletion';
  @Input() message =
    'Are you sure you want to delete this record? This action cannot be undone.';
  @Input() confirmText = 'Delete';
  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
