import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxCompleterComponent } from './ngx-completer.component';

describe('NgxCompleterComponent', () => {
  let component: NgxCompleterComponent;
  let fixture: ComponentFixture<NgxCompleterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxCompleterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxCompleterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
