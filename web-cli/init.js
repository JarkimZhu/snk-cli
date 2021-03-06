/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const {
  listTemplatesAndExit,
    createProjectFromTemplate,
} = require('../local-cli/generator/templates');
const execSync = require('child_process').execSync;
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const process = require('process');
const yarn = require('../local-cli/util/yarn');
const chalk = require('chalk');

/**
 * Creates the template for a React Native project given the provided
 * parameters:
 * @param projectDir Templates will be copied here.
 * @param argsOrName Project name or full list of custom arguments
 *                   for the generator.
 * @param options Command line options passed from the react-native-cli directly.
 *                E.g. `{ version: '0.43.0', template: 'navigation' }`
 */
function init(projectDir, argsOrName) {
    const args = Array.isArray(argsOrName)
        ? argsOrName // argsOrName was e.g. ['AwesomeApp', '--verbose']
        : [argsOrName].concat(process.argv.slice(4)); // argsOrName was e.g. 'AwesomeApp'

    // args array is e.g. ['AwesomeApp', '--verbose', '--template', 'navigation']
    if (!args || args.length === 0) {
        console.error('react-native init requires a project name.');
        return;
    }

    const newProjectName = args[0];
    const options = minimist(args);

    if (listTemplatesAndExit(newProjectName, options)) {
        // Just listing templates using 'react-native init --template'
        // Not creating a new app.
        return;
    } else {
        console.log('Setting up new SNK app in ' + projectDir);
        generateProject(projectDir, newProjectName, options);
    }
}

/**
 * Generates a new React Native project based on the template.
 * @param Absolute path at which the project folder should be created.
 * @param options Command line arguments parsed by minimist.
 */
function generateProject(destinationRoot, newProjectName, options) {

    const yarnVersion =
        (!options.npm) &&
        yarn.getYarnVersionIfAvailable() &&
        yarn.isGlobalCliUsingYarn(destinationRoot);

    createProjectFromTemplate(destinationRoot, newProjectName, options.template, yarnVersion);

    const absoluteProjectDir = path.resolve(destinationRoot);
    console.log(chalk.white.bold('To run your app:'));
    console.log('   cd ' + absoluteProjectDir);
    console.log('   npm start');
}

/**
 * Add Jest-related stuff to package.json, which was created by the react-native-cli.
 */
function addJestToPackageJson(destinationRoot) {
    var packageJSONPath = path.join(destinationRoot, 'package.json');
    var packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));

    packageJSON.scripts.test = 'jest';
    packageJSON.jest = {
        preset: 'react-native'
    };
    fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, '\t'));
}

module.exports = init;
