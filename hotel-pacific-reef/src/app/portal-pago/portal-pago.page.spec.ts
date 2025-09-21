import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortalPagoPage } from './portal-pago.page';

describe('PortalPagoPage', () => {
  let component: PortalPagoPage;
  let fixture: ComponentFixture<PortalPagoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalPagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
