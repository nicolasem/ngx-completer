import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxCompleterComponent } from './ngx-completer.component';
import { CtrCompleterDirective } from './directives/ctr-completer.directive';
import { RemoteDataFactoryProvider, LocalDataFactoryProvider } from './factories/completer-data.factory';
import { CompleterService } from './services/completer.service';
import { CtrDropdownDirective } from './directives/ctr-dropdown.directive';
import { CtrInputDirective } from './directives/ctr-input.directive';
import { CtrListDirective } from './directives/ctr-list.directive';
import { CtrRowDirective } from './directives/ctr-row.directive';
import { CompleterListItemComponent } from './components/completer-list-item/completer-list-item.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    NgxCompleterComponent,
    CtrCompleterDirective,
    CtrDropdownDirective,
    CtrInputDirective,
    CtrListDirective,
    CtrRowDirective,
    CompleterListItemComponent
  ],
  providers: [
    CompleterService,
    RemoteDataFactoryProvider,
    LocalDataFactoryProvider
  ],
  exports: [
    NgxCompleterComponent
  ]
})
export class NgxCompleterModule { }
