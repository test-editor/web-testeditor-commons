import { Field } from './field';


describe('Field', () => {
  it('can be initialized', () => {
    const testField: Field = {
      condition: (element) => element != null,
      states: [{
        condition: (node) => node.root === null,
        cssClasses: 'rootCssClass',
        label: () => 'I am root!',
      }, {
        condition: (node) => node.root !== null,
        cssClasses: 'treeCssClass',
        label: () => 'I am not root.',
      }]
    };
    expect(testField).toBeTruthy();
  });
});
