import { DebugMessage } from '../../debug-message';
import { ExtensionProperties } from './extensionProperties';

export type Command = {
  name: string;
  handler: (
    extensionProperties: ExtensionProperties,
    debugMessage: DebugMessage,
    commandArguments?: unknown[],
  ) => Promise<void>;
};
