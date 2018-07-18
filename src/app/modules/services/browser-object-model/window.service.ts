export abstract class WindowService {
  abstract open(getUrl: () => Promise<URL>): void;
}
