import { Injectable, EventEmitter } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompleterItem } from '../model/completer-item';

@Injectable()
export class LocalDataService extends DataService {

  public dataSourceChange: EventEmitter<void> = new EventEmitter<void>();

  protected _data: any[];

  constructor() {
    super();
  }

  public data(data: any[] | Observable<any[]>) {
    this._data = <any[]>data;
    this.dataSourceChange.emit();
    return this;
  }

  public search(term: string): Observable<CompleterItem[]> {
    return new Observable(subscriber => {
      if (this._data != null) {
        const matches: any[] = this.extractMatches(this._data, term);
        subscriber.next(this.processResults(matches));
        subscriber.complete();
      } else {
        subscriber.next([]);
        subscriber.complete();
      }
    });
  }

  public convertToItem(data: any): CompleterItem {
    return super.convertToItem(data);
  }
}
