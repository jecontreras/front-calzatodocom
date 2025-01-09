import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcinAlertComponent } from './opcin-alert.component';

describe('OpcinAlertComponent', () => {
  let component: OpcinAlertComponent;
  let fixture: ComponentFixture<OpcinAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpcinAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpcinAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
