// src/components/NaturalLanguageEditor/types.d.ts
declare global {
  interface Window {
    currentEditorId?: string;
    blockEditorUpdates: boolean;
    editorPersistenceDebugger: any;
    registerComponentInStorage: (id: string, type: string, props: any) => void;
    registerEditorComponentPersistence?: (
      editorId: string,
      componentId: string,
      type: string,
      props: any
    ) => boolean;
    editorInstance: any;
    __ZUSTAND_STORE__?: any;
  }
}

export {};
