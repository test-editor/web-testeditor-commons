import { TreeNode } from './tree-node';

export interface TreeViewerEmbeddedButton {
  visible: (node: TreeNode, level: number) => boolean;
  hoverText: (node: TreeNode) => string;
  cssClasses: string;
  onClick: (node: TreeNode) => void;
}

/**
 * Creates a delete button appearing as an 'X' symbol to be used with a TreeViewerConfig.
 * It will be shown for all nodes except the root.
 * The css class 'embedded-delete-button' can be used to provide extra styling, e.g. color.
 */
export class EmbeddedDeleteButton implements TreeViewerEmbeddedButton {
  cssClasses = 'embedded-delete-button fa fa-fw fa-times';
  onClick: (node: TreeNode) => void;
  visible = (node, level) => level !== 0;
  hoverText = (node: TreeNode) => `delete '${node.name}'`;

  constructor(deleteAction: (node: TreeNode) => void) {
    this.onClick = deleteAction;
  }
}
