import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { TreeViewerComponent } from './tree-viewer.component';
import { TreeNode, forEach } from './tree-node';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { DeleteAction } from './confirmation-needing-action';
import { EmbeddedDeleteButton } from './tree-viewer-embedded-button';
import { MessagingModule, MessagingService } from '@testeditor/messaging-service';
import { InputBoxComponent } from './input-box/input-box.component';
import { RenameElementComponent } from './rename-element/rename-element.component';
import { TREE_NODE_CREATE_AT_SELECTED, TREE_NODE_RENAME_SELECTED, InputBoxConfig, TreeViewerInputBoxConfig } from '../../event-types-in';

describe('TreeViewerComponent', () => {
  let component: TreeViewerComponent;
  let fixture: ComponentFixture<TreeViewerComponent>;

  const singleEmptyTreeNode: () => TreeNode = () => {
    const node = {
      name: 'tree node',
      children: [],
      root: null,
      leafCssClasses: 'fa-file',
      cssClasses: 'someCssClass otherCssClass'
    };
    node.root = node;
    return node;
  };

  const treeNodeWithSubNodes: () => TreeNode = () => {
    const root: TreeNode = {
      name: 'parent node',
      root: null,
      collapsedCssClasses: 'fa-chevron-right',
      expandedCssClasses: 'fa-chevron-down',
      leafCssClasses: 'fa-folder',
      expanded: false,
      children: [
        { name: 'child node 1', children: [], root: null },
        { name: 'child node 2', children: [], root: null },
        { name: 'child node 3', children: [], root: null }
      ]
    };
    forEach(root, node => { node.root = root; });
    return root;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MessagingModule.forRoot() ],
      declarations: [ TreeViewerComponent, InputBoxComponent, RenameElementComponent ]
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
    const action = new DeleteAction({ name: 'elementName', children: [], root: null}, () => {});

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
    const action = new DeleteAction({ name: 'elementName', children: [], root: null}, () => actionHasBeenCalled = true);
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
    const action = new DeleteAction({ name: 'elementName', children: [], root: null}, () => actionHasBeenCalled = true);
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
    const unrelatedNode: TreeNode = {
      name: 'unrelated node',
      children: [],
      root: null
    };
    unrelatedNode.root = unrelatedNode;

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
      onConfirm: () => Promise.resolve(true),
      validateName: () => ({ valid: false })
    };
    component.select(component.model);

    // when
    messageBus.publish(TREE_NODE_RENAME_SELECTED, renameRequest);
    fixture.detectChanges();

    // then
    const renameInputField = fixture.debugElement.query(By.css('.navRenameElement > input'));
    expect(renameInputField.nativeElement.value).toEqual('tree node');
  }));

  it('hides the rename element input box when the user cancels it',
    inject([MessagingService], (messageBus: MessagingService) => {
    // given
    component.model = singleEmptyTreeNode();
    const renameRequest: InputBoxConfig = {
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
});
