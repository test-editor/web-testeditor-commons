import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { TreeViewerModule } from './modules/widgets/tree-viewer/tree-viewer.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, TreeViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
