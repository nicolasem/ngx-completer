import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
  Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, forwardRef, AfterViewInit, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CompleterItem } from './model/completer-item';
import { TEXT_NO_RESULTS, TEXT_SEARCHING, PAUSE, MIN_SEARCH_LENGTH, MAX_CHARS, isNil } from './globals/globals';
import { DataService } from './services/data.service';
import { CompleterService } from './services/completer.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { Subject } from 'rxjs/Subject';
import { NgxCompleterDropdownComponent } from './components/ngx-completer-dropdown/ngx-completer-dropdown.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-completer',
  templateUrl: './ngx-completer.component.html',
  styleUrls: ['./ngx-completer.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxCompleterComponent),
    multi: true
  }]
})
export class NgxCompleterComponent implements OnInit, ControlValueAccessor {
  @Input() public dataService: DataService;
  @Input() public inputName = '';
  @Input() public inputId = '';
  @Input() public pause = PAUSE;
  @Input() public minSearchLength = MIN_SEARCH_LENGTH;
  @Input() public maxChars = MAX_CHARS;
  @Input() public clearUnselected = false;
  @Input() public autoMatch = false;
  @Input() public autoMatchBy: string;
  @Input() public disableInput = false;
  @Input() public inputClass: string;
  @Input() public initialValue: any;
  @Input() public autoHighlight = false;

  @Output() public selected = new EventEmitter<CompleterItem>();
  @ViewChild(NgxCompleterDropdownComponent) public completerDropdown: NgxCompleterDropdownComponent;

  public searchActive = false;
  public items: any[];
  public error: any;
  public textInputSubject: Subject<string>;

  public doBlur: boolean;
  private _searchStr = '';
  private _selectedItem: CompleterItem;
  private _onChangeCallback: (val: any) => void;
  private _onTouched: (val: any) => void;

  constructor(private completerService: CompleterService, private cdr: ChangeDetectorRef) { }

  public get value(): any { return this.searchStr; }

  public set value(v: any) {
    this.searchStr = v;
    this._onChangeCallback(v);
  }

  public get searchStr() {
    return this._searchStr;
  }

  public set searchStr(value: string) {
    if (typeof value === 'string' || isNil(value)) {
      this._searchStr = value;
    } else {
      this._searchStr = JSON.stringify(value);
    }
  }

  public writeValue(value: any) {
    console.log(`Initial value: ${value}`);
    this.searchStr = value;
  }

  public registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disableInput = isDisabled;
  }

  @Input()
  public set datasource(source: DataService | string | Array<any>) {
    if (source != null) {
      if (source instanceof Array) {
        this.dataService = this.completerService.local(source);
      } else if (typeof (source) === 'string') {
        this.dataService = this.completerService.remote(source);
      } else {
        this.dataService = source;
      }
    }
  }

  public ngOnInit() {
    this.textInputSubject = new Subject<string>();
    this.textInputSubject
    .do(value => this._onChangeCallback(value))
    .map(value => {
      return {
        value: value,
        hasValue: value != null && value.length > this.minSearchLength
      };
    }).filter(text => {
      if (this._selectedItem != null) {
        if (text.hasValue && this._selectedItem.title === text.value) {
          return false;
        } else {
          this.onSelected(null);
        }
      }

      return true;
    }).debounce(text => {
      this.items = null;

      if (text.hasValue) {
        return Observable.timer(this.pause);
      } else {
        // clear messages and cancel remaining requests with switchMap immediately
        return Observable.timer(0);
      }
    }).switchMap(text => {
      if (text.hasValue) {
        if (this.dataService != null) {
          this.searchActive = true;
          return this.dataService.search(text.value);
        } else {
          return Observable.of<CompleterItem[]>([]);
        }
      } else {
        return Observable.of(null);
      }
    }).catch(err => {
      console.error(err);
      this.error = err;
      return Observable.of(null);
    }).subscribe(results => {
      this.searchActive = false;
      const autoMatch = this.getAutoMatch(results);

      // if a match is found select it
      // else, display the results
      if (autoMatch != null) {
        this.onSelected(autoMatch);
        this.items = null;
      } else {
        this.items = results;
      }
    });
  }

  private getAutoMatch(results: CompleterItem[]): CompleterItem {
    const text = this._searchStr;
    if (this.autoMatch && results && results.length === 1 && !isNil(text)) {
      const result = results[0];
      const autoMatchedBy = this.autoMatchBy != null && result.originalObject[this.autoMatchBy] === text;
      const autoMatched = result.title && result.title.toLocaleLowerCase() === text.toLocaleLowerCase();

      if (autoMatched || autoMatchedBy) {
        return result;
      }
    }

    return null;
  }

  public onSelected(item: CompleterItem) {
    this.items = null;
    if (this._selectedItem !== item) {
      this._selectedItem = item;

      if (item != null) {
        this._searchStr = item.title;
        this._onChangeCallback(this._searchStr);
      }

      this.selected.emit(item);
    }
  }

  public doSelection() {
    const item = this.completerDropdown.getSelected();
    if (item != null) {
      this.onSelected(item);
    }
  }

  public onFocus(event: any) {
    this.completerDropdown.hovering = false;
  }

  public onBlur(event: any) {
    if (this.completerDropdown.hovering) {
      event.preventDefault();
      return;
    }

    if (this._selectedItem == null) {
      this._searchStr = null;
      this._onChangeCallback(this._searchStr);
    } else if (this._searchStr !== this._selectedItem.title) {
      this.onSelected(null);
    }

    this.items = null;
  }
}
