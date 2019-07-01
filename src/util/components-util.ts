export function classNames(...classes: ReadonlyArray<string | false | null | undefined>) {
  return classes.filter(name => name).join(' ');
}
