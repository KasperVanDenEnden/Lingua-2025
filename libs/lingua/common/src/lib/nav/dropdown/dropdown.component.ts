/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';



@Component({
  selector: 'lingua-dropdown',
  imports: [],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  isOpen = false;
  closeTimer: any = null;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  startCloseTimer(): void {
    // Annuleer bestaande timer als die er is
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
    
    // Stel een nieuwe timer in om de dropdown te sluiten na 150ms
    this.closeTimer = setTimeout(() => {
      this.isOpen = false;
    }, 150);
  }
  
  cancelCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
