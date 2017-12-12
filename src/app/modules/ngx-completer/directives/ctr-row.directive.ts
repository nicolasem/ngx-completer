import { Directive, OnDestroy, ElementRef, Host, Input, HostListener, Renderer2 } from '@angular/core';
import { CtrRowElement, CtrDropdownDirective, CtrRowItem } from './ctr-dropdown.directive';
import { CompleterItem } from '../model/completer-item';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ctrRow]'
})
export class CtrRowDirective implements CtrRowElement, OnDestroy {
  private selected = false;
  private _rowIndex: number;
  private _item: CompleterItem;

  constructor(private el: ElementRef, private renderer: Renderer2, @Host() private dropdown: CtrDropdownDirective) { }

  public ngOnDestroy() {
    if (this._rowIndex) {
      this.dropdown.unregisterRow(this._rowIndex);
    }
  }

  @Input()
  set ctrRow(index: number) {
    this._rowIndex = index;
    this.dropdown.registerRow(new CtrRowItem(this, this._rowIndex));
  }

  @Input()
  set dataItem(item: CompleterItem) {
    this._item = item;
  }

  @HostListener('click', ['$event']) public onClick(event: any) {
    this.dropdown.onSelected(this._item);
  }

  @HostListener('mouseenter', ['$event']) public onMouseEnter(event: any) {
    this.dropdown.highlightRow(this._rowIndex);
  }

  @HostListener('mousedown', ['$event']) public onMouseDown(event: any) {
    this.dropdown.rowMouseDown();
  }

  public setHighlighted(selected: boolean) {
    this.selected = selected;
    if (this.selected) {
      this.renderer.addClass(this.el.nativeElement, 'completer-selected-row');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'completer-selected-row');
    }
  }

  public getNativeElement() {
    return this.el.nativeElement;
  }

  public getDataItem() {
    return this._item;
  }
}

