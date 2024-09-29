import { integer } from 'vscode-languageserver';
import log from './log';

const LETTER = /[a-zA-Z_^]/
const WHITESPACE = /[ \t]+/;  // Matches spaces and tabs
const NUMBER = /^[0-9]+$/
const LINECOMMENT = /^--$/
const CRLF = /\r\n/;
const DIRECTIVE = /\?/;

/*********************************************************************************************************************************/
/************************************************************  SYMBOLS  *********************************************************/
/*********************************************************************************************************************************/
const INDIRECTION_SYMBOLS             = [".", ".EXT", ".SG", ];
const BASE_ADDRESS_SYMBOLS            = ["'P'", "'G'", "'L'", "'P'", "'S'", "'SG'", ];
const DELIMITER_SYMBOLS = ["!", "--", ",", ";", ".", "<", ">", ":", "(", ")", "[", "]", "->", "\"", "=", "#", "'", "$", "?"];
/*********************************************************************************************************************************/
/***********************************************************  OPERATORS  *********************************************************/
/*********************************************************************************************************************************/
const ASSIGMENT_OPERATORS = [":="];
const MOVE_OPERATORS = ["':='", "'=:'", "&"];
const LABEL_CASE_OPERATORS = [".."];
const REMOVE_INDIRECTION_OPERATOR = ["@"];
const REPETITION_OPERATOR = ["*"];
const TEMPLATE_STRUCTURE_OPERATOR = ["(*)"];
const FIXED_PARAM_TYPE_OPERATOR = ["(*)"];
const DEREFERECING_OPERATOR = ["."];
const BIT_FIELD_OPERATOR = ["."];
const BIT_SHIFT_OPERATORS = ["<<", ">>", "'<<'", "'>>'"];
const ARITHMETIC_EXPRESION_OPERATORS = ["+", "-", "*", "/", "'*'", "'/'", "'\\'", "'+'", "'–'", "LOR", "LAND", "XOR"];
const RELACTIONAL_EXPRESION_OPERATORS = ["<", "=", ">", "<=", ">=", "<>", "'<'", "'='", "'>'", "'<='", "'>='", "'<>'"];
const BOOLEAN_EXPRESION_OPERATORS = ["AND", "OR", "NOT"];                             
/*********************************************************************************************************************************/
/*********************************************************** DIRECTIVES **********************************************************/
/*********************************************************************************************************************************/
const DIRECTIVES =  ["ABORT",        "NOABORT",      "ABSLIST",      "NOABSLIST",        "ASSERTION",        "BEGINCOMPILATION",
                     "CHECEK",       "NOCHECK",      "PUSHCHECK",    "POPCHECK",         "CODE",             "NOCODE", 
                     "PUSHCODE",     "POPCODE",      "COLUMNS",      "COMPACT",          "NOCOMPACT",        "CPU", 
                     "CROSSREF",     "NOCROSSREF",   "DATAPAGES",    "DECS",             "DEFEXPAND",        "NODEFEXPAND", 
                     "PUSHDEFEXPAND", "POPDEFEXPAND","DEFINETOG",    "DEFINETOG",        "ENV",              "ERRORFILE",
                     "ERRORS",       "EXTENDSTACK",  "EXTENDTALHEAP","FIXUP",            "NOFIXUP",          "FMAP",
                     "NOFMAP",       "GMAP",         "NOGMAP",       "HEAP",             "HIGHPIN",          "HIGHREQUESTERS",
                     "ICODE",        "NOICODE",      "PUSHICODE",    "POPICODE",         "IF",               "IFNOT",
                     "ENDIF",        "INHIBITXX",    "NOINHIBITXX",  "INNERLIST",        "NOINNERLIST",      "PUSHINNERLIST",
                     "POPINNERLIST", "INSPECT",      "NOINSPECT",    "INT32INDEX",       "NOINT32INDEX",     "PUSHINT32INDEX",
                     "POPINT32INDEX","LARGESTACK"
                    ];
/*********************************************************************************************************************************/
/***********************************************************  KEYWORDS  **********************************************************/
/*********************************************************************************************************************************/
const KEYWORDS =    ["AND",             "DO",           "FORWARD",          "MAIN",         "RETURN",       "TO",
                     "ASEERT",          "DOWMTO",       "GOTO",             "NOT",          "RSCAN",        "UNSIGNED",
                     "BEGIN",           "DROP",         "IF",               "OF",           "SCAN",         "UNTIL", 
                     "BY",              "ELSE",         "INT",              "OR",           "STACK",        "USE", 
                     "CALL",            "END",          "INTERRUPT",        "OTHERWISE",    "STORE",        "VARIABLE",
                     "CALLABLE",        "ENTRY",        "LABEL",            "PRIV",         "STRING",       "WHILE",
                     "CASE",            "EXTERNAL",     "LAND",             "PROC",         "STRUCT",       "XOR",
                     "CODE",            "FIXED",        "LITERAL",          "REAL",         "SUBPROC",      
                     "DEFINE",          "FOR",          "LOR",              "RESIDENT",     "THEN",      
                    ]

/*********************************************************************************************************************************/
/********************************************************** DATA TYPES  **********************************************************/
/*********************************************************************************************************************************/

const DATA_TYPES =  ["STRING",
                     "INT",             
                     "FIXED",          
                     "REAL",           
                     "UNSIGNED",
                    ]

/* TODO */ 
/* Check to see how to address the + and - Unary operators */

let cursor = 0;

export const getCursor = function getCursor(): number {
    return cursor;
};
export  const resetCursor = (): void => {
    cursor = 0;
};
export const moveCursor = (length: number): void => {
    cursor += length;
};
export const skipCharacters = (input: string, numberOfCharacter: number ): void => {
    do {
        getCharacter(input);
    } while (numberOfCharacter-- > 0);
};
export const getCharacter = (input: string): string => {
    if (!(getCursor() < input.length)) return "";
    const character = input[cursor];
    log.write('DEBUG', `returned "${character}" at ${cursor}.`)
    cursor++;
    return character;
};
export const getCharacters = (input: string, numberOfCharacter: number ): string => {
    if (!(getCursor() + numberOfCharacter < input.length)) return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`)
    cursor += numberOfCharacter;
    return characters;
};
export const getLastElement = (arr: Token[]): any | undefined => {
    if (arr.length === 0) {
        return undefined;  
    }
    return arr[arr.length - 1];  
}
export const getLastType = (arr: Token[]): string => {
    const token = getLastElement(arr);
    log.write('DEBUG', `returned ${token.type}.`)
    if (token){
        return token.type;  
    } else {
        return "";
    }
}
export const getLastValue = (arr: Token[]): string => {
    const token = getLastElement(arr);
    log.write('DEBUG', `returned ${token.value}.`)
    if (token){
        return token.value;  
    } else {
        return "";
    }
}
export const peekCharacter = (input: string): string => {
    if (!(getCursor() < input.length)) return "";
    const character = input[cursor];
    log.write('DEBUG', `returned "${character}" at ${cursor}.`)
    return character;
};
export const peekCharacterAt = (input: string, offsetCursor: number = 0): string => {
    if (!(getCursor() < input.length)) return "";
    let tempCursor = cursor + offsetCursor;
    const character = input.substring(tempCursor, tempCursor + 1);
    log.write('DEBUG', `returned "${character}" at ${tempCursor}.`)
    return character;
};
export const peekCharacters = (input: string, numberOfCharacter: number ): string => {
    if (!(getCursor() + numberOfCharacter < input.length)) return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`)
    return characters;
};
export const isCRLF = (character: string): boolean => {
    const retVal = CRLF.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
};
export const isLetter = (character: string): boolean => {
    const retVal = LETTER.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isWhitespace = (character: string): boolean => {
    const retVal = WHITESPACE.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isNumber = (character: string): boolean => {
    const retVal = NUMBER.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isCompilerDirective = (character: string): boolean => {
    const retVal = DIRECTIVE.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isOpeneningComment = (character: string): boolean => {
    const retVal = (character === "!");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isClosingComment = (character: string): boolean => {
    const retVal = (character === "!");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isSingleLineComment = (character: string): boolean => {
    const retVal = LINECOMMENT.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isOpeneningParenthesis = (character: string): boolean => {
    const retVal = (character === "(");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isClosingParenthesis = (character: string): boolean => {
    const retVal = (character === ")");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isOpeneningIndex = (character: string): boolean => {
    const retVal = (character === "[");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isClosingIndex = (character: string): boolean => {
    const retVal = (character === "]");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isOpeneningBit = (character: string): boolean => {
    const retVal = (character === "<");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isClosingBit = (character: string): boolean => {
    const retVal = (character === ">");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isComment = (character: string): boolean => {
    const retVal = isOpeneningComment(character) || isClosingComment(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isAngleBrackets = (character: string): boolean => {
    const retVal = isOpeneningBit(character) || isClosingBit(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isSquareBrackets = (character: string): boolean => {
    const retVal = isOpeneningIndex(character) || isClosingIndex(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isParenthesis = (character: string): boolean => {
    const retVal = isOpeneningParenthesis(character) || isClosingParenthesis(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isQuote = (character: string): boolean => { 
    const retVal = (character === '"');
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
export const isKeyword = (word: string): boolean =>{
    const retVal = KEYWORDS.includes(word);
    log.write('DEBUG', `returned "${retVal}" for word ${word} , at ${cursor}`)
    return retVal;
}
export const isDataType = (word: string): boolean => {
    const retVal = DATA_TYPES.includes(word);
    log.write('DEBUG', `returned "${retVal}" for word ${word} , at ${cursor}`)
    return retVal;
}
export const isDelimiter = (character: string): boolean => {
    const retVal = DELIMITER_SYMBOLS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
export const isAssigmentOperator = (character: string): boolean => {
    const retVal =  ASSIGMENT_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isMoveOperator = (character: string): boolean => {
    const retVal =  MOVE_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isLabelCaseOperator = (character: string): boolean => {
    const retVal =  LABEL_CASE_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isRemoveIndirectionOperator = (character: string): boolean => {
    const retVal =  REMOVE_INDIRECTION_OPERATOR.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isRepetitionOperator = (character: string): boolean => {
    const retVal =  REPETITION_OPERATOR.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isTemplateStructureOperator = (character: string): boolean => {
    const retVal =  TEMPLATE_STRUCTURE_OPERATOR.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isFixedParamTypeOperator = (character: string): boolean => {
    const retVal =  FIXED_PARAM_TYPE_OPERATOR.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isDereferencingOperator = (character: string): boolean => {
    const retVal =  DEREFERECING_OPERATOR.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isBitFieldOperator = (character: string): boolean => {
    const retVal =  BIT_FIELD_OPERATOR.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isBitShilfOperator = (character: string): boolean => {
    const retVal =  BIT_SHIFT_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isArithmeticExpresionOperator = (character: string): boolean => {
    const retVal =  ARITHMETIC_EXPRESION_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isRelationalExpresionOperator = (character: string): boolean => {
    const retVal =  RELACTIONAL_EXPRESION_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isBooleanExpresionOperator = (character: string): boolean => {
    const retVal =  BOOLEAN_EXPRESION_OPERATORS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isIndirection = (character: string): boolean => {
    const retVal = INDIRECTION_SYMBOLS.some(delimiter => delimiter.includes(character));
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`);
    return retVal;
};
export const isOperator = (character: string): boolean => {
    const retVal =  (isDelimiter(character) ||
                     isAssigmentOperator(character) || 
                     isMoveOperator(character) || 
                     isLabelCaseOperator(character) ||
                     isRemoveIndirectionOperator(character) ||
                     isRepetitionOperator(character) ||
                     isTemplateStructureOperator(character) ||
                     isFixedParamTypeOperator(character) ||
                     isDereferencingOperator(character) ||
                     isBitFieldOperator(character) ||
                     isBitShilfOperator(character) ||
                     isArithmeticExpresionOperator(character) ||
                     isRelationalExpresionOperator(character)||
                     isBooleanExpresionOperator(character)
                    );
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
export const isSpecialCharacter = (input: string): string | null  => {
    const symbols = [
        '\r\n',
        ...INDIRECTION_SYMBOLS,
        ...DELIMITER_SYMBOLS,
        ...ASSIGMENT_OPERATORS,
        ...MOVE_OPERATORS,
        ...LABEL_CASE_OPERATORS,
        ...REMOVE_INDIRECTION_OPERATOR,
        ...REPETITION_OPERATOR,
        ...TEMPLATE_STRUCTURE_OPERATOR,
        ...FIXED_PARAM_TYPE_OPERATOR,
        ...BIT_SHIFT_OPERATORS,
        ...ARITHMETIC_EXPRESION_OPERATORS,
        ...RELACTIONAL_EXPRESION_OPERATORS,
        ...BOOLEAN_EXPRESION_OPERATORS
    ];

    // Sort symbols by length in descending order (longest match first)
    symbols.sort((a, b) => b.length - a.length);

    for (let symbol of symbols) {
        if (input.startsWith(symbol, cursor)) {
            return symbol;
        }
    }
    return null;
}
    
export type Token = {
    type: string;
    value: string | number;
};