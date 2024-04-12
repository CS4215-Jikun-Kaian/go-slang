import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { GoLexer } from '../lang/GoLexer';
import { GoParser } from '../lang/GoParser';
import { ThrowingErrorListener } from './throwingErrorListener';
import { type Token } from 'antlr4ts/Token';

export const parse = (code: string): void => {
  const inputStream = CharStreams.fromString(code);

  const lexer = new GoLexer(inputStream);
  const lexerErrorListener = new ThrowingErrorListener<number>();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerErrorListener);

  const tokenStream = new CommonTokenStream(lexer);

  const parser = new GoParser(tokenStream);
  const parserErrorListener = new ThrowingErrorListener<Token>();
  parser.removeErrorListeners();
  parser.addErrorListener(parserErrorListener);

  const tree = parser.sourceFile();
  console.log(tree);
};
