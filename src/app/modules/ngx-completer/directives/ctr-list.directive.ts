import { Directive, Input, Host, TemplateRef, ViewContainerRef, ChangeDetectorRef, OnInit, EmbeddedViewRef } from '@angular/core';
import { isNil, CLEAR_TIMEOUT, MIN_SEARCH_LENGTH, PAUSE } from '../globals/globals';
import { timer } from 'rxjs/observable/timer';
import { take } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { CtrCompleterDirective, CompleterList } from './ctr-completer.directive';
import { CompleterItem } from '../model/completer-item';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

export class CtrListContext {
  constructor(
    public results: CompleterItem[],
    public searching: boolean,
    public searchInitialized: boolean,
    public isOpen: boolean
  ) { }
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ctrList]'
})
export class CtrListDirective implements OnInit, CompleterList {

  @Input() public ctrListMinSearchLength = MIN_SEARCH_LENGTH;
  @Input() public ctrListPause = PAUSE;
  @Input() public ctrListAutoMatch = false;
  @Input() public ctrListAutoMatchBy: string;
  @Input() public ctrListAutoHighlight = false;
  @Input() public ctrListDisplaySearching = true;

  private _dataService: DataService;
  // private results: CompleterItem[] = [];
  private term: string = null;
  // private searching = false;
  private searchTimer: Subscription = null;
  private clearTimer: Subscription = null;
  private ctx = new CtrListContext([], false, false, false);
  private _initialValue: any = null;
  private viewRef: EmbeddedViewRef<CtrListContext> = null;

  constructor(
    @Host() private completer: CtrCompleterDirective,
    private templateRef: TemplateRef<CtrListContext>,
    private viewContainer: ViewContainerRef,
    private cd: ChangeDetectorRef) { }

  public ngOnInit() {
    this.completer.registerList(this);
    this.viewRef = this.viewContainer.createEmbeddedView(
      this.templateRef,
      new CtrListContext([], false, false, false)
    );
  }

  @Input('ctrList')
  public set dataService(newService: DataService) {
    this._dataService = newService;
    this.dataServiceSubscribe();
  }

  @Input('ctrListInitialValue')
  public set initialValue(value: any) {
    if (this._dataService && typeof this._dataService.convertToItem === 'function') {
      setTimeout(() => {
        // tslint:disable-next-line:no-non-null-assertion
        const initialItem = this._dataService.convertToItem!(value);
        if (initialItem) {
          this.completer.onSelected(initialItem, false);
        }
      });
    } else if (!this._dataService) {
      this._initialValue = value;
    }
  }

  public search(term: string) {
    if (!isNil(term) && term.length >= this.ctrListMinSearchLength && this.term !== term) {
      if (this.searchTimer) {
        this.searchTimer.unsubscribe();
        this.searchTimer = null;
      }
      if (!this.ctx.searching) {
        if (this.ctrListDisplaySearching) {
          this.ctx.results = [];
        }
        this.ctx.searching = true;
        this.ctx.searchInitialized = true;
        this.refreshTemplate();
      }
      if (this.clearTimer) {
        this.clearTimer.unsubscribe();
      }
      this.searchTimer = timer(this.ctrListPause).pipe(take(1)).subscribe(() => {
        this.searchTimerComplete(term);
      });
    } else if (!isNil(term) && term.length < this.ctrListMinSearchLength) {
      this.clear();
      this.term = '';
    }
  }

  public clear() {
    if (this.searchTimer) {
      this.searchTimer.unsubscribe();
    }
    this.clearTimer = timer(CLEAR_TIMEOUT).pipe(take(1)).subscribe(() => {
      this._clear();
    });
  }

  public open() {
    if (!this.ctx.searchInitialized) {
      this.search('');
    }
    this.refreshTemplate();
  }

  public isOpen(open: boolean) {
    this.ctx.isOpen = open;
  }

  private _clear() {
    if (this.searchTimer) {
      this.searchTimer.unsubscribe();
      this.searchTimer = null;
    }
    if (this.dataService) {
      this.dataService.cancel();
    }

    this.viewContainer.clear();
    this.viewRef = null;
  }

  private searchTimerComplete(term: string) {
    // Begin the search
    if (isNil(term) || term.length < this.ctrListMinSearchLength) {
      this.ctx.searching = false;
      return;
    }
    this.term = term;
    this._dataService.search(term);
  }

  private refreshTemplate() {
    // create the template if it doesn't exist
    if (!this.viewRef) {
      this.viewRef = this.viewContainer.createEmbeddedView(
        this.templateRef,
        this.ctx
      );
    } else if (!this.viewRef.destroyed) {
      // refresh the template
      // tslint:disable-next-line:no-non-null-assertion
      this.viewRef!.context.isOpen = this.ctx.isOpen;
      // tslint:disable-next-line:no-non-null-assertion
      this.viewRef!.context.results = this.ctx.results;
      // tslint:disable-next-line:no-non-null-assertion
      this.viewRef!.context.searching = this.ctx.searching;
      // tslint:disable-next-line:no-non-null-assertion
      this.viewRef!.context.searchInitialized = this.ctx.searchInitialized;
      this.viewRef.detectChanges();
    }
    this.cd.markForCheck();
  }

  private getBestMatchIndex() {
    if (!this.ctx.results || !this.term) {
      return null;
    }

    // First try to find the exact term
    // tslint:disable-next-line:no-non-null-assertion
    let bestMatch = this.ctx.results.findIndex(item => item.title.toLowerCase() === this.term!.toLocaleLowerCase());
    // If not try to find the first item that starts with the term
    if (bestMatch < 0) {
      // tslint:disable-next-line:no-non-null-assertion
      bestMatch = this.ctx.results.findIndex(item => item.title.toLowerCase().startsWith(this.term!.toLocaleLowerCase()));
    }
    // If not try to find the first item that includes the term
    if (bestMatch < 0) {
      // tslint:disable-next-line:no-non-null-assertion
      bestMatch = this.ctx.results.findIndex(item => item.title.toLowerCase().includes(this.term!.toLocaleLowerCase()));
    }

    return bestMatch < 0 ? null : bestMatch;
  }

  private dataServiceSubscribe() {
    if (this._dataService) {
      this._dataService
        .catch(err => {
          console.error(err);
          console.error('Unexpected error in dataService: errors should be handled by the dataService Observable');
          return Observable.of([]);
        })
        .subscribe(results => {
          this.ctx.searchInitialized = true;
          this.ctx.searching = false;
          this.ctx.results = results;

          if (this.ctrListAutoMatch && results && results.length === 1 && !isNil(this.term)) {
            const result = results[0];
            if (this.ctrListAutoMatchBy != null && result.originalObject[this.ctrListAutoMatchBy] === this.term) {
              // Do automatch
              this.completer.onSelected(result);
              return;
              // tslint:disable-next-line:no-non-null-assertion
            } else if (result.title && result.title.toLocaleLowerCase() === this.term!.toLocaleLowerCase()) {
              // Do automatch
              this.completer.onSelected(result);
              return;
            }
          }

          if (this._initialValue) {
            this.initialValue = this._initialValue;
            this._initialValue = null;
          }

          this.refreshTemplate();

          if (this.ctrListAutoHighlight) {
            this.completer.autoHighlightIndex = this.getBestMatchIndex();
          }
        });

      if (this._dataService.dataSourceChange) {
        this._dataService.dataSourceChange.subscribe(() => {
          this.term = null;
          this.ctx.searchInitialized = false;
          this.ctx.searching = false;
          this.ctx.results = [];
          this.refreshTemplate();
          this.completer.onDataSourceChange();
        });
      }
    }
  }
}
