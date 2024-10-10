import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosTComponent } from './productos-t.component';

describe('ProductosTComponent', () => {
  let component: ProductosTComponent;
  let fixture: ComponentFixture<ProductosTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductosTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductosTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
