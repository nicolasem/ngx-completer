import { Injectable, Inject } from '@angular/core';
import { RemoteDataService } from './remote-data.service';
import { LocalDataService } from './local-data.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CompleterService {
  constructor(
    @Inject(LocalDataService) private localDataFactory: any, // Using any instead of () => LocalData because on AoT errors
    @Inject(RemoteDataService) private remoteDataFactory: any // Using any instead of () => LocalData because on AoT errors
  ) { }

  public local(data: any[] | Observable<any>, searchFields: string = '', titleField: string = ''): LocalDataService {
    const localData = this.localDataFactory();
    return localData
      .data(data)
      .searchFields(searchFields)
      .titleField(titleField);
  }

  public remote(url?: string, searchFields: string = '', titleField: string = ''): RemoteDataService {
    const remoteData = this.remoteDataFactory();
    return remoteData
      .remoteUrl(url)
      .searchFields(searchFields)
      .titleField(titleField);
  }
}
