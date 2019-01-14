import { TreeNodeAction } from './confirmation-needing-action';

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

  static create({ name, children, active, selected, expanded, expandedCssClasses,
     collapsedCssClasses, leafCssClasses, hover, id, cssClasses }:
     TreeNodeWithoutParentLinks, parent: TreeNode = null): TreeNode {
     const treeNode = new TreeNode();
     treeNode.name = name;
     treeNode.active = active;
     treeNode.selected = selected;
     treeNode.expanded = expanded;
     treeNode.expandedCssClasses = expandedCssClasses;
     treeNode.collapsedCssClasses = collapsedCssClasses;
     treeNode.leafCssClasses = leafCssClasses;
     treeNode.cssClasses = cssClasses;
     treeNode.hover = hover;
     treeNode.id = id;
     treeNode.parent = parent;
     treeNode.children = children.map((child) =>  TreeNode.create(child, treeNode));
     return treeNode;
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

  protected nextSiblingOrAncestorSibling(): TreeNode {
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

  protected lastVisibleDescendant(): TreeNode {
    if (this.children.length > 0 && this.expanded) {
      return this.children[this.children.length - 1].lastVisibleDescendant();
    } else {
      return this;
    }
  }
}

export class CommonTreeNodeActions {
  public static readonly INSTANCE = new CommonTreeNodeActions();

  private constructor() {}

  public readonly expandAction = (node: TreeNode) => node.expanded = true;
  public readonly collapseAction = (node: TreeNode) => node.expanded = false;
  public readonly selectNextVisible = (node: TreeNode) => {
    const nextNode = node.nextVisible();
    nextNode.selectOnly();
  }
  public readonly selectPreviousVisible = (node: TreeNode) => {
    const previousNode = node.previousVisible();
    previousNode.selectOnly();
  }

  // field must come after functions because it references them
  // tslint:disable-next-line:member-ordering
  public static readonly arrowKeyNavigation = new Map<string, TreeNodeAction>([
    ['ArrowRight', CommonTreeNodeActions.INSTANCE.expandAction],
    ['ArrowLeft', CommonTreeNodeActions.INSTANCE.collapseAction],
    ['ArrowUp', CommonTreeNodeActions.INSTANCE.selectPreviousVisible],
    ['ArrowDown', CommonTreeNodeActions.INSTANCE.selectNextVisible]
  ]);
}
