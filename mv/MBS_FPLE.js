/**
 *  @file    MBS - FPLE MV
 *  @author  Masked
 *  @version 0.1-beta 2016/02/11
 */
/*:
 *  @plugindesc This plugin makes your game a first person labyrinth explorer.
 *	
 *  @author Masked
 *
 *  @param View Distance
 *  @desc The amount of tiles ahead the player can see by default. 
 *  (Changeable in-game).
 *  @default 100
 *  
 *  @param Wall Terrain
 *  @desc  The ID for wall tiles terrain tag on FPLE tilesets.
 *  @default 1
 *  
 *  @param Ceiling Region
 *  @desc  The Region ID for ceiled tiles.
 *  @default 0
 *
 *  @help 
 *  #
 *                       First Person Labyrinth Explorer
 *                                  by Masked
 *
 *  This plugin makes your game a kind of 3D so it looks like a first person
 *  labyrinth explorer.
 *
 *
 *                                 How to use
 *
 *  1. Setup
 *
 *  I really recommend you using the Demo as a base for creating your FPLE
 *  projects. 
 *  If you create the project from scratch, however, you'll need to download
 *  three.min.js by yourself from http://threejs.org/build/three.min.js and
 *  save it at your project's "js/libs" folder.
 *
 *  2. Textures
 *
 *  Textures can be set by creating a file named "{tileset}_{row}{col}",
 *  replacing '{tileset}' by the FPLE tileset on the database and '{row}' and
 *  '{col}' with, respectively, the row and column the tile you are texturing
 *  is on the tileset's A5 layer, and placing it at your game's img/textures
 *  folder.
 *  There's no maximum/minimum size for the textures, but keep in mind that 
 *  textures above 1024px might not make a difference at all and will be just
 *  a waste of resources.
 *
 *  3. Tilesets
 * 
 *  Setting tilesets up for FPLE is quite simple: first, create the tileset 
 *  and set just the A5 layer (which is, currently, the only one supported by
 *  FPLE). Then, you can set passability flags as you want, and mark wall
 *  tiles with terrain tag 7 (or other, depending on your plugin settings).
 *
 *                                   Credits
 *
 *  - Masked, for creating;
 *  - three.js team (https://github.com/mrdoob/three.js/graphs/contributors), 
 *    for their aweasome library.
 */

var Imported = Imported || {};

// This plugin uses three.js (http://threejs.org/).
if (!THREE)
    throw new error("Couldn't find three.js (did you forget to include it on" +
            "your index.html?).");

var MBS = MBS || {};
MBS.FPLE = {};

"use strict";

//-----------------------------------------------------------------------------
// MBS.FPLE
// 
// Module used for FPLE's generic functions
//
(function ($) {

    // Parameter loading
    var params = PluginManager.parameters('FPLE');

    $.Params = {};
    $.Params.viewDistance = Number(params['View Distance']);
    $.Params.wallTerrain = Number(params['Wall Terrain']);
    $.Params.ceilRegion  = Number(params['Ceiling Region']);

    // Cube UV map.
    // Don't change this unless you are really sure of what you're doing.
    $.cubeMap = [
       [
           new THREE.Vector2(1, 1),
           new THREE.Vector2(0, 1),
           new THREE.Vector2(0, 0),
           new THREE.Vector2(1, 0)
       ],
       [
           new THREE.Vector2(0, 0),
           new THREE.Vector2(1, 0),
           new THREE.Vector2(1, 1),
           new THREE.Vector2(0, 1)
       ],
       [
           new THREE.Vector2(1, 0),
           new THREE.Vector2(1, 1),
           new THREE.Vector2(0, 1),
           new THREE.Vector2(0, 0)
       ],
       [
           new THREE.Vector2(0, 1),
           new THREE.Vector2(0, 0),
           new THREE.Vector2(1, 0),
           new THREE.Vector2(1, 1)
       ],
       [
           new THREE.Vector2(0, 0),
           new THREE.Vector2(1, 0),
           new THREE.Vector2(1, 1),
           new THREE.Vector2(0, 1)
       ],
       [
           new THREE.Vector2(0, 0),
           new THREE.Vector2(1, 0),
           new THREE.Vector2(1, 1),
           new THREE.Vector2(0, 1)
       ]
    ];
    
})(MBS.FPLE);

//-----------------------------------------------------------------------------
// FPLE
// 
// Class used for rendering and controlling FPLE.

function FPLE() {
    this.initialize.apply(this, arguments);
}

(function ($) {
    
    /**
     * FPLE initialization.
     */
    $.prototype.initialize = function() {
        // Warns Graphics that the FPLE is running, so it will not mess the
        // rendering up.
        Graphics._fple = this;
        
        this._textureLoader = new THREE.TextureLoader();
        
        this._renderer = new THREE.WebGLRenderer({
            canvas: Graphics._canvas
        });
        this._renderer.autoClear = false;
        
        this.refresh();
    };
    
    /**
     * Setups three.js camera
     */
    $.prototype.setupThreeJS = function() {
        this._camera = new THREE.PerspectiveCamera(
                75.0, 
                Graphics.width / Graphics.height,
                0.2,
                MBS.FPLE.viewDistance
        );
        this._camera.position.set(0, 1, 0);
        this._camera.up = new THREE.Vector3(0,1,0);    // Up is Z-axis
    };
    
    /**
     * Parallax creation
     */
    $.prototype.createParallax = function() {
        var sky = new THREE.Mesh(
            new THREE.SphereGeometry(10, 32, 32),
            new THREE.MeshBasicMaterial({
                map: this._textureLoader.load( 'img/parallaxes/' + $dataMap.parallaxName + '.png' ),
                depthWrite: false
            })
        );
        sky.material.side = THREE.BackSide;
        
        this._parallax_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        this._parallax_camera.target = new THREE.Vector3(0, 0, 0);
        this._parallax_scene = new THREE.Scene();
        this._parallax_scene.add(this._parallax_camera);
        this._parallax_scene.add(sky);
    };
    
    /**
     * Refreshes the FPLE context, reloading the game map, textures and camera.
     */
    $.prototype.refresh = function() {
        this.setupThreeJS();

        this.createParallax();
        
        // FPLE Main scene
        this._light = new THREE.PointLight(0xffffff, 1, MBS.FPLE.Params.viewDistance);
        
        this._scene = new THREE.Scene();
        this._scene.add(this._light);
        this._scene.add(this._camera);
        
        // Map data
        var width = $dataMap.width;
        var height = $dataMap.height;
        var data = $dataMap.data;
        
        // Create a cubic geometry object, used for drawing... cubes?
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        
        geometry.faceVertexUvs[0] = [];
        
        // Apply UVs to cube
        for (var i = 0; i < 6; i++) {
            geometry.faceVertexUvs[0][i * 2] = [ 
                MBS.FPLE.cubeMap[i][0], 
                MBS.FPLE.cubeMap[i][1], 
                MBS.FPLE.cubeMap[i][3] 
            ];
            geometry.faceVertexUvs[0][i * 2 + 1] = [ 
                MBS.FPLE.cubeMap[i][1], 
                MBS.FPLE.cubeMap[i][2],
                MBS.FPLE.cubeMap[i][3] 
            ];
        }
        
        // Forward declarations
        var cube;
        var x, y, z = 0;
        var tile;
        var row, col;
        
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                
                // Dark magic for getting tile data
                tile = data[(z * height + y) * width + x];
                col = (Math.floor(tile / 128) % 2 * 8 + tile % 8); // srsly?
                row = (Math.floor(tile % 256 / 8) % 16); // wow, such formula
              
                if (col === 0 && row === 0) continue;
                
                // Loads the texture for the current tile
                var texture = this._textureLoader.load( "img/textures/" + $dataMap.tilesetId + "_" + row + "" + col + ".png" );
                texture.minFilter = THREE.LinearFilter;
                if (texture.image)
                    texture.needsUpdate = true;
                
                var material = new THREE.MeshPhongMaterial( { map: texture } );
                
                // Creates our cube...
                cube = new THREE.Mesh( geometry, material );
                cube.position.set(x, 0, y);
                cube.castShadow = true;
                cube.receiveShadow = true;
                
                // ...And adds it to the scene, so it appears on screen
                this._scene.add(cube);
                
                // If the tile is marked with the wall terrain tag, create 
                // another cube one tile above the floor.
                if ($gameMap.terrainTag(x, y) === MBS.FPLE.Params.wallTerrain) {
                    cube = new THREE.Mesh( geometry, material );
                    cube.position.set(x, 1, y);
                    this._scene.add(cube);
                } 
                
                if ($gameMap.regionId(x, y) === MBS.FPLE.Params.ceilRegion) {
                    cube = new THREE.Mesh( geometry, material );
                    cube.position.set(x, 2, y);
                    this._scene.add(cube);
                }
            }
        }
        
        // Look forward
        this._camera.lookAt(new THREE.Vector3(0, 1, $gamePlayer.y + 1));
    };
    
    /**
     * Updates the renderer position
     */
    $.prototype.updatePosition = function() {
        this._camera.position.x = $gamePlayer._realX;
        this._camera.position.z = $gamePlayer._realY;
        this._light.position.copy(this._camera.position);
        this._camera.updateProjectionMatrix();
    };
    
    /**
     * Updates the main scene camera.
     */
    $.prototype.updateCamera = function () {
       $gamePlayer.adjustCamera();
    };
    
    /**
     * Updates the parallax camera.
     */
    $.prototype.updateParallax = function () {
        this._parallax_camera.rotation.y = -this._camera.rotation.y;
    };
    
    /**
     * Updates the renderer.
     */
    $.prototype.update = function() {
        this.updatePosition();
        this.updateCamera();
        this.updateParallax();
        this.render();
    };
    
    /**
     * Renders the scene.
     */
    $.prototype.render = function() {
        this._renderer.clear();
        this._renderer.render(this._parallax_scene, this._parallax_camera);
        this._renderer.render(this._scene, this._camera);
    };
    
    /**
     * Terminates the FPLE and frees Graphics._fple so it can render stuff
     * normally.
     */
    $.prototype.terminate = function() {
        Graphics._fple = null;
    };
    
    /**
     * Gets the FPLE camera
     */
    Object.defineProperty($.prototype, 'camera', {
        get: function() {
            return this._camera;
        }
    });
    /**
     * Gets the FPLE scene
     */
    Object.defineProperty($.prototype, 'scene', {
        get: function() {
            return this._scene;
        }
    });
})(FPLE);

//-----------------------------------------------------------------------------
// Graphics
// 
// The static class that carries out graphics processing.
// Changed renderer-related stuff to use three.js and support FPLE.

(function ($) {
    
    $._createThreeCanvas = function() {
        this._threeCanvas = document.createElement('canvas');
        this._threeCanvas.id = 'THREECanvas';
        document.body.appendChild(this._threeCanvas);
    };
    
    var aliasCreateAllElements = $._createAllElements;
    $._createAllElements = function() {
        aliasCreateAllElements.apply(this, arguments);
        this._createThreeCanvas();
    };
    
    /**
     * Creates the graphical renderers.
     */
    $._createRenderer = function() {
        PIXI.dontSayHello = true;
        var width = this._width;
        var height = this._height;
        
        if (!Graphics.hasWebGL())
            throw new error("FPLE: failed to create WebGL renderer.");
        
        this._renderer = new PIXI.autoDetectRenderer(width, height, { 
            view: this._canvas
        });
        
    };
    
    /**
     * Renders the screen.
     */
    var aliasRender = $.render;
    $.render = function(stage) {
        
        if (this._skipCount === 0) {
            
            var startTime = Date.now();
            
            if (stage && !this._fple) {
                this._renderer.render(stage);
            }
            
            var endTime = Date.now();
            var elapsed = endTime - startTime;
            this._skipCount = Math.min(Math.floor(elapsed / 15), this._maxSkip);
            this._rendered = true;
        } else {
            this._skipCount--;
            this._rendered = false;
        }
        this.frameCount++;
    };
    
})(Graphics);

//-----------------------------------------------------------------------------
// Spriteset_Map
//
// The set of sprites on the map screen.
// Removed all the Tilemap-related stuff and added FPLE.

(function ($) {
    var aliasUpdate = $.prototype.update;
    /**
     * Updates the spriteset and its children.
     */
    $.prototype.update = function() {
        aliasUpdate.call(this);
        this._fple.update();
    };
    
    /**
     * Creates a FPLE renderer and loads the map.
     */
    $.prototype.createFPLE = function() {
        this._fple = new FPLE();
        
        this._fpleSprite = new Sprite();
        this._fpleSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
    };
    
    var aliasCLL = $.prototype.createLowerLayer;
    /**
     * Creates the low layer sprites.
     */
    $.prototype.createLowerLayer = function() {
        aliasCLL.call(this);
        this.createFPLE();
    };
    
    /**
     * Terminates and frees the spriteset and its children.
     */
    $.prototype.terminate = function() {
        this._fple.terminate();
    };
    
})(Spriteset_Map);

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.
// Addded call to spriteset.terminate() so the FPLE renderer is terminated and
// stop interfering with Graphics.render

(function ($) {
    
    var aliasTerminate = $.prototype.terminate;
    
    /**
     * Terminates the scene process
     */
    $.prototype.terminate = function() {
        aliasTerminate.apply(this, arguments);
        this._spriteset.terminate();
    };
    
})(Scene_Map);

//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

(function ($) {    
    
    $.prototype.cameraAngle = function() {
        var d = this.direction();
        var theta = 0;
            
        if (d === 4)
            theta = Math.PI / 2;
        else if (d === 6)
            theta = Math.PI * 3 / 2;
        else if (d === 2)
            theta = 0.0;
        else if (d === 8)
            theta = Math.PI;
        
        return theta;
    };
    
    $.prototype.adjustCamera = function() {
        if (!Graphics._fple) return;
        
        var fple = Graphics._fple;
        
        var r = this.cameraAngle();
        
        var dA = r - fple._camera.rotation.y;
        var dB = Math.PI * 2 + r - fple._camera.rotation.y;
        var dC = -Math.PI * 2 + r - fple._camera.rotation.y;
        var n = 0;
           
        if (Math.abs(dA) < Math.abs(dB)) {
            if (Math.abs(dA) < Math.abs(dC))
                n = dA;
            else
                n = dC;
        } else {
            if (Math.abs(dB) < Math.abs(dC))
                n = dB;
            else
                n = dC;
        }
        
        var t = (n / Math.abs(n));
        var toDeg = (Math.PI * 2) / 360.0;
        
        if (Math.round(n * 10) / 10 === 0.00) {
            fple._camera.rotation.y = r;
        } else {
            fple._camera.rotation.y += t * toDeg * 5;
        }
        
        fple._camera.rotation.y %= (Math.PI * 2);
    };
    
    $.prototype.moveByInput = function() {
        if (Graphics._fple._camera.rotation.y === this.cameraAngle() &&
                !this.isMoving() && this.canMove()) {
            if (Input.isPressed('right')) {
                this.turnRight90();
            } else if (Input.isPressed('left')) {
                this.turnLeft90();
            } else if (Input.isPressed('up')) {
                this.moveForward();
            } else if (Input.isPressed('down')) {
                this.moveBackward();
            }
        }
    };
})(Game_Player);
