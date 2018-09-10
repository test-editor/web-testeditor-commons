export interface TreeNode {
  name: string;
  children: TreeNode[];
  root: TreeNode;
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


export function forEach(node: TreeNode, callbackfn: (value: TreeNode) => void): TreeNode {
  callbackfn(node);
  node.children.forEach((child) => forEach(child, callbackfn));
  return node;
}
