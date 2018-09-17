import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewerComponent } from './tree-viewer.component';
import { InputBoxComponent } from './input-box/input-box.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TreeViewerComponent,
    InputBoxComponent
  ],
  exports: [
    TreeViewerComponent
  ]
})
export class TreeViewerModule { }
