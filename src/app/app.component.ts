import { Component } from '@angular/core';
import { TreeNode } from './modules/widgets/tree-viewer/tree-node';
import { TreeViewerConfig } from './modules/widgets/tree-viewer/tree-viewer-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  model: TreeNode = {
    name: 'parent node',
    collapsedCssClasses: 'fa-chevron-right',
    expandedCssClasses: 'fa-chevron-down',
    leafCssClasses: 'fa-folder',
    cssClasses: '',
    expanded: false,
    children: [
      { name: 'child node 1', children: [] },
      { name: 'child node 2', children: [] },
      { name: 'child node 3', children: [] }
    ]
  };

  treeConfig: TreeViewerConfig = {
    onDoubleClick: (node: TreeNode) => node.expanded = !node.expanded,
    onIconClick: (node: TreeNode) => node.expanded = !node.expanded,
    onClick: () => {}
  };
}
