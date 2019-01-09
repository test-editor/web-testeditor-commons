export interface TreeNodeWithoutParentLinks {
  name: string;
  children: TreeNodeWithoutParentLinks[];
  active?: boolean;
  selected?: boolean;
  expanded?: boolean;
  expandedCssClasses?: string;
  collapsedCssClasses?: string;
  leafCssClasses?: string;
  cssClasses?: string;
  hover?: string;
  id?: string;
}

export interface TreeNode extends TreeNodeWithoutParentLinks {
  parent?: TreeNode;
  children: TreeNode[];
}

export function forEach(node: TreeNode, callbackfn: (value: TreeNode) => void): TreeNode {
  callbackfn(node);
  node.children.forEach((child) => forEach(child, callbackfn));
  return node;
}

export class TreeNode {

  private static deselectTree(tree: TreeNode) {
    tree.selected = false;
    if (tree.children) {
      tree.children.forEach((subtree) => TreeNode.deselectTree(subtree));
    }
  }

  constructor({ name, children, active, selected, expanded, expandedCssClasses,
    collapsedCssClasses, leafCssClasses, hover, id, cssClasses }:
    TreeNodeWithoutParentLinks, parent: TreeNode = null) {
    this.name = name;
    this.active = active;
    this.selected = selected;
    this.expanded = expanded;
    this.expandedCssClasses = expandedCssClasses;
    this.collapsedCssClasses = collapsedCssClasses;
    this.leafCssClasses = leafCssClasses;
    this.cssClasses = cssClasses;
    this.hover = hover;
    this.id = id;
    this.parent = parent;
    this.children = children.map((child) => new TreeNode(child, this));
  }

  selectOnly() {
    this.deselectAll();
    this.selected = true;
  }

  deselectAll() {
    TreeNode.deselectTree(this.root);
  }

  get root() {
    let currentNode: TreeNode = this;
    while (currentNode.parent) {
      currentNode = currentNode.parent;
    }
    return currentNode;
  }

  public nextVisible(): TreeNode {
    if (this.children.length > 0 && this.expanded) {
      return this.children[0];
    } else {
      const sibling = this.nextSiblingOrAncestorSibling();
      return sibling ? sibling : this;
    }
  }

  public previousVisible(): TreeNode {
    if (this.parent != null) {
      const nodeIndex = this.parent.children.indexOf(this);
      if (nodeIndex === 0) {
        return this.parent;
      } else {
        return this.parent.children[nodeIndex - 1].lastVisibleDescendant();
      }
    }
    return this;
  }

  private nextSiblingOrAncestorSibling(): TreeNode {
    let sibling: TreeNode = null;
    if (this.parent != null) {
      sibling = this.parent;
      const nodeIndex = this.parent.children.indexOf(this);
      if (nodeIndex + 1 < this.parent.children.length) { // implicitly assuming elementIndex > -1
        sibling = this.parent.children[nodeIndex + 1];
      } else {
        sibling = this.parent.nextSiblingOrAncestorSibling();
      }
    }
    return sibling;
  }

  private lastVisibleDescendant(): TreeNode {
    if (this.children.length > 0 && this.expanded) {
      return this.children[this.children.length - 1].lastVisibleDescendant();
    } else {
      return this;
    }
  }
}

export type TreeNodeAction = (node: TreeNode) => void;

export class CommonTreeNodeActions {

  public static readonly expandAction = (node: TreeNode) => node.expanded = true;
  public static readonly collapseAction = (node: TreeNode) => node.expanded = false;
  public static readonly selectNextVisible = (node: TreeNode) => {
    const nextNode = node.nextVisible();
    nextNode.selectOnly();
  }
  public static readonly selectPreviousVisible = (node: TreeNode) => {
    const previousNode = node.previousVisible();
    previousNode.selectOnly();
  }

  // field must come after functions because it references them
  // tslint:disable-next-line:member-ordering
  public static readonly arrowKeyNavigation = new Map<string, TreeNodeAction>([
    ['ArrowRight', CommonTreeNodeActions.expandAction],
    ['ArrowLeft', CommonTreeNodeActions.collapseAction],
    ['ArrowUp', CommonTreeNodeActions.selectPreviousVisible],
    ['ArrowDown', CommonTreeNodeActions.selectNextVisible]
  ]);
}
