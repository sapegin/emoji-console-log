export enum LogMessageType {
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

export type LogMessage =
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
    }
  | {
      type: Extract<LogMessageType, 'MultilineBraces' | 'MultilineParenthesis'>;
      metadata: LogContextMetadata;
    }
  | {
      type: Extract<LogMessageType, 'NamedFunction'>;
      metadata: NamedFunctionMetadata;
    };
