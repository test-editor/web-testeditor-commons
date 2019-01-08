import { TreeNode } from './widgets/tree-viewer/tree-node';

// all events this library's components subscribe to and expect to be pushed by other components

// request to let the user rename the currently selected tree node, by making it editable using an input box
// payload:
export interface InputBoxConfig {
  root: TreeNode;
  validateName: (newName: string) => { valid: boolean, message?: string };
  onConfirm: (newName: string) => Promise<boolean>;
  onCancel?: () => Promise<void>;
}
export const TREE_NODE_RENAME_SELECTED = 'treenode.rename-selected';

// request to let the user create a new node in the context of the currently selected tree node,
// by displaying an editable tree node that may be indented by one level and show an icon.
// payload:
export interface TreeViewerInputBoxConfig extends InputBoxConfig {
  indent: boolean;
  iconCssClasses: string;
}
export const TREE_NODE_CREATE_AT_SELECTED = 'treenode.create-at-selected';

export const HTTP_CLIENT_SUPPLIED = 'httpClient.supplied';
