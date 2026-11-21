// O package.json usa "type": "module", então a config do Babel precisa ser .cjs.
// Faz o babel-jest transpilar os `import/export` (ESM) para CommonJS durante os testes.
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
