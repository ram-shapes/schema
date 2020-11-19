import * as React from 'react';
import { useState } from 'react';

import * as styles from './tabs.css';

export interface TabsProps {
  readonly defaultActiveTab?: string;
  readonly children: React.ReactElement<TabProps> | Array<React.ReactElement<TabProps>>;
}

export function Tabs(props: TabsProps) {
  const {children} = props;
  const [activeTab, setActiveTab] = useState(props.defaultActiveTab);
  return (
    <React.Fragment>
      <nav className={styles.tabHeaders} role='tablist'>
        {React.Children.map(children, (tab, index) => {
          const isActive = activeTab ? tab.props.tabKey === activeTab : index === 0;
          let className = styles.tabHeader;
          if (isActive) {
            className += ` ${styles.activeTabHeader}`;
          }
          return (
            <a href='#' className={className} onClick={() => setActiveTab(tab.props.tabKey)}>
              {tab.props.title}
            </a>
          );
        })}
      </nav>
      <div className={styles.tabContent}>
        {React.Children.map(children, (tab, index) => {
          const isActive = activeTab ? tab.props.tabKey === activeTab : index === 0;
          return React.cloneElement(tab, {active: isActive});
        })}
      </div>
    </React.Fragment>
  );
}

export interface TabProps {
  readonly tabKey: string;
  readonly title: React.ReactNode;
  readonly className?: string;
  readonly active?: boolean;
  readonly children?: React.ReactNode;
}

export function Tab(props: TabProps) {
  const {active, className, children} = props;
  let effectiveClass = styles.tab;
  if (active) {
    effectiveClass += ` ${styles.activeTab}`;
  }
  if (className) {
    effectiveClass += ` ${className}`;
  }
  return (
    <div className={effectiveClass}>
      {children}
    </div>
  );
}
