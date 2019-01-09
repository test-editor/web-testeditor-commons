import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommonTreeNodeActions } from './tree-node';
import { TreeViewerKeyboardDecoratorComponent } from './tree-viewer-keyboard-decorator.component';
import { treeNodeWithSubNodes } from './tree-viewer.component.spec';
import { MessagingModule } from '@testeditor/messaging-service';
import { TreeViewerComponent } from './tree-viewer.component';
import { InputBoxComponent } from './input-box/input-box.component';
import { IndicatorBoxComponent } from './indicator-box/indicator-box.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';


describe('TreeViewerKeyboardDecoratorComponent', () => {
  let component: TreeViewerKeyboardDecoratorComponent;
  let fixture: ComponentFixture<TreeViewerKeyboardDecoratorComponent>;
  let keyboardDecorator: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MessagingModule.forRoot() ],
      declarations: [ TreeViewerKeyboardDecoratorComponent, TreeViewerComponent, InputBoxComponent, IndicatorBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeViewerKeyboardDecoratorComponent);
    component = fixture.componentInstance;
    component.model = null;
    keyboardDecorator = fixture.debugElement.query(By.css('.tree-viewer-keyboard-decorator'));
    keyboardDecorator.nativeElement.focus();
    fixture.detectChanges();
  });

  function constructKeyEventWithKey(key: string): any {
    return { key: key, stopPropagation: () => {}, preventDefault: () => {}};
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default keyboard actions', () => {

    it('sets expanded state when right arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = false;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.tree-view .tree-view-item-key')).triggerEventHandler('click', new MouseEvent('click'));

      // when
      keyboardDecorator.triggerEventHandler('keyup', constructKeyEventWithKey('ArrowRight'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeTruthy('configured key action was not performed (right arrow key expands the node)');
    });

    it('keeps expanded state when right arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.tree-view .tree-view-item-key')).triggerEventHandler('click', new MouseEvent('click'));

      // when
      keyboardDecorator.triggerEventHandler('keyup', constructKeyEventWithKey('ArrowRight'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeTruthy('wrong key action was performed (right arrow key does nothing on expanded node)');
    });

    it('sets collapsed state when left arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.tree-view .tree-view-item-key')).triggerEventHandler('click', new MouseEvent('click'));

      // when
      keyboardDecorator.triggerEventHandler('keyup', constructKeyEventWithKey('ArrowLeft'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeFalsy('configured key action was not performed (left arrow key collapses the node)');
    });

    it('keeps collapsed state when left arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = false;
      component.model.selected = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();

      // when
      keyboardDecorator.triggerEventHandler('keyup', constructKeyEventWithKey('ArrowLeft'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeFalsy('wrong key action was performed (left arrow key does nothing on collapsed node)');
    });

    it('selects the next sibling element when the down arrow key is pressed', fakeAsync(() => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();
      fixture.debugElement.query(By.css('div:nth-child(2) > div:nth-child(1) > app-tree-viewer > div > div.tree-view-item > div'))
        .triggerEventHandler('click', new MouseEvent('click'));

      // when
      keyboardDecorator.triggerEventHandler('keyup', constructKeyEventWithKey('ArrowDown'));
      fixture.detectChanges();

      // then
      expect(component.model.children[0].selected).toBeFalsy('original node remained selected');
      expect(component.model.children[1].selected).toBeTruthy('next node was not selected');
    }));

    it('selects the first child element when the down arrow key is pressed', async(() => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.tree-view .tree-view-item-key')).triggerEventHandler('click', new MouseEvent('click'));

      // when
      keyboardDecorator.triggerEventHandler('keyup', constructKeyEventWithKey('ArrowDown'));
      fixture.detectChanges();

      // then
      expect(component.model.selected).toBeFalsy('original node remained selected');
      expect(component.model.children[0].selected).toBeTruthy('next node was not selected');
    }));

    // it('selects the parent`s next sibling element when the down arrow key is pressed', async(() => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   component.getWorkspace().setSelected('subfolder/newFolder');
    //   fixture.detectChanges();

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.NAVIGATE_NEXT));

    //   // then
    //   expect(component.getWorkspace().getSelected()).toEqual(nonExecutableFile.path);
    // }));

    // it('leaves the selection unchanged when the down arrow key is pressed on the last element', async(() => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   component.getWorkspace().setSelected(lastElement.path);
    //   component.getWorkspace().setExpanded(lastElement.path, true);
    //   fixture.detectChanges();

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.NAVIGATE_NEXT));

    //   // then
    //   expect(component.getWorkspace().getSelected()).toEqual(lastElement.path);
    // }));

    // it('selects the preceding sibling element when the up arrow key is pressed', async(() => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   component.getWorkspace().setSelected(tclFile.path);
    //   fixture.detectChanges();

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.NAVIGATE_PREVIOUS));

    //   // then
    //   expect(component.getWorkspace().getSelected()).toEqual(nonExecutableFile.path);
    // }));

    // it('selects the parent element when the up arrow key is pressed on the first child', async(() => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   component.getWorkspace().setSelected('subfolder/newFolder');
    //   component.getWorkspace().setExpanded(component.getWorkspace().getSelected(), true);
    //   fixture.detectChanges();

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.NAVIGATE_PREVIOUS));

    //   // then
    //   expect(component.getWorkspace().getElementInfo(component.getWorkspace().getSelected()).name).toEqual('subfolder');
    // }));

    // it('selects the preceding sibling`s last child element when the up arrow key is pressed', async(() => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   component.getWorkspace().setSelected(nonExecutableFile.path);
    //   component.getWorkspace().setExpanded(component.getWorkspace().getSelected(), true);
    //   fixture.detectChanges();

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.NAVIGATE_PREVIOUS));

    //   // then
    //   expect(component.getWorkspace().getSelected()).toEqual('subfolder/newFolder');
    // }));

    // it('leaves the selection unchanged when the up arrow key is pressed on the first element', async(() => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   let firstElement = component.getWorkspace().getRootPath();
    //   component.getWorkspace().setSelected(firstElement);
    //   component.getWorkspace().setExpanded(firstElement, true);
    //   fixture.detectChanges();

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.NAVIGATE_PREVIOUS));


    //   // then
    //   expect(component.getWorkspace().getSelected()).toEqual(firstElement);
    // }));

    // it('emits "navigation.open" message when the enter key is pressed', () => {
    //   // given
    //   setupWorkspace(component, messagingService, fixture);
    //   component.getWorkspace().setExpanded(component.getWorkspace().getElementInfo('subfolder').path, true);
    //   component.getWorkspace().setSelected(tclFile.path);
    //   fixture.detectChanges();
    //   let callback = jasmine.createSpy('callback');
    //   messagingService.subscribe(events.NAVIGATION_OPEN, callback);

    //   // when
    //   sidenav.query(By.css('nav-tree-viewer')).triggerEventHandler('keyup', constructKeyEventWithKey(KeyActions.OPEN_FILE));

    //   // then
    //   expect(callback).toHaveBeenCalledTimes(1);
    //   expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({
    //     name: tclFile.name,
    //     path: tclFile.path
    //   }));
    // });

  });
});
