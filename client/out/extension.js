"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
        },
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for all documents by default
        documentSelector: [{ scheme: 'file', language: 'tal' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
        },
    };
    // Create the language client and start the client.
    client = new node_1.LanguageClient("tal-language-server", // Unique ID for the language server
    "TAL Language Server", // Human-readable name for the server
    serverOptions, clientOptions);
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
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map