function testOut() {
    console.log("testOut called");
}

const myAddon = require('../src/addon/build/Release/addon.node');
const loadedMesh = myAddon.loadBunny();