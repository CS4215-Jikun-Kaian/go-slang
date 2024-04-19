import { ErrorNode } from 'antlr4ts/tree/ErrorNode';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { RuleNode } from 'antlr4ts/tree/RuleNode';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import {
  SourceFileContext,
  PackageClauseContext,
  ImportDeclContext,
  ImportSpecContext,
  ImportPathContext,
  DeclarationContext,
  ConstDeclContext,
  ConstSpecContext,
  IdentifierListContext,
  ExpressionListContext,
  TypeDeclContext,
  TypeSpecContext,
  AliasDeclContext,
  TypeDefContext,
  TypeParametersContext,
  TypeParameterDeclContext,
  TypeElementContext,
  TypeTermContext,
  FunctionDeclContext,
  MethodDeclContext,
  ReceiverContext,
  VarDeclContext,
  VarSpecContext,
  BlockContext,
  StatementListContext,
  StatementContext,
  SimpleStmtContext,
  ExpressionStmtContext,
  SendStmtContext,
  IncDecStmtContext,
  AssignmentContext,
  Assign_opContext,
  ShortVarDeclContext,
  LabeledStmtContext,
  ReturnStmtContext,
  BreakStmtContext,
  ContinueStmtContext,
  GotoStmtContext,
  FallthroughStmtContext,
  DeferStmtContext,
  IfStmtContext,
  SwitchStmtContext,
  ExprSwitchStmtContext,
  ExprCaseClauseContext,
  ExprSwitchCaseContext,
  TypeSwitchStmtContext,
  TypeSwitchGuardContext,
  TypeCaseClauseContext,
  TypeSwitchCaseContext,
  TypeListContext,
  SelectStmtContext,
  CommClauseContext,
  CommCaseContext,
  RecvStmtContext,
  ForStmtContext,
  ForClauseContext,
  RangeClauseContext,
  GoStmtContext,
  Type_Context,
  TypeArgsContext,
  TypeNameContext,
  TypeLitContext,
  ArrayTypeContext,
  ArrayLengthContext,
  ElementTypeContext,
  PointerTypeContext,
  InterfaceTypeContext,
  SliceTypeContext,
  MapTypeContext,
  ChannelTypeContext,
  MethodSpecContext,
  FunctionTypeContext,
  SignatureContext,
  ResultContext,
  ParametersContext,
  ParameterDeclContext,
  ExpressionContext,
  PrimaryExprContext,
  ConversionContext,
  OperandContext,
  LiteralContext,
  BasicLitContext,
  IntegerContext,
  OperandNameContext,
  QualifiedIdentContext,
  CompositeLitContext,
  LiteralTypeContext,
  LiteralValueContext,
  ElementListContext,
  KeyedElementContext,
  KeyContext,
  ElementContext,
  StructTypeContext,
  FieldDeclContext,
  String_Context,
  EmbeddedFieldContext,
  FunctionLitContext,
  IndexContext,
  Slice_Context,
  TypeAssertionContext,
  ArgumentsContext,
  MethodExprContext,
  EosContext,
} from '../lang/GoParser';
import { GoParserVisitor } from '../lang/GoParserVisitor';
import {
  AddOp,
  Arguments,
  Assignment,
  BinaryOp,
  Block,
  BreakStmt,
  ContinueStmt,
  Declaration,
  Expression,
  ExpressionStmt,
  ForClause,
  ForStmt,
  FunctionDecl,
  GoStmt,
  IfStmt,
  Index,
  Literal,
  MulOp,
  Operand,
  PrimaryExpr,
  RecvStmt,
  RelOp,
  ReturnStmt,
  SelectClause,
  SelectStmt,
  SendStmt,
  SimpleStmt,
  SourceFile,
  Statement,
  UnaryOp,
} from './types';
import {
  TypeInfo,
  getTypeInfoFromIdentifier,
  ArrayTypeInfo,
  PointerTypeInfo,
  ChannelTypeInfo,
  FunctionTypeInfo,
  arrayTypeInfo,
  pointerTypeInfo,
  channelTypeInfo,
  functionTypeInfo,
  TypeWithIdentifier,
} from '../typing/types';

export class ASTBuilder implements GoParserVisitor<any> {
  visitSourceFile(ctx: SourceFileContext): SourceFile {
    return {
      type: 'SourceFile',
      functions: ctx.functionDecl().map(this.visitFunctionDecl, this),
      declarations: ctx.declaration().map(this.visitDeclaration, this).flat(),
    };
  }

  visitPackageClause(ctx: PackageClauseContext) {
    throw new Error('Method not implemented.');
  }

  visitImportDecl(ctx: ImportDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitImportSpec(ctx: ImportSpecContext) {
    throw new Error('Method not implemented.');
  }

  visitImportPath(ctx: ImportPathContext) {
    throw new Error('Method not implemented.');
  }

  visitDeclaration(ctx: DeclarationContext): Declaration[] {
    const constDecl = ctx.constDecl();
    if (constDecl) {
      return this.visitConstDecl(constDecl);
    }

    const varDecl = ctx.varDecl();
    if (varDecl) {
      return this.visitVarDecl(varDecl);
    }

    throw new Error('Method not implemented.');
  }

  visitConstDecl(ctx: ConstDeclContext): Declaration[] {
    return ctx.constSpec().map(this.visitConstSpec, this).flat();
  }

  visitConstSpec(ctx: ConstSpecContext): Declaration[] {
    const identifierList = this.visitIdentifierList(ctx.identifierList());

    const typeContext = ctx.type_();
    if (!typeContext) throw new Error('missing type for const declaration');
    const typeInfo = this.visitType_(typeContext);

    const expressionListContext = ctx.expressionList();
    if (!expressionListContext) throw new Error('missing expression list for const declaration');

    const expressionList = this.visitExpressionList(expressionListContext);
    if (expressionList.length !== identifierList.length)
      throw new Error("length of identifier list doesn't equal length of expression list");

    return identifierList.map((identifier, i) => ({
      type: 'Declaration',
      identifier,
      typeInfo,
      initializer: expressionList[i],
    }));
  }

  visitIdentifierList(ctx: IdentifierListContext): string[] {
    return ctx.IDENTIFIER().map((i) => i.toString());
  }

  visitExpressionList(ctx: ExpressionListContext): Expression[] {
    return ctx.expression().map(this.visitExpression, this);
  }

  visitTypeDecl(ctx: TypeDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeSpec(ctx: TypeSpecContext) {
    throw new Error('Method not implemented.');
  }

  visitAliasDecl(ctx: AliasDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeDef(ctx: TypeDefContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeParameters(ctx: TypeParametersContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeParameterDecl(ctx: TypeParameterDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeElement(ctx: TypeElementContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeTerm(ctx: TypeTermContext) {
    throw new Error('Method not implemented.');
  }

  visitFunctionDecl(ctx: FunctionDeclContext): FunctionDecl {
    const blockContext = ctx.block();
    if (!blockContext) throw new Error('missing function body');

    return {
      type: 'FunctionDecl',
      identifier: ctx.IDENTIFIER().toString(),
      typeInfo: this.visitSignature(ctx.signature()),
      body: this.visitBlock(blockContext),
    };
  }

  visitMethodDecl(ctx: MethodDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitReceiver(ctx: ReceiverContext) {
    throw new Error('Method not implemented.');
  }

  visitVarDecl(ctx: VarDeclContext): Declaration[] {
    return ctx.varSpec().map(this.visitVarSpec, this).flat();
  }

  visitVarSpec(ctx: VarSpecContext): Declaration[] {
    const identifierList = this.visitIdentifierList(ctx.identifierList());

    const typeContext = ctx.type_();
    if (!typeContext) throw new Error('missing type for var declaration');
    const typeInfo = this.visitType_(typeContext);

    const expressionListContext = ctx.expressionList();
    const expressionList = expressionListContext ? this.visitExpressionList(expressionListContext) : null;
    if (expressionList && expressionList.length !== identifierList.length)
      throw new Error("length of identifier list doesn't equal length of expression list");

    return identifierList.map((identifier, i) => ({
      type: 'Declaration',
      identifier,
      typeInfo,
      initializer: expressionList && expressionList[i],
    }));
  }

  visitBlock(ctx: BlockContext): Block {
    const stmtListContext = ctx.statementList();
    return {
      type: 'Block',
      stmts: stmtListContext ? this.visitStatementList(stmtListContext) : [],
    };
  }

  visitStatementList(ctx: StatementListContext): Statement[] {
    return ctx.statement().map(this.visitStatement, this);
  }

  visitStatement(ctx: StatementContext): Statement {
    const declaration = ctx.declaration();
    if (declaration) {
      return this.visitDeclaration(declaration);
    }

    const simpleStmt = ctx.simpleStmt();
    if (simpleStmt) {
      return this.visitSimpleStmt(simpleStmt);
    }

    const goStmt = ctx.goStmt();
    if (goStmt) {
      return this.visitGoStmt(goStmt);
    }

    const returnStmt = ctx.returnStmt();
    if (returnStmt) {
      return this.visitReturnStmt(returnStmt);
    }

    const breakStmt = ctx.breakStmt();
    if (breakStmt) {
      return this.visitBreakStmt(breakStmt);
    }

    const continueStmt = ctx.continueStmt();
    if (continueStmt) {
      return this.visitContinueStmt(continueStmt);
    }

    const block = ctx.block();
    if (block) {
      return this.visitBlock(block);
    }

    const ifStmt = ctx.ifStmt();
    if (ifStmt) {
      return this.visitIfStmt(ifStmt);
    }

    const selectStmt = ctx.selectStmt();
    if (selectStmt) {
      return this.visitSelectStmt(selectStmt);
    }

    const forStmt = ctx.forStmt();
    if (forStmt) {
      return this.visitForStmt(forStmt);
    }

    throw new Error('Method not implemented.');
  }

  visitSimpleStmt(ctx: SimpleStmtContext): SimpleStmt {
    const sendStmt = ctx.sendStmt();
    if (sendStmt) {
      return this.visitSendStmt(sendStmt);
    }

    const assignment = ctx.assignment();
    if (assignment) {
      return this.visitAssignment(assignment);
    }

    const expressionStmt = ctx.expressionStmt();
    if (expressionStmt) {
      return this.visitExpressionStmt(expressionStmt);
    }

    throw new Error('Method not implemented.');
  }

  visitExpressionStmt(ctx: ExpressionStmtContext): ExpressionStmt {
    return {
      type: 'ExpressionStmt',
      expr: this.visitExpression(ctx.expression()),
    };
  }

  visitSendStmt(ctx: SendStmtContext): SendStmt {
    return {
      type: 'SendStmt',
      channel: this.visitExpression(ctx.expression(0)),
      expr: this.visitExpression(ctx.expression(1)),
    };
  }

  visitIncDecStmt(ctx: IncDecStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitAssignment(ctx: AssignmentContext): Assignment[] {
    const leftList = this.visitExpressionList(ctx.expressionList(0));
    const rightList = this.visitExpressionList(ctx.expressionList(1));
    if (leftList.length !== rightList.length) throw new Error('mismatch in length of expression lists');
    return leftList.map((left, i) => ({ type: 'Assignment', left, right: rightList[i] }));
  }

  visitAssign_op(ctx: Assign_opContext) {
    throw new Error('Method not implemented.');
  }

  visitShortVarDecl(ctx: ShortVarDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitLabeledStmt(ctx: LabeledStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitReturnStmt(ctx: ReturnStmtContext): ReturnStmt {
    const c = ctx.expressionList();
    return { type: 'ReturnStmt', exprs: c ? this.visitExpressionList(c) : [] };
  }

  visitBreakStmt(ctx: BreakStmtContext): BreakStmt {
    return { type: 'BreakStmt' };
  }

  visitContinueStmt(ctx: ContinueStmtContext): ContinueStmt {
    return { type: 'ContinueStmt' };
  }

  visitGotoStmt(ctx: GotoStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitFallthroughStmt(ctx: FallthroughStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitDeferStmt(ctx: DeferStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitIfStmt(ctx: IfStmtContext): IfStmt {
    const expressionCtx = ctx.expression();
    if (!expressionCtx) throw new Error('missing boolean expression for if statement');
    const simpleStmtCtx = ctx.simpleStmt();
    const blockCtxs = ctx.block();
    const ifStmtCtx = ctx.ifStmt();

    const precedingStmt = simpleStmtCtx ? this.visitSimpleStmt(simpleStmtCtx) : null;
    const condition = this.visitExpression(expressionCtx);
    const consequent = this.visitBlock(blockCtxs[0]);
    let alternative = null;
    if (blockCtxs.length > 1) alternative = this.visitBlock(blockCtxs[1]);
    else if (ifStmtCtx) alternative = this.visitIfStmt(ifStmtCtx);

    return { type: 'IfStmt', precedingStmt, condition, consequent, alternative };
  }

  visitSwitchStmt(ctx: SwitchStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitExprSwitchStmt(ctx: ExprSwitchStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitExprCaseClause(ctx: ExprCaseClauseContext) {
    throw new Error('Method not implemented.');
  }

  visitExprSwitchCase(ctx: ExprSwitchCaseContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeSwitchStmt(ctx: TypeSwitchStmtContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeSwitchGuard(ctx: TypeSwitchGuardContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeCaseClause(ctx: TypeCaseClauseContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeSwitchCase(ctx: TypeSwitchCaseContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeList(ctx: TypeListContext) {
    throw new Error('Method not implemented.');
  }

  visitSelectStmt(ctx: SelectStmtContext): SelectStmt {
    return { type: 'SelectStmt', clauses: ctx.commClause().map(this.visitCommClause, this) };
  }

  visitCommClause(ctx: CommClauseContext): SelectClause {
    const stmtListCtx = ctx.statementList();
    const stmts = stmtListCtx ? this.visitStatementList(stmtListCtx) : [];
    return { type: 'SelectClause', case: this.visitCommCase(ctx.commCase()), stmts };
  }

  visitCommCase(ctx: CommCaseContext): SendStmt | RecvStmt | 'default' {
    if (ctx.DEFAULT()) return 'default';
    const sendStmtCtx = ctx.sendStmt();
    if (sendStmtCtx) return this.visitSendStmt(sendStmtCtx);
    const recvStmtCtx = ctx.recvStmt();
    if (recvStmtCtx) return this.visitRecvStmt(recvStmtCtx);
    throw new Error('Method not implemented.');
  }

  visitRecvStmt(ctx: RecvStmtContext): RecvStmt {
    if (ctx.identifierList()) throw new Error('Method not implemented.');

    const expressionListCtx = ctx.expressionList();
    const expressions = expressionListCtx ? this.visitExpressionList(expressionListCtx) : [];
    if (expressions.length > 1) throw new Error('Method not implemented.');
    const assignExpr = expressions.length ? expressions[0] : null;
    const recvExpr = this.visitExpression(ctx.expression());

    return { type: 'RecvStmt', assignExpr, recvExpr };
  }

  visitForStmt(ctx: ForStmtContext): ForStmt {
    let clause: ForClause = { type: 'ForClause', init: null, condition: null, post: null };
    const forClauseCtx = ctx.forClause();
    if (forClauseCtx) clause = this.visitForClause(forClauseCtx);
    const exprCtx = ctx.expression();
    if (exprCtx) clause.condition = this.visitExpression(exprCtx);

    return { type: 'ForStmt', clause, block: this.visitBlock(ctx.block()) };
  }

  visitForClause(ctx: ForClauseContext): ForClause {
    const initCtx = ctx._initStmt;
    const exprCtx = ctx.expression();
    const postCtx = ctx._postStmt;

    return {
      type: 'ForClause',
      init: initCtx ? this.visitSimpleStmt(initCtx) : null,
      condition: exprCtx ? this.visitExpression(exprCtx) : null,
      post: postCtx ? this.visitSimpleStmt(postCtx) : null,
    };
  }

  visitRangeClause(ctx: RangeClauseContext) {
    throw new Error('Method not implemented.');
  }

  visitGoStmt(ctx: GoStmtContext): GoStmt {
    return { type: 'GoStmt', expr: this.visitExpression(ctx.expression()) };
  }

  visitType_(ctx: Type_Context): TypeInfo {
    const typeName = ctx.typeName();
    if (typeName) {
      return this.visitTypeName(typeName);
    }

    const typeLit = ctx.typeLit();
    if (typeLit) {
      return this.visitTypeLit(typeLit);
    }

    const type_ = ctx.type_();
    if (type_) {
      return this.visitType_(type_);
    }

    throw new Error('Method not implemented.');
  }

  visitTypeArgs(ctx: TypeArgsContext) {
    throw new Error('Method not implemented.');
  }

  visitTypeName(ctx: TypeNameContext): TypeInfo {
    const identifier = ctx.IDENTIFIER();
    if (identifier) {
      return getTypeInfoFromIdentifier(identifier.toString());
    }

    throw new Error('Method not implemented.');
  }

  visitTypeLit(ctx: TypeLitContext): TypeInfo {
    const arrayType = ctx.arrayType();
    if (arrayType) {
      return this.visitArrayType(arrayType);
    }

    const pointerType = ctx.pointerType();
    if (pointerType) {
      return this.visitPointerType(pointerType);
    }

    const functionType = ctx.functionType();
    if (functionType) {
      return this.visitFunctionType(functionType);
    }

    const channelType = ctx.channelType();
    if (channelType) {
      return this.visitChannelType(channelType);
    }

    throw new Error('Method not implemented.');
  }

  visitArrayType(ctx: ArrayTypeContext): ArrayTypeInfo {
    return arrayTypeInfo(this.visitArrayLength(ctx.arrayLength()), this.visitElementType(ctx.elementType()));
  }

  visitArrayLength(ctx: ArrayLengthContext): number {
    return this.visitInteger(ctx.integer());
  }

  visitElementType(ctx: ElementTypeContext): TypeInfo {
    return this.visitType_(ctx.type_());
  }

  visitPointerType(ctx: PointerTypeContext): PointerTypeInfo {
    return pointerTypeInfo(this.visitType_(ctx.type_()));
  }

  visitInterfaceType(ctx: InterfaceTypeContext) {
    throw new Error('Method not implemented.');
  }

  visitSliceType(ctx: SliceTypeContext) {
    throw new Error('Method not implemented.');
  }

  visitMapType(ctx: MapTypeContext) {
    throw new Error('Method not implemented.');
  }

  visitChannelType(ctx: ChannelTypeContext): ChannelTypeInfo {
    return channelTypeInfo(this.visitElementType(ctx.elementType()));
  }

  visitMethodSpec(ctx: MethodSpecContext) {
    throw new Error('Method not implemented.');
  }

  visitFunctionType(ctx: FunctionTypeContext): FunctionTypeInfo {
    return this.visitSignature(ctx.signature());
  }

  visitSignature(ctx: SignatureContext): FunctionTypeInfo {
    const result = ctx.result();
    return functionTypeInfo(this.visitParameters(ctx.parameters()), result ? this.visitResult(result) : []);
  }

  visitResult(ctx: ResultContext): TypeWithIdentifier[] {
    const parameters = ctx.parameters();
    if (parameters) {
      return this.visitParameters(parameters);
    }

    const type_ = ctx.type_();
    if (type_) {
      return [{ type: this.visitType_(type_), identifier: undefined }];
    }

    throw new Error('Method not implemented.');
  }

  visitParameters(ctx: ParametersContext): TypeWithIdentifier[] {
    return ctx.parameterDecl().map(this.visitParameterDecl, this).flat();
  }

  visitParameterDecl(ctx: ParameterDeclContext): TypeWithIdentifier[] {
    const type = this.visitType_(ctx.type_());
    const identifierList = ctx.identifierList();
    if (!identifierList) {
      return [{ type, identifier: undefined }];
    }
    return this.visitIdentifierList(identifierList).map((identifier) => ({
      type,
      identifier,
    }));
  }

  visitExpression(ctx: ExpressionContext): Expression {
    const primaryExprCtx = ctx.primaryExpr();
    if (primaryExprCtx) return this.visitPrimaryExpr(primaryExprCtx);

    const unaryOp = ctx._unary_op;
    if (unaryOp) {
      return { type: 'UnaryExpr', op: unaryOp.text as UnaryOp, expr: this.visitExpression(ctx.expression(0)) };
    }

    let binaryOp: BinaryOp | null = null;
    const mulOp = ctx._mul_op;
    if (mulOp) binaryOp = mulOp.text as MulOp;
    const addOp = ctx._add_op;
    if (addOp) binaryOp = addOp.text as AddOp;
    const relOp = ctx._rel_op;
    if (relOp) binaryOp = relOp.text as RelOp;
    if (ctx.LOGICAL_AND()) binaryOp = '&&';
    if (ctx.LOGICAL_OR()) binaryOp = '||';
    if (!binaryOp) throw new Error('Method not implemented.');

    return {
      type: 'BinaryExpr',
      op: binaryOp,
      left: this.visitExpression(ctx.expression(0)),
      right: this.visitExpression(ctx.expression(1)),
    };
  }

  visitPrimaryExpr(ctx: PrimaryExprContext): PrimaryExpr {
    const operandCtx = ctx.operand();
    if (operandCtx) return this.visitOperand(operandCtx);

    const primaryExprCtx = ctx.primaryExpr();
    if (primaryExprCtx) {
      let op: Index | Arguments | null = null;
      const indexCtx = ctx.index();
      if (indexCtx) op = this.visitIndex(indexCtx);
      const argumentsCtx = ctx.arguments();
      if (argumentsCtx) op = this.visitArguments(argumentsCtx);

      if (!op) throw new Error('Method not implemented.');
      return { type: 'PrimaryExprOp', op, expr: this.visitPrimaryExpr(primaryExprCtx) };
    }

    throw new Error('Method not implemented.');
  }

  visitConversion(ctx: ConversionContext) {
    throw new Error('Method not implemented.');
  }

  visitOperand(ctx: OperandContext): Operand {
    const literalCtx = ctx.literal();
    if (literalCtx) return this.visitLiteral(literalCtx);

    const operandNameCtx = ctx.operandName();
    if (operandNameCtx) return this.visitOperandName(operandNameCtx);

    const exprCtx = ctx.expression();
    if (exprCtx) return { type: 'ParanthesizedExpr', expr: this.visitExpression(exprCtx) };

    throw new Error('Method not implemented.');
  }

  visitLiteral(ctx: LiteralContext): Literal {
    const basicLitCtx = ctx.basicLit();
    if (basicLitCtx) return this.visitBasicLit(basicLitCtx);

    const functionLitCtx = ctx.functionLit();
    if (functionLitCtx) return this.visitFunctionLit(functionLitCtx);

    throw new Error('Method not implemented.');
  }

  visitBasicLit(ctx: BasicLitContext): Literal {
    if (ctx.NIL_LIT()) return 'nil';

    const integerCtx = ctx.integer();
    if (integerCtx) return this.visitInteger(integerCtx);

    const stringCtx = ctx.string_();
    if (stringCtx) return this.visitString_(stringCtx);

    throw new Error('Method not implemented.');
  }

  visitInteger(ctx: IntegerContext): number {
    const f = (i: TerminalNode) => i.toString().replace('_', '');

    const decimalLit = ctx.DECIMAL_LIT();
    if (decimalLit) {
      return parseInt(f(decimalLit), 10);
    }

    const binaryLit = ctx.BINARY_LIT();
    if (binaryLit) {
      return parseInt(f(binaryLit).replace('0b', '').replace('0B', ''), 2);
    }

    const octalLit = ctx.OCTAL_LIT();
    if (octalLit) {
      return parseInt(f(octalLit).replace('0o', '').replace('0O', ''), 8);
    }

    const hexLit = ctx.HEX_LIT();
    if (hexLit) {
      return parseInt(f(hexLit), 16);
    }

    throw new Error('Method not implemented.');
  }

  visitOperandName(ctx: OperandNameContext): string {
    return ctx.IDENTIFIER().toString();
  }

  visitQualifiedIdent(ctx: QualifiedIdentContext) {
    throw new Error('Method not implemented.');
  }

  visitCompositeLit(ctx: CompositeLitContext) {
    throw new Error('Method not implemented.');
  }

  visitLiteralType(ctx: LiteralTypeContext) {
    throw new Error('Method not implemented.');
  }

  visitLiteralValue(ctx: LiteralValueContext) {
    throw new Error('Method not implemented.');
  }

  visitElementList(ctx: ElementListContext) {
    throw new Error('Method not implemented.');
  }

  visitKeyedElement(ctx: KeyedElementContext) {
    throw new Error('Method not implemented.');
  }

  visitKey(ctx: KeyContext) {
    throw new Error('Method not implemented.');
  }

  visitElement(ctx: ElementContext) {
    throw new Error('Method not implemented.');
  }

  visitStructType(ctx: StructTypeContext) {
    throw new Error('Method not implemented.');
  }

  visitFieldDecl(ctx: FieldDeclContext) {
    throw new Error('Method not implemented.');
  }

  visitString_(ctx: String_Context): string {
    const c = ctx.INTERPRETED_STRING_LIT();
    if (c) return c.toString();

    throw new Error('Method not implemented.');
  }

  visitEmbeddedField(ctx: EmbeddedFieldContext) {
    throw new Error('Method not implemented.');
  }

  visitFunctionLit(ctx: FunctionLitContext): FunctionDecl {
    return {
      type: 'FunctionDecl',
      identifier: '',
      typeInfo: this.visitSignature(ctx.signature()),
      body: this.visitBlock(ctx.block()),
    };
  }

  visitIndex(ctx: IndexContext): Index {
    return { type: 'Index', expr: this.visitExpression(ctx.expression()) };
  }

  visitSlice_(ctx: Slice_Context) {
    throw new Error('Method not implemented.');
  }

  visitTypeAssertion(ctx: TypeAssertionContext) {
    throw new Error('Method not implemented.');
  }

  visitArguments(ctx: ArgumentsContext): Arguments {
    const exprs: (Expression | TypeInfo)[] = [];
    const typeCtx = ctx.type_();
    if (typeCtx) exprs.push(this.visitType_(typeCtx));
    const exprListCtx = ctx.expressionList();
    if (exprListCtx) exprs.push(...this.visitExpressionList(exprListCtx));
    return { type: 'Arguments', exprs };
  }

  visitMethodExpr(ctx: MethodExprContext) {
    throw new Error('Method not implemented.');
  }

  visitEos(ctx: EosContext) {
    throw new Error('Method not implemented.');
  }

  visit(tree: ParseTree) {
    throw new Error('Method not implemented.');
  }

  visitChildren(node: RuleNode) {
    throw new Error('Method not implemented.');
  }

  visitTerminal(node: TerminalNode) {
    throw new Error('Method not implemented.');
  }

  visitErrorNode(node: ErrorNode) {
    throw new Error('Method not implemented.');
  }
}
