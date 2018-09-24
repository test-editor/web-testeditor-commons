import { MarkerState } from './marker.state';

describe('MarkerState', () => {

  let sampleMarkerState: MarkerState;
  const sampleAttributeValue = 42;

  beforeEach(() => {
    sampleMarkerState = {
      condition: (marker) => marker.someAttribute === sampleAttributeValue,
      cssClasses: 'someCssClass',
      label: (marker) => 'The label',
    };
  });

  it('conditions can be invoked', () => {
    // given
    const marker = { someAttribute: sampleAttributeValue };

    // when
    const actualResult = sampleMarkerState.condition(marker);

    // then
    expect(actualResult).toBeTruthy();
  });

  it('returns the correct label', () => {
    // given
    const markerState: MarkerState = {
      condition: () => true,
      cssClasses: '',
      label: (marker) => `label for ${marker.name}`,
    };
    const sampleMarker = { name: 'the marker' };

    // when
    const actualLabel = markerState.label(sampleMarker);

    // then
    expect(actualLabel).toEqual('label for the marker');
  });
});
