import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MessagingModule } from '@testeditor/messaging-service';
import { TreeNode, TreeNodeWithoutParentLinks } from './tree-node';
import { TreeViewerConfig } from './tree-viewer-config';
import { TreeViewerComponent } from './tree-viewer.component';
import { TreeViewerModule } from './tree-viewer.module';

describe('tree viewer inside scrollable viewport', () => {
  let treeViewer: TreeViewerComponent;
  let hostComponent: TestHostComponent;
  let scrollContainer: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;

  @Component({
    selector: 'app-host-component',
    template: `
    <div #scrollContainer style="height: 200px; overflow: scroll">
      <app-tree-viewer #treeViewer
                       id="test-tree-viewer"
                       [model]="model"
                       [config]="config"
                       [level]="0">
      </app-tree-viewer>
    </div>`
  })
  class TestHostComponent {
    @ViewChild('scrollContainer')
    scrollContainer: ElementRef;
    @ViewChild('treeViewer')
    treeViewer: TreeViewerComponent;

    treeElements: TreeNodeWithoutParentLinks[] = Array.from({length: 15}, (_, index) => {
      return { name: `child${index}`, id: `root/child${index}`, children: [] };
    });

    model = TreeNode.create({name: 'root', id: 'root', children: this.treeElements});

    config: TreeViewerConfig = {};
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
    hostComponent.model.expanded = true;
    treeViewer = hostComponent.treeViewer;
    scrollContainer = hostComponent.scrollContainer.nativeElement;
    fixture.detectChanges();
  });

  it('detects that root element is initially fully visible', () => {
    // given
    scrollContainer.scrollTop = 0;
    // when
    const actualResult = treeViewer.isFullyVisible();

    // then
    expect(actualResult).toBeTruthy();
  });

  it('detects that root element is not fully visible after scrolling down', () => {
    // given
    scrollContainer.scrollTop = 1;

    // when
    const actualResult = treeViewer.isFullyVisible();

    // then
    expect(actualResult).toBeFalsy();
  });

  it('detects that child element is initially not fully visible', () => {
    // given
    scrollContainer.scrollTop = 0;
    const childComponent: TreeViewerComponent = fixture.debugElement.query(By.css('div:nth-child(11) > app-tree-viewer')).componentInstance;

    // when
    const actualResult = childComponent.isFullyVisible();

    // then
    expect(actualResult).toBeFalsy();
  });

  it('detects that child element becomes fully visible after scrolling down', () => {
    // given
    scrollContainer.scrollTop = 200;
    const childComponent: TreeViewerComponent = fixture.debugElement.query(By.css('div:nth-child(11) > app-tree-viewer')).componentInstance;

    // when
    const actualResult = childComponent.isFullyVisible();

    // then
    expect(actualResult).toBeTruthy();
  });

  it('scrolls down to selected element below the viewport', (done: any) => {
    // given
    const originalScrollPosition = 0;
    scrollContainer.scrollTop = originalScrollPosition;
    const childElement: DebugElement = fixture.debugElement.query(By.css('div:nth-child(11) > app-tree-viewer'));
    const childComponent: TreeViewerComponent = childElement.componentInstance;
    const childBottom = childElement.nativeElement.getBoundingClientRect().bottom;
    const containerBottom = scrollContainer.getBoundingClientRect().top + scrollContainer.clientHeight;
    expect(childBottom).toBeGreaterThan(containerBottom);

    // when
    childComponent.select(childComponent.model);

    // then
    setTimeout(() => { // wait for smooth scrolling animation to complete (fakeAsync/jasmine.clock don't work here)
      expect(childElement.nativeElement.getBoundingClientRect().bottom).toEqual(containerBottom);
      done();
    }, 1000);
  });

  it('scrolls up to selected element above the viewport', (done: any) => {
    // given
    const originalScrollPosition = 250;
    scrollContainer.scrollTop = originalScrollPosition;
    const childElement: DebugElement = fixture.debugElement.query(By.css('div:nth-child(2) > app-tree-viewer'));
    const childComponent: TreeViewerComponent = childElement.componentInstance;
    const childTop = childElement.nativeElement.getBoundingClientRect().top;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    expect(childTop).toBeLessThan(containerTop);

    // when
    childComponent.select(childComponent.model);

    // then
    setTimeout(() => { // wait for smooth scrolling animation to complete (fakeAsync/jasmine.clock don't work here)
      expect(childElement.nativeElement.getBoundingClientRect().top).toEqual(containerTop);
      done();
    }, 1000);
  });

  it('does not scroll to selected element inside the viewport', () => {
    // given
    const originalScrollPosition = 50;
    scrollContainer.scrollTop = originalScrollPosition;
    const childComponent: TreeViewerComponent = fixture.debugElement.query(By.css('div:nth-child(5) > app-tree-viewer')).componentInstance;

    // when
    childComponent.select(childComponent.model);

    // then
    expect(scrollContainer.scrollTop).toEqual(originalScrollPosition);
  });

});
