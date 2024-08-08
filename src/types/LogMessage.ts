export enum LogMessageType {
  None = 'None',
  ArrayAssignment = 'ArrayAssignment',
  Decorator = 'Decorator',
  MultiLineAnonymousFunction = 'MultiLineAnonymousFunction',
  MultilineBraces = 'MultilineBraces',
  MultilineParenthesis = 'MultilineParenthesis',
  NamedFunction = 'NamedFunction',
  NamedFunctionAssignment = 'NamedFunctionAssignment',
  ObjectFunctionCallAssignment = 'ObjectFunctionCallAssignment',
  ObjectLiteral = 'ObjectLiteral',
  PrimitiveAssignment = 'PrimitiveAssignment',
  Ternary = 'Ternary',
}

export type LogContextMetadata = {
  openingContextLine: number;
  closingContextLine: number;
};

export type NamedFunctionMetadata = {
  line: number;
};

export type LogMessage = {
  logMessageType: LogMessageType;
  metadata?: LogContextMetadata | NamedFunctionMetadata | unknown;
};

export type LogMessageCheck =
  | {
      type: Extract<
        LogMessageType,
        | 'None'
        | 'ObjectLiteral'
        | 'Decorator'
        | 'ArrayAssignment'
        | 'Ternary'
        | 'ObjectFunctionCallAssignment'
        | 'NamedFunctionAssignment'
        | 'MultiLineAnonymousFunction'
        | 'PrimitiveAssignment'
      >;
      isChecked: boolean;
    }
  | {
      type: Extract<LogMessageType, 'MultilineBraces' | 'MultilineParenthesis'>;
      isChecked: boolean;
      metadata: LogContextMetadata;
    }
  | {
      type: Extract<LogMessageType, 'NamedFunction'>;
      isChecked: boolean;
      metadata: NamedFunctionMetadata;
    };
