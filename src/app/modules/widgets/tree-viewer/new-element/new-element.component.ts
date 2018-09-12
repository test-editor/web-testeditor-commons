import { Component, ViewChild, Input, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { TreeNode } from '../tree-node';

export enum ContextType { Parent, Sibling }
export interface NodeContext { node: TreeNode; type: ContextType; }

export interface NewElementConfig {
  indent: boolean;
  validateName: (newName: string) => { valid: boolean, message?: string };
  createNewElement: (newName: string) => boolean;
  iconCssClasses: string;
}

@Component({
  selector: 'app-new-element',
  templateUrl: './new-element.component.html',
  styleUrls: ['./new-element.component.css']
})
export class NewElementComponent implements AfterViewInit {

  @ViewChild('theInput') input: ElementRef;
  @Input() config: NewElementConfig;
  @Output() cancelled = new EventEmitter<void>();
  @Output() succeeded = new EventEmitter<void>();

  errorMessage: string;

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

  onEnter(): void {
    if (this.validate()) {
      if (this.config.createNewElement(this.input.nativeElement.value)) {
        this.succeeded.emit();
      } else {
        this.errorMessage = 'Error while creating element!';
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

}
