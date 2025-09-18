import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LoginPage } from './login.page';
import { AuthDbService } from '../services/auth-db.service';


class MockAuthDbService {
  init = jasmine.createSpy('init').and.returnValue(Promise.resolve());
  login = jasmine.createSpy('login').and.callFake((email: string, pass: string) => {
    return Promise.resolve(email === 'test@correo.com' && pass === '123456');
  });
  register = jasmine.createSpy('register').and.returnValue(Promise.resolve());
  getSessionEmail = jasmine.createSpy('getSessionEmail').and.returnValue(null);
  logout = jasmine.createSpy('logout');
}

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: MockAuthDbService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FormsModule, CommonModule, LoginPage],
      providers: [
        ToastController,
        NavController,
        { provide: AuthDbService, useClass: MockAuthDbService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthDbService) as any;
    fixture.detectChanges();
  }));

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a login del servicio con credenciales válidas', async () => {
    component.email = 'test@correo.com';
    component.password = '123456';
    await component.onLogin();
    expect(authService.login).toHaveBeenCalledWith('test@correo.com', '123456');
  });

  it('debería intentar registrar una cuenta', async () => {
    component.regEmail = 'nuevo@correo.com';
    component.regPass = 'abcdef';
    component.regPass2 = 'abcdef';
    await component.onRegister();
    expect(authService.register).toHaveBeenCalledWith('nuevo@correo.com', 'abcdef');
  });

  it('no debería permitir registro si las contraseñas no coinciden', async () => {
    component.regEmail = 'nuevo@correo.com';
    component.regPass = 'abcdef';
    component.regPass2 = 'xyz';
    await component.onRegister();
    expect(authService.register).not.toHaveBeenCalled();
  });
});
