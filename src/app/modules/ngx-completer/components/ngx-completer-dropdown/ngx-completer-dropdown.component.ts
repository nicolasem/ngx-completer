import { OnInit, Component, Input, EventEmitter, Output } from '@angular/core';
import { CompleterItem } from '../../model/completer-item';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-completer-dropdown',
  templateUrl: './ngx-completer-dropdown.component.html',
  styleUrls: ['./ngx-completer-dropdown.component.css']
})
export class NgxCompleterDropdownComponent implements OnInit {
  private _items: CompleterItem[];
  public get items() {
    return this._items;
  }
  @Input() public set items(i: CompleterItem[]) {
    this.error = null;
    this.currentIndex = null;
    this._items = i;
  }

  @Input() searchActive: boolean;
  @Input() error: any;
  public currentIndex: number;
  public hovering: boolean;


  @Output() public itemClicked = new EventEmitter<CompleterItem>();

  ngOnInit(): void {

  }

  public onClick() {
    const item = this.getHighlighted();
    if (item != null) {
      this.itemClicked.emit(item);
    }
  }

  public getHighlighted(): CompleterItem {
    if (this.currentIndex != null && this.items != null && this.items[this.currentIndex] != null) {
      return this.items[this.currentIndex];
    }

    return null;
  }

  public get hasHighlighted(): boolean {
    return this.getHighlighted() != null;
  }

  public moveDown() {
    if (this.items != null) {
      if (this.currentIndex == null) {
        this.currentIndex = 0;
      } else if (this.currentIndex < this.items.length - 1) {
        this.currentIndex++;
      }
    } else {
      this.currentIndex = null;
    }
  }

  public moveUp() {
    if (this.items != null && this.currentIndex >= 1) {
      this.currentIndex--;
    } else {
      this.currentIndex = null;
    }
  }
}
