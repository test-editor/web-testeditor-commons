import { Field } from './field';


describe('Field', () => {
  it('can be initialized', () => {
    const testField: Field = {
      condition: (element) => element != null,
      states: [{
        condition: (node) => node.marker.someAttribute,
        cssClasses: 'someClass',
        label: () => 'some',
      }, {
        condition: (node) => !node.marker.someAttribute,
        cssClasses: 'otherClass',
        label: () => 'other',
      }]
    };
    expect(testField).toBeTruthy();
  });
});
