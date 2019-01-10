import { DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MessagingModule, MessagingService } from '@testeditor/messaging-service';
import { InputBoxConfig, TreeViewerInputBoxConfig, TREE_NODE_CREATE_AT_SELECTED, TREE_NODE_RENAME_SELECTED } from '../../event-types-in';
import { DeleteAction } from './confirmation-needing-action';
import { IndicatorBoxComponent } from './indicator-box/indicator-box.component';
import { InputBoxComponent } from './input-box/input-box.component';
import { TreeNode } from './tree-node';
import { EmbeddedDeleteButton } from './tree-viewer-embedded-button';
import { TreeViewerComponent } from './tree-viewer.component';

export const singleEmptyTreeNode: () => TreeNode = () => {
  const node = {
    name: 'tree node',
    children: [],
    leafCssClasses: 'fa-file',
    cssClasses: 'someCssClass otherCssClass'
  };
  return TreeNode.create(node);
};

export const treeNodeWithSubNodes: () => TreeNode = () => {
  const root = TreeNode.create({
    name: 'parent node',
    collapsedCssClasses: 'fa-chevron-right',
    expandedCssClasses: 'fa-chevron-down',
    leafCssClasses: 'fa-folder',
    expanded: false,
    children: [
      { name: 'child node 1', children: []},
      { name: 'child node 2', children: []},
      { name: 'child node 3', children: []}
    ]
  });
  return root;
};

describe('TreeViewerComponent', () => {
  let component: TreeViewerComponent;
  let fixture: ComponentFixture<TreeViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MessagingModule.forRoot() ],
      declarations: [ TreeViewerComponent, InputBoxComponent, IndicatorBoxComponent ]
    })
    .compileComponents();
  }));

  function getRootTreeViewItemKey(): DebugElement {
    return fixture.debugElement.query(By.css('.tree-view .tree-view-item-key'));
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
    const hiddenSubtree = fixture.debugElement.query(By.css('.tree-view > .collapsed-subtree'));
    expect(hiddenSubtree).toBeTruthy();
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
      onClick: () => hasBeenClicked = true
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
      onIconClick: () => iconClickHandlerTriggered = true,
      onClick: () => generalClickHandlerTriggered = true
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
      onClick: () => generalClickHandlerTriggered = true
    };
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('.icon-type')).nativeElement;

    // when
    icon.click();
    fixture.detectChanges();

    // then
    expect(generalClickHandlerTriggered).toBeTruthy('the general click handler was not triggered.');
  });

  it('uses model`s css classes for node', () => {
    // given
    const treeNode = singleEmptyTreeNode();
    component.model = treeNode;

    // when
    fixture.detectChanges();

    // then
    const treeView = fixture.debugElement.query(By.css('.tree-view'));
    expect(treeView.classes['someCssClass']).toBeTruthy();
    expect(treeView.classes['otherCssClass']).toBeTruthy();
  });

  it('uses applies css classes when the model changes', () => {
    // given
    const treeNode = singleEmptyTreeNode();
    component.model = treeNode;
    fixture.detectChanges();

    // when
    component.model.cssClasses = 'newCssClass';
    fixture.detectChanges();

    // then
    const treeView = fixture.debugElement.query(By.css('.tree-view'));
    expect(treeView.classes['someCssClass']).toBeFalsy();
    expect(treeView.classes['otherCssClass']).toBeFalsy();
    expect(treeView.classes['newCssClass']).toBeTruthy();
  });

  it('opens up confirmation dialog when calling commenceAction', () => {
    // given
    const treeNode = singleEmptyTreeNode();
    component.model = treeNode;
    const action = new DeleteAction(TreeNode.create({ name: 'elementName', children: []}), () => {});

    // when
    component.commenceAction(action);
    fixture.detectChanges();

    // then
    const confirmationDialog = fixture.debugElement.query(By.css('.confirm-action'));
    const message = fixture.debugElement.query(By.css('.confirm-action-message'));
    const cancelButton = fixture.debugElement.query(By.css('.confirm-action-cancel-button'));
    const confirmButton = fixture.debugElement.query(By.css('.confirm-action-confirm-button'));
    expect(confirmationDialog).toBeTruthy();
    expect(confirmationDialog.classes['alert']).toBeTruthy();
    expect(confirmationDialog.classes['alert-warning']).toBeTruthy();
    expect(cancelButton.classes['alert-link']).toBeTruthy();
    expect(confirmButton.classes['alert-link']).toBeTruthy();
    expect(message.nativeElement.innerText.trim()).toEqual('Are you sure you want to delete \'elementName\'?');
  });

  it('closes the confirmation dialog when user clicks the cancel button', () => {
    // given
    const treeNode = singleEmptyTreeNode();
    let actionHasBeenCalled = false;
    component.model = treeNode;
    const action = new DeleteAction(TreeNode.create({ name: 'elementName', children: []}), () => actionHasBeenCalled = true);
    component.commenceAction(action);
    fixture.detectChanges();
    const cancelButton = fixture.debugElement.query(By.css('.confirm-action-cancel-button'));

    // when
    cancelButton.nativeElement.click();
    fixture.detectChanges();

    // then
    const confirmationDialog = fixture.debugElement.query(By.css('.confirm-action'));
    expect(confirmationDialog).toBeFalsy();
    expect(actionHasBeenCalled).toBeFalsy();
  });

  it('executes the associated action and closes the confirmation dialog when user clicks the confirm button', () => {
    // given
    const treeNode = singleEmptyTreeNode();
    let actionHasBeenCalled = false;
    component.model = treeNode;
    const action = new DeleteAction(TreeNode.create({ name: 'elementName', children: []}), () => actionHasBeenCalled = true);
    component.commenceAction(action);
    fixture.detectChanges();
    const confirmButton = fixture.debugElement.query(By.css('.confirm-action-confirm-button'));

    // when
    confirmButton.nativeElement.click();
    fixture.detectChanges();

    // then
    const confirmationDialog = fixture.debugElement.query(By.css('.confirm-action'));
    expect(confirmationDialog).toBeFalsy();
    expect(actionHasBeenCalled).toBeTruthy();
  });

  it('displays an embedded delete button for all nodes but the root, if specified in the config', () => {
    // given
    const treeNode = treeNodeWithSubNodes();
    treeNode.expanded = true;
    component.model = treeNode;

    // when
    component.config = { embeddedButton: (node) => new EmbeddedDeleteButton(new DeleteAction(node, () => {})) };
    fixture.detectChanges();

    // then
    const treeview = fixture.debugElement.query(By.css('.tree-view'));
    const embeddedButtons = treeview.queryAll(By.css('.tree-view-item-key .embedded-button'));
    expect(embeddedButtons.length).toEqual(3);
    embeddedButtons.forEach((embeddedButton, index) => {
      expect(embeddedButton.classes['embedded-delete-button']).toBeTruthy();
      expect(embeddedButton.classes['fa']).toBeTruthy();
      expect(embeddedButton.classes['fa-fw']).toBeTruthy();
      expect(embeddedButton.classes['fa-times']).toBeTruthy();
      expect(embeddedButton.classes['fa-times']).toBeTruthy();
      expect(embeddedButton.properties['title']).toEqual(`delete 'child node ${index + 1}'`);
    });
  });

  it('performs the provided action when the embedded delete button is clicked and the user confirms it', () => {
    // given
    const treeNode = treeNodeWithSubNodes();
    treeNode.expanded = true;
    component.model = treeNode;
    let actionPerformed = false;
    component.config = { embeddedButton: (node) => new EmbeddedDeleteButton(new DeleteAction(node, () => actionPerformed = true)) };
    fixture.detectChanges();
    const embeddedButton = fixture.debugElement.query(By.css('.tree-view-item-key .embedded-button'));

    // when
    embeddedButton.nativeElement.click();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.confirm-action-confirm-button')).nativeElement.click();
    fixture.detectChanges();

    // then
    expect(actionPerformed).toBeTruthy();
  });

  it('marks a node as selected if clicking it', () => {
    // given
    component.model = treeNodeWithSubNodes();
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.css('.tree-view-item-key')).nativeElement;

    // when
    item.click();

    // then
    expect(component.model.selected).toBeTruthy();
  });

  it('deselects selected node upon selection of different node', () => {
    const treeNode = treeNodeWithSubNodes();
    const subNode = treeNode.children[0];
    component.model = treeNode;
    component.select(treeNode);

    // when
    component.select(subNode);

    // then
    expect(treeNode.selected).toBeFalsy();
    expect(subNode.selected).toBeTruthy();
  });

  it('does not change selection if selecting the same node again', () => {
    const treeNode = treeNodeWithSubNodes();
    component.model = treeNode;
    component.select(treeNode);

    // when
    component.select(treeNode);

    // then
    expect(treeNode.selected).toBeTruthy();
  });

  it('does not change selection if selecting a node of a different tree', () => {
    const treeNode = treeNodeWithSubNodes();
    component.model = treeNode;
    component.select(treeNode);
    const unrelatedNode = TreeNode.create({
      name: 'unrelated node',
      children: []
    });

    // when
    component.select(unrelatedNode);

    // then
    expect(treeNode.selected).toBeTruthy();
  });

  it('displays new element input box with css settings when receiving TREE_NODE_CREATE_AT_SELECTED event',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const newElementRequest: TreeViewerInputBoxConfig = {
      root: component.model.root,
      onConfirm: () => Promise.resolve(true),
      iconCssClasses: 'testCssClass',
      indent: false,
      validateName: () => ({ valid: false })
    };
    component.select(component.model);

    // when
    messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, newElementRequest);
    fixture.detectChanges();

    // then
    const newElementIcon = fixture.debugElement.query(By.css('.navInputBox > span'));
    expect(newElementIcon.classes['testCssClass']).toBeTruthy();
  }));

  it('hides the new element input box when the user cancels it',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const newElementRequest: TreeViewerInputBoxConfig = {
      root: component.model.root,
      onConfirm: () => Promise.resolve(true),
      iconCssClasses: 'testCssClass',
      indent: false,
      validateName: () => ({ valid: false })
    };
    component.select(component.model);
    messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, newElementRequest);
    fixture.detectChanges();

    // when
    component.onNewElementCancelled();
    fixture.detectChanges();

    // then
    expect(fixture.debugElement.query(By.css('.navInputBox'))).toBeFalsy();
  }));

  it('hides the new element input box when element creation success is signalled',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const newElementRequest: TreeViewerInputBoxConfig = {
      root: component.model.root,
      onConfirm: () => Promise.resolve(true),
      iconCssClasses: 'testCssClass',
      indent: false,
      validateName: () => ({ valid: true })
    };
    component.select(component.model);
    messageBus.publish(TREE_NODE_CREATE_AT_SELECTED, newElementRequest);
    fixture.detectChanges();

    // when
    component.onNewElementSucceeded();
    fixture.detectChanges();

    // then
    expect(fixture.debugElement.query(By.css('.navInputBox'))).toBeFalsy();
  }));

  it('displays rename element input box when receiving TREE_NODE_RENAME_SELECTED event',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const renameRequest: InputBoxConfig = {
      root: component.model.root,
      onConfirm: () => Promise.resolve(true),
      validateName: () => ({ valid: false })
    };
    component.select(component.model);

    // when
    messageBus.publish(TREE_NODE_RENAME_SELECTED, renameRequest);
    fixture.detectChanges();

    // then
    const renameInputField = fixture.debugElement.query(By.css('.navInputBox > input'));
    expect(renameInputField.nativeElement.value).toEqual('tree node');
  }));

  it('hides the rename element input box when the user cancels it',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const renameRequest: InputBoxConfig = {
      root: component.model.root,
      onConfirm: () => Promise.resolve(true),
      validateName: () => ({ valid: false })
    };
    component.select(component.model);
    messageBus.publish(TREE_NODE_RENAME_SELECTED, renameRequest);
    fixture.detectChanges();

    // when
    component.onRenameCancelled();
    fixture.detectChanges();

    // then
    expect(fixture.debugElement.query(By.css('.navRenameElement'))).toBeFalsy();
  }));

  it('hides the rename element input box when element creation success is signalled',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const renameRequest: InputBoxConfig = {
      root: component.model.root,
      onConfirm: () => Promise.resolve(true),
      validateName: () => ({ valid: false })
    };
    component.select(component.model);
    messageBus.publish(TREE_NODE_RENAME_SELECTED, renameRequest);
    fixture.detectChanges();

    // when
    component.onRenameSucceeded();
    fixture.detectChanges();

    // then
    expect(fixture.debugElement.query(By.css('.navRenameElement'))).toBeFalsy();
  }));

  it('provides an indicator box for fields whose display condition is satisfied', () => {
    // given
    component.model = singleEmptyTreeNode();

    // when
    component.config = { indicatorFields: [{
      condition: () => true, states: [{condition: () => true, cssClasses: 'testCssClass', label: () => 'testLabel'}]
    }] };
    fixture.detectChanges();

    // then
    const indicatorBox = fixture.debugElement.query(By.css('.indicator-boxes .testCssClass'));
    expect(indicatorBox).toBeTruthy();
    expect(indicatorBox.nativeElement.title).toEqual('testLabel');
  });

  it('hides the indicator box but reserves the space for fields whose display condition is not satisfied', () => {
    // given
    component.model = singleEmptyTreeNode();

    // when
    component.config = { indicatorFields: [{
      condition: () => false, states: []
    }] };
    fixture.detectChanges();

    // then
    expect(fixture.debugElement.query(By.css('.indicator-boxes .testCssClass'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.indicator-boxes .fa-fw'))).toBeTruthy();
  });

  it('provides indicator boxes for each field whose display condition is satisfied', () => {
    // given
    component.model = singleEmptyTreeNode();

    // when
    component.config = { indicatorFields: [{
      condition: () => true, states: [{condition: () => true, cssClasses: 'testCssClass', label: () => 'testLabel'}]
    }, {
      condition: () => false, states: [{condition: () => true, cssClasses: 'notPresentCssClass', label: () => 'notShown'}]
    }, {
      condition: () => true, states: [{condition: () => true, cssClasses: 'anotherCssClass', label: () => 'anotherLabel'}]
    }, ] };
    fixture.detectChanges();

    // then
    const indicatorBox1 = fixture.debugElement.query(By.css('.indicator-boxes .testCssClass'));
    const indicatorBox2 = fixture.debugElement.query(By.css('.indicator-boxes .notPresentCssClass'));
    const indicatorBox3 = fixture.debugElement.query(By.css('.indicator-boxes .anotherCssClass'));
    expect(indicatorBox1).toBeTruthy();
    expect(indicatorBox1.nativeElement.title).toEqual('testLabel');
    expect(indicatorBox2).toBeFalsy();
    expect(indicatorBox3).toBeTruthy();
    expect(indicatorBox3.nativeElement.title).toEqual('anotherLabel');
  });
});
