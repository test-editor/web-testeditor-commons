export interface ConfirmationNeedingAction {
  message: string;
  messageCssClassses: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmCssClasses: string;
  cancelCssClasses: string;
  onConfirm: () => void;
}

export class DeleteAction implements ConfirmationNeedingAction {
  message: string;  messageCssClassses: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmCssClasses: string;
  cancelCssClasses: string;
  onConfirm: () => void;

  constructor(elementToDelete: string, onConfirm: () => void) {
    this.message = `Are you sure you want to delete '${elementToDelete}'?`;
    this.confirmButtonText = 'Yes';
    this.cancelButtonText = 'No';

    this.messageCssClassses = 'alert alert-warning';
    this.confirmCssClasses = 'alert-link';
    this.cancelCssClasses = 'alert-link';

    this.onConfirm = onConfirm;
  }
}
