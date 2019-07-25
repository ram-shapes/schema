import React, { useCallback, useRef, useEffect, useImperativeHandle } from 'react';
import * as ReactDOM from 'react-dom';

import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-light-theme.css';

import * as styles from './panel-system.css';

(window as any).React = React;
(window as any).ReactDOM = {
  render: (component: any, container: HTMLElement) => {
    ReactDOM.createPortal(component, container);
  },
  unmountComponentAtNode: (container: HTMLElement) => {
    // pass
  }
};

abstract class Wrapper {
  static readonly component = 'wrapper';

  constructor(
    private container: any,
    private state: any
  ) {
    container.on('open', this.onOpen, this);
    container.on('destroy', this.onDestroy, this);
  }

  protected getKey(): string {
    return this.container.getState().key;
  }

  abstract getElement(): HTMLElement;

  private onOpen() {
    const root = this.container.getElement()[0] as HTMLElement;
    const portalRoot = this.getElement();
    if (portalRoot.parentNode) {
      portalRoot.parentNode.removeChild(portalRoot);
    }
    root.appendChild(portalRoot);
  }

  private onDestroy() {
    // const root = this.container.getElement()[0] as HTMLElement;
    // root.removeChild(this.getElement());
  }
}

export interface PanelSystemProps extends React.HTMLProps<HTMLDivElement> {
  layout: PanelItem;
  settings?: GoldenLayout.Settings;
}

export type PanelItem = StackItem | ComponentItem;
export interface StackItem {
  type: 'row' | 'column' | 'stack';
  content: ReadonlyArray<PanelItem>;
}
export interface ComponentItem {
  key: string;
  type: 'component';
  element: React.ReactElement<any>;
  title: string;
  closable?: boolean;
  hidden?: boolean;
}

export class PanelSystem extends React.Component<PanelSystemProps, {}> {
  private mountedLayout: GoldenLayout | undefined;
  private mountedLayoutConfig: PanelItem | undefined;
  private cachedContainers: Map<string, HTMLElement> | undefined;

  render() {
    const {layout, settings, ...divProps} = this.props;

    const portalContainers = new Map<string, HTMLElement>();
    const portals: JSX.Element[] = [];

    for (const component of getComponents(layout)) {
      const element = React.cloneElement(component.element, {key: component.key});
      let container = this.cachedContainers ? this.cachedContainers.get(component.key) : undefined;
      if (!container) {
        container = document.createElement('div');
        container.setAttribute('class', styles.panel);
      }
      portalContainers.set(component.key, container);
      portals.push(ReactDOM.createPortal(element, container));
    }

    this.cachedContainers = portalContainers;

    return <div {...divProps} ref={this.onMount}>{portals}</div>;
  }

  private onMount = (container: HTMLDivElement | null) => {
    if (container) {
      const {cachedContainers} = this;
      const wrapperImpl = class extends Wrapper {
        getElement() {
          const element = cachedContainers!.get(this.getKey());
          if (!element) {
            throw new Error('Failed to find layout component with key: ' + this.getKey());
          }
          return element;
        }
      };
      const {settings, layout} = this.props;
      const config: GoldenLayout.Config = {
        settings,
        content: [mapLayoutConfig(layout)],
      };
      const goldenLayout = new GoldenLayout(config, container);
      goldenLayout.registerComponent(Wrapper.component, wrapperImpl);
      goldenLayout.init();
      this.mountedLayout = goldenLayout;
      this.mountedLayoutConfig = layout;
    } else if (this.mountedLayout) {
      this.mountedLayout.destroy();
      this.mountedLayout = undefined;
    }
  }

  componentDidUpdate(prevProps: PanelSystemProps) {
    if (this.props.layout !== this.mountedLayoutConfig) {
      updateLayout(this.mountedLayout!, this.props.layout);
      this.mountedLayoutConfig = this.props.layout;
    }
  }
}

export interface PanelSystemModel {
  focusTab(componentKey: string): void;
}

function mapLayoutConfig(layout: PanelItem): GoldenLayout.ItemConfigType {
  function mapItem(item: PanelItem): GoldenLayout.ItemConfigType {
    if (item.type === 'component') {
      return {
        id: item.key,
        type: 'component',
        componentName: 'wrapper',
        componentState: {key: item.key},
        title: item.title,
        isClosable: item.closable,
      };
    } else {
      return {
        type: item.type,
        content: item.content.reduce(reduceItems, []),
      };
    }
  }

  function reduceItems(acc: GoldenLayout.ItemConfigType[], item: PanelItem) {
    if (!(item.type === 'component' && item.hidden)) {
      acc.push(mapItem(item));
    }
    return acc;
  }

  return mapItem(layout);
}

function getComponents(layout: PanelItem): ComponentItem[] {
  const components: ComponentItem[] = [];
  function collectComponents(item: PanelItem) {
    if (item.type === 'component') {
      components.push(item);
    } else {
      for (const child of item.content) {
        collectComponents(child);
      }
    }
  }
  collectComponents(layout);
  return components;
}

function updateLayout(goldenLayout: GoldenLayout, layout: PanelItem) {
  const oldElements = [...goldenLayout.root.contentItems];
  for (const oldItem of oldElements) {
    goldenLayout.root.removeChild(oldItem as any);
  }
  goldenLayout.root.addChild(mapLayoutConfig(layout));
}

function updateLayoutAt(targetRoot: GoldenLayout.ContentItem, newChildren: ReadonlyArray<PanelItem>) {
  const oldElements = [...targetRoot.contentItems];
  if (oldElements.length === newChildren.length) {
    for (let i = 0; i < oldElements.length; i++) {
      const oldItem = oldElements[i];
      const newItem = newChildren[i];
      const redraw = oldItem.type !== newItem.type ||
        newItem.type === 'component' && oldItem.config.id !== newItem.key;
      if (redraw) {
        targetRoot.removeChild(oldItem as any);
        targetRoot.addChild(mapLayoutConfig(newItem), i);
      } else if (newItem.type !== 'component') {
        updateLayoutAt(oldItem, newItem.content);
      }
    }
  } else {
    for (const oldItem of oldElements) {
      targetRoot.removeChild(oldItem as any);
    }
    for (const newChild of newChildren) {
      targetRoot.addChild(mapLayoutConfig(newChild));
    }
  }
}
