import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewerComponent } from './tree-viewer.component';
import { NewElementComponent } from './new-element/new-element.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TreeViewerComponent,
    NewElementComponent
  ],
  exports: [
    TreeViewerComponent
  ]
})
export class TreeViewerModule { }
