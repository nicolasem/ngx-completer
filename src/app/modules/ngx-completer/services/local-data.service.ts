import { Injectable, EventEmitter } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { CompleterItem } from '../model/completer-item';

@Injectable()
export class LocalDataService extends DataService {

  public dataSourceChange: EventEmitter<void> = new EventEmitter<void>();

  protected _data: any[];
  protected savedTerm: string | null;

  constructor() {
    super();
  }

  public data(data: any[] | Observable<any[]>) {
    if (data instanceof Observable) {
      const data$ = <Observable<any[]>>data;
      data$
        .pipe(catchError(() => []))
        .subscribe((res) => {
          this._data = res;
          if (this.savedTerm) {
            this.search(this.savedTerm);
          }
          this.dataSourceChange.emit();
        });
    } else {
      this._data = <any[]>data;
    }

    this.dataSourceChange.emit();

    return this;
  }

  public search(term: string): void {
    if (!this._data) {
      this.savedTerm = term;
    } else {
      this.savedTerm = null;
      const matches: any[] = this.extractMatches(this._data, term);
      this.next(this.processResults(matches));
    }
  }

  public convertToItem(data: any): CompleterItem {
    return super.convertToItem(data);
  }
}
