"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const path = require("path");
const log_1 = require("./log");
const tokenizer_1 = require("./tokenizer");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection;
connection.onInitialize((params) => {
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            //completionProvider: {
            //resolveProvider: true,
            //triggerCharacters: ['$', '{'],
            //},
            //hoverProvider: true,
            //documentHighlightProvider: true,
            //documentFormattingProvider: true,
            //colorProvider: true,
            //documentSymbolProvider: true,
            //definitionProvider: true,
        },
    };
    return result;
});
process.on('message', (message) => {
    // Assuming message is a string
    const messageString = JSON.stringify(message);
    console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'), '\n');
    console.log('', messageString, '\n');
});
documents.onDidChangeContent((change) => {
    const filePath = decodeURIComponent(change.document.uri.replace('file:///', ''));
    const directoryPath = path.dirname(filePath);
    const startTime = Date.now();
    if (log_1.default.init(directoryPath)) {
        log_1.default.write('DEBUG', `File system path: ${filePath}.`);
    }
    log_1.default.write('DEBUG', change.document.getText());
    log_1.default.write('DEBUG', (0, tokenizer_1.default)(change.document.getText()));
    log_1.default.write('DEBUG', `Time taken to tokenizer: ${Date.now() - startTime} ms`);
    //connection.window.showInformationMessage(
    //  "onDidChangeContent: " + change.document.uri + ", change: " + change.document.getText() 
    //);
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map