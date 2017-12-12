import { HttpClient } from '@angular/common/http';
import { RemoteDataService } from '../services/remote-data.service';
import { LocalDataService } from '../services/local-data.service';


export function localDataFactory() {
  return () => {
    return new LocalDataService();
  };
}

export function remoteDataFactory(http: HttpClient) {
  return () => {
    return new RemoteDataService(http);
  };
}

export let LocalDataFactoryProvider = { provide: LocalDataService, useFactory: localDataFactory };
export let RemoteDataFactoryProvider = { provide: RemoteDataService, useFactory: remoteDataFactory, deps: [HttpClient] };
