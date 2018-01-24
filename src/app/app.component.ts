import { Component } from '@angular/core';
import { DataService } from './modules/ngx-completer/services/data.service';
import { CompleterService } from './modules/ngx-completer/services/completer.service';
import { CompleterItem } from './modules/ngx-completer/model/completer-item';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private completerService: CompleterService) {
    this.dataService = this.completerService.local(this.quotes, 'id,nm', 'nm').descriptionField('qt');
  }

  public selectedQuote: string;
  public quote: string;
  public dataService: DataService;
  public quotes = [
    {
      id: '1',
      qt: 'Always forgive your enemies; nothing annoys them so much.',
      nm: 'Friedrich Nietzsche'
    },
    {
      id: '2',
      qt: 'Analyzing humor is like dissecting a frog. Few people are interested and the frog dies of it.',
      nm: 'E.B. White'
    },
    {
      id: '3',
      qt: 'Humor is perhaps a sense of intellectual perspective: an awareness that some things are really important, ' +
        'others not; and that the two kinds are most oddly jumbled in everyday affairs.',
      nm: 'Voltaire'
    },
    {
      id: '4',
      qt: 'I think the next best thing to solving a problem is finding some humor in it.',
      nm: 'Frank Howard Clark'
    },
    {
      id: '5',
      qt: 'Life is tough, and if you have the ability to laugh at it you have the ability to enjoy it.',
      nm: 'Salma Hayek'
    },
    {
      id: '6',
      qt: 'Never be afraid to laugh at yourself. After all, you could be missing out on the joke of the century.',
      nm: 'Benjamin Franklin'
    },
    {
      id: '7',
      qt: 'That is the saving grace of humor. If you fail no one is laughing at you.',
      nm: 'William Arthur Ward'
    },
    {
      id: '8',
      qt: 'The best jokes are dangerous, and dangerous because they are in some way truthful.',
      nm: 'Kurt Vonnegut'
    },
    {
      id: '9',
      qt: 'There’s so much comedy on television. Does that cause comedy in the streets?',
      nm: 'Henry Ford'
    },
    {
      id: '10',
      qt: 'You are not angry with people when you laugh at them. Humor teaches tolerance.',
      nm: 'W. Somerset Maugham'
    }
  ];

  public onSelectedQuote(item: CompleterItem) {
    if (item == null) {
      this.selectedQuote = null;
    } else {
      this.selectedQuote = item.title;
    }
  }
}
