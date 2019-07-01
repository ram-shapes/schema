import React from 'react';
import * as Monaco from 'monaco-editor';

import { classNames } from '../util/components-util';

import * as styles from './code-editor.css';

export interface CodeEditorProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly language: 'turtle' | 'json';
}

export class CodeEditor extends React.Component<CodeEditorProps, {}> {
  private container: HTMLElement | null = null;
  private editor: Monaco.editor.IStandaloneCodeEditor | undefined;

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
      const {language} = this.props;
      this.editor = Monaco.editor.create(container, {
        value: [
          'from banana import *',
          '',
          'class Monkey:',
          '	# Bananas the monkey can eat.',
          '	capacity = 10',
          '	def eat(self, N):',
          '		\'\'\'Make the monkey eat N bananas!\'\'\'',
          '		capacity = capacity - N*banana.size',
          '',
          '	def feeding_frenzy(self):',
          '		eat(9.25)',
          '		return "Yum yum"',
        ].join('\n'),
        language: language === 'json' ? language : undefined,
        automaticLayout: true,
      });
    } else if (this.editor) {
      this.editor.dispose();
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
