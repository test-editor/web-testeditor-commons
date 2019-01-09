import { TreeNode, TreeNodeAction } from './tree-node';
import { TreeViewerEmbeddedButton } from './tree-viewer-embedded-button';
import { Field } from './markers/field';

export type KeyActionMap = Map<string, TreeNodeAction>;
export interface TreeViewerConfig {
  onClick?: TreeNodeAction;
  onDoubleClick?: TreeNodeAction;
  onIconClick?: TreeNodeAction;
  onTextClick?: TreeNodeAction;
  onTextDoubleClick?: TreeNodeAction;
  embeddedButton?: (node: TreeNode) => TreeViewerEmbeddedButton;
  indicatorFields?: Field[];
}

export interface TreeViewerKeyboardConfig extends TreeViewerConfig {
  onKeyPress: KeyActionMap;
}
