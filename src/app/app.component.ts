import { Component } from '@angular/core';
import { MessagingService } from '@testeditor/messaging-service';
import { InputBoxConfig, TreeViewerInputBoxConfig,
  TREE_NODE_CREATE_AT_SELECTED, TREE_NODE_RENAME_SELECTED } from './modules/event-types-in';
import { TREE_NODE_SELECTED } from './modules/event-types-out';
import { DeleteAction } from './modules/widgets/tree-viewer/confirmation-needing-action';
import { forEach, TreeNode } from './modules/widgets/tree-viewer/tree-node';
import { TreeViewerConfig } from './modules/widgets/tree-viewer/tree-viewer-config';
import { EmbeddedDeleteButton } from './modules/widgets/tree-viewer/tree-viewer-embedded-button';

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
    expanded: true,
    children: [
      { name: 'child node 1', children: [], root: null, leafCssClasses: 'fa-file' },
      { name: 'child node 2', children: [], root: null, leafCssClasses: 'fa-file' },
      { name: 'child node 3', children: [], root: null, leafCssClasses: 'fa-file' }
    ]
  };

  selectedNode: TreeNode = null;
  indicatorFieldState = [0, 0];

  treeConfig: TreeViewerConfig = {
    onDoubleClick: (node: TreeNode) => node.cssClasses = 'hidden',
    onIconClick: (node: TreeNode) => node.expanded !== undefined ? node.expanded = !node.expanded : {},
    onClick: (node: TreeNode) => node.expanded !== undefined ? node.expanded = !node.expanded : {},
    onKeyPress: CommonTreeNodeActions.arrowKeyNavigation,
    embeddedButton: (node: TreeNode) => new EmbeddedDeleteButton(
      new DeleteAction(node, (_node) => console.log(`Clicked delete button of node '${_node.name}'`))),
    indicatorFields: [
      {
        condition: () => true,
        states: [{
            condition: () => this.indicatorFieldState[0] % 2 === 0,
            cssClasses: 'fa fa-font-awesome',
            label: (node: TreeNode) => `Font Awesome Logo displayed for ${node.name}`
          }, {
            condition: () => this.indicatorFieldState[0] % 2 === 1,
            cssClasses: 'fa fa-fort-awesome',
            label: (node: TreeNode) => `Fort Awesome Logo displayed for ${node.name}`
          }
        ]
      },
      {
        condition: () => this.indicatorFieldState[1] % 5 !== 0,
        states: [
          { condition: () => this.indicatorFieldState[1] % 5 === 1, cssClasses: 'fa fas fa-chevron-right', label: () => 'one' },
          { condition: () => this.indicatorFieldState[1] % 5 === 2, cssClasses: 'fa fas fa-chevron-down', label: () => 'two' },
          { condition: () => this.indicatorFieldState[1] % 5 === 3, cssClasses: 'fa fas fa-chevron-left', label: () => 'three' },
          { condition: () => this.indicatorFieldState[1] % 5 === 4, cssClasses: 'fa fas fa-chevron-up', label: () => 'four' }
        ]
      }
    ]
  };

  constructor(private messageBus: MessagingService) {
    forEach(this.model, node => { node.root = this.model; });
    this.messageBus.subscribe(TREE_NODE_SELECTED, (selectedNode) => this.selectedNode = selectedNode);
  }

  createNewFile() {
    if (this.selectedNode) {
      const payload: TreeViewerInputBoxConfig = {
        root: this.model.root,
        onConfirm: (name) => {
          const contextTypeString = this.selectedNode.expanded !== undefined ? 'child' : 'sibling';
          console.log(`Create file with name '${name}' as a ${contextTypeString} of '${this.selectedNode.name}'`);
          return Promise.resolve(false);
        },
        iconCssClasses: 'fa-file',
        indent: this.selectedNode.expanded !== undefined,
        validateName: (name) => 'Ni!' === name ? { valid: false, message: 'You must not say Ni!' } : { valid: true }
      };
      this.messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, payload);
    }
  }

  createNewFolder() {
    if (this.selectedNode) {
      const payload: TreeViewerInputBoxConfig = {
        root: this.model.root,
        onConfirm: (name) => {
          const contextTypeString = this.selectedNode.expanded !== undefined ? 'child' : 'sibling';
          console.log(`Create folder with name '${name}' as a ${contextTypeString} of '${this.selectedNode.name}'`);
          return Promise.resolve(true);
        },
        iconCssClasses: 'fa-folder',
        indent: this.selectedNode.expanded !== undefined,
        validateName: (name) => 'Ni!' === name ? { valid: false, message: 'You must not say Ni!' } : { valid: true }
      };
      this.messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, payload);
    }
  }

  rename() {
    if (this.selectedNode) {
      const payload: InputBoxConfig = {
        root: this.model.root,
        onConfirm: (name) => {
          console.log(`renaming '${this.selectedNode.name}' to '${name}'`);
          this.selectedNode.name = name;
          return Promise.resolve(true);
        },
        validateName: (name) => 'Ni!' === name ? { valid: false, message: 'You must not say Ni!' } : { valid: true }
      };
      this.messageBus.publish(TREE_NODE_RENAME_SELECTED, payload);
    }
  }

  nextState(fieldIndex: number) {
    this.indicatorFieldState[fieldIndex]++;
  }
}
