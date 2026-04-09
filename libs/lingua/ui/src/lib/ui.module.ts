import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from './cards/card/card.component';
import { ModalDeleteComponent } from './modals/modal-delete/modal-delete.component';
import { ModalComponent } from './modals/modal/modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ModalDeleteComponent,
    ModalComponent,
  ],
  declarations: [],
  providers: [],
  exports: [CardComponent, ModalDeleteComponent, ModalComponent],
})
export class UiModule {}
