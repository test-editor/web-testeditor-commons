import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { InputBoxComponent } from './input-box.component';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TreeViewerInputBoxConfig, InputBoxConfig } from '../../../event-types-in';


@Component({
  selector: `app-host-component`,
  template: `<app-tree-input-box [value]="value"
                                 [config]="config"
                                 (cancelled)="onCancelled()"
                                 (succeeded)="onSucceeded()">
             </app-tree-input-box>`
})
class TestHostComponent {
  public config: InputBoxConfig | TreeViewerInputBoxConfig = {
    root: null,
    onConfirm: null,
    iconCssClasses: '',
    indent: false,
    validateName: null
  };
  public value: string = undefined;
  public cancelCounter = 0;
  public successCounter = 0;

  @ViewChild(InputBoxComponent)
  public inputBoxComponentUnderTest: InputBoxComponent;

  onCancelled() {
    this.cancelCounter++;
  }

  onSucceeded() {
    this.successCounter++;
  }
}

describe('InputBoxComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestHostComponent, InputBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent.inputBoxComponentUnderTest).toBeTruthy();
  });

  it('should emit cancel event when ESC is pressed', () => {
    // given
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));

    // when
    inputField.triggerEventHandler('keyup.escape', {});

    // then
    expect(hostComponent.cancelCounter).toEqual(1);
  });

  it('should validate the input on keyup', fakeAsync(() => {
    // given
    let nameToValidate = '';
    hostComponent.config.validateName = (name) => { nameToValidate = name; return { valid: true }; };
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));
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
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));
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

  it('should call "onConfirm" callback when enter key is pressed and the input is valid', fakeAsync(() => {
    // given
    let actualName = '';
    hostComponent.config.validateName = () => ({ valid: true });
    hostComponent.config.onConfirm = (name) => { actualName = name; return Promise.resolve(true); };
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));
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

  it('should not call "onConfirm" callback when enter key is pressed and the input is invalid', fakeAsync(() => {
    // given
    let createNewElementWasCalled = false;
    hostComponent.config.validateName = () => ({ valid: false, message: 'invalid input!' });
    hostComponent.config.onConfirm = () => { createNewElementWasCalled = true; return Promise.resolve(true); };
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));
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

  it('should emit "succeeded" event when pressing enter and "onConfirm" returns true', fakeAsync(() => {
    // given
    hostComponent.config.validateName = () => ({ valid: true });
    hostComponent.config.onConfirm = () => Promise.resolve(true);
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));
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

  it('must not emit "succeeded" event when pressing enter and "onConfirm" returns false', fakeAsync(() => {
    // given
    hostComponent.config.validateName = (name) => ({ valid: true });
    hostComponent.config.onConfirm = (name) => Promise.resolve(false);
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input'));
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
    expect(errorField.nativeElement.innerText).toEqual('Action did not succeed.');
    expect(inputField.classes['input-error']).toBeTruthy('input field should contain "input-error" css class.');
  }));

  it('leaves the input box empty if "value" is not set by the host component', () => {
    // given
    hostComponent.value = undefined;

    // when
    fixture.detectChanges();

    // then
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input')).nativeElement;
    expect(inputField.value).toEqual('');
  });

  it('sets the initial text of the input box to the value provided the host component', () => {
    // given
    hostComponent.value = 'initial value';

    // when
    fixture.detectChanges();

    // then
    const inputField = fixture.debugElement.query(By.css('.navInputBox > input')).nativeElement;
    expect(inputField.value).toEqual('initial value');
  });

  it('shows an icon and sets indent when a TreeViewerInputBoxConfig is provided', () => {
    // given
    const config: TreeViewerInputBoxConfig = {
      root: null,
      onConfirm: null,
      iconCssClasses: 'anIconCssClass',
      indent: true,
      validateName: null
    };

    // when
    hostComponent.config = config;
    fixture.detectChanges();

    // then
    const navInputBox = fixture.debugElement.query(By.css('.navInputBox'));
    const icon = fixture.debugElement.query(By.css('.navInputBox > span'));
    expect(navInputBox.styles['padding-left']).toEqual('12px');
    expect(icon.classes['anIconCssClass']).toBeTruthy();
  });

  it('shows no icon and sets indent to "0px" when a plain InputBoxConfig (w/o "indent" and "iconCssClasses" fields) is provided', () => {
    // given
    const config: InputBoxConfig = {
      root: null,
      onConfirm: null,
      validateName: null
    };

    // when
    hostComponent.config = config;
    fixture.detectChanges();

    // then
    const navInputBox = fixture.debugElement.query(By.css('.navInputBox'));
    const icon = fixture.debugElement.query(By.css('.navInputBox > span'));
    expect(navInputBox.styles['padding-left']).toEqual('0px');
    expect(icon).toBeFalsy();
  });
});
