import { EventEmitter, Directive, HostListener, Output } from '@angular/core';

// keyboard events
const KEY_DW = 40;
const KEY_RT = 39;
const KEY_UP = 38;
const KEY_LF = 37;
const KEY_ES = 27;
const KEY_EN = 13;
const KEY_TAB = 9;
const KEY_BK = 8;
const KEY_SH = 16;
const KEY_CL = 20;
const KEY_F1 = 112;
const KEY_F12 = 123;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ngx-completer-input]',
})
export class NgxCompleterInputDirective {
  @Output() public moveUp = new EventEmitter();
  @Output() public moveDown = new EventEmitter();
  @Output() public selection = new EventEmitter();

  @HostListener('keydown', ['$event'])
  public keyHandler(event: any) {
    if (event.keyCode === KEY_UP) {
      this.moveUp.emit();
      event.preventDefault();
    }

    if (event.keyCode === KEY_DW) {
      this.moveDown.emit();
      event.preventDefault();
    }

    if (event.keyCode === KEY_EN) {
      this.selection.emit();
      event.preventDefault();
    }
  }
}
