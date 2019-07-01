import React from 'react';
import * as Monaco from 'monaco-editor';

import { classNames } from '../util/components-util';

import * as styles from './code-editor.css';

export interface CodeEditorProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly defaultValue: string;
  readonly language: 'turtle' | 'json' | 'sparql';
  readonly readOnly?: boolean;
}

export class CodeEditor extends React.Component<CodeEditorProps, {}> {
  private container: HTMLElement | null = null;
  private editor: Monaco.editor.IStandaloneCodeEditor | undefined;

  getEditor() {
    if (!this.editor) {
      throw new Error('Editor is unmounted');
    }
    return this.editor;
  }

  render() {
    const {className, style} = this.props;
    return (
      <div ref={this.onMount}
        className={classNames(styles.component, className)}
        style={style}>
      </div>
    );
  }

  private onMount = (container: HTMLElement | null) => {
    this.container = container;
    if (container) {
      const {defaultValue, language, readOnly} = this.props;
      this.editor = Monaco.editor.create(container, {
        value: defaultValue,
        language: language === 'json' ? language : undefined,
        automaticLayout: true,
        wordWrap: language === 'turtle' ? 'wordWrapColumn' : undefined,
        readOnly,
      });
    } else if (this.editor) {
      this.editor.dispose();
    }
  }

  componentDidUpdate(prevProps: CodeEditorProps) {
    if (this.props.defaultValue !== prevProps.defaultValue) {
      const model = this.editor ? this.editor.getModel() : undefined;
      if (model) {
        model.setValue(this.props.defaultValue);
      }
    }
  }
}

(window as any).MonacoEnvironment = {
  getWorkerUrl(moduleId: string, label: string) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
};
