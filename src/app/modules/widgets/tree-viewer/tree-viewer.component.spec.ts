import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TreeViewerComponent } from './tree-viewer.component';
import { TreeNode, CommonTreeNodeActions } from './tree-node';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('TreeViewerComponent', () => {
  let component: TreeViewerComponent;
  let fixture: ComponentFixture<TreeViewerComponent>;

  const singleEmptyTreeNode = () => new TreeNode({
    name: 'tree node',
    children: [],
    leafCssClasses: 'fa-file'
  });

  const treeNodeWithSubNodes = () => new TreeNode({
    name: 'parent node',
    collapsedCssClasses: 'fa-chevron-right',
    expandedCssClasses: 'fa-chevron-down',
    leafCssClasses: 'fa-folder',
    expanded: false,
    children: [
      { name: 'child node 1', children: [] },
      { name: 'child node 2', children: [] },
      { name: 'child node 3', children: [] }
    ]
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeViewerComponent ]
    })
    .compileComponents();
  }));

  function getRootTreeViewItemKey(): DebugElement {
    return fixture.debugElement.query(By.css('.tree-view .tree-view-item-key'));
  }

  function constructKeyEventWithKey(key: string): any {
    return { key: key, stopPropagation: () => {}, preventDefault: () => {}};
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeViewerComponent);
    component = fixture.componentInstance;
    component.model = null;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides sub elements of collapsed node', fakeAsync(() => {
    // given
    component.model = treeNodeWithSubNodes();

    // when
    fixture.detectChanges();
    tick();

    // then
    const treeview = fixture.debugElement.query(By.css('.tree-view'));
    const treeitems = treeview.queryAll(By.css('.tree-view-item-key'));
    expect(treeitems.length).toEqual(1);
    expect(treeitems[0].nativeElement.innerText).toContain('parent node');
  }));

  it('shows sub elements of expanded noded', fakeAsync(() => {
    // given
    component.model = treeNodeWithSubNodes();

    // when
    component.model.expanded = true;
    fixture.detectChanges();
    tick();

    // then
    const treeview = fixture.debugElement.query(By.css('.tree-view'));
    const treeitems = treeview.queryAll(By.css('.tree-view-item-key'));
    expect(treeitems.length).toEqual(4);
    expect(treeitems[0].nativeElement.innerText).toContain('parent node');
    expect(treeitems[1].nativeElement.innerText).toContain('child node 1');
    expect(treeitems[2].nativeElement.innerText).toContain('child node 2');
    expect(treeitems[3].nativeElement.innerText).toContain('child node 3');
  }));

  it('performs configured action when double-clicked', () => {
    // given
    component.model = treeNodeWithSubNodes();
    component.config = {
      onDoubleClick: (node) => node.expanded = true
    };
    fixture.detectChanges();

    // when
    getRootTreeViewItemKey().triggerEventHandler('dblclick', new MouseEvent('dblclick'));

    // then
    expect(component.model.expanded).toBeDefined();
    expect(component.model.expanded).toBeTruthy();
  });

  it('uses model`s leaf style when expanded is undefined', () => {
    // given
    const treeNode = singleEmptyTreeNode();
    component.model = treeNode;

    // when
    fixture.detectChanges();

    // then
    const icon = getRootTreeViewItemKey().query(By.css('.icon-type'));
    expect(icon.classes[treeNode.leafCssClasses]).toBeTruthy();
  });

  it('uses model`s collapsed style when unexpanded', () => {
    // given
    const treeNode = treeNodeWithSubNodes();
    component.model = treeNode;

    // when
    fixture.detectChanges();

    // then
    const icon = getRootTreeViewItemKey().query(By.css('.icon-type'));
    expect(icon.classes[treeNode.collapsedCssClasses]).toBeTruthy();
  });

  it('uses model`s expanded style when expanded', () => {
    // given
    const treeNode = treeNodeWithSubNodes();
    treeNode.expanded = true;
    component.model = treeNode;

    // when
    fixture.detectChanges();

    // then
    const icon = getRootTreeViewItemKey().query(By.css('.icon-type'));
    expect(icon.classes[treeNode.expandedCssClasses]).toBeTruthy();
  });

  it('performs configured action when icon is clicked', () => {
    // given
    component.model = treeNodeWithSubNodes();
    component.config = {
      onIconClick: (node) => node.expanded = true
    };
    fixture.detectChanges();
    const icon = getRootTreeViewItemKey().query(By.css('.icon-type'));

    // when
    icon.triggerEventHandler('click', new MouseEvent('click'));

    // then
    expect(component.model.expanded).toBeDefined();
    expect(component.model.expanded).toBeTruthy();
  });

  it('performs configured action when node is clicked', () => {
    // given
    component.model = treeNodeWithSubNodes();
    let hasBeenClicked = false;
    component.config = {
      onClick: (node) => hasBeenClicked = true
    };
    fixture.detectChanges();

    // when
    getRootTreeViewItemKey().triggerEventHandler('click', new MouseEvent('click'));

    // then
    expect(hasBeenClicked).toBeTruthy();
  });

  it('has css class "active" if given by the model state', () => {
    // given
    component.model = singleEmptyTreeNode();

    fixture.detectChanges();
    expect(getRootTreeViewItemKey().classes.active).toBeFalsy();

    // when
    component.model.active = true;
    fixture.detectChanges();

    // then
    expect(getRootTreeViewItemKey().classes.active).toBeTruthy();
  });

  it('has css class "selected" if given by the model state', () => {
    // given
    component.model = singleEmptyTreeNode();

    fixture.detectChanges();
    expect(getRootTreeViewItemKey().classes.selected).toBeFalsy();

    // when
    component.model.selected = true;
    fixture.detectChanges();

    // then
    expect(getRootTreeViewItemKey().classes.selected).toBeTruthy();
  });

  it('only performs icon click action, not the general click action, when icon is clicked', () => {
    // given
    let iconClickHandlerTriggered = false;
    let generalClickHandlerTriggered = false;

    component.model = singleEmptyTreeNode();
    component.config = {
      onIconClick: (node) => iconClickHandlerTriggered = true,
      onClick: (node) => generalClickHandlerTriggered = true
    };
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('.icon-type')).nativeElement;

    // when
    icon.click();
    fixture.detectChanges();

    // then
    expect(iconClickHandlerTriggered).toBeTruthy('Icon was clicked, but icon click handler was not triggered.');
    expect(generalClickHandlerTriggered).toBeFalsy('Icon was clicked, but general click handler was triggered.');
  });

  it('performs the general click action when no icon click handler is specified and the icon is clicked', () => {
    // given
    let generalClickHandlerTriggered = false;

    component.model = singleEmptyTreeNode();
    component.config = {
      onClick: (node) => generalClickHandlerTriggered = true
    };
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('.icon-type')).nativeElement;

    // when
    icon.click();
    fixture.detectChanges();

    // then
    expect(generalClickHandlerTriggered).toBeTruthy('the general click handler was not triggered.');
  });

  it('performs the configured action when associated key is pressed', () => {
    // given
    component.model = treeNodeWithSubNodes();
    component.config = {
      onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
    };
    fixture.detectChanges();

    // when
    getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowRight'));
    fixture.detectChanges();

    // then
    expect(component.model.expanded).toBeTruthy('configured key action was not performed (right arrow key expands the node)');
  });

  describe('default keyboard actions', () => {

    it('sets expanded state when right arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = false;
      component.model.selected = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();

      // when
      getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowRight'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeTruthy('configured key action was not performed (right arrow key expands the node)');
    });

    it('keeps expanded state when right arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.model.selected = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();

      // when
      getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowRight'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeTruthy('wrong key action was performed (right arrow key does nothing on expanded node)');
    });

    it('sets collapsed state when left arrow key is pressed', () => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.model.selected = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();

      // when
      getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowLeft'));
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
      getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowLeft'));
      fixture.detectChanges();

      // then
      expect(component.model.expanded).toBeFalsy('wrong key action was performed (left arrow key does nothing on collapsed node)');
    });

    it('selects the next sibling element when the down arrow key is pressed', async(() => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.model.selected = false;
      component.model.children[0].selected = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();

      // when
      getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowDown'));
      fixture.detectChanges();

      // then
      expect(component.model.children[0].selected).toBeFalsy('original node remained selected');
      expect(component.model.children[1].selected).toBeTruthy('next node was not selected');
    }));

    it('selects the first child element when the down arrow key is pressed', async(() => {
      // given
      component.model = treeNodeWithSubNodes();
      component.model.expanded = true;
      component.model.selected = true;
      component.config = {
        onKeyPress: CommonTreeNodeActions.arrowKeyNavigation
      };
      fixture.detectChanges();

      // when
      getRootTreeViewItemKey().triggerEventHandler('keyup', constructKeyEventWithKey('ArrowDown'));
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
