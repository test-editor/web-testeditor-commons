import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TreeNode } from './tree-node';
import { TreeViewerKeyboardConfig } from './tree-viewer-config';
import { MessagingService } from '@testeditor/messaging-service';
import { TREE_NODE_SELECTED } from '../../event-types-out';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-tree-viewer-keyboard-decorator',
  templateUrl: './tree-viewer-keyboard-decorator.component.html',
  styleUrls: ['./tree-viewer-keyboard-decorator.component.css']
})
export class TreeViewerKeyboardDecoratorComponent implements OnInit, OnDestroy {
  @Input() model: TreeNode;
  @Input() config: TreeViewerKeyboardConfig;
  private selectedNode: TreeNode = null;
  private subscriptions: Subscription;

  constructor(private messageBus: MessagingService) {
    this.subscriptions = this.messageBus.subscribe(TREE_NODE_SELECTED, (selectedNode) => {
      if (this.model.root === selectedNode.root) {
        this.selectedNode = selectedNode;
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (this.config.onKeyPress && this.config.onKeyPress.has(event.key)) {
      this.config.onKeyPress.get(event.key)(this.selectedNode);
      event.preventDefault();
    }
  }

}
