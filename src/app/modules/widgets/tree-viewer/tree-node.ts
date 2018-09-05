export interface TreeNode {
  name: string;
  children: TreeNode[];
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
