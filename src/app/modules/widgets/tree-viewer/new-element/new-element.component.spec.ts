import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { NewElementComponent, ContextType } from './new-element.component';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NewElementConfig } from '../../../event-types-in';


@Component({
  selector: `app-host-component`,
  template: `<app-new-element [config]="config" (cancelled)="onCancelled()" (succeeded)="onSucceeded()"></app-new-element>`
})
class TestHostComponent {
  public config: NewElementConfig = {
    createNewElement: null,
    iconCssClasses: '',
    indent: false,
    validateName: null
  };
  public cancelCounter = 0;
  public successCounter = 0;

  @ViewChild(NewElementComponent)
  public newElementComponentUnderTest: NewElementComponent;

  onCancelled() {
    this.cancelCounter++;
  }

  onSucceeded() {
    this.successCounter++;
  }
}

describe('NewElementComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestHostComponent, NewElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent.newElementComponentUnderTest).toBeTruthy();
  });

  it('should emit cancel event when ESC is pressed', () => {
    // given
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));

    // when
    inputField.triggerEventHandler('keyup.escape', {});

    // then
    expect(hostComponent.cancelCounter).toEqual(1);
  });

  it('should validate the input on keyup', fakeAsync(() => {
    // given
    let nameToValidate = '';
    hostComponent.config.validateName = (name) => { nameToValidate = name; return { valid: true }; };
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));
    inputField.nativeElement.value = 'Hello, World';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // when
    inputField.triggerEventHandler('keyup', {});
    tick();

    // then
    expect(nameToValidate).toEqual('Hello, World');
    expect(fixture.debugElement.query(By.css('.alert'))).toBeFalsy('error field should not be present!');
    expect(inputField.classes['input-error']).toBeFalsy('input field should not contain "input-error" css class.');
  }));

  it('should display error message when the input is not valid', fakeAsync(() => {
    // given
    let nameToValidate = '';
    hostComponent.config.validateName = (name) => { nameToValidate = name; return { valid: false, message: 'invalid name!' }; };
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));
    inputField.nativeElement.value = 'Hello, World';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // when
    inputField.triggerEventHandler('keyup', {});
    fixture.detectChanges();
    tick();

    // then
    const errorField = fixture.debugElement.query(By.css('.alert'));
    expect(errorField).toBeTruthy('error field was not found');
    expect(errorField.nativeElement.innerText).toEqual('invalid name!');
    expect(inputField.classes['input-error']).toBeTruthy('input field should contain "input-error" css class.');
  }));

  it('should call "createNewElement" callback when enter key is pressed and the input is valid', fakeAsync(() => {
    // given
    let actualName = '';
    hostComponent.config.validateName = () => ({ valid: true });
    hostComponent.config.createNewElement = (name) => { actualName = name; return Promise.resolve(true); };
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));
    inputField.nativeElement.value = 'Hello, World';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // when
    inputField.triggerEventHandler('keyup.enter', {});
    tick();

    // then
    expect(fixture.debugElement.query(By.css('.alert'))).toBeFalsy('error field should not be present!');
    expect(inputField.classes['input-error']).toBeFalsy('input field should not contain "input-error" css class.');
    expect(actualName).toEqual('Hello, World');
  }));

  it('should not call "createNewElement" callback when enter key is pressed and the input is invalid', fakeAsync(() => {
    // given
    let createNewElementWasCalled = false;
    hostComponent.config.validateName = () => ({ valid: false, message: 'invalid input!' });
    hostComponent.config.createNewElement = () => { createNewElementWasCalled = true; return Promise.resolve(true); };
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));
    inputField.nativeElement.value = 'Hello, World';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // when
    inputField.triggerEventHandler('keyup.enter', {});
    tick();
    fixture.detectChanges();

    // then
    expect(createNewElementWasCalled).toBeFalsy();
    const errorField = fixture.debugElement.query(By.css('.alert'));
    expect(errorField).toBeTruthy('error field was not found');
    expect(errorField.nativeElement.innerText).toEqual('invalid input!');
    expect(inputField.classes['input-error']).toBeTruthy('input field should contain "input-error" css class.');
  }));

  it('should emit "succeeded" event when pressing enter and "createNewElement" returns true', fakeAsync(() => {
    // given
    hostComponent.config.validateName = () => ({ valid: true });
    hostComponent.config.createNewElement = () => Promise.resolve(true);
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));
    inputField.nativeElement.value = 'Hello, World';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // when
    inputField.triggerEventHandler('keyup.enter', {});
    tick();

    // then
    expect(fixture.debugElement.query(By.css('.alert'))).toBeFalsy('error field should not be present!');
    expect(inputField.classes['input-error']).toBeFalsy('input field should not contain "input-error" css class.');
    expect(hostComponent.successCounter).toEqual(1);
  }));

  it('must not emit "succeeded" event when pressing enter and "createNewElement" returns false', fakeAsync(() => {
    // given
    hostComponent.config.validateName = (name) => ({ valid: true });
    hostComponent.config.createNewElement = (name) => Promise.resolve(false);
    const inputField = fixture.debugElement.query(By.css('.navNewElement > input'));
    inputField.nativeElement.value = 'Hello, World';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // when
    inputField.triggerEventHandler('keyup.enter', {});
    tick();
    fixture.detectChanges();

    // then
    expect(hostComponent.successCounter).toEqual(0);
    const errorField = fixture.debugElement.query(By.css('.alert'));
    expect(errorField).toBeTruthy('error field was not found');
    expect(errorField.nativeElement.innerText).toEqual('Error while creating element!');
    expect(inputField.classes['input-error']).toBeTruthy('input field should contain "input-error" css class.');
  }));
});
