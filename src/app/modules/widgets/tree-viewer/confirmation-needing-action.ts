import { TreeNode } from './tree-node';

export interface ConfirmationNeedingAction {
  message: string;
  messageCssClassses: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmCssClasses: string;
  cancelCssClasses: string;
  onConfirm: TreeNodeAction;
}

export type TreeNodeAction = (node: TreeNode) => void;

export function isConfirmationNeedingAction(action: ConfirmationNeedingAction | TreeNodeAction): action is ConfirmationNeedingAction {
  return action['message'] !== undefined &&
         action['messageCssClassses'] !== undefined &&
         action['confirmButtonText'] !== undefined &&
         action['cancelButtonText'] !== undefined &&
         action['confirmCssClasses'] !== undefined &&
         action['cancelCssClasses'] !== undefined &&
         action['onConfirm'] !== undefined;
}

export class DeleteAction implements ConfirmationNeedingAction {
  message: string;  messageCssClassses: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmCssClasses: string;
  cancelCssClasses: string;
  onConfirm: TreeNodeAction;

  constructor(nodeToDelete: TreeNode, onConfirm: TreeNodeAction) {
    this.message = `Are you sure you want to delete '${nodeToDelete.name}'?`;
    this.confirmButtonText = 'Yes';
    this.cancelButtonText = 'No';

    this.messageCssClassses = 'alert alert-warning';
    this.confirmCssClasses = 'alert-link';
    this.cancelCssClasses = 'alert-link';

    this.onConfirm = onConfirm;
  }
}
