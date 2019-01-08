import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewerComponent } from './tree-viewer.component';
import { InputBoxComponent } from './input-box/input-box.component';
import { IndicatorBoxComponent } from './indicator-box/indicator-box.component';
import { MessagingModule } from '@testeditor/messaging-service';

@NgModule({
  imports: [
    CommonModule, MessagingModule.forRoot()
  ],
  declarations: [
    TreeViewerComponent,
    InputBoxComponent,
    IndicatorBoxComponent
  ],
  exports: [
    TreeViewerComponent
  ]
})
export class TreeViewerModule { }
