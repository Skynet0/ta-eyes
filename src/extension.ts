import * as vscode from 'vscode';

import * as cp from "child_process";

const execShell = (cmd: string) =>
	new Promise<string>((resolve, reject) => {
		cp.exec(cmd, (err, out) => {
			if (err) {
				return reject(err);
			}
			return resolve(out);
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
	let readHintConfig = vscode.commands.registerCommand('ta-eyes.readHintConfig', () => {
		let f: string | null | undefined = vscode.workspace.getConfiguration('ta-eyes').get('patternFile');
		if (f === null || typeof f === 'undefined') {
			vscode.window.showErrorMessage("ta-eyes.patternFile is null or not defined");
			return;
		}
		let config: TaEyesConfig = require(f);
		console.log(config);
	});

	let useTaEyes = vscode.commands.registerCommand('ta-eyes.runTest', async () => {
		let f: string | null | undefined = vscode.workspace.getConfiguration('ta-eyes').get('patternFile');
		if (f === null || typeof f === 'undefined') {
			vscode.window.showErrorMessage("ta-eyes.patternFile is null or not defined");
			return;
		}
		let config: TaEyesConfig = require(f);
		let testName = (await vscode.window.showQuickPick(config.tests.map(t => t.name)))![0];
		let test = config.tests.find(t => t.name === testName)!;

		let output: string;
		let success = true;
		try {
			output = await execShell(test.testCommand);
		} catch(e) {
			let ee = e as cp.ExecException;
			output = ee.message;
		}

		console.log(output);
	});

	context.subscriptions.push(readHintConfig);
}

export function deactivate() { }
