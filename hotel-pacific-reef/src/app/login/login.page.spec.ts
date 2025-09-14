import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage]   
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if fields are empty', () => {
    component.username = '';
    component.password = '';
    component.login();
    expect(component.errorMessage).toBe('Por favor, ingresa usuario y contraseña');
  });

  it('should navigate to /home with correct credentials', (done) => {
    component.username = 'admin';
    component.password = '1234';
    spyOn(component['router'], 'navigate').and.callFake(() => {
      done();
      return Promise.resolve(true);
    });

    component.login();
  });

  it('should show error with wrong credentials', (done) => {
    component.username = 'wrong';
    component.password = 'user';
    component.login();

    setTimeout(() => {
      expect(component.errorMessage).toBe('Usuario o contraseña incorrecta');
      done();
    }, 1100);
  });
});
