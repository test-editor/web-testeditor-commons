import { Component, ElementRef, Input, isDevMode, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MessagingService } from '@testeditor/messaging-service';
import { Subscription } from 'rxjs';
import { ActionInTree, InputBoxConfig, TreeViewerInputBoxConfig, TREE_NODE_COMMENCE_ACTION_AT_SELECTED,
  TREE_NODE_CREATE_AT_SELECTED, TREE_NODE_RENAME_SELECTED } from '../../event-types-in';
import { TREE_NODE_DESELECTED, TREE_NODE_SELECTED } from '../../event-types-out';
import { ConfirmationNeedingAction, isConfirmationNeedingAction } from './confirmation-needing-action';
import { NodeView, TreeNode } from './tree-node';
import { TreeViewerConfig } from './tree-viewer-config';
import { TreeViewerEmbeddedButton } from './tree-viewer-embedded-button';



@Component({
  selector: 'app-tree-viewer',
  templateUrl: './tree-viewer.component.html',
  styleUrls: ['./tree-viewer.component.css']
})
export class TreeViewerComponent implements OnInit, OnChanges, NodeView {
  private static readonly NO_SCROLLABLE_PARENT = {};

  @ViewChild('treeViewItemKey') treeViewItemKey: ElementRef;

  @Input() model: TreeNode;
  @Input() level = 0;
  @Input() config: TreeViewerConfig;

  private selectionContextSubscriptions: Subscription;
  createNewElement: TreeViewerInputBoxConfig = null;
  renameElement: InputBoxConfig = null;

  public embeddedButton: TreeViewerEmbeddedButton;
  public activeAction: ConfirmationNeedingAction = null;
  public get actionCssClasses(): string { return this.activeAction ? this.activeAction.messageCssClassses : ''; }
  public get embeddedButtonClasses(): string {
    return this.embeddedButton && this.embeddedButton.cssClasses ? this.embeddedButton.cssClasses : '';
  }

  constructor(private messagingService: MessagingService) { }

  ngOnInit() {
    if (this.model) {
      this.model.attachView(this);
      if (this.config && this.config.embeddedButton) {
        this.embeddedButton = this.config.embeddedButton(this.model);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model) {
      this.model.attachView(this);
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
  public select(node: TreeNode = this.model): void {
    this.log('selecting node', node);
    this.log('model is', this.model);
    if (!node.selected && node.root === this.model.root) {
      console.log(`Selecting ${node}`);
      node.selected = true;
      this.scrollIntoView();
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

  public scrollIntoView() {
    if (this.treeViewItemKey) {
      const scrollableParent = this.findScrollableParent();
      if (this.hasScrollContainer(scrollableParent)) {
        if (this.extendsBelowViewport(scrollableParent)) {
          this.treeViewItemKey.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
        } else if (this.extendsAboveViewport(scrollableParent)) {
          this.treeViewItemKey.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
      }
    }
  }

  private hasScrollContainer(scrollableParent: any): boolean {
    return scrollableParent !== TreeViewerComponent.NO_SCROLLABLE_PARENT;
  }

  public extendsBelowViewport(scrollableParent: any): boolean {
    const elementPosition = this.treeViewItemKey.nativeElement.getBoundingClientRect();
    const containerPosition = scrollableParent.getBoundingClientRect();

    return elementPosition.bottom > containerPosition.bottom;
  }

  public extendsAboveViewport(scrollableParent: any): boolean {
    const elementPosition = this.treeViewItemKey.nativeElement.getBoundingClientRect();
    const containerPosition = scrollableParent.getBoundingClientRect();

    return  elementPosition.top < containerPosition.top;
  }

  public findScrollableParent(element?: any): any {
    if (!element) {
      element = this.treeViewItemKey.nativeElement;
    }
    const parent = element.parentNode;
    if (!parent) {
      return TreeViewerComponent.NO_SCROLLABLE_PARENT;
    } else if (parent.scrollHeight > parent.clientHeight) {
      return parent;
    } else {
      return this.findScrollableParent(parent);
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
        }
      )
    );
    this.selectionContextSubscriptions.add(
      this.messagingService.subscribe(
        TREE_NODE_COMMENCE_ACTION_AT_SELECTED,
        (payload: ActionInTree) => {
          if (this.model.root === payload.treeRoot) {
            this.commenceAction(payload.action);
          }
        }
      )
    );
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
