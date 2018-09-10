import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MessagingModule } from '@testeditor/messaging-service';

import { AppComponent } from './app.component';
import { TreeViewerModule } from './modules/widgets/tree-viewer/tree-viewer.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TreeViewerModule,
    MessagingModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
