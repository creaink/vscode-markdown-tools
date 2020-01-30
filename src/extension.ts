// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { worker } from 'cluster';

const imgFileType = [
	"png",
	"jpg",
	"jpeg",
	"bmp",
	"gif"
]

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-tools" is now active!');

	/**
	 * 判断 uri 是否是当前正编辑的文件
	 * @param uri context uri
	 */
	function uriIsActiveEditor(uri: vscode.Uri) {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) return activeEditor.document.fileName == uri.fsPath;
		else return false;
	}


	/**
	 * 从路径当中获取文件名
	 * @param relWorkspacePath 相对于 Workspace 的文件路径
	 */
	function getReferLinkFromRelWorkspacePath(relWorkspacePath: string) {
		let fileName = relWorkspacePath.replace(/^.*[\\\/]/, '');
		return `[${fileName}](/${relWorkspacePath})`
	}

	/**
	 * 获取当前文件的参考链接
	 * 如果是 md 文件是激活当前文件，1、当前行是合法标题，则返回标题作为链接，2、否则返回整个文件作为链接
	 * 如果是其他类型文件，从文件管理或者当前激活，返回文件链接
	 */
	function getActiveFileReferLink() {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) return null;

		let relWorkspacePath = vscode.workspace.asRelativePath(activeEditor.document.fileName);
		const langId = activeEditor.document.languageId.toLowerCase();

		if (langId == 'markdown') {
			const curLinePosition = activeEditor.selection.active;

			let curLineSelection = new vscode.Selection(curLinePosition.with(curLinePosition.line, 0),
				curLinePosition.with(curLinePosition.line + 1, 0));
			let curLineText = activeEditor.document.getText(curLineSelection).replace(/[\n\r]/g, '');
			if (curLineText.startsWith("#")) {
				// markdown 标题的链接
				let herfName = curLineText.replace(/^#+\s/, '');
				// delete dummy '#', replace no-first ' ' with '-'
				let herfLinkShort = curLineText.replace(/(#)\1+\s/, '$1').replace(/\s/g, '-');
				let herfLinkLong = '/' + relWorkspacePath + herfLinkShort;
				let herf = `[${herfName}](${herfLinkLong})`;
				return herf;
			} else {
				return getReferLinkFromRelWorkspacePath(relWorkspacePath);
			}
		} else {
			return getReferLinkFromRelWorkspacePath(relWorkspacePath);
		}
	}

	/**
	 * copyReferLink command handler
	 * @param uri context uri
	 */
	function copyReferLink(uri?: vscode.Uri) {
		var referLink = null;
		if (uri instanceof vscode.Uri) {
			if (uriIsActiveEditor(uri)) {
				// 当前操作的为正在编辑的文件
				referLink = getActiveFileReferLink();
			} else {
				// 非当前编辑文件，即文件浏览器
				let relWorkspacePath = vscode.workspace.asRelativePath(uri.path);
				let fileType = relWorkspacePath.split('.').pop();
				if (fileType && imgFileType.includes(fileType)) {
					// 如果是图片加上 ! 的格式，图片查看界面不能右键菜单
					referLink = '!' + getReferLinkFromRelWorkspacePath(relWorkspacePath);
				} else {
					referLink = getReferLinkFromRelWorkspacePath(relWorkspacePath);
				}
			}
			if (referLink != null) vscode.env.clipboard.writeText(referLink);
		}
		if (referLink == null) {
			vscode.window.showInformationMessage('Error occurred when copy markdown refer link!');
		}
	}

	// 注册 command
	context.subscriptions.push(
		vscode.commands.registerCommand("markdown-tools.copyReferLink", copyReferLink),
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
