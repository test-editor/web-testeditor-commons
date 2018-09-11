import { DeleteAction } from './confirmation-needing-action';

describe('DeleteAction', () => {
  it('should create an instance', () => {
    expect(new DeleteAction({ name: '', children: [], root: null}, () => {})).toBeTruthy();
  });

  it('sets all fields to values appropriate for delete action', () => {
    // given
    const actionClosure = () => {};
    const treeNode = { name: 'elementName', children: [], root: null};

    // when
    const actualActionObject = new DeleteAction(treeNode, actionClosure);

    // then
    expect(actualActionObject.message).toEqual('Are you sure you want to delete \'elementName\'?');
    expect(actualActionObject.confirmButtonText).toEqual('Yes');
    expect(actualActionObject.cancelButtonText).toEqual('No');
    expect(actualActionObject.messageCssClassses).toEqual('alert alert-warning');
    expect(actualActionObject.confirmCssClasses).toEqual('alert-link');
    expect(actualActionObject.cancelCssClasses).toEqual('alert-link');
    expect(actualActionObject.onConfirm).toBe(actionClosure);
  });
});
