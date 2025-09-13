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

export type LogMessageInfo =
  | {
      type: Extract<
        LogMessageType,
        | 'ArrayAssignment'
        | 'Decorator'
        | 'MultiLineAnonymousFunction'
        | 'NamedFunctionAssignment'
        | 'None'
        | 'ObjectFunctionCallAssignment'
        | 'ObjectLiteral'
        | 'PrimitiveAssignment'
        | 'Ternary'
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
