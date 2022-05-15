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

		let output: string;		// let success = true;
		try {
			output = await execShell(test.testCommand);
		} catch(e) {
			let ee = e as cp.ExecException;
			output = ee.message;
		}

		for (const hint of test.hints) {
			let regex = new RegExp(hint.pattern, 'gm');
			let matches = output.matchAll(regex);

			for (const match of matches) {
				console.log(`Found "${match[0]}" start=${match.index} end=${match.index! + match[0].length}.`);

				vscode.window.showInformationMessage(hint.message + " // " + `"${match[0]}" start=${match.index} end=${match.index! + match[0].length}`);
			}
		}
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

export function deactivate() { }
