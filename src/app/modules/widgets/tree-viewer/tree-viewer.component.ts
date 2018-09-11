import { Component, Input, OnInit, isDevMode } from '@angular/core';

import { MessagingService } from '@testeditor/messaging-service';

import { ConfirmationNeedingAction } from './confirmation-needing-action';
import { TreeNode } from './tree-node';
import { TreeViewerConfig } from './tree-viewer-config';
import { TREE_NODE_SELECTED, TREE_NODE_DESELECTED } from '../../event-types-out';

@Component({
  selector: 'app-tree-viewer',
  templateUrl: './tree-viewer.component.html',
  styleUrls: ['./tree-viewer.component.css']
})
export class TreeViewerComponent implements OnInit {

  @Input() model: TreeNode;
  @Input() level = 0;
  @Input() config: TreeViewerConfig;

  private activeAction: ConfirmationNeedingAction = null;
  private get actionCssClasses(): string { return this.activeAction ? this.activeAction.messageCssClassses : ''; }
  private get embeddedButtonClasses(): string {
    return this.config && this.config.embeddedButton && this.config.embeddedButton.cssClasses ? this.config.embeddedButton.cssClasses : '';
  }

  constructor(private messagingService: MessagingService) { }

  ngOnInit() {
  }

  get cssClasses(): string {
    return this.model.cssClasses ? this.model.cssClasses : '';
  }

  get icon(): string {
    if (this.model) {
      switch (this.model.expanded) {
        case undefined: return this.model.leafCssClasses;
        case true: return this.model.expandedCssClasses;
        case false: return this.model.collapsedCssClasses;
      }
    } else {
      return 'fa-question';
    }
  }

  /** select this node, publish event that this node has been selected,
      register for selection events (react to selections of other nodes of the same tree and deselect) */
  public select(node: TreeNode): void {
    this.log('selecting node', node);
    this.log('model is', this.model);
    if (!node.selected && node.root === this.model.root) {
      node.selected = true;
      const subscription = this.messagingService.subscribe(TREE_NODE_SELECTED, (selectedNode) => {
        this.log('received TREE_NODE_SELECTED', selectedNode);
        if ((selectedNode !== node) && (selectedNode.root === this.model.root)) {
          node.selected = false;
          subscription.unsubscribe();
          this.messagingService.publish(TREE_NODE_DESELECTED, node);
        }
      });

      this.messagingService.publish(TREE_NODE_SELECTED, node);
      this.log('published TREE_NODE_SELECTED', node);
    }
  }

  onClick(node: TreeNode) {
    if (this.config && this.config.onClick) {
      this.config.onClick(node);
    }
    this.select(node);
  }

  onIconClick(node: TreeNode, event?: MouseEvent) {
    if (this.config && this.config.onIconClick) {
      event.stopPropagation();
      this.config.onIconClick(node);
    }
    this.select(node);
  }

  onDoubleClick(node: TreeNode) {
    if (this.config && this.config.onDoubleClick) {
      this.config.onDoubleClick(node);
    }
    this.select(node);
  }

  onTextClick(node: TreeNode, event?: MouseEvent) {
    if (this.config && this.config.onTextClick) {
      event.stopPropagation();
      this.config.onTextClick(node);
    }
    this.select(node);
  }

  onTextDoubleClick(node: TreeNode) {
    if (this.config && this.config.onTextDoubleClick) {
      this.config.onTextDoubleClick(node);
    }
    this.select(node);
  }

  commenceAction(action: ConfirmationNeedingAction) {
    this.activeAction = action;
  }

  onActionCancelled() {
    this.activeAction = null;
  }

  onActionConfirmed() {
    this.activeAction.onConfirm();
    this.activeAction = null;
  }

  showEmbeddedButton(): boolean {
    return this.config && this.config.embeddedButton && this.config.embeddedButton.visible(this.model, this.level);
  }

  onEmbeddedButtonClick() {
    if (this.config.embeddedButton) {
      this.config.embeddedButton.onClick(this.model);
    }
  }

  private log(msg: String, payload?) {
    if (isDevMode()) {
      console.log('TreeViewerComponent: ' + msg);
      if (payload !== undefined) {
        console.log(payload);
      }
    }
  }

}
