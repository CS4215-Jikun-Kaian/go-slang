import { Type, TypeInfo } from '../typing/types';
import * as Token from '../ast/types';
import { Instruction } from '../virtual_machine/types';
import { CompileTimeEnvironment } from './compile_time_environment';

class Compiler {
  private instructions: Instruction[] = [];
  private compileTimeEnvironment: CompileTimeEnvironment = new CompileTimeEnvironment();

  public compile(token: Token.BaseNode): Instruction[] {
    this.instructions = [];
    this.compileTimeEnvironment = new CompileTimeEnvironment();
    this.compileToken(token);
    return this.instructions;
  }

  private compileToken(token: Token.BaseNode | string | number | Token.BaseNode[] | TypeInfo): void {
    if (typeof token === 'string') {
      const pos = this.compileTimeEnvironment.findVariable(token);
      this.instructions.push({ type: 'LD', pos });
      return;
    } else if (typeof token === 'number') {
      this.compileNumber(token);
      return;
    } else if (Array.isArray(token)) {
      for (const subtoken of token) this.compileToken(subtoken);
      return;
    }

    const isTypeInfo = (token: Token.BaseNode | TypeInfo): token is TypeInfo => {
      return Object.values(Type).includes(token.type as Type);
    };
    if (isTypeInfo(token)) {
      this.compileType(token);
      return;
    }

    const compilationMapping = {
      SourceFile: this.compileSourceFile,
      FunctionDecl: this.compileFunctionDecl,
      Declaration: this.compileDeclaration,
      Block: this.compileBlock,
      ParanthesizedExpr: this.compileParanthesizedExpr,
      PrimaryExprOp: this.compilePrimaryExprOp,
      Index: this.compileIndex,
      Arguments: this.compileArguments,
      UnaryExpr: this.compileUnaryExpr,
      BinaryExpr: this.compileBinaryExpr,
      GoStmt: this.compileGoStmt,
      ReturnStmt: this.compileReturnStmt,
      BreakStmt: this.compileBreakStmt,
      ContinueStmt: this.compileContinueStmt,
      IfStmt: this.compileIfStmt,
      SelectStmt: this.compileSelectStmt,
      SelectClause: this.compileSelectClause,
      ForStmt: this.compileForStmt,
      SendStmt: this.compileSendStmt,
      RecvStmt: this.compileRecvStmt,
      Assignment: this.compileAssignment,
      ExpressionStmt: this.compileExpressionStmt,
    };
    const tokenCompilationMethod =
      compilationMapping[(token as Token.BaseNode).type as keyof typeof compilationMapping];
    tokenCompilationMethod.bind(this)(token as any);
  }

  // COMPILATION FUNCTIONS

  private compileSourceFile(sourceFile: Token.SourceFile): void {
    for (const functionDecl of sourceFile.functions) {
      this.compileToken(functionDecl);
    }
    const mainPos = this.compileTimeEnvironment.findVariable('main');
    this.instructions.push({ type: 'LD', pos: mainPos });
    this.instructions.push({ type: 'CALL', arity: 0 });
    this.instructions.push({ type: 'DONE' });
  }

  private compileFunctionDecl(functionDecl: Token.FunctionDecl): void {
    const functionPos = this.compileTimeEnvironment.declareVariable(functionDecl.identifier);

    const jumpToEnd = { type: 'JOF', addr: 0 };
    this.instructions.push(jumpToEnd);
    const closurePC = this.instructions.length;
    this.compileTimeEnvironment.extend();

    // Arguments
    this.instructions.push({ type: 'ENTER_SCOPE', num: functionDecl.typeInfo.paramTypes.length });
    for (let i = functionDecl.typeInfo.paramTypes.length - 1; i >= 0; i--) {
      const name = functionDecl.typeInfo.paramTypes[i].identifier as string;
      const pos = this.compileTimeEnvironment.declareVariable(name);
      this.instructions.push({ type: 'LD', pos });
    }

    // Body
    this.compileToken(functionDecl.body);

    // Cleanup
    this.instructions.push({ type: 'EXIT_SCOPE' });
    this.compileTimeEnvironment.pop();
    jumpToEnd.addr = this.instructions.length;

    // Make closure and assign it.
    this.instructions.push(
      { type: 'LDF', arity: functionDecl.typeInfo.paramTypes.length, addr: closurePC },
      { type: 'ASSIGN', pos: functionPos }
    );
  }

  private compileDeclaration(declaration: Token.Declaration): void {
    const pos = this.compileTimeEnvironment.declareVariable(declaration.identifier);
    this.compileToken(declaration.initializer as Token.Expression);
    this.instructions.push({ type: 'ASSIGN', pos });
  }

  private compileBlock(block: Token.Block): void {
    const enterScope = { type: 'ENTER_SCOPE', num: 0 };
    this.instructions.push(enterScope);
    this.compileTimeEnvironment.extend();

    for (const stmt of block.stmts) {
      this.compileToken(stmt as any);
    }

    enterScope.num = this.compileTimeEnvironment.currentFrame().length;
    this.compileTimeEnvironment.pop();
    this.instructions.push({ type: 'EXIT_SCOPE' });
  }

  private compileParanthesizedExpr(paranthesizedExpr: Token.ParanthesizedExpr): void {
    this.compileToken(paranthesizedExpr.expr);
  }

  private compilePrimaryExprOp(primaryExprOp: Token.PrimaryExprOp): void {
    this.compileToken(primaryExprOp.expr);
    this.compileToken(primaryExprOp.op);
  }

  private compileIndex(index: Token.Index): void {
    // todo - not supported
  }

  private compileArguments(args: Token.Arguments): void {
    for (const arg of args.exprs) {
      this.compileToken(arg);
    }
    this.instructions.push({ type: 'CALL', arity: args.exprs.length });
  }

  private compileUnaryExpr(unaryExpr: Token.UnaryExpr): void {
    if (unaryExpr.op === '<-') {
      const channel = unaryExpr.expr;
      if (typeof channel !== 'string') throw new Error('Can only read from variables');
      const pos = this.compileTimeEnvironment.findVariable(channel);
      this.instructions.push({ type: 'LD', pos });
      this.instructions.push({ type: 'READ_CHANNEL' });
    }
    this.compileToken(unaryExpr.expr);
    this.instructions.push({ type: 'UNOP', sym: unaryExpr.op });
  }

  private compileBinaryExpr(binaryExpr: Token.BinaryExpr): void {
    this.compileToken(binaryExpr.left);
    this.compileToken(binaryExpr.right);
    this.instructions.push({ type: 'BINOP', sym: binaryExpr.op });
  }

  private compileGoStmt(goStmt: Token.GoStmt): void {
    const spawningThreadJumps = { type: 'GOTO', addr: 0 };
    this.instructions.push(spawningThreadJumps);
    const goRoutinePC = this.instructions.length;
    this.compileToken(goStmt.expr);
    this.instructions.push({ type: 'DONE' });
    spawningThreadJumps.addr = this.instructions.length;
    this.instructions.push({ type: 'SPAWN', addr: goRoutinePC });
  }

  private compileReturnStmt(returnStmt: Token.ReturnStmt): void {
    for (const expr of returnStmt.exprs) {
      this.compileToken(expr);
    }
    this.instructions.push({ type: 'RESET' });
  }

  private compileBreakStmt(breakStmt: Token.BreakStmt): void {
    // todo - HJ
  }

  private compileContinueStmt(continueStmt: Token.ContinueStmt): void {
    // todo - HJ
  }

  private compileIfStmt(ifStmt: Token.IfStmt): void {
    this.compileTimeEnvironment.extend();
    const enterScope = { type: 'ENTER_SCOPE', num: 0 };
    this.instructions.push(enterScope);

    if (ifStmt.precedingStmt) this.compileToken(ifStmt.precedingStmt);
    this.compileToken(ifStmt.condition);

    const jumpToAlt = { type: 'JOF', addr: 0 };
    this.instructions.push(jumpToAlt);

    this.compileToken(ifStmt.consequent);
    const jumpToEnd = { type: 'GOTO', addr: 0 };
    jumpToAlt.addr = this.instructions.length;

    if (ifStmt.alternative) this.compileToken(ifStmt.alternative);
    jumpToEnd.addr = this.instructions.length;

    enterScope.num = this.compileTimeEnvironment.currentFrame().length;
    this.compileTimeEnvironment.pop();
  }

  private compileSelectStmt(selectStmt: Token.SelectStmt): void {
    // todo
  }

  private compileSelectClause(selectClause: Token.SelectClause): void {
    // todo
  }

  private compileForStmt(forStmt: Token.ForStmt): void {
    this.compileTimeEnvironment.extend();
    const loopframe = { type: 'PUSH_LOOP', addr: 0 };
    const enterScope = { type: 'ENTER_SCOPE', num: 0 };

    const start = this.instructions.length;

    this.instructions.push(loopframe);
    this.instructions.push(enterScope);

    const init = forStmt.clause.init;
    if (init) this.compileToken(init);

    const condition = forStmt.clause.condition;
    if (condition) {
      this.compileToken(condition);
    }
    const jump_on_false_instr = { type: 'JOF', addr: 0 };
    this.instructions.push(jump_on_false_instr);

    const body = forStmt.block;
    this.compileToken(body);

    this.instructions.push({ type: 'GOTO', addr: start });

    const post = forStmt.clause.post;
    if (post) {
      this.compileToken(post);
    }

    jump_on_false_instr.addr = this.instructions.length;
    loopframe.addr = this.instructions.length;
  }

  private compileSendStmt(sendStmt: Token.SendStmt): void {
    // Push value, then channel onto the OS
    this.compileToken(sendStmt.expr);
    if (typeof sendStmt.channel !== 'string') throw new Error('Only send to variables are allowed');
    const pos = this.compileTimeEnvironment.findVariable(sendStmt.channel);
    this.instructions.push({ type: 'LD', pos });
    this.instructions.push({ type: 'WRITE_CHANNEL' });
  }

  private compileRecvStmt(recvStmt: Token.RecvStmt): void {
    this.compileToken(recvStmt.recvExpr);
    if (recvStmt.assignExpr) {
      if (typeof recvStmt.assignExpr !== 'string') throw new Error('Only assignments to variables are allowed');
      const pos = this.compileTimeEnvironment.declareVariable(recvStmt.assignExpr);
      this.instructions.push({ type: 'ASSIGN', pos });
    } else {
      this.instructions.push({ type: 'POP' });
    }
  }

  private compileAssignment(assignment: Token.Assignment): void {
    if (typeof assignment.left !== 'string') throw new Error('Only assignments to variables are allowed');
    const name = assignment.left;
    const pos = this.compileTimeEnvironment.declareVariable(name);
    this.compileToken(assignment.right);
    this.instructions.push({ type: 'ASSIGN', pos });
  }

  private compileExpressionStmt(expressionStmt: Token.ExpressionStmt): void {
    this.compileToken(expressionStmt.expr);
    this.instructions.push({ type: 'POP' });
  }

  private compileString(string: string): void {
    this.instructions.push({ type: 'LDC', val: string });
  }

  private compileNumber(number: number): void {
    this.instructions.push({ type: 'LDC', val: number });
  }

  private compileType(token: TypeInfo): void {
    this.instructions.push({ type: 'LDC', val: token.type as string });
  }
}

export const compile = (token: Token.BaseNode): Instruction[] => {
  return new Compiler().compile(token);
};
