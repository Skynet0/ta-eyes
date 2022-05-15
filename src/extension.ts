import * as vscode from 'vscode';

import * as cp from "child_process";
import path = require('path');

const execShell = (cmd: string) =>
	new Promise<string>((resolve, reject) => {
		cp.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				return reject(err);
			}
			return resolve(stdout + "\n" + stderr);
		});
	});

interface Hint {
	pattern: string;
	message: string;
}

interface TaEyeTest {
	name: string;
	testCommand: string;
	hints: Array<Hint>;
}

interface TaEyesConfig {
	tests: Array<TaEyeTest>;
}

export function activate(context: vscode.ExtensionContext) {
	let readHintConfig = vscode.commands.registerCommand('ta-eyes.readHintConfig', async () => {
		let f: string | null | undefined = vscode.workspace.getConfiguration('ta-eyes').get('patternFile');
		if (f === null || typeof f === 'undefined') {
			vscode.window.showErrorMessage("ta-eyes.patternFile is null or not defined");
			return;
		}

		f = path.join(vscode.workspace.workspaceFolders![0].uri.path, f);
		let config: TaEyesConfig = JSON.parse(await vscode.workspace.openTextDocument(f).then(d => d.getText()));
		console.log(config);
	});

	let useTaEyes = vscode.commands.registerCommand('ta-eyes.runTest', async () => {
		let f: string | null | undefined = vscode.workspace.getConfiguration('ta-eyes').get('patternFile');
		if (f === null || typeof f === 'undefined') {
			vscode.window.showErrorMessage("ta-eyes.patternFile is null or not defined");
			return;
		}
		f = path.join(vscode.workspace.workspaceFolders![0].uri.path, f);
		let config: TaEyesConfig = JSON.parse(await vscode.workspace.openTextDocument(f).then(d => d.getText()));

		let testName = (await vscode.window.showQuickPick(config.tests.map(t => t.name)))!;
		let test = config.tests.find(t => t.name === testName)!;

		let output: string;
		try {
			output = await execShell(test.testCommand);
		} catch(e) {
			let ee = e as cp.ExecException;
			output = ee.message;
		}

		for (const hint of test.hints) {
			let regex = new RegExp(hint.pattern, 'gm');
			let matches = output.matchAll(regex);
			let replaced = "";
			let lastIndex = 0;

			for (const match of matches) {
				replaced += output.slice(lastIndex, match.index) +
					`<span class="highlight">` +
					output.slice(match.index, match.index! + match[0].length) +
					`</span>` +
					`<span class="hint">` + hint.message + `</span>`;
				lastIndex = match.index! + match[0].length;
				console.log(`Found "${match[0]}" start=${match.index} end=${match.index! + match[0].length}.`);
			}
			replaced += output.slice(lastIndex);
			output = replaced;
		}

		const panel = vscode.window.createWebviewPanel(
			'taEyes',
			'TA Eyes: ' + testName,
			vscode.ViewColumn.Beside
		);
		panel.webview.html = baseWebviewContent(output);
	});

	let pwd = vscode.commands.registerCommand('ta-eyes.pwd', async () => {
		let output = await execShell("pwd");
		console.log(output);
	});

	context.subscriptions.push(pwd);
	context.subscriptions.push(readHintConfig);
	context.subscriptions.push(useTaEyes);

	process.chdir(vscode.workspace.workspaceFolders![0].uri.path);
}

function escapeHtml(text: string) {
	return text.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#039;');
}

function baseWebviewContent(content: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		pre {
			padding-left: 200px;
		}

    pre > span.hint {
      position: absolute;
      left: 25px;
      width: 150px;
      text-align: center;
			white-space: normal;
			color: var(--vscode-editorInfo-foreground);
    }

		pre > span.highlight {
			background-color: var(--vscode-editorWarning-foreground);
		}
	</style>
</head>
<body>
	<pre>
  ${content}
	</pre>
</body>
</html>`;
}

export function deactivate() { }
