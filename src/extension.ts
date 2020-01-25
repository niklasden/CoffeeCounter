// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
var path=require('path');

let coffeemugitem: vscode.StatusBarItem;
let count = 1;

/* Read local.json file to keep track of changes
   Currently the file is not created :/
*/
const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'safsa.txt'));
vscode.workspace.openTextDocument(newFile).then(document => {
    const edit = new vscode.WorkspaceEdit();
    edit.insert(newFile, new vscode.Position(0, 0), "Hello world!");
    return vscode.workspace.applyEdit(edit).then(success => {
        if (success) {
            vscode.window.showTextDocument(document);
        } else {
            vscode.window.showInformationMessage('Error!');
        }
    });
});


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "coffeecounter" is now active!');

	const mycommand = 'sample.showCoffeeCount';
	subscriptions.push((vscode.commands.registerCommand(mycommand, () => {
		vscode.window.showInformationMessage(`You had, ${count} coffee!`);
		drinkCoffee();
	})));

	// create new status bar item that we can now manage
	coffeemugitem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right,100);
	coffeemugitem.command = mycommand;
	subscriptions.push(coffeemugitem);

	//register listener to make sure the status bar
	//item is always up-to-date
	subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateCoffeeMug));
	subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateCoffeeMug));
	
	//update status bar item once at start
	updateCoffeeMug();
}

function updateCoffeeMug(): void {
	coffeemugitem.text = `☕`;
	coffeemugitem.show();
}

function drinkCoffee():void {
	count = count + 1;
}


// this method is called when your extension is deactivated
export function deactivate() {}
