import { Parser, TokenStream } from 'antlr4ts';
import { GoParser } from './GoParser';

export abstract class GoParserBase extends Parser {
  constructor(input: TokenStream) {
    super(input);
  }

  protected closingBracket(): boolean {
    const la = this._input.LA(1);
    return la === GoParser.R_CURLY || la === GoParser.R_PAREN;
  }
}
