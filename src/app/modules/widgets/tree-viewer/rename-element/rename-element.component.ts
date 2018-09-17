import { Component, ViewChild, Input, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { TreeNode } from '../tree-node';
import { InputBoxConfig } from '../../../event-types-in';

@Component({
  selector: 'app-rename-element',
  templateUrl: './rename-element.component.html',
  styleUrls: ['./rename-element.component.css']
})
export class RenameElementComponent implements AfterViewInit {

  @ViewChild('renameInput') input: ElementRef;
  @Input() originalName: string;
  @Input() config: InputBoxConfig;
  @Output() cancelled = new EventEmitter<void>();
  @Output() succeeded = new EventEmitter<void>();

  errorMessage: string;

  ngAfterViewInit(): void {
    this.input.nativeElement.focus();
  }

  onKeyup(event: KeyboardEvent): void {
    this.validate();
    event.stopPropagation();
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
        this.errorMessage = 'Error while creating element!';
      }
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

}
