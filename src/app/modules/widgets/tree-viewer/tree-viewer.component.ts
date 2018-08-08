import { Component, OnInit, Input, OnChanges, SimpleChanges, Renderer2, ElementRef, ViewChild, isDevMode } from '@angular/core';
import { MessagingService } from '@testeditor/messaging-service';

import { ConfirmationNeedingAction, isConfirmationNeedingAction } from './confirmation-needing-action';
import { TreeNode } from './tree-node';
import { TreeViewerConfig } from './tree-viewer-config';
import { TREE_NODE_SELECTED, TREE_NODE_DESELECTED } from '../../event-types-out';
import { TreeViewerEmbeddedButton } from './tree-viewer-embedded-button';
import { InputBoxConfig, TREE_NODE_CREATE_AT_SELECTED, TREE_NODE_RENAME_SELECTED, TreeViewerInputBoxConfig } from '../../event-types-in';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-tree-viewer',
  templateUrl: './tree-viewer.component.html',
  styleUrls: ['./tree-viewer.component.css']
})
export class TreeViewerComponent implements OnInit, OnChanges {
  @ViewChild('treeViewItemKey') treeViewItemKey: ElementRef;

  @Input() model: TreeNode;
  @Input() level = 0;
  @Input() config: TreeViewerConfig;

  private selectionContextSubscriptions: Subscription;
  createNewElement: TreeViewerInputBoxConfig = null;
  renameElement: InputBoxConfig = null;

  private embeddedButton: TreeViewerEmbeddedButton;
  private activeAction: ConfirmationNeedingAction = null;
  private get actionCssClasses(): string { return this.activeAction ? this.activeAction.messageCssClassses : ''; }
  private get embeddedButtonClasses(): string {
    return this.embeddedButton && this.embeddedButton.cssClasses ? this.embeddedButton.cssClasses : '';
  }

  constructor(private messagingService: MessagingService) { }

  ngOnInit() {
    if (this.model && this.config && this.config.embeddedButton) {
      this.embeddedButton = this.config.embeddedButton(this.model);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.model.selected) {
      this.treeViewItemKey.nativeElement.focus();
    }
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
          this.selectionContextSubscriptions.unsubscribe();
          this.messagingService.publish(TREE_NODE_DESELECTED, node);
        }
      });

      this.subscribeToEventsInSelectionContext();

      this.messagingService.publish(TREE_NODE_SELECTED, node);
      this.log('published TREE_NODE_SELECTED', node);
    }
  }

  private subscribeToEventsInSelectionContext() {
    this.selectionContextSubscriptions =
      this.messagingService.subscribe(
        TREE_NODE_CREATE_AT_SELECTED,
        (payload) => {
          if (this.model.root === payload.root) {
            this.createNewElement = payload;
          }
        });
    this.selectionContextSubscriptions.add(
      this.messagingService.subscribe(
        TREE_NODE_RENAME_SELECTED,
        (payload) => {
          if (this.model.root === payload.root) {
            this.renameElement = payload;
          }
        }));
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

  onKeyUp(node: TreeNode, event: KeyboardEvent) {
    console.log('key up!')
    if (this.config.onKeyPress) {
      this.config.onKeyPress.get(event.key)(node);
    }
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
    this.activeAction.onConfirm(this.model);
    this.activeAction = null;
  }

  showEmbeddedButton(): boolean {
    return this.embeddedButton && this.embeddedButton.visible(this.model, this.level);
  }

  onEmbeddedButtonClick() {
    if (this.config.embeddedButton) {
      if (isConfirmationNeedingAction(this.embeddedButton.onClick)) {
        this.commenceAction(this.embeddedButton.onClick);
      } else {
        this.embeddedButton.onClick(this.model);
      }
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

  onNewElementCancelled() {
    this.createNewElement = null;
  }
  onNewElementSucceeded() {
    this.createNewElement = null;
  }

  onRenameCancelled() {
    this.renameElement = null;
  }

  onRenameSucceeded() {
    this.renameElement = null;
  }
}
