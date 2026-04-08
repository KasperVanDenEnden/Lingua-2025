import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LinguaCommonModule } from '@lingua/common';
import { UiModule } from '@lingua/ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LinguaCommonModule,
    UiModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
    UiModule,
    LinguaCommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class PagesModule {}
