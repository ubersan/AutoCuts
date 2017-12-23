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
    var vRows = myAddon.loadBunny();
    console.log('Vrows = ', vRows);
  }

  init() {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 200, 200, 200 );
    var material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh( geometry, material );
    this.scene.add( this.mesh );

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  animate() {
    requestAnimationFrame(() => this.animate() );

    //this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;

    this.renderer.render( this.scene, this.camera );
  }

}
