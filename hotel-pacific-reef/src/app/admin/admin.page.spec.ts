import { ComponentFixture, TestBed } from '@angular/core/testing';
import { adminPage } from './admin.page';


describe('adminPage', () => {
  let component: adminPage;
  let fixture: ComponentFixture<adminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(adminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
