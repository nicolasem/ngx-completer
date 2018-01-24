import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CompleterItem } from '../model/completer-item';
import { isNil } from '../globals/globals';
import { Observable } from 'rxjs/Observable';

export abstract class DataService {
  public dataSourceChange?: EventEmitter<void>;
  protected _searchFields: string;
  protected _titleField: string;
  protected _descriptionField: string;

  constructor() {
  }

  public abstract search(term: string): Observable<CompleterItem[]>;

  public cancel() { }

  public searchFields(searchFields: string) {
    this._searchFields = searchFields;
    return this;
  }

  public titleField(titleField: string) {
    this._titleField = titleField;
    return this;
  }

  public descriptionField(descriptionField: string) {
    this._descriptionField = descriptionField;
    return this;
  }

  public convertToItem(data: any) {
    let formattedText: string;
    let formattedDesc: string | null = null;

    if (this._titleField) {
      formattedText = this.extractTitle(data);
    } else {
      formattedText = data;
    }

    if (typeof formattedText !== 'string') {
      formattedText = JSON.stringify(formattedText);
    }

    if (this._descriptionField) {
      formattedDesc = this.extractValue(data, this._descriptionField);
    }

    if (isNil(formattedText)) {
      return null;
    }

    return {
      title: formattedText,
      description: formattedDesc,
      originalObject: data
    } as CompleterItem;

  }

  protected extractMatches(data: any[], term: string) {
    let matches: any[] = [];
    const searchFields = this._searchFields ? this._searchFields.split(',') : null;
    if (this._searchFields !== null && this._searchFields !== undefined && term !== '') {
      matches = data.filter(item => {
        let values: any[];
        if (searchFields != null) {
          values = searchFields.map(searchField => this.extractValue(item, searchField)).filter(value => !!value);
        } else {
          values = [item];
        }

        return values.some(value => value.toString().toLowerCase().indexOf(term.toString().toLowerCase()) >= 0);
      });
    } else {
      matches = data;
    }


    return matches;
  }

  protected extractTitle(item: any) {
    // split title fields and run extractValue for each and join with ' '
    return this._titleField.split(',')
      .map((field) => {
        return this.extractValue(item, field);
      })
      .reduce((acc, titlePart) => acc ? `${acc} ${titlePart}` : titlePart);
  }

  protected extractValue(obj: any, key: string | null) {
    let keys: string[];
    let result: any;
    if (key) {
      keys = key.split('.');
      result = obj;
      for (let i = 0; i < keys.length; i++) {
        if (result) {
          result = result[keys[i]];
        }
      }
    } else {
      result = obj;
    }
    return result;
  }

  protected processResults(matches: string[]): CompleterItem[] {
    let i: number;
    const results: CompleterItem[] = [];

    if (matches && matches.length > 0) {
      for (i = 0; i < matches.length; i++) {
        const item = this.convertToItem(matches[i]);
        if (item) {
          results.push(item);
        }
      }
    }
    return results;
  }
}
