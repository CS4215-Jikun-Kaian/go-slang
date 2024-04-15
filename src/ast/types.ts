import { FunctionTypeInfo, TypeInfo } from '../typing/types';

export interface BaseNode {
  type: string;
}

export interface SourceFile extends BaseNode {
  type: 'SourceFile';
  functions: FunctionDecl[];
  declarations: Declaration[];
}

export interface FunctionDecl extends BaseNode {
  type: 'FunctionDecl';
  identifier: string;
  typeInfo: FunctionTypeInfo;
  body: Block;
}

export interface Declaration extends BaseNode {
  type: 'Declaration';
  identifier: string;
  typeInfo: TypeInfo;
  initializer: Expression | null;
}

export interface Block extends BaseNode {
  type: 'Block';
  stmts: Statement[];
}

export type Expression = PrimaryExpr | UnaryExpr | BinaryExpr;

export type PrimaryExpr = Operand | PrimaryExprOp;

export type Operand = Literal | string | ParanthesizedExpr;

export type Literal = 'nil' | number | string;

export interface ParanthesizedExpr extends BaseNode {
  type: 'ParanthesizedExpr';
  expr: Expression;
}

export interface PrimaryExprOp extends BaseNode {
  type: 'PrimaryExprOp';
  expr: PrimaryExpr;
  op: Index | Arguments;
}

export interface Index extends BaseNode {
  type: 'Index';
  expr: Expression;
}

export interface Arguments extends BaseNode {
  type: 'Arguments';
  exprs: (Expression | TypeInfo)[];
}

export interface UnaryExpr extends BaseNode {
  type: 'UnaryExpr';
  op: UnaryOp;
  expr: Expression;
}

export type UnaryOp = '+' | '-' | '!' | '^' | '*' | '&' | '<-';

export interface BinaryExpr extends BaseNode {
  type: 'BinaryExpr';
  op: BinaryOp;
  left: Expression;
  right: Expression;
}

export type BinaryOp = '||' | '&&' | RelOp | AddOp | MulOp;

export type MulOp = '*' | '/' | '%' | '<<' | '>>' | '&' | '&^';

export type AddOp = '+' | '-' | '|' | '^';

export type RelOp = '==' | '!=' | '<' | '<=' | '>' | '>=';

export type Statement =
  | Declaration[]
  | SimpleStmt
  | GoStmt
  | ReturnStmt
  | BreakStmt
  | ContinueStmt
  | Block
  | IfStmt
  | SelectStmt
  | ForStmt;

export type SimpleStmt = SendStmt | Assignment[] | ExpressionStmt;

export interface GoStmt extends BaseNode {
  type: 'GoStmt';
  expr: Expression;
}

export interface ReturnStmt extends BaseNode {
  type: 'ReturnStmt';
  exprs: Expression[];
}

export interface BreakStmt extends BaseNode {
  type: 'BreakStmt';
}

export interface ContinueStmt extends BaseNode {
  type: 'ContinueStmt';
}

export interface IfStmt extends BaseNode {
  type: 'IfStmt';
  precedingStmt: SimpleStmt | null;
  condition: Expression;
  consequent: Block;
  alternative: IfStmt | Block | null;
}

export interface SelectStmt extends BaseNode {
  type: 'SelectStmt';
  clauses: SelectClause[];
}

export interface SelectClause extends BaseNode {
  type: 'SelectClause';
  case: SendStmt | RecvStmt | 'default';
  stmts: Statement[];
}

export interface ForStmt extends BaseNode {
  type: 'ForStmt';
  clause: ForClause;
  block: Block;
}

export interface ForClause extends BaseNode {
  type: 'ForClause';
  init: SimpleStmt | null;
  condition: Expression | null;
  post: SimpleStmt | null;
}

export interface SendStmt extends BaseNode {
  type: 'SendStmt';
  channel: Expression;
  expr: Expression;
}

export interface RecvStmt extends BaseNode {
  type: 'RecvStmt';
  assignExpr: Expression | null;
  recvExpr: Expression;
}

export interface Assignment extends BaseNode {
  type: 'Assignment';
  left: Expression;
  right: Expression;
}

export interface ExpressionStmt extends BaseNode {
  type: 'ExpressionStmt';
  expr: Expression;
}
