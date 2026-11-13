import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Set from the route: true on AppPath.RecordStandaloneShowPage
export const contextStoreIsStandaloneRecordPageComponentState =
  createAtomComponentState<boolean>({
    key: 'contextStoreIsStandaloneRecordPageComponentState',
    defaultValue: false,
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
