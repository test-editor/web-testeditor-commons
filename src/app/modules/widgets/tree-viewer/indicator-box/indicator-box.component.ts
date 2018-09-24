import { Component, Input } from '@angular/core';
import { MarkerState } from '../markers/marker.state';
import { TreeNode } from '../tree-node';

@Component({
  selector: 'app-indicator-box',
  templateUrl: './indicator-box.component.html',
  styleUrls: ['./indicator-box.component.css']
})
export class IndicatorBoxComponent {
  @Input() model: { node: TreeNode, possibleStates: MarkerState[] };

  get cssClasses(): string {
    if (this.isInitialized()) {
      const activeState = this.getActiveState();
      if (activeState != null) {
        return activeState.cssClasses + ' fa-fw';
      }
    }
    return 'fa-fw';
  }

  get label(): string {
    if (this.isInitialized()) {
      const activeState = this.getActiveState();
      if (activeState) {
        return activeState.label(this.getMarker());
      }
    }
    return '';
  }

  private getMarker(): any {
    return this.model.node.marker;
  }

  private isInitialized(): boolean {
    return this.model != null && this.model.node != null && this.model.possibleStates != null;
  }

  private getActiveState(): MarkerState {
    return this.model.possibleStates.find((state) => {
      try {
        return state.condition(this.getMarker());
      } catch (error) {
        console.log(error);
        return false;
      }
    });
  }
}
