import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  mesh: any;
  camera: any;
  renderer: any;
  scene: any;
  controls: any;

  constructor() {
    this.init();
    this.animate();
  }

  ngOnInit() {
    var result = myAddon.loadBunny();

    var meshInfo = result[0];

    console.log('result', result);
    console.log('meshInfo', meshInfo);
    console.log('Vrows = ', meshInfo[0]);
    console.log('Frows = ', meshInfo[1]);
  }

  init() {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;

    this.scene = new THREE.Scene();

    var material = new THREE.MeshStandardMaterial( { color : 0x00cc00 } );

    var bunnyMesh = myAddon.loadBunny();

    var numVertices = bunnyMesh[0][0];
    var numFaces = bunnyMesh[0][1];

    var geometry = new THREE.Geometry();
    for (var i = 0; i < numVertices; ++i) {
      var v = bunnyMesh[i + 1];
      geometry.vertices.push(new THREE.Vector3(v[0]*100, v[1]*100, v[2]*100));
    }

    for (var i = 0; i < numFaces; ++i) {
      var f = bunnyMesh[i + 1 + numVertices];
      geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    //the face normals and vertex normals can be calculated automatically if not supplied above
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );

    var light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  animate() {
    requestAnimationFrame(() => this.animate() );

    //this.mesh.rotation.x += 0.01;
    //this.mesh.rotation.y += 0.01;

    this.renderer.render( this.scene, this.camera );
  }

}
