import { MarkerState } from './marker.state';
import { TreeNode } from '../tree-node';

describe('MarkerState', () => {

  let sampleMarkerState: MarkerState;
  const sampleName = 'sampleName';

  beforeEach(() => {
    sampleMarkerState = {
      condition: (node) => node.name === sampleName,
      cssClasses: 'someCssClass',
      label: () => 'The label',
    };
  });

  it('conditions can be invoked', () => {
    // given
    const node = TreeNode.create({ name: sampleName, children: []});

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
    const node = TreeNode.create({ name: sampleName, children: []});

    // when
    const actualLabel = markerState.label(node);

    // then
    expect(actualLabel).toEqual('label for sampleName');
  });
});
