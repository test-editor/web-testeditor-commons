import { Component, ViewChild, Input, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { TreeNode } from '../tree-node';
import { InputBoxConfig, TreeViewerInputBoxConfig } from '../../../event-types-in';

export enum ContextType { Parent, Sibling }
export interface NodeContext { node: TreeNode; type: ContextType; }

@Component({
  selector: 'app-tree-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.css']
})
export class InputBoxComponent implements AfterViewInit {

  @ViewChild('theInput') input: ElementRef;
  @Input() config: InputBoxConfig;
  @Input() value: string;
  @Output() cancelled = new EventEmitter<void>();
  @Output() succeeded = new EventEmitter<void>();

  errorMessage: string;

  get indent(): boolean {
    return this.isTreeViewerInputBoxConfig(this.config) ? this.config.indent : false;
  }

  get iconCssClasses(): string {
    return this.isTreeViewerInputBoxConfig(this.config) ? this.config.iconCssClasses : '';
  }

  isTreeViewerInputBoxConfig(config: InputBoxConfig | TreeViewerInputBoxConfig): config is TreeViewerInputBoxConfig {
    const extendedConfig = <TreeViewerInputBoxConfig>config;
    return extendedConfig.indent !== undefined && extendedConfig.iconCssClasses !== undefined;
  }

  ngAfterViewInit(): void {
    this.input.nativeElement.focus();
  }

  onKeyup(event: any): void {
    this.validate();
  }

  validate(): boolean {
    const newName: string = this.input.nativeElement.value;
    const nameCheckResult = this.config.validateName(newName);
    this.errorMessage = nameCheckResult.valid ? null : nameCheckResult.message;
    return nameCheckResult.valid;
  }

  async onEnter(): Promise<void> {
    if (this.validate()) {
      if (await this.config.onConfirm(this.input.nativeElement.value)) {
        this.succeeded.emit();
      } else {
        this.errorMessage = 'Action did not succeed.';
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

}
