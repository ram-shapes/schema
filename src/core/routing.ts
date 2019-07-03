export enum AppPage {
  Home = 'home',
  Spec = 'spec',
  Playground = 'playground',
}

export function getLinkHref(page: AppPage, options: {
  base: string,
}): string {
  const {base} = options;
  const prefix = base.endsWith('/') ? base : (base + '/');
  return prefix + getPageName(page);
}

function getPageName(page: AppPage): string {
  switch (page) {
    case AppPage.Home:
      return '';
    case AppPage.Spec:
      return 'ram-shapes-spec/';
    case AppPage.Playground:
      return 'playground.html';
  }
}
