import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TreeNode } from './tree-node';
import { TreeViewerKeyboardConfig } from './tree-viewer-config';
import { MessagingService } from '@testeditor/messaging-service';
import { TREE_NODE_SELECTED } from '../../event-types-out';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-viewer-keyboard-decorator',
  templateUrl: './tree-viewer-keyboard-decorator.component.html',
  styleUrls: ['./tree-viewer-keyboard-decorator.component.css']
})
export class TreeViewerKeyboardDecoratorComponent implements OnInit, OnDestroy {
  @Input() config: TreeViewerKeyboardConfig;
  private _model: TreeNode;
  private _selectedNode: TreeNode = null;
  private subscriptions: Subscription;

  constructor(private messageBus: MessagingService) {
    this.subscriptions = this.messageBus.subscribe(TREE_NODE_SELECTED, (selectedNode) => {
      if (this.model.root === selectedNode.root) {
        this._selectedNode = selectedNode;
      }
    });
  }

  get model(): TreeNode {
    return this._model;
  }

  @Input()
  set model(newModel: TreeNode) {
    if (newModel !== this._model) {
      this._model = newModel;
      this._selectedNode = newModel;
    }
  }

  get selectedNode(): TreeNode {
    return this._selectedNode;
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.config.onKeyPress && this.config.onKeyPress.has(event.key)) {
      this.config.onKeyPress.get(event.key)(this._selectedNode);
      event.preventDefault();
    }
  }

}
