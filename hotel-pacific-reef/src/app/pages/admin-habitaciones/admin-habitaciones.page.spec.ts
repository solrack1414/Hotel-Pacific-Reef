import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminHabitacionesPage } from './admin-habitaciones.page';

describe('AdminHabitacionesPage', () => {
  let component: AdminHabitacionesPage;
  let fixture: ComponentFixture<AdminHabitacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHabitacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
