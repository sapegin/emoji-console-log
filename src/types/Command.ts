import { DebugMessage } from '../debug-message';
import { ExtensionProperties } from './ExtensionProperties';

export type Command = {
  name: string;
  handler: (
    extensionProperties: ExtensionProperties,
    debugMessage: DebugMessage,
    commandArguments?: unknown[],
  ) => Promise<void>;
};
