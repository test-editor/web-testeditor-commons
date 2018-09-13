// all events this components subscribes to for other components to publish

// payload NewElementConfig
export interface NewElementConfig {
  indent: boolean;
  validateName: (newName: string) => { valid: boolean, message?: string };
  createNewElement: (newName: string) => boolean;
  iconCssClasses: string;
}
export const TREE_NODE_CREATE_AT_SELECTED = 'treenode.create-at-selected';
