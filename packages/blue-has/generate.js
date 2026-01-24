#!/usr/bin/env node
const path = require('path'),
    fs = require('fs'),
    YAML = require('yamljs'),
    apiDir = path.join(__dirname, 'api'),
    srcDir = path.join(__dirname, 'src'),
    javaScriptDir = path.join(srcDir, 'javascript'),
    nodeDir = path.join(srcDir, 'node'),
    webDir = path.join(srcDir, 'web'),
    javaScriptFeatures = YAML.load(path.join(apiDir, 'javascript-features.yaml')),
    nodeFeatures = YAML.load(path.join(apiDir, 'node-features.yaml')),
    webFeatures = YAML.load(path.join(apiDir, 'web-features.yaml'));

const keys = Object.keys,
    isNativeType = (type, value) => typeof value === type,
    isNotADirective = (value) => value.indexOf('$') === -1,
    isNotIgnored = (value) => !value.startsWith('~'),
    isNotADirectiveAndNotIgnored = (value) => isNotADirective(value) && isNotIgnored(value),
    isUndefined = isNativeType.bind(this, 'undefined'),
    hasPrototype = /_prototype_/,
    createId = (namespace) => namespace.join('_').toLowerCase().replace(hasPrototype, '_');

function walk(features, callback, namespace = []) {
    const featureKeys = keys(features).filter(isNotADirectiveAndNotIgnored),
        length = featureKeys.length;

    if (length) {
        let index = 0;
        for (; index < length; index++) {
            const featureKey = featureKeys[index],
                featureValue = features[featureKey],
                featureType = featureValue['$type'];

            if (!isUndefined(featureType)) {
                //const id = createId( namespace, featureKey );
                namespace.push(featureKey);

                callback(namespace, featureType);

                if (featureKey === 'prototype' || featureType === 'object') {
                    walk(featureValue, callback, namespace);
                } else if (keys(featureValue).length > 0) {
                    walk(featureValue, callback, namespace);
                }

                namespace.pop();
            }
        }
    }
}

const generateDetection = (stream, api) => {
    stream.write('/* eslint-disable no-undef */\n');
    stream.write("import { defineDetector } from '../has';\n\n");
    stream.write('// Generated file. Do not edit!\n\n');
    stream.write('export default () => {\n');
    walk(api, function (namespace, type) {
        const id = createId(namespace),
            dependency = createId(namespace.slice(0, namespace.length - 1)),
            feature = namespace.join('.');
        stream.write('\t// @ts-ignore Detecting a feature that may not be supported by TypeScript\n');
        if (namespace.length > 1) {
            stream.write(
                `\tdefineDetector( '${id}', ( has ) => has.${dependency} && typeof ${feature} === '${type}' );\n`
            );
        } else {
            stream.write(`\tdefineDetector( '${id}', () => typeof ${feature} === '${type}' );\n`);
        }
    });
    stream.write('};\n');
    stream.end();
};

const generateInterface = (stream, api, interface) => {
    stream.write('// Generated file. Do not edit!\n\n');
    stream.write(`export interface ${interface} {\n`);
    walk(api, function (namespace) {
        stream.write(`    ${createId(namespace)}?: boolean;\n`);
    });
    stream.write('}\n');
    stream.write(`\n/**\n * @interface module:has.${interface}\n */\n`);
    walk(api, function (namespace, type) {
        stream.write(
            `\n/**\n * Whether or not \`${namespace.join('.')}\` is of type \`${type}\`.\n * @member {external:boolean} module:has.${interface}#${createId(namespace)}\n */\n`
        );
    });
    stream.end();
};

const javaScriptDeclaration = fs.createWriteStream(path.join(srcDir, 'javascript-features.ts'), {
        encoding: 'UTF-8',
    }),
    javaScriptDetection = fs.createWriteStream(path.join(javaScriptDir, 'detect-features.ts'), {
        encoding: 'UTF-8',
    });

generateDetection(javaScriptDetection, javaScriptFeatures);
generateInterface(javaScriptDeclaration, javaScriptFeatures, 'JavaScriptFeatures');

const nodeDeclaration = fs.createWriteStream(path.join(srcDir, 'node-features.ts'), {
        encoding: 'UTF-8',
    }),
    nodeDetection = fs.createWriteStream(path.join(nodeDir, 'detect-features.ts'), {
        encoding: 'UTF-8',
    });

generateDetection(nodeDetection, nodeFeatures);
generateInterface(nodeDeclaration, nodeFeatures, 'NodeFeatures');

const webDeclaration = fs.createWriteStream(path.join(srcDir, 'web-features.ts'), {
        encoding: 'UTF-8',
    }),
    webDetection = fs.createWriteStream(path.join(webDir, 'detect-features.ts'), {
        encoding: 'UTF-8',
    });

generateDetection(webDetection, webFeatures);
generateInterface(webDeclaration, webFeatures, 'WebFeatures');
