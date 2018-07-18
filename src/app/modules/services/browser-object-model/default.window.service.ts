import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

/**
 * Wraps around the window object to avoid using a global,
 * platform-specific object throughout the code.
 */
@Injectable()
export class DefaultWindowService implements WindowService {
  private readonly windowRef = window;

  open(getUrl: () => Promise<URL>): void {
    const newWindow = this.windowRef.open('');
    getUrl().then((url) => newWindow.document.write(`<html><body><img src="${url.toString()}"/></body></html>`));
  }

}
