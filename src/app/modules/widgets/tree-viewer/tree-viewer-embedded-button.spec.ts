import { EmbeddedDeleteButton } from './tree-viewer-embedded-button';
import { TreeNode } from './tree-node';
import { DeleteAction } from './confirmation-needing-action';

describe('EmbeddedDeleteButton', () => {
  it('should create an instance', () => {
    expect(new EmbeddedDeleteButton(new DeleteAction(new TreeNode({ name: '', children: []}), () => {}))).toBeTruthy();
  });

  it('sets all fields to values appropriate for delete button', () => {
    // given
    const buttonAction = new DeleteAction(new TreeNode({ name: '', children: []}), () => {});
    const contextNode = new TreeNode({
      children: [],
      name: 'NodeWithDeleteButton'
    });

    // when
    const actualButton = new EmbeddedDeleteButton(buttonAction);

    // then
    expect(actualButton.cssClasses).toEqual('embedded-delete-button fa fa-fw fa-times');
    expect(actualButton.hoverText(contextNode)).toEqual('delete \'NodeWithDeleteButton\'');
    expect(actualButton.onClick).toBe(buttonAction);
    expect(actualButton.visible(contextNode, 42)).toBeTruthy();
    expect(actualButton.visible(contextNode, 0)).toBeFalsy();
  });
});
