import { type ANTLRErrorListener, type Recognizer } from 'antlr4ts';
import { type RecognitionException } from 'antlr4ts/RecognitionException';

export class ParseError extends Error {}

export class ThrowingErrorListener<T> implements ANTLRErrorListener<T> {
  public syntaxError(
    recognizer: Recognizer<T, any>,
    offendingSymbol: T | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    throw new ParseError(`Line ${line}:${charPositionInLine} ${msg}`);
  }
}
