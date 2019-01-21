import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, async } from '@angular/core/testing';
import { MessagingModule } from '@testeditor/messaging-service';
import { CommonTreeNodeActions, TreeNode } from './tree-node';
import { TreeViewerKeyboardConfig } from './tree-viewer-config';
import { TreeViewerKeyboardDecoratorComponent } from './tree-viewer-keyboard-decorator.component';
import { TreeViewerModule } from './tree-viewer.module';
import { By } from '@angular/platform-browser';

describe('Two keyboard-enabled tree viewers', () => {
  let firstTreeViewer: TreeViewerKeyboardDecoratorComponent;
  let secondTreeViewer: TreeViewerKeyboardDecoratorComponent;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  @Component({
    selector: `app-host-component`,
    template:
      `<app-tree-viewer-keyboard-decorator #firstTreeViewer
        id="first-tree-viewer" [model]="firstTree" [config]="sharedConfig">
      </app-tree-viewer-keyboard-decorator>
      <app-tree-viewer-keyboard-decorator #secondTreeViewer
        id="second-tree-viewer" [model]="secondTree" [config]="sharedConfig">
      </app-tree-viewer-keyboard-decorator>`
  })
  class TestHostComponent {
    @ViewChild('firstTreeViewer')
    firstTreeViewer: TreeViewerKeyboardDecoratorComponent;
    @ViewChild('secondTreeViewer')
    secondTreeViewer: TreeViewerKeyboardDecoratorComponent;

    firstTree = TreeNode.create({name: 'firstTree', id: 'firstTree', children: [
      { name: 'child1', id: 'firstTree/child1', children: [] },
      { name: 'child2', id: 'firstTree/child2', children: [] },
    ]});
    secondTree = TreeNode.create({name: 'secondTree', id: 'secondTree', children: [
      { name: 'child1', id: 'secondTree/child1', children: [] },
      { name: 'child2', id: 'secondTree/child2', children: [] },
    ]});
    sharedConfig: TreeViewerKeyboardConfig = {
      onKeyPress: new CommonTreeNodeActions().arrowKeyNavigation};
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TreeViewerModule, MessagingModule.forRoot()
      ],
      declarations: [
        TestHostComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    firstTreeViewer = hostComponent.firstTreeViewer;
    secondTreeViewer = hostComponent.secondTreeViewer;
  });

  it('are actually two different TreeViewer instances', () => {
    expect(firstTreeViewer).toBeTruthy();
    expect(secondTreeViewer).toBeTruthy();
    expect(firstTreeViewer === secondTreeViewer).toBeFalsy();
  });

  it('do not handle keyboard navigation events meant for the other tree viewer', () => {
    // given
    hostComponent.firstTree.expanded = true;
    hostComponent.secondTree.expanded = true;
    fixture.detectChanges();
    const firstKeyboardDecorator = fixture.debugElement.query(By.css('#first-tree-viewer > .tree-viewer-keyboard-decorator'));
    const firstTreeFirstChild = fixture.debugElement.query(By.css('#first-tree-viewer div:nth-child(2) .tree-view-item-key'));
    const secondTreeFirstChild = fixture.debugElement.query(By.css('#second-tree-viewer div:nth-child(2) .tree-view-item-key'));

    // when
    firstTreeFirstChild.nativeElement.click(); fixture.detectChanges();
    secondTreeFirstChild.nativeElement.click(); fixture.detectChanges();
    firstTreeFirstChild.nativeElement.click(); fixture.detectChanges();
    firstKeyboardDecorator.triggerEventHandler('keyup', {key: 'ArrowDown'}); fixture.detectChanges();

    // then
    expect(hostComponent.firstTree.children[0].selected).toBeFalsy('element remained selected after down arrow key was pressed');
    expect(hostComponent.firstTree.children[1].selected).toBeTruthy('element was not selected after down arrow key was pressed');
    expect(hostComponent.secondTree.children[0].selected).toBeTruthy('deselected element in wrong tree after down arrow key was pressed');
    expect(hostComponent.secondTree.children[1].selected).toBeFalsy('selected element in wrong tree after down arrow key was pressed');
  });

});
