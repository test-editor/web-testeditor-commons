import { TreeNode, TreeNodeAction } from './tree-node';

export type KeyActionMap = Map<string, TreeNodeAction>;
export interface TreeViewerConfig {
  onClick?: TreeNodeAction;
  onDoubleClick?: TreeNodeAction;
  onIconClick?: TreeNodeAction;
  onKeyPress?: KeyActionMap;
}
