import * as path from "path";
import * as vscode from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for all documents by default
    documentSelector: [{ scheme: 'file', language: '*' }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "REPLACE_ME language-server-id",
    "REPLACE_ME language server name",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // // Trigger suggestions on each keystroke by executing the command to open suggestions
  // vscode.workspace.onDidChangeTextDocument((event) => {
  //   const editor = vscode.window.activeTextEditor;
  //   
  //   // Make sure we are working with the correct document
  //   if (editor && editor.document === event.document) {
  //       // Trigger the suggestion manually after each keystroke
  //       vscode.commands.executeCommand('editor.action.triggerSuggest');
  //   }
  // });

}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
