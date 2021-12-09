import * as vscode from 'vscode';
const tinify = require("tinify");
const path = require("path");
const fs = require("fs");
const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");

// the quality of the webp image
let imageQuantity: unknown;

// compress image
const compressImage = (image: any, folderPath?: string) => {
	const shouldOverwrite = vscode.workspace
		.getConfiguration('tinypng')
		.get('forceOverwrite');
	// defines this storage address after image compression
	let destinationImagePath = image.fsPath;
	const parsedPath = path.parse(image.fsPath);
	if (!shouldOverwrite) {
		const dirname = parsedPath.dir;
		if (folderPath) {
			destinationImagePath = path.join(folderPath, 'image-min');
		} else {
			destinationImagePath = path.join(dirname, 'image-min');
		}
		if (!fs.existsSync(destinationImagePath)) {
			fs.mkdir(destinationImagePath, (err: any) => {
				if (err) {
					console.log('Failed to create a folder');
				} else {
					console.log('successed to create a folder');
				}
			});
		}
		destinationImagePath = path.join(destinationImagePath, parsedPath.base);
	}
	// show now is compressing
	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left
	);
	statusBarItem.text = `Compressing file ${image.fsPath}...`;
	statusBarItem.show();
	return tinify.fromFile(image.fsPath).toFile(destinationImagePath, (err: any) => {
		statusBarItem.hide();
		if (err) {
			// Verify your API key and account limit.
			if (err instanceof tinify.AccountError) {
				console.log("The error message is: " + err.message);
				vscode.window.showErrorMessage(
					'Authentication failed. Have you set the API Key?'
				);
			} else if (err instanceof tinify.ClientError) {
				// Check your source image and request options.
				console.log("The error message is: " + err.message);
				vscode.window.showErrorMessage(
					'Ooops, there is an error. Please check your source image and settings.'
				);
			} else if (err instanceof tinify.ServerError) {
				// Temporary issue with the Tinify API.
				console.log("The error message is: " + err.message);
				vscode.window.showErrorMessage(
					'TinyPNG API is currently not available.'
				);
			} else if (err instanceof tinify.ConnectionError) {
				// A network connection error occurred.
				console.log("The error message is: " + err.message);
				vscode.window.showErrorMessage(
					'Network issue occurred. Please check your internet connectivity.'
				);
			} else {
				// Something else went wrong, unrelated to the Tinify API.
				console.error(err.message);
				vscode.window.showErrorMessage(err.message);
			}
		} else {
			// compress successfully
			vscode.window.showInformationMessage(
				`Successfully compressed ${image.fsPath} to ${destinationImagePath}!`
			);
		}

	});
};

const validate = (
	onSuccess = () => { },
	onFailure = (e: any) => { }
) =>
	tinify.validate(function (err: any) {
		if (err) {
			onFailure(err);
		} else {
			onSuccess();
		}
	});

// convert the image to the webp format
const convertToWebp = async (image: any, folderPath?: string) => {
	try {
		const dirname = path.dirname(image.fsPath);
		let destinationImagePath;
		if (folderPath) {
			destinationImagePath = path.join(folderPath, 'webp');
		} else {
			destinationImagePath = path.join(dirname, 'webp');
		}
		// show now is compressing
		const statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left
		);
		statusBarItem.text = `Compressing file ${image.fsPath}...`;
		statusBarItem.show();
		await imagemin([image.fsPath], {
			glob: false,
			destination: destinationImagePath,
			plugins: [imageminWebp({ quality: imageQuantity })]
		});
		statusBarItem.hide();
		const parsedPath = path.parse(image.fsPath);
		vscode.window.showInformationMessage(
			`Successfully convert ${image.fsPath} to ${destinationImagePath + '\\' + parsedPath.name + '.webp'}!`
		);
	} catch (e) {
		console.log('convert fail', e);
		vscode.window.showErrorMessage('Ooops, there is an error. Please check your source image and settings.');
	}
};

export function activate(context: vscode.ExtensionContext) {
	tinify.key = vscode.workspace.getConfiguration("tinypng").get("apiKey") || "";
	imageQuantity = vscode.workspace.getConfiguration("compress").get("webpQuality") || 50;

	// Validate user
	validate(
		() => console.log('Validation successful!'),
		(e) => {
			console.error(e.message, "validate user fail");
			vscode.window.showInformationMessage(
				'TinyPNG: API validation failed. Be sure that you filled out tinypng.apiKey setting already.'
			);
		}
	);

	// compress image
	const compressImageDisposable = vscode.commands.registerCommand('extension.compressImage', (image) => {
		compressImage(image);
	});
	context.subscriptions.push(compressImageDisposable);

	// compress image folder
	const compressImageFolderDisposable = vscode.commands.registerCommand('extension.compressImageFolder',  (folder) => {
		vscode.workspace.
			findFiles(new vscode.RelativePattern(
				folder.fsPath,
				`**/*.{png,jpg,jpeg}`
			))
			.then((files) => files.forEach((file) => {
				compressImage(file, folder.fsPath);
			}));
	});
	context.subscriptions.push(compressImageFolderDisposable);

	// convert image to webp
	const convertToWebpDisposable = vscode.commands.registerCommand('extension.convertToWebp', (image) => {
		convertToWebp(image);
	});
	context.subscriptions.push(convertToWebpDisposable);

	// compress image folder to webp
	const convertFolderToWebpDisposable = vscode.commands.registerCommand('extension.convertFolderToWebp', (folder) => {
		vscode.workspace.
			findFiles(new vscode.RelativePattern(
				folder.fsPath,
				`**/*.{png,jpg,jpeg}`
			))
			.then((files) => files.forEach((file) => {
				convertToWebp(file, folder.fsPath);
			}));
	});
	context.subscriptions.push(convertFolderToWebpDisposable);

	// get compress surplus count
	const getCompressUsedCountDisposable = vscode.commands.registerCommand('extension.getCompressUsedCount', () => {
		validate(
			() => {
				vscode.window.showInformationMessage(
					`TinyPNG: You already used ${tinify.compressionCount} compression(s) this month.`
				);
			}
		);
	});
	context.subscriptions.push(getCompressUsedCountDisposable);
}

export function deactivate() {
	console.log("deactivate");
}
