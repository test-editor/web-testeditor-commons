import { Component, OnInit, Input, OnChanges, SimpleChanges, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { TreeNode } from './tree-node';
import { TreeViewerConfig } from './tree-viewer-config';

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

  constructor() {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.model.selected) {
      this.treeViewItemKey.nativeElement.focus();
    }
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

  onKeyUp(node: TreeNode, event: KeyboardEvent) {
    console.log('key up!')
    if (this.config.onKeyPress) {
      this.config.onKeyPress.get(event.key)(node);
    }
  }

}
