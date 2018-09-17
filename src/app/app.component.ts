import { Component } from '@angular/core';
import { TreeNode, forEach } from './modules/widgets/tree-viewer/tree-node';
import { TreeViewerConfig } from './modules/widgets/tree-viewer/tree-viewer-config';
import { EmbeddedDeleteButton } from './modules/widgets/tree-viewer/tree-viewer-embedded-button';
import { DeleteAction } from './modules/widgets/tree-viewer/confirmation-needing-action';
import { MessagingService } from '@testeditor/messaging-service';
import { TREE_NODE_CREATE_AT_SELECTED, NewElementConfig } from './modules/event-types-in';
import { TREE_NODE_SELECTED } from './modules/event-types-out';

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
      { name: 'child node 1', children: [], root: null, leafCssClasses: 'fa-file' },
      { name: 'child node 2', children: [], root: null, leafCssClasses: 'fa-file' },
      { name: 'child node 3', children: [], root: null, leafCssClasses: 'fa-file' }
    ]
  };

  selectedNode: TreeNode = null;

  treeConfig: TreeViewerConfig = {
    onDoubleClick: (node: TreeNode) => node.cssClasses = 'hidden',
    onIconClick: (node: TreeNode) => node.expanded !== undefined ? node.expanded = !node.expanded : {},
    onClick: (node: TreeNode) => node.expanded !== undefined ? node.expanded = !node.expanded : {},
    embeddedButton: (node: TreeNode) => new EmbeddedDeleteButton(
      new DeleteAction(node, (_node) => console.log(`Clicked delete button of node '${_node.name}'`))),
  };

  constructor(private messageBus: MessagingService) {
    forEach(this.model, node => { node.root = this.model; });
    this.messageBus.subscribe(TREE_NODE_SELECTED, (selectedNode) => this.selectedNode = selectedNode);
  }

  createNewFile() {
    const payload: NewElementConfig = {
      createNewElement: (name) => {
        const contextTypeString = this.selectedNode.expanded !== undefined ? 'child' : 'sibling';
        console.log(`Create file with name '${name}' as a ${contextTypeString} of '${this.selectedNode.name}'`);
        return false;
      },
      iconCssClasses: 'fa-file',
      indent: this.selectedNode.expanded !== undefined,
      validateName: (name) => 'Ni!' === name ? { valid: false, message: 'You must not say Ni!'} : { valid: true }
    };
    this.messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, payload);
  }

  createNewFolder() {
    const payload: NewElementConfig = {
      createNewElement: (name) => {
        const contextTypeString = this.selectedNode.expanded !== undefined ? 'child' : 'sibling';
        console.log(`Create folder with name '${name}' as a ${contextTypeString} of '${this.selectedNode.name}'`);
        return true;
      },
      iconCssClasses: 'fa-folder',
      indent: this.selectedNode.expanded !== undefined,
      validateName: (name) => 'Ni!' === name ? { valid: false, message: 'You must not say Ni!'} : { valid: true }
    };
    this.messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, payload);
  }
}
