# ngx-completer

Auto complete component for Angular.

This component is based on [ng2-completer](https://github.com/oferh/ng2-completer) by [Ofer Herman](https://github.com/oferh)

## Usage

The module you want to use ngx-completer in must import `NgxCompleterModule` and `FormsModule` (to use the ngModel
directive on ngx-completer).  `NgxCompleterModule` provides the `CompleterService`, and declares the `ngx-completer`
directive.
```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { AppComponent } from './app.component';
import { NgxCompleterModule } from "ngx-completer";

@NgModule({
  imports: [
      BrowserModule,
      NgxCompleterModule,
      FormsModule,
  ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

Add ngx-completer to your component and create a data source:

```ts
import { Component } from '@angular/core';
import { CompleterService, DataService } from 'ngx-completer';

@Component({
  selector: 'my-component',
  template: `<h1>Search color</h1>
            <ngx-completer [(ngModel)]="searchStr" [datasource]="dataService" [minSearchLength]="0"></ngx-completer>
            <h1>Search captain</h1>
            <ngx-completer [(ngModel)]="captain" [datasource]="captains" [minSearchLength]="0"></ngx-completer>`
})
export class MyComponent {

  protected searchStr: string;
  protected captain: string;
  protected dataService: DataService;
  protected searchData = [
    { color: 'red', value: '#f00' },
    { color: 'green', value: '#0f0' },
    { color: 'blue', value: '#00f' },
    { color: 'cyan', value: '#0ff' },
    { color: 'magenta', value: '#f0f' },
    { color: 'yellow', value: '#ff0' },
    { color: 'black', value: '#000' }
  ];
  protected captains = ['James T. Kirk', 'Benjamin Sisko', 'Jean-Luc Picard', 'Spock', 'Jonathan Archer', 'Hikaru Sulu', 'Christopher Pike', 'Rachel Garrett' ];

  constructor(private completerService: CompleterService) {
    this.dataService = completerService.local(this.searchData, 'color', 'color');
  }
}
```

ngx-completer uses [rxjs](https://github.com/Reactive-Extensions/RxJS) stream as data sources.
There are 2 ready made data sources that can be used to fetch local and remote data but it's also possible to provide
a custom source that generates a stream of items.

### System.js configuration

Add the following to `System.js` map configuration:
```ts
   var map = {
       ...
       'ngx-completer': 'node_modules/ngx-completer/bundles/ngx-completer.umd.js'
   }
```



## API

### ngx-completer component

|Attribute|Description|Type|Required|Default|
|:---    |:---        |:--- |:---      |:--- |
|datasource|Autocomplete list data source can be an array of strings or a URL that results in an array of strings or a DataService object|Array\<string\>\|string\|DataService|Yes||
|ngModel| see the angular [forms API](https://angular.io/docs/js/latest/guide/forms.html).|string|Yes||
|autoMatch|Auto select an item if it is the only result and it is an exact match of the search text.|boolean|No|false
|autoMatchBy|The property to autoMatch a result by.|string|No|
|clearUnselected|Clear the input on blur if not selected.|boolean|No|false|
|disableInput|If true disable the input field.|boolean|No|false|
|initialValue|Initial value for the component. Value is parsed using: titleField and descriptionField and used as selected value|any|No||
|inputId|`id` attribute of the input element.|string|No||
|inputName|`name` attribute of the input element.|string|No||
|inputClass| `class` attribute of the input element.|string|No||
|maxChars|Maximal number of characters that the user can type in the component.|number|No|524288|
|minSearchLength|Minimal number of characters required for searching.|number|No|3|
|pause|Number of msec. to wait before searching.|number|No|250|
|placeholder|Placeholder text for the search field.|string|No||
|textNoResults|Text displayed when the search returned no results. if the string is falsy it won't be displayed|string|No|
|textSearching|Text displayed while search is active. if the string is falsy it won't be displayed|string|No|Searching...|

### Local data

Create local data provider by calling `CompleterService.local`.

#### Parameters

|Name|Type|Description|Required|
|:---|:---|:---       |:---    |
|data|any[] \| Observable<any[]>|A JSON array with the data to use or an Observable that emits one|Yes|
|searchFields|string|Comma separated list of fields to search on. Fields may contain dots for nested attributes; if empty or null all data will be returned.|Yes|
|titleField|string|Name of the field to use as title for the list item.|Yes|

#### Attributes
|Name|Type|Description|
|:---|:---|:---       |
|descriptionField|string|Name of the field to use as description for the list item.|
|imageField|string|Name of the field to use as image url for the list item.|

### Remote data

Create remote data provider by calling `CompleterService.remote`.

#### Parameters

|Name|Type|Description|Required|
|:---|:---|:---       |:---    |
|url|string|Base url for the search|Yes|
|searchFields|string|Comma separated list of fields to search on. Fields may contain dots for nested attributes; if empty or null all data will be returned.|Yes|
|titleField|string|Name of the field to use as title for the list item.|Yes|

#### Attributes

|Name|Type|Description|
|:---|:---|:---       |
|descriptionField|string|Name of the field to use as description for the list item.|
|imageField|string|Name of the field to use as image url for the list item.|
|urlFormater|(term: string) => string|Function that get's the searchterm and returns the search url before each search.|
|dataField|string|The field in the response that includes the data.|
|headers|Headers (@angular/http)|**Deprecated**  use `requestOptions` instead. HTTP request headers that should be sent with the search request.
|requestOptions|RequestOptions (@angular/http)|HTTP request options that should be sent with the search request.|

### CSS classes

* `.completer-dropdown`
* `.completer-row`
* `.completer-description`
* `.completer-selected-row`

## Credits

* This product uses the TMDb API but is not endorsed or certified by TMDb
