import log from './log';

const LETTER = /[a-zA-Z_^]/
const WHITESPACE = /\s+/
const NUMBER = /^[0-9]+$/
const LINECOMMENT = /^--$/
const CRLF = /\r\n/;
const DIRECTIVE = /^\?$/


/*********************************************************************************************************************************/
/************************************************************  SYMBOLS  *********************************************************/
/*********************************************************************************************************************************/
const INDIRECTION_SYMBOLS             = [".",
                                         ".EXT",
                                         ".SG",
                                        ];
const BASE_ADDRESS_SYMBOLS            = ["'P'",
                                         "'G'",
                                         "'L'",
                                         "'P'",
                                         "'S'",
                                         "'SG'",
                                        ];
const DELIMITER_SYMBOLS            = ["'P'",
                                         "'G'",
                                         "'L'",
                                         "'P'",
                                         "'S'",
                                         "'SG'",
                                        ];                                        
/*********************************************************************************************************************************/
/***********************************************************  OPERATORS  *********************************************************/
/*********************************************************************************************************************************/
const BITS_OPERATORS                  = ["<<",
                                         ">>",
                                         "'<<'",
                                         "'>>'"
                                        ];
const ASSIGMENT_OPERATORS             = [":="];
const MOVE_OPERATORS                  = ["':='",
                                         "'=:'",
                                         "&" 
                                        ];
const LABEL_CASE_OPERATORS            = [".."];
const TEMPLATE_STRUCTURE_OPERATOR     = ["(*)"];
const FIXED_PARAMETET_TYPE_OPERATOR   = ["(*)"];
const ARITHMETIC_EXPRESION_OPERATORS  = ["+",
                                         "-",
                                         "*",
                                         "/",
                                         "'*'",
                                         "'/'",
                                         "'\\'",
                                         "'+'",
                                         "'–'",
                                         "LOR",
                                         "LAND",
                                         "XOR"
                                        ];
const RELACTIONAL_EXPRESION_OPERATORS = ["<",
                                         "=",
                                         ">",
                                         "<=",
                                         ">=",
                                         "<>",
                                         "'<'",
                                         "'='",
                                         "'>'",
                                         "'<='",
                                         "'>='",
                                         "'<>'" 
                                        ];


const COMPILER_DIRECTIVE = ["?"]
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

const DATA_TYPES =  ["STRING",
                     "INT",            "INT(16)",
                     "INT(32)", 
                     "FIXEX",          "INT(64",
                     "REAL",           "REAL(32)",
                     "REAL(64)",
                     "UNSIGNED(n)",
                    ]

/* TODO */ 
/* Check to see how to address the + and - Unary operators */

let cursor = 0;

const getCursor = function getCursor(): number {
    return cursor;
};
const resetCursor = (): void => {
    cursor = 0;
};

const skipCharacters = (input: string, numberOfCharacter: number ): void => {
    do {
        getCharacter(input);
    } while (numberOfCharacter-- > 0);
};
const getCharacter = (input: string): string => {
    if (!(getCursor() < input.length)) return "";
    const character = input[cursor];
    log.write('DEBUG', `returned "${character}" at ${cursor}.`)
    cursor++;
    return character;
};
const getCharacters = (input: string, numberOfCharacter: number ): string => {
    if (!(getCursor() + numberOfCharacter < input.length)) return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`)
    cursor += numberOfCharacter;
    return characters;
};
const peekCharacter = (input: string): string => {
    if (!(getCursor() < input.length)) return "";
    const character = input[cursor];
    log.write('DEBUG', `returned "${character}" at ${cursor}.`)
    return character;
};
const peekCharacterAt = (input: string, offsetCursor: number = 0): string => {
    if (!(getCursor() < input.length)) return "";
    let tempCursor = cursor + offsetCursor;
    const character = input.substring(tempCursor, tempCursor + 1);
    log.write('DEBUG', `returned "${character}" at ${tempCursor}.`)
    return character;
};
const peekCharacters = (input: string, numberOfCharacter: number ): string => {
    if (!(getCursor() + numberOfCharacter < input.length)) return "";
    const characters = input.substring(cursor, cursor + numberOfCharacter);
    log.write('DEBUG', `returned "${characters}", (${characters.length}), at ${cursor}, for ${numberOfCharacter}.`)
    return characters;
};
const isCRLF = (character: string): boolean => {
    const retVal = CRLF.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
};
const isLetter = (character: string): boolean => {
    const retVal = LETTER.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isWhitespace = (character: string): boolean => {
    const retVal = WHITESPACE.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isNumber = (character: string): boolean => {
    const retVal = NUMBER.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isCompilerDirective = (character: string): boolean => {
    const retVal = COMPILER_DIRECTIVE.includes(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isOpeneningComment = (character: string): boolean => {
    const retVal = (character === "!");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isClosingComment = (character: string): boolean => {
    const retVal = (character === "!");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isSingleLineComment = (character: string): boolean => {
    const retVal = LINECOMMENT.test(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isOpeneningParenthesis = (character: string): boolean => {
    const retVal = (character === "(");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isClosingParenthesis = (character: string): boolean => {
    const retVal = (character === ")");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isOpeneningIndex = (character: string): boolean => {
    const retVal = (character === "[");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isClosingIndex = (character: string): boolean => {
    const retVal = (character === "]");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isOpeneningBit = (character: string): boolean => {
    const retVal = (character === "<");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isClosingBit = (character: string): boolean => {
    const retVal = (character === ">");
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isComment = (character: string): boolean => {
    const retVal = isOpeneningComment(character) || isClosingComment(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isBitExtraction = (character: string): boolean => {
    const retVal = isOpeneningBit(character) || isClosingBit(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isIndex = (character: string): boolean => {
    const retVal = isOpeneningIndex(character) || isClosingIndex(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isParenthesis = (character: string): boolean => {
    const retVal = isOpeneningParenthesis(character) || isClosingParenthesis(character);
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isQuote = (character: string): boolean => { 
    const retVal = (character === '"');
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)
    return retVal;
}
const isKeyword = (word: string): boolean =>{
    const retVal = KEYWORDS.includes(word);
    log.write('DEBUG', `returned "${retVal}" for word ${word} , at ${cursor}`)
    return retVal;
}
const isOperator = (character: string): boolean => {
    const retVal = false;
    /*const retVal =  (ARITHMETIC_OPERATORS.includes(character) || 
                     COMPARISON_OPERATORS.includes(character) || 
                     ADDRES_OPERATORS.includes (character) ||
                     BITS_OPERATORS.includes (character));
                     */
    log.write('DEBUG', `returned "${retVal}" for character ${character} , at ${cursor}`)                     
    return retVal;
}
    

export default {
    getCharacter,
    getCharacters,
    getCursor,
    isComment,
    isClosingParenthesis,
    isCRLF,
    isCompilerDirective,
    isIndex,
    isKeyword,
    isLetter,
    isNumber,
    isOperator,
    isOpeneningParenthesis,
    isParenthesis,
    isSingleLineComment,
    isQuote,
    isWhitespace,
    isBitExtraction,
    peekCharacter,
    peekCharacterAt,
    peekCharacters,
    resetCursor,
    skipCharacters,
}