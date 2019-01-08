import { MarkerState } from './marker.state';
import { TreeNode } from '../tree-node';

export class Field {
  condition: (node: TreeNode) => boolean;
  states: MarkerState[];
}

export class IndicatorFieldSetup {
  fields: Field[];
}
