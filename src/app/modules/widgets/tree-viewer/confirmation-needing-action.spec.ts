import { DeleteAction } from './confirmation-needing-action';

describe('DeleteAction', () => {
  it('should create an instance', () => {
    expect(new DeleteAction('', () => {})).toBeTruthy();
  });

  it('sets all fields to values appropriate for delete action', () => {
    // given
    const actionClosure = () => {};
    const elementName = 'theElement';

    // when
    const actualActionObject = new DeleteAction(elementName, actionClosure);

    // then
    expect(actualActionObject.message).toEqual('Are you sure you want to delete \'theElement\'?');
    expect(actualActionObject.confirmButtonText).toEqual('Yes');
    expect(actualActionObject.cancelButtonText).toEqual('No');
    expect(actualActionObject.messageCssClassses).toEqual('alert alert-warning');
    expect(actualActionObject.confirmCssClasses).toEqual('alert-link');
    expect(actualActionObject.cancelCssClasses).toEqual('alert-link');
    expect(actualActionObject.onConfirm).toBe(actionClosure);
  });
});
