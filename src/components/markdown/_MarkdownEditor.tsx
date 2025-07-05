'use client';

import { Fragment, Ref } from 'react';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  InsertTable,
  InsertThematicBreak,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from '@mdxeditor/editor';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { cn } from '@/lib/utils';

export default function InternalMarkdownEditor({
  ref,
  className,
  ...props
}: MDXEditorProps & {
  ref?: Ref<MDXEditorMethods>;
}) {
  const isDarkMode = useIsDarkMode();

  return (
    <MDXEditor
      {...props}
      ref={ref}
      className={cn(isDarkMode && 'dark-theme', className)}
      suppressHtmlProcessing
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <Fragment>
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <InsertThematicBreak />
              <InsertTable />
            </Fragment>
          )
        })
      ]}
    />
  );
}
