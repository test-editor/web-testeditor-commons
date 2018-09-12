import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewerComponent } from './tree-viewer.component';
import { NewElementComponent } from './new-element/new-element.component';
import { RenameElementComponent } from './rename-element/rename-element.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TreeViewerComponent,
    NewElementComponent,
    RenameElementComponent
  ],
  exports: [
    TreeViewerComponent
  ]
})
export class TreeViewerModule { }
