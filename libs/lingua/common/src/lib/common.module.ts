import { NgModule } from '@angular/core';
import { CardComponent } from '@lingua/ui';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { NavComponent } from './nav/nav.component';

@NgModule({
  imports: [NavComponent, FooterComponent, HeaderComponent, CardComponent],
  declarations: [],
  providers: [],
  exports: [NavComponent, FooterComponent, HeaderComponent, CardComponent],
})
export class LinguaCommonModule {}
