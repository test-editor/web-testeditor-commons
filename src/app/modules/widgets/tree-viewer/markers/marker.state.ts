/**
 * Represents the state a marker field can assume based on a marker.
 *
 * The marker objects provided as parameters to the condition and
 * the label functions are of arbitrary type: they will contain
 * attributes corresponding to whatever properties have been added
 * to the workspace element for which a field should be displayed.
 */
export class MarkerState {
  condition: (marker: any) => boolean;
  cssClasses: string;
  label: (marker: any) => string;
}
