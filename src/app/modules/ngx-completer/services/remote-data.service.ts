import { EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { CompleterItem } from '../model/completer-item';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

export class RemoteDataService extends DataService {
  public dataSourceChange: EventEmitter<void> = new EventEmitter<void>();

  private _remoteUrl: string;
  private _urlFormater: ((term: string) => string) | null = null;
  private _dataField: string | null = null;
  private _requestOptions: any;


  constructor(private http: HttpClient) {
    super();
  }

  public remoteUrl(remoteUrl: string) {
    this._remoteUrl = remoteUrl;
    this.dataSourceChange.emit();
    return this;
  }

  public urlFormater(urlFormater: (term: string) => string) {
    this._urlFormater = urlFormater;
  }

  public dataField(dataField: string) {
    this._dataField = dataField;
  }

  public requestOptions(requestOptions: any) {
    this._requestOptions = requestOptions;
  }

  public search(term: string): Observable<CompleterItem[]> {
    let url = '';
    if (this._urlFormater) {
      url = this._urlFormater(term);
    } else {
      url = this._remoteUrl + encodeURIComponent(term);
    }

    return this.http
      .get<any[]>(url, Object.assign({}, this._requestOptions))
      .map(data => this.extractValue(data, this._dataField))
      .map(values => this.extractMatches(values, term))
      .map(matches => this.processResults(matches));
  }

  public convertToItem(data: any): CompleterItem | null {
    return super.convertToItem(data);
  }
}
