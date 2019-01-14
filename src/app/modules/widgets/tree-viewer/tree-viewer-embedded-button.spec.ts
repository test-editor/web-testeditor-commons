import { EmbeddedDeleteButton } from './tree-viewer-embedded-button';
import { TreeNode } from './tree-node';
import { DeleteAction } from './confirmation-needing-action';

describe('EmbeddedDeleteButton', () => {
  it('should create an instance', () => {
    expect(new EmbeddedDeleteButton(new DeleteAction(TreeNode.create({ name: '', children: []}), () => {}))).toBeTruthy();
  });

  it('sets all fields to values appropriate for delete button', () => {
    // given
    const buttonAction = new DeleteAction(TreeNode.create({ name: '', children: []}), () => {});
    const contextNode = TreeNode.create({
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
