export abstract class LabelProvider<T> {
  abstract getLabel(subject: T): string;
}
