import { TreeNode } from './tree-node';
import { TreeViewerEmbeddedButton } from './tree-viewer-embedded-button';

export interface TreeViewerConfig {
  onClick?: (node: TreeNode) => void;
  onDoubleClick?: (node: TreeNode) => void;
  onIconClick?: (node: TreeNode) => void;
  embeddedButton?: TreeViewerEmbeddedButton;
}
