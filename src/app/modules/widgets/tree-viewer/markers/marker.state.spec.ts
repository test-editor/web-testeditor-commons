import { MarkerState } from './marker.state';
import { TreeNode } from '../tree-node';

describe('MarkerState', () => {

  let sampleMarkerState: MarkerState;
  const sampleAttributeValue = 42;

  beforeEach(() => {
    sampleMarkerState = {
      condition: (node) => node.marker.someAttribute === sampleAttributeValue,
      cssClasses: 'someCssClass',
      label: () => 'The label',
    };
  });

  it('conditions can be invoked', () => {
    // given
    const node: TreeNode = { name: '', children: [], root: null, marker: { someAttribute: sampleAttributeValue } };

    // when
    const actualResult = sampleMarkerState.condition(node);

    // then
    expect(actualResult).toBeTruthy();
  });

  it('returns the correct label', () => {
    // given
    const markerState: MarkerState = {
      condition: () => true,
      cssClasses: '',
      label: (node_) => `label for ${node_.name}`,
    };
    const node: TreeNode = { name: 'the node', children: [], root: null, marker: { someAttribute: sampleAttributeValue } };

    // when
    const actualLabel = markerState.label(node);

    // then
    expect(actualLabel).toEqual('label for the node');
  });
});
