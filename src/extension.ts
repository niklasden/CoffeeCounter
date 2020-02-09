'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { posix } from 'path';
import * as _ from "lodash";

let coffeemugitem: vscode.StatusBarItem;
var currentdrink: any = '';
/* Read local.json file to keep track of changes
*/

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "coffeecounter" is now active!');
	var currentdrink = vscode.workspace.getConfiguration().get('drink');
	console.log(`The current drink is `+currentdrink);
	
	//this function updates the currentdrink on changes to the Config file
	vscode.workspace.onDidChangeConfiguration( event => {
		if (event.affectsConfiguration('drink')) {
			currentdrink = vscode.workspace.getConfiguration().get('drink');
			vscode.window.showInformationMessage('You changed your drink to '+currentdrink);
		}
	});

	if (!vscode.workspace.workspaceFolders) {
		return vscode.window.showInformationMessage('No folder or workspace opened!');
	}

	const folderUri = vscode.workspace.workspaceFolders[0].uri;
	const fileUri = folderUri.with({ path: posix.join(folderUri.path, 'drinks.json') });
	var count = 0;

	//writes initial json file so we can keep track of how much coffee we have
	var writeinitial = () => {
		vscode.window.showInformationMessage("Drinks file wasn't there so I created it!");
		const msg = '{"coffee": {"counter": 0},"tea": {"counter": 0},"water": {"counter": 0},"coke": {"counter": 0},"beer": {"counter": 0},"redbull": {"counter": 0}}';
		var jsonObj = JSON.parse(msg);
		var jsonStr = JSON.stringify(jsonObj);
		var buf = Buffer.from(jsonStr, "utf-8");
		vscode.workspace.fs.writeFile(fileUri, buf);
	};

	//runs initially to check if a file exists and updates local variable.
	var readFileasync = async () => {
		var readData = await vscode.workspace.fs.readFile(fileUri);
		var readStr = Buffer.from(readData).toString('utf-8');
		var drinksjson = JSON.parse(readStr);
		updatecount(drinksjson);
		vscode.window.showInformationMessage(`I was able to read the storage file. Enjoy your Drinks!😄`);
	};

	//gets launched when the coffemug is pressed, reads in the file, increases the counter, then writes it & updates the local variable
	var increasedrink = async () => {
		var readData = await vscode.workspace.fs.readFile(fileUri);
		var readStr = Buffer.from(readData).toString('utf-8');
		var drinksjson = JSON.parse(readStr);
		var incrcount = _.get(drinksjson, [`${currentdrink}`, 'counter']);
		incrcount += 1;
		_.set(drinksjson, [`${currentdrink}`, 'counter'], incrcount);
		var jsonStr = JSON.stringify(drinksjson);
		var buf = Buffer.from(jsonStr, "utf-8");
		vscode.workspace.fs.writeFile(fileUri, buf);
		updatecount(drinksjson);
	};

	//Updates the local counter with the contents of the json file
	var updatecount = (drinksjson: any) => {
		count = _.get(drinksjson, [`${currentdrink}`, 'counter']);
	};

	//This checks if the drinks.json file exists, in case it doesnt it gets written to the filesystem
	readFileasync().catch(error => writeinitial());

	const mycommand = 'sample.showCoffeeCount';
	subscriptions.push((vscode.commands.registerCommand(mycommand, () => {
		increasedrink();
		vscode.window.showInformationMessage(`You had, ${count} ${currentdrink}!`);
	})));

	// create new status bar item that we can now manage
	coffeemugitem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
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

// this method is called when your extension is deactivated
export function deactivate() { }
