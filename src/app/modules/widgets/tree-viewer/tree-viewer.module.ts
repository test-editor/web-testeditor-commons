import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewerComponent } from './tree-viewer.component';
import { InputBoxComponent } from './input-box/input-box.component';
import { RenameElementComponent } from './rename-element/rename-element.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TreeViewerComponent,
    InputBoxComponent,
    RenameElementComponent
  ],
  exports: [
    TreeViewerComponent
  ]
})
export class TreeViewerModule { }
