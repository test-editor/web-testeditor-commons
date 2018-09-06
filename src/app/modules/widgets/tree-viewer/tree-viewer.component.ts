import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationNeedingAction } from './confirmation-needing-action';
import { TreeNode } from './tree-node';
import { TreeViewerConfig } from './tree-viewer-config';

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

  constructor() { }

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

  onClick(node: TreeNode) {
    if (this.config.onClick) {
      this.config.onClick(node);
    }
  }

  onIconClick(node: TreeNode, event?: MouseEvent) {
    if (this.config.onIconClick) {
      event.stopPropagation();
      this.config.onIconClick(node);
    }
  }

  onDoubleClick(node: TreeNode) {
    if (this.config.onDoubleClick) {
      this.config.onDoubleClick(node);
    }
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

}
