import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleterListItemComponent } from './completer-list-item.component';

describe('CompleterListItemComponent', () => {
  let component: CompleterListItemComponent;
  let fixture: ComponentFixture<CompleterListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleterListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleterListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
