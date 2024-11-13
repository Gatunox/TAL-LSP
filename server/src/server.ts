import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    DidChangeTextDocumentParams,
    TextDocumentContentChangeEvent,
    Range,
} from "vscode-languageserver/node";

import * as path from 'path';
import log from './log';
import { Token } from './helper';
import { printAllDefines, printAllLiterals, SymbolEntry } from './parser';
import tokenizer from './tokenizer';
import parseTokens from './parser';



import { TextDocument } from "vscode-languageserver-textdocument";

interface Message {
    id?: number;
    jsonrpc: string;
    method: string;
    params?: any;
}

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Map to cache tokens for each document
let documentTokensCache = new Map<string, { version: number; tokens: Token[] }>();
let documentSymbolsCache = new Map<string, { version: number; symbolTable: SymbolEntry[] }>();


function isNewLine(token: Token ): boolean {
    // Check if the token is on the same line as the range
    if (token.type === 'NewLine') {
        return true;
    }

    return false;
}

// Function to filter relevant tokens (keywords, names, strings) and remove duplicates
function cacheTokens(documentUri: string, version: number, tokens: Token[]) {
    log.write('DEBUG', 'cacheTokens called:');
  
    tokens.forEach((token: Token) => {
        log.write('DEBUG', token);
    });

    // Cache the filtered tokens along with the document version
    documentTokensCache.set(documentUri, {
        version: version,
        tokens: tokens,  // Store filtered tokens
    });

    // const filterdTokens = tokens.filter((token: Token) => !isNewLine(token));
    const symbolsCache = parseTokens(tokens);
    printAllLiterals();
    printAllDefines();
    filterAndCacheSymbols(documentUri, version, symbolsCache);
}

function filterAndCacheSymbols(documentUri: string, version: number, symbolsCache:Map<string, SymbolEntry>) {
    log.write('DEBUG', 'filterAndCacheSymbos called:');
    // Use a Map to store tokens by their value to automatically exclude duplicates
    const filteredSymbolsMap = new Map<string, SymbolEntry>();

    for (const [key, value] of symbolsCache.entries()) {
        log.write('DEBUG','Key: ' + key +', Value: ' + JSON.stringify(value));

        if (!filteredSymbolsMap.has(key)) {
            filteredSymbolsMap.set(key, value);
        }
    }
    // Convert the map back to an array to store in the cache
    const filteredSymbols = Array.from(filteredSymbolsMap.values());

    // Log the cache content for verification
    log.write('DEBUG', `Cached tokens for ${documentUri}: ${JSON.stringify(filteredSymbols)}`);

    // Cache the filtered tokens along with the document version
    documentSymbolsCache.set(documentUri, {
        version: version,
        symbolTable: filteredSymbols,  // Store filtered tokens
    });
}

// A function to return completion items based on the tokens
function generateCompletionItems(word: string, symbolTable: SymbolEntry[]): CompletionItem[] {
    log.write('DEBUG', 'generateCompletionItems called:');
    return symbolTable.map((symbolEntry) => ({
        label: symbolEntry.name,
        kind: CompletionItemKind.Text,  // Use CompletionItemKind
        detail: `Token at line ${symbolEntry.line} [${symbolEntry.startChar}:${symbolEntry.endChar}]`,
        insertText: symbolEntry.name
    }));
}


function updateTokensForChange(
    documentUri: string,
    version: number,
    range: Range,
    newText: string
) {
    const cachedData = documentTokensCache.get(documentUri);

    if (!cachedData) {
        // Tokenize the whole document if no cached data exists
        const tokens = tokenizer(documents.get(documentUri)?.getText() || '');
        documentTokensCache.set(documentUri, {
            version: version,
            tokens: tokens,  // Store filtered tokens
        });
        cacheTokens(documentUri, version, tokens);
        return;
    }

    const { tokens } = cachedData;

    // Remove tokens within the changed range
    const updatedTokens = tokens.filter((token: Token) => !isTokenWithinRange(token, range));

    // Tokenize the new text in the range
    const newTokens = tokenizer(newText);
    
    // Merge tokens and update the cache
    const mergedTokens = [...updatedTokens, ...newTokens];
    cacheTokens(documentUri, version, mergedTokens);
}

function updateTokensForFullDocument(
    documentUri: string,
    version: number,
    newText: string
) {
    const startTime = Date.now();
    const tokens = tokenizer(newText);
    // Tokenize the entire new document
    cacheTokens(documentUri, version, tokens);

    log.write('DEBUG', `Time taken to tokenizer: ${Date.now() - startTime} ms`);
}

function isTokenWithinRange(token: Token, range: Range): boolean {
    // Check if the token is on the same line as the range
    if (token.line < range.start.line || token.line > range.end.line) {
        return false;
    }

    // If the token is on the same line as the range, check character positions
    if (token.line === range.start.line && token.line === range.end.line) {
        return token.endCharacter >= range.start.character && token.startCharacter <= range.end.character;
    } else if (token.line === range.start.line) {
        // Token starts before the end of the start line of the range
        return token.endCharacter >= range.start.character;
    } else if (token.line === range.end.line) {
        // Token ends after the start of the end line of the range
        return token.startCharacter <= range.end.character;
    }

    // If the token is between the start and end line, it's within the range
    return true;
}

// Intercept incoming messages
connection.onRequest((method, params) => {
    console.log('onRequest Received:');
    // const messageString = JSON.stringify(params);
    // console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'), '\n');
    // console.log( method, messageString, '\n');
});

connection.onNotification((method, params) => {
    console.log('onNotification Received:');
    // const messageString = JSON.stringify(params);
    // console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'), '\n');
    // console.log( method, messageString, '\n');
});


connection.onInitialize((params: InitializeParams) => {
    log.write('DEBUG', 'onInitialize Received:');
    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.'],
            },
            //hoverProvider: true,
            //documentHighlightProvider: true,
            //documentFormattingProvider: true,
            //colorProvider: true,
            //documentSymbolProvider: true,
            //definitionProvider: true,
        },
    };
    // const messageString = JSON.stringify(result);
    // console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'), '\n');
    // console.log('', messageString, '\n');
    return result;
});



process.on('message', (message: Message) => {
    // Assuming message is a string
    console.log('Message Received:');

    // const messageString = JSON.stringify(message);
    // console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'), '\n');
    // console.log('', messageString, '\n');

    // Prepare a response message
    //const response = {
    //    jsonrpc: "2.0",
    //    id: message.id || null,  // Use the message's ID if present (for JSON-RPC handling)
    //    result: { success: true, data: "Response data" } // Your response data here
    //};

    // Send the response back using process.send()
    // if (process.send) {
    //     process.send(response);
    // }
});


documents.onDidChangeContent(function handleContentChange(change) {
    console.log('onDidChangeContent/change Received:');
    const documentUri = change.document.uri;
    const documentVersion = change.document.version;
    // const contentChanges = change.contentChanges; // Array of changes
    const filePath = decodeURIComponent(documentUri.replace('file:///', ''));
    const directoryPath = path.dirname(filePath);
 
    if (log.init(directoryPath)) {
        log.write('DEBUG', `File system path: ${filePath}.`);
    }
    const document = documents.get(documentUri);
    if (!document){
        console.log("NO DOCUMENT!!!!!");
        return;
    }
 
    const startTime = Date.now();
    const tokens = tokenizer(document.getText());
    cacheTokens(documentUri, documentVersion, tokens);
    log.write('DEBUG', `Time taken to tokenizer: ${Date.now() - startTime} ms`);
 
//    // Process each change
//    contentChanges.forEach((change) => {
//        if ('range' in change) {
//            // Incremental update: process the change in the given range
//            const range: Range = change.range;
//            const newText = change.text;
// 
//            // Handle incremental change
//            updateTokensForChange(documentUri, documentVersion, range, newText);
//        } else {
//            // Full document update: the entire document has been replaced
//            const newText = change.text;
// 
//            // Handle full document replacement
//            updateTokensForFullDocument(documentUri, documentVersion, newText);
//        }
//    });
    // connection.window.showInformationMessage(
    //     "onDidChangeContent: " + change.document.uri + ", change: " + change.document.getText() 
    // );
  });


// Handle completion request
connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
    log.write('DEBUG', 'onCompletion Received:');
    const documentUri = params.textDocument.uri;
    const document = documents.get(documentUri);
    const position = params.position;

    if (!document) return [];

    // Get the tokens for this document from the cache
    //const cachedData = documentSymbolsCache.get(documentUri);
    const cachedData = documentSymbolsCache.get(documentUri);

    // If no tokens are cached, return 
    if (!cachedData) return [];

    // Generate completion items based on the cached tokens
    //return generateCompletionItems('', cachedData.symbolTable);
    return generateCompletionItems('', cachedData.symbolTable);

    // const messageString = JSON.stringify(params);
    // console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'), '\n');
    // console.log('', messageString, '\n');
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
