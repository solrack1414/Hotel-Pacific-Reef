import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminReservasPage } from './admin-reservas.page';

describe('AdminReservasPage', () => {
  let component: AdminReservasPage;
  let fixture: ComponentFixture<AdminReservasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminReservasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
