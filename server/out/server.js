"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const path = require("path");
const log_1 = require("./log");
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Map to cache tokens for each document
let documentTokensCache = new Map();
let documentSymbolsCache = new Map();
function isNewLine(token) {
    // Check if the token is on the same line as the range
    if (token.type === 'NewLine') {
        return true;
    }
    return false;
}
// Function to filter relevant tokens (keywords, names, strings) and remove duplicates
function cacheTokens(documentUri, version, tokens) {
    log_1.default.write('DEBUG', 'cacheTokens called:');
    tokens.forEach((token) => {
        log_1.default.write('DEBUG', token);
    });
    // Cache the filtered tokens along with the document version
    documentTokensCache.set(documentUri, {
        version: version,
        tokens: tokens, // Store filtered tokens
    });
    // const filterdTokens = tokens.filter((token: Token) => !isNewLine(token));
    const symbols = (0, parser_1.default)(tokens);
    filterAndCacheSymbols(documentUri, version, symbols);
}
function filterAndCacheSymbols(documentUri, version, symbolTable) {
    log_1.default.write('DEBUG', 'filterAndCacheSymbos called:');
    // Use a Map to store tokens by their value to automatically exclude duplicates
    const filteredSymbolsMap = new Map();
    symbolTable.forEach((symbolEntry) => {
        log_1.default.write('DEBUG', symbolEntry);
        // log.write('DEBUG', `Token: ${token.type}, Value: ${token.value}, Position: ${token.position}`);
        if (!filteredSymbolsMap.has(symbolEntry.name)) {
            filteredSymbolsMap.set(symbolEntry.name, symbolEntry);
        }
    });
    // Convert the map back to an array to store in the cache
    const filteredSymbols = Array.from(filteredSymbolsMap.values());
    // Log the cache content for verification
    log_1.default.write('DEBUG', `Cached tokens for ${documentUri}: ${JSON.stringify(filteredSymbols)}`);
    // Cache the filtered tokens along with the document version
    documentSymbolsCache.set(documentUri, {
        version: version,
        symbolTable: filteredSymbols, // Store filtered tokens
    });
}
// A function to return completion items based on the tokens
function generateCompletionItems(word, symbolTable) {
    log_1.default.write('DEBUG', 'generateCompletionItems called:');
    return symbolTable.map((symbolEntry) => ({
        label: symbolEntry.name,
        kind: node_1.CompletionItemKind.Text,
        detail: `Token at line ${symbolEntry.line} [${symbolEntry.startChar}:${symbolEntry.endChar}]`,
        insertText: symbolEntry.name
    }));
}
function updateTokensForChange(documentUri, version, range, newText) {
    const cachedData = documentTokensCache.get(documentUri);
    if (!cachedData) {
        // Tokenize the whole document if no cached data exists
        const tokens = (0, tokenizer_1.default)(documents.get(documentUri)?.getText() || '');
        documentTokensCache.set(documentUri, {
            version: version,
            tokens: tokens, // Store filtered tokens
        });
        cacheTokens(documentUri, version, tokens);
        return;
    }
    const { tokens } = cachedData;
    // Remove tokens within the changed range
    const updatedTokens = tokens.filter((token) => !isTokenWithinRange(token, range));
    // Tokenize the new text in the range
    const newTokens = (0, tokenizer_1.default)(newText);
    // Merge tokens and update the cache
    const mergedTokens = [...updatedTokens, ...newTokens];
    cacheTokens(documentUri, version, mergedTokens);
}
function updateTokensForFullDocument(documentUri, version, newText) {
    const startTime = Date.now();
    const tokens = (0, tokenizer_1.default)(newText);
    // Tokenize the entire new document
    cacheTokens(documentUri, version, tokens);
    log_1.default.write('DEBUG', `Time taken to tokenizer: ${Date.now() - startTime} ms`);
}
function isTokenWithinRange(token, range) {
    // Check if the token is on the same line as the range
    if (token.line < range.start.line || token.line > range.end.line) {
        return false;
    }
    // If the token is on the same line as the range, check character positions
    if (token.line === range.start.line && token.line === range.end.line) {
        return token.endCharacter >= range.start.character && token.startCharacter <= range.end.character;
    }
    else if (token.line === range.start.line) {
        // Token starts before the end of the start line of the range
        return token.endCharacter >= range.start.character;
    }
    else if (token.line === range.end.line) {
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
connection.onInitialize((params) => {
    log_1.default.write('DEBUG', 'onInitialize Received:');
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
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
process.on('message', (message) => {
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
    if (log_1.default.init(directoryPath)) {
        log_1.default.write('DEBUG', `File system path: ${filePath}.`);
    }
    const document = documents.get(documentUri);
    if (!document) {
        console.log("NO DOCUMENT!!!!!");
        return;
    }
    const startTime = Date.now();
    const tokens = (0, tokenizer_1.default)(document.getText());
    cacheTokens(documentUri, documentVersion, tokens);
    log_1.default.write('DEBUG', `Time taken to tokenizer: ${Date.now() - startTime} ms`);
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
connection.onCompletion((params) => {
    log_1.default.write('DEBUG', 'onCompletion Received:');
    const documentUri = params.textDocument.uri;
    const document = documents.get(documentUri);
    const position = params.position;
    if (!document)
        return [];
    console.log("paso1");
    // Get the tokens for this document from the cache
    //const cachedData = documentSymbolsCache.get(documentUri);
    const cachedData = documentSymbolsCache.get(documentUri);
    console.log("paso2");
    // If no tokens are cached, return 
    if (!cachedData)
        return [];
    console.log("paso3");
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
//# sourceMappingURL=server.js.map