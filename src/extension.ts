// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-tools" is now active!');

    function copyReferLink(uri?: vscode.Uri) {
		var isFailed = true;
		if (uri instanceof vscode.Uri) {
			var relPath = vscode.workspace.asRelativePath(uri.path);
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				const curLinePosition = activeEditor.selection.active;

				let curLineSelection = new vscode.Selection(curLinePosition.with(curLinePosition.line, 0),
															curLinePosition.with(curLinePosition.line+1, 0));
				let curLineText = activeEditor.document.getText(curLineSelection).replace(/[\n\r]/g,'');
				if (curLineText.includes("#")) {
					let herfName = curLineText.replace(/^#+\s/, '');
					// delete dummy '#', replace no-first ' ' with '-'
					let herfLinkShort = curLineText.replace(/(#+)(\1)\s/, '$2').replace(/\s/g, '-');
					let herfLinkLong = '/' + relPath + herfLinkShort;
					let herf = `[${herfName}](${herfLinkLong})`;
					vscode.env.clipboard.writeText(herf);
					isFailed = false;
				}
			}
		}
		if (isFailed) {
			vscode.window.showInformationMessage('Error occurred when copy markdown refer link!');
		}
	}

	// 注册 command
	context.subscriptions.push(
        vscode.commands.registerCommand(
            "markdown-tools.copyReferLink",
            copyReferLink,
        ),
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
