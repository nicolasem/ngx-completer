import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxCompleterComponent } from './ngx-completer.component';
import { RemoteDataFactoryProvider, LocalDataFactoryProvider } from './factories/completer-data.factory';
import { CompleterService } from './services/completer.service';
import { FormsModule } from '@angular/forms';
import { NgxCompleterDropdownComponent } from './components/ngx-completer-dropdown/ngx-completer-dropdown.component';
import { NgxCompleterInputDirective } from './directives/ngx-completer-input.directive';
import { RemoteDataService } from './services/remote-data.service';
import { LocalDataService } from './services/local-data.service';
import { DataService } from './services/data.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    NgxCompleterComponent,
    NgxCompleterDropdownComponent,
    NgxCompleterInputDirective
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
export class NgxCompleterModule {
  public static forRoot(): ModuleWithProviders {

    return {
      ngModule: NgxCompleterModule,
      providers: [
        CompleterService,
        RemoteDataService,
        LocalDataService
      ]
    };
  }
}
