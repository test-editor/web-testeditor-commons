import { TreeNode } from './tree-node';
import { TreeViewerEmbeddedButton } from './tree-viewer-embedded-button';
import { NodeContext } from './new-element/new-element.component';

export interface TreeViewerConfig {
  onClick?: (node: TreeNode) => void;
  onDoubleClick?: (node: TreeNode) => void;
  onIconClick?: (node: TreeNode) => void;
  onTextClick?: (node: TreeNode) => void;
  onTextDoubleClick?: (node: TreeNode) => void;
  embeddedButton?: (node: TreeNode) => TreeViewerEmbeddedButton;
}
