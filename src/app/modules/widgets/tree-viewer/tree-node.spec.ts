import { TreeNode } from './tree-node';

const root = new TreeNode({
  name: 'folder',
  children: [{
    name: 'firstChild',
    children: []
  }, {
    name: 'middleChild',
    children: [{
      name: 'grandChild',
      children: [{
        name: 'greatGrandChild',
        children: []
      }]
    }]
  }, {
    name: 'lastChild',
    children: []
  }]
});

const firstChild = root.children[0];
const middleChild = root.children[1];
const lastChild = root.children[2];
const grandChild = middleChild.children[0];
const greatGrandChild = grandChild.children[0];

describe('TreeNode', () => {

  beforeEach(() => {
    root.expanded = true;
    middleChild.expanded = true;
    grandChild.expanded = true;
  });

  describe('nextVisible()', () => {

    it('returns the first child element', () => {
      // given + when
      const actualSuccessor = root.nextVisible();

      // then
      expect(actualSuccessor).toEqual(firstChild);
    });

    it('returns the next sibling element', () => {
      // given + when
      const actualSuccessor = firstChild.nextVisible();
      // then
      expect(actualSuccessor).toEqual(middleChild);
    });

    it('returns the parent`s next sibling element when collapsed', () => {
      // given
      grandChild.expanded = false;

      // when
      const actualSuccessor = grandChild.nextVisible();

      // then
      expect(actualSuccessor).toEqual(lastChild);
    });

    it('does not change selection for last element', () => {
      // given + when
      const actualSuccessor = lastChild.nextVisible();

      // then
      expect(actualSuccessor).toEqual(lastChild);
    });

    it('skips collapsed elements and returns next sibling element', () => {
      // given
      middleChild.expanded = false;

      // when
      const actualSuccessor = middleChild.nextVisible();

      // then
      expect(actualSuccessor).toEqual(lastChild);
    });
  });

  describe('previousVisible()', () => {
    it('does not change selection for root', () => {
      // given + when
      const actualPredecessor = root.previousVisible();

      // then
      expect(actualPredecessor).toEqual(root);
    });

    it('returns parent', () => {
      // given + when
      const actualPredecessor = root.previousVisible();

      // then
      expect(actualPredecessor).toEqual(root);
    });

    it('returns preceeding sibling', () => {
      // given + when
      const actualPredecessor = middleChild.previousVisible();

      // then
      expect(actualPredecessor).toEqual(firstChild);
    });

    it('returns preceeding sibling`s last descendant', () => {
      // given + when
      const actualPredecessor = lastChild.previousVisible();

      // then
      expect(actualPredecessor).toEqual(greatGrandChild);
    });

    it('skips collapsed elements and returns preceeding sibling', () => {
      // given
      middleChild.expanded = false;

      // when
      const actualPredecessor = lastChild.previousVisible();

      // then
      expect(actualPredecessor).toEqual(middleChild);
    });
  });

});
