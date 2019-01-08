import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkerState } from '../markers/marker.state';
import { TreeNode, TreeNodeWithoutParentLinks } from '../tree-node';
import { IndicatorBoxComponent } from './indicator-box.component';
import { By } from '@angular/platform-browser';

describe('IndicatorBoxComponent', () => {
  let component: IndicatorBoxComponent;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  class TreeNodeWithMarker extends TreeNode {
    marker?: any;

    constructor(baseTreeNode: TreeNodeWithoutParentLinks, marker: any = null, parent: TreeNode = null,) {
        super(baseTreeNode, parent);
        this.marker = marker;
      }
  }

  const sampleMarkerStates: MarkerState[] = [{
      condition: (node: TreeNodeWithMarker) => node.marker.sampleField && node.marker.otherField === 'test',
      cssClasses: 'someClass',
      label: (node: TreeNodeWithMarker) => `sampleField = ${node.marker.sampleField}`,
    }, {
      condition: (node: TreeNodeWithMarker) => !node.marker.sampleField,
      cssClasses: 'otherClass',
      label: (node: TreeNodeWithMarker) => `otherField = ${node.marker.otherField}`,
  }];

  @Component({
    selector: `app-host-component`,
    template: `<app-indicator-box [model]="{'node': node, 'possibleStates': states}"></app-indicator-box>`
  })
  class TestHostComponent {
    @ViewChild(IndicatorBoxComponent)
    public indicatorBoxComponentUnderTest: IndicatorBoxComponent;

    node: TreeNodeWithMarker;
    states: MarkerState[];
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IndicatorBoxComponent, TestHostComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = hostComponent.indicatorBoxComponentUnderTest;
  });

  it('Can be instantiated', () => {
    expect(component).toBeTruthy();
  });

  it('sets the css classes of the active marker state and "fa-fw"', () => {
    // given
    const marker = {sampleField: true, otherField: 'test'};
    hostComponent.node = new TreeNodeWithMarker({children: [], name: 'sampleNode'}, marker);
    hostComponent.states = sampleMarkerStates;
    fixture.detectChanges();

    // when
    const actualCssClasses = hostComponent.indicatorBoxComponentUnderTest.cssClasses;

    // then
    expect(actualCssClasses).toEqual('someClass fa-fw');
  });

  it('uses the active marker state`s label and css classes', () => {
    // given
    const marker = {sampleField: true, otherField: 'test'};
    hostComponent.node = new TreeNodeWithMarker({children: [], name: 'sampleNode'}, marker);
    hostComponent.states = sampleMarkerStates;

    // when
    fixture.detectChanges();

    // then
    const indicatorBoxTag = fixture.debugElement.query(By.css('div'));
    expect(indicatorBoxTag.nativeElement.attributes['title'].value).toEqual('sampleField = true');
    expect(indicatorBoxTag.nativeElement.className).toEqual('someClass fa-fw');
  });

  it('changes label and css classes in accordance with changing marker states', () => {
    // given
    const marker = {sampleField: true, otherField: 'test'};
    hostComponent.node = new TreeNodeWithMarker({children: [], name: 'sampleNode'}, marker);
    hostComponent.states = sampleMarkerStates;
    fixture.detectChanges();
    const indicatorBoxTag = fixture.debugElement.query(By.css('div'));
    expect(indicatorBoxTag.nativeElement.attributes['title'].value).toEqual('sampleField = true');
    expect(indicatorBoxTag.nativeElement.className).toEqual('someClass fa-fw');

    // when
    marker.sampleField = false;
    fixture.detectChanges();

    // then
    expect(indicatorBoxTag.nativeElement.attributes['title'].value).toEqual('otherField = test');
    expect(indicatorBoxTag.nativeElement.className).toEqual('otherClass fa-fw');
  });

  it('handles exceptions in condition expressions gracefully and allows other state to become active', () => {
    // given
    const marker = {sampleField: true, otherField: 'test'};
    hostComponent.node = new TreeNodeWithMarker({children: [], name: 'sampleNode'}, marker);
    hostComponent.states = sampleMarkerStates.slice(0);
    hostComponent.states.unshift({
      condition: (node: TreeNodeWithMarker) => node.marker.nonExisting.property === true,
      cssClasses: 'brokenStateClass',
      label: () => { throw new Error('broken label provider'); },
    });

    // when
    fixture.detectChanges();

    // then
    const indicatorBoxTag = fixture.debugElement.query(By.css('div'));
    expect(indicatorBoxTag.nativeElement.attributes['title'].value).toEqual('sampleField = true');
    expect(indicatorBoxTag.nativeElement.className).toEqual('someClass fa-fw');
  });

  it('handles exceptions in condition expressions gracefully and resorts to defaults when no state is active', () => {
    // given
    // given
    const marker = {sampleField: true, otherField: 'no state can become active now'};
    hostComponent.node = new TreeNodeWithMarker({children: [], name: 'sampleNode'}, marker);
    hostComponent.states = sampleMarkerStates.slice(0);
    hostComponent.states.unshift({
      condition: (node: TreeNodeWithMarker) => node.marker.nonExisting.property === true,
      cssClasses: 'brokenStateClass',
      label: () => { throw new Error('broken label provider'); },
    });

    // when
    fixture.detectChanges();

    // then
    const indicatorBoxTag = fixture.debugElement.query(By.css('div'));
    expect(indicatorBoxTag.nativeElement.className).toEqual('fa-fw');
    expect(indicatorBoxTag.nativeElement.attributes['title'].value).toEqual('');
  });
});
