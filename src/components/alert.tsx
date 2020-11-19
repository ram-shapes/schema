import * as React from 'react';

import * as styles from './alert.css';

export interface AlertProps {
  readonly className?: string;
  readonly onClose: () => void;
  readonly children?: React.ReactNode;
}

export function Alert(props: AlertProps) {
  const {className, onClose, children} = props;
  let effectiveClass = styles.alert;
  if (className) {
    effectiveClass += ` ${className}`;
  }
  return (
    <div className={effectiveClass}>
      <button className={styles.closeButton}
        onClick={onClose}>
        ❌
      </button>
      {children}
    </div>
  );
}
