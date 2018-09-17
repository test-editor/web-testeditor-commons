// all events this library's components subscribe to and expect to be pushed by other components


// request to let the user create a new node in the context of the currently selected tree node
// payload: NewElementConfig
export interface TreeViewerInputBoxConfig extends InputBoxConfig {
  indent: boolean;
  iconCssClasses: string;
}
export const TREE_NODE_CREATE_AT_SELECTED = 'treenode.create-at-selected';

// request to let the user rename the currently selected tree node
// payload: RenameElementConfig
export interface InputBoxConfig {
  validateName: (newName: string) => { valid: boolean, message?: string };
  onConfirm: (newName: string) => Promise<boolean>;
}
export const TREE_NODE_RENAME_SELECTED = 'treenode.rename-selected';
