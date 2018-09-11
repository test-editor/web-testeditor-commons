import { Component } from '@angular/core';
import { TreeNode, forEach } from './modules/widgets/tree-viewer/tree-node';
import { TreeViewerConfig } from './modules/widgets/tree-viewer/tree-viewer-config';
import { EmbeddedDeleteButton } from './modules/widgets/tree-viewer/tree-viewer-embedded-button';
import { DeleteAction } from './modules/widgets/tree-viewer/confirmation-needing-action';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  model: TreeNode = {
    name: 'parent node',
    root: null,
    collapsedCssClasses: 'fa-chevron-right',
    expandedCssClasses: 'fa-chevron-down',
    leafCssClasses: 'fa-folder',
    cssClasses: '',
    expanded: false,
    children: [
      { name: 'child node 1', children: [], root: null },
      { name: 'child node 2', children: [], root: null },
      { name: 'child node 3', children: [], root: null }
    ]
  };

  treeConfig: TreeViewerConfig = {
    onDoubleClick: (node: TreeNode) => node.cssClasses = 'hidden',
    onIconClick: (node: TreeNode) => node.expanded = !node.expanded,
    onClick: (node: TreeNode) => node.expanded = !node.expanded,
    embeddedButton: (node: TreeNode) => new EmbeddedDeleteButton(
      new DeleteAction(node, (_node) => console.log(`Clicked delete button of node '${_node.name}'`)))
  };

  constructor() {
    forEach(this.model, node => { node.root = this.model; });
  }

}
