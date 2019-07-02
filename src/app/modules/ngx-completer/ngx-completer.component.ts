
import { throwError as observableThrowError, Subscription, Observable, Subscriber, Subject, pipe, timer, of } from 'rxjs';
import { tap, map, filter, debounce, switchMap, catchError } from 'rxjs/operators';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
  Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, forwardRef, AfterViewInit, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CompleterItem } from './model/completer-item';
import { TEXT_NO_RESULTS, TEXT_SEARCHING, PAUSE, MIN_SEARCH_LENGTH, MAX_CHARS } from './globals/globals';
import { DataService } from './services/data.service';
import { CompleterService } from './services/completer.service';
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
  @Input() public placeholder = '';
  @Input() public textSearching = TEXT_SEARCHING;
  @Input() public textNoResults = TEXT_NO_RESULTS;
  @Input() public inputId = '';
  @Input() public pause = PAUSE;
  @Input() public minSearchLength = MIN_SEARCH_LENGTH;
  @Input() public maxChars = MAX_CHARS;
  @Input() public clearUnselected = false;
  @Input() public autoMatch = false;
  @Input() public autoMatchBy: string;
  @Input() public disableInput = false;
  @Input() public inputClass: string;
  @Input() public autoHighlight = false;
  private _initialValue: any;
  @Input() public set initialValue(value: any) {
    if (value != null) {
      if (this.dataService != null && typeof this.dataService.convertToItem === 'function') {
        setTimeout(() => {
          const initialItem = this.dataService.convertToItem(value);
          if (initialItem) {
            this.onSelected(initialItem);
          }
        });
      } else {
        this._initialValue = value;
      }
    }
  }

  @Output() public selected = new EventEmitter<CompleterItem>();
  @ViewChild(NgxCompleterDropdownComponent) public completerDropdown: NgxCompleterDropdownComponent;

  public searchActive = false;
  public items: any[];
  public error: any;
  public textInputSubject: Subject<string>;

  public searchStr = '';
  private _selectedItem: CompleterItem;
  private _inputHasFocus: boolean;
  private _onChangeCallback: (val: any) => void;
  private _onTouched: (val: any) => void;

  constructor(private completerService: CompleterService) { }

  public writeValue(value: any) {
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

      if (this._initialValue != null) {
        this.initialValue = this._initialValue;
        this._initialValue = null;
      }
    }
  }

  public ngOnInit() {
    this.textInputSubject = new Subject<string>();
    this.textInputSubject
      .pipe(tap(value => this._onChangeCallback(value)), tap(() => this.searchActive = false))
      .pipe(map(value => {
        return {
          value: value,
          hasValue: value != null && value.length >= this.minSearchLength
        };
      })).pipe(filter(text => {
        // if the text matches the previously selected item, do nothing
        if (text.hasValue && this._selectedItem != null && this._selectedItem.title === text.value) {
          return false;
        }

        return true;
      })).pipe(tap(text => {
        // clear the results
        this.items = null;

        // if an item was previously selected, clear it
        if (this._selectedItem != null) {
          this.onSelected(null);
        }
      })).pipe(debounce(text => {
        if (text.hasValue) {
          return timer(this.pause);
        } else {
          // clear messages and cancel remaining requests with switchMap immediately
          return timer(0);
        }
      })).pipe(switchMap(text => {
        if (text.hasValue) {
          if (this.dataService != null) {
            this.searchActive = true;
            return this.dataService.search(text.value);
          } else {
            return observableThrowError('Data service not set');
          }
        } else {
          return of(null);
        }
      })).pipe(catchError(err => {
        console.error(err);
        this.error = err;
        return of(null);
      })).subscribe(results => {
        this.searchActive = false;
        let match: CompleterItem;

        if (this.autoMatch) {
          match = this.getSingleMatch(results);
        }

        // if a match is found select it
        if (match != null) {
          this.onSelected(match);
          // else, display the results if the input is still focused
        } else if (this.hasFocus) {
          this.items = results;
        }
      });
  }

  private getSingleMatch(results: CompleterItem[]): CompleterItem {
    const text = this.searchStr;

    // if just a single result exists and the input contains text
    if (results && results.length === 1 && text != null) {
      const result = results[0];
      // check if the item matches by configured property (autoMatchBy)
      const autoMatchedBy = this.autoMatchBy != null && result.originalObject[this.autoMatchBy] === text;
      // check if the item matches by title
      const autoMatched = result.title && result.title.toLocaleLowerCase() === text.toLocaleLowerCase();

      if (autoMatched || autoMatchedBy) {
        return result;
      }
    }

    return null;
  }

  public onSelected(item: CompleterItem) {
    // clear the dropdown when an item is selected
    this.items = null;

    // if the selected item changed, update it
    if (this._selectedItem !== item) {
      this._selectedItem = item;

      //  update the search input with the item's title
      if (item != null) {
        this.searchStr = item.title;
        this._onChangeCallback(this.searchStr);
      }

      // fire the event
      this.selected.emit(item);
    }
  }

  // triggered when the user hits enter or tab
  public onSelection() {
    const item = this.completerDropdown.getHighlighted();
    if (item != null) {
      this.onSelected(item);
    }
  }

  // the input or the dropdown has focus
  public get hasFocus(): boolean {
    return this._inputHasFocus || this.completerDropdown.hovering;
  }

  // the input was focused
  public onFocus(event: any) {
    this._inputHasFocus = true;
  }

  public onBlur(event: any) {
    // wait for the dropdown to refresh
    setTimeout(() => {
      // if focus is on the dropdown
      if (this.completerDropdown.hasHighlighted && this.completerDropdown.hovering) {
        // prevent the input blur so the user can keep writing
        event.preventDefault();
      } else {
        // if not, do the blur
        this.doBlur(event);
      }
    }, 200);
  }

  private doBlur(event: any) {
    // the input no longer has focus
    this._inputHasFocus = false;

    // hide the dropdown list
    this.items = null;

    if (this.clearUnselected) {
      // if no item was selected clear the search input
      if (this._selectedItem == null) {
        this.searchStr = null;
        this._onChangeCallback(this.searchStr);
        // emit empty text to cancel requests
        this.textInputSubject.next(null);
      } else if (this.searchStr !== this._selectedItem.title) {
        // if the search input differs from the previous selected title, clear it
        this.onSelected(null);
        // emit empty text to cancel requests
        this.textInputSubject.next(null);
      }
    }
  }
}
