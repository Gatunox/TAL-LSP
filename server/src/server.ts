import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
} from "vscode-languageserver/node";
import * as path from 'path';
import log from './log';
import { Token } from './helper';

import tokenizer from './tokenizer';

import { TextDocument } from "vscode-languageserver-textdocument";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection

connection.onInitialize((params: InitializeParams) => {
  
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
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

  console.log('Content-Length:', Buffer.byteLength(messageString, 'utf8'),'\n');
  console.log('', messageString,'\n');
});

documents.onDidChangeContent(function handleContentChange(change) {
  const filePath = decodeURIComponent(change.document.uri.replace('file:///', ''));
  const directoryPath = path.dirname(filePath);

  const startTime = Date.now();

  if (log.init(directoryPath)) {
    log.write('DEBUG', `File system path: ${filePath}.`); 
  }
  log.write('DEBUG', change.document.getText());
  const tokens = tokenizer(change.document.getText());
//  tokens.forEach((token: string) => log.write('DEBUG', JSON.stringify(token)));
  tokens.forEach((token: Token) => log.write('DEBUG', token));  
//  log.write('DEBUG', JSON.stringify(tokenizer(change.document.getText())));
  log.write('DEBUG', `Time taken to tokenizer: ${Date.now() - startTime} ms`);
  
  //connection.window.showInformationMessage(
  //  "onDidChangeContent: " + change.document.uri + ", change: " + change.document.getText() 
  //);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
