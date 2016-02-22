/**
 *  @file    MBS - FPLE MV
 *  @author  Masked
 *  @version 1.0.0 2016-02-21
 */
/*:
 *  @plugindesc This plugin makes your game a first person labyrinth explorer.
 *
 *  @author Masked
 *
 *  @param View Distance
 *  @desc The amount of tiles ahead the player can see by default.
 *  @default 3
 *
 *  @param Light Color
 *  @desc The hex code for the color used on the light.
 *  @default ffffff
 *  
 *  @param Wall Terrain
 *  @desc The ID for wall tiles terrain tag on FPLE tilesets.
 *  @default 1
 *  
 *  @param Ceiling Region
 *  @desc The Region ID for ceiled tiles.
 *  @default 0
 *  
 *  @param Material Type
 *  @desc The material type used for the scene. (phong/lambert/basic)
 *  @default phong
 *  
 *  @param Texture Filter
 *  @desc The texture's filter type. (nearest/linear)
 *  @default linear
 *  
 *  @param Texture Format
 *  @desc The texture file format used. (png/jpg/dds/gif/...)
 *  @default png
 *  
 *  @param Texture Anisotropy
 *  @desc The amount of samples taken from textures. (usually a power of 2)
 *  @default 1
 *  
 *  @param Antialiasing
 *  @desc Whether to use antialiasing or not (expensive). 1 = YES, 0 = NO.
 *  @default 0
 *  
 *  @param Shader Precision
 *  @desc The precision to render shaders. (highp/mediump/lowp)
 *  @default highp
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
 *  projects, so you can skip this part.
 *  If you create the project from scratch, however, you'll need to download
 *  three.min.js by yourself from http://threejs.org/build/three.min.js and
 *  save it at your project's "js/libs" folder. This plugin was made using
 *  three.js r74, so you should use this version too in order to avoid possible
 *  bugs, but feel free to try later versions.
 *  Then, edit your index.html and add this after line 14:
 *  <script type="text/javascript" src="js/libs/three.min.js"></script>
 *  Now, you're half a step nearer to be ready to go.
 *
 *  2. Textures
 *
 *  Textures can be set creating a file named "{tileset}_{row}-{col}",
 *  replacing '{tileset}' by the FPLE tileset number on the database and 
 *  '{row}' and '{col}' with, respectively, the row and column the tile you are 
 *  texturing is on the tileset's A5 layer, and placing it at your game's 
 *  img/textures folder.
 *  There's no maximum/minimum size for the textures, but keep in mind that 
 *  bigger textures are more expensive and can cause some serious performance
 *  decrease, specially on older computers.
 *
 *  3. Tilesets
 * 
 *  Setting tilesets up for FPLE is quite simple: first, create the tileset 
 *  and set just the A5 layer (which is, currently, the only one supported by
 *  FPLE). Then, you can set passability flags as you want, and mark wall
 *  tiles with the terrain tag you choose on your plugin settings.
 *  Note that the first tile at the first row is always invisible, so it's 
 *  recommended you use a black tile or something like that.
 *  
 *  4. Mapping
 *  
 *  Mapping is quite intuitive, just put wall tiles wherer you want to be walls
 *  and floor tiles where you don't, you can use the first tile at the first
 *  wall to create holes since it's invisible. Also, you may want your map to 
 *  have a ceiling, if so, you just have to set the tiles you want with the 
 *  ceil region you choose on the plugin settings.
 *
 *  5. Plugin commands
 * 
 *  FPLE setResolution <x | v[n]>    : Sets the FPLE canvas resolution (higher 
 *                                     is better)
 *  FPLE setViewDistance <x | v[n]>  : Sets the FPLE view distance in tile
 *
 *  Examples:
 *  FPLE setResolution 0.5           : Sets the resolution at half
 *  FPLE setResolution v[42]         : Sets the resolution to the value of
 *                                     variable 42 
 *
 *  FPLE setViewDistance 3           : Sets the view radius to 3 tiles
 *  FPLE setViewDistance v[42]       : Sets the view radius to the value of
 *                                     variable 42
 *
 *
 *                                   Credits
 *
 *  - Masked, for creating;
 *  - three.js team (https://github.com/mrdoob/three.js/graphs/contributors), 
 *    for their aweasome library.
 */

 /*:pt
 *  @plugindesc Esse plugin transforma seu jogo em um explorador de labirinto em primeira pessoa.
 *
 *  @author Masked
 *
 *  @param View Distance
 *  @desc Número de tiles à frente que o jogador vê por padrão.
 *  @default 3
 *
 *  @param Light Color
 *  @desc Código hexadecimal da cor da luz do jogador.
 *  @default ffffff
 *  
 *  @param Wall Terrain
 *  @desc ID do terreno usado para identificar paredes nos tilesets.
 *  @default 1
 *  
 *  @param Ceiling Region
 *  @desc ID da região usada em tiles com teto no mapa.
 *  @default 0
 *  
 *  @param Material Type
 *  @desc Tipo de material usado nos cubos do mapa. (phong/lambert/basic)
 *  @default phong
 *  
 *  @param Texture Filter
 *  @desc Filtro usado nas texturas. (nearest/linear)
 *  @default linear
 *  
 *  @param Texture Format
 *  @desc Formato dos arquivos de textura. (png/jpg/dds/gif/...)
 *  @default png
 *  
 *  @param Texture Anisotropy
 *  @desc Número de amostras tiradas das texturas. (geralmente uma potência de 2)
 *  @default 1
 *  
 *  @param Antialiasing
 *  @desc Quando usar antialiasing ou não (alto custo de performance). 1 = SIM, 0 = NÃO.
 *  @default 0
 *  
 *  @param Shader Precision
 *  @desc Precisão para renderizar shaders do THREE js. (highp/mediump/lowp)
 *  @default highp
 *  
 *  @help 
 *  #
 *                       First Person Labyrinth Explorer
 *                                  por Masked
 *
 *  Esse plugin constrói um cenário 3D para o seu jogo a partir de mapas simples,
 *  tornando-o um explorador de labirinto em primeira pessoa.
 *
 *
 *                                  Como Usar
 *
 *  1. Instalação
 *
 *  Eu recomendo fortemente que use a DEMO do FPLE como base para seu projeto,
 *  se estiver usando-a, pule esta parte.
 *  Caso você queira criar seu projeto do zero, no entanto, é necessário baixar
 *  o three.min.js de http://threejs.org/build/three.min.js e salvá-lo na pasta
 *  "js/libs" do seu jogo. Esse plugin foi feito e testado usando a versão r74,
 *  por isso é recomendado usar esta versão para evitar problemas.
 *  Depois, edite o index.html do seu jogo e adicione isso após a linha 14:
 *  <script type="text/javascript" src="js/libs/three.min.js"></script>
 *  Pronto, plugin instalado, agora estamos meio passo mais próximos do final :D
 *
 *  2. Texturas
 *
 *  Texturas são definidas criando arquivos com nomes seguindo o padrão 
 *  "{tileset}_{linha}-{coluna}", substituindo '{tileset}' pelo ID do tileset do
 *  FPLE no database e '{linha}' e '{coluna}' com, respectivamente, o número da 
 *  linha e coluna do tile correspondente à textura no tileset. Note que apenas
 *  tiles A5 podem ser usados no momento.
 *  Arquivos de textura devem estar na pasta "img/textures" do seu projeto.
 *  Não há valor mínimo ou máximo para o tamanho das texturas, mas recomenda-se
 *  usar texturas quadradas e com tamanhos que sejam potências de 2. É importante
 *  perceber que usar texturas maiores pode causar lag, especialmente em 
 *  computadores antigos.
 *
 *  3. Tilesets
 * 
 *  Configurar tilesets no FPLE é bem simples: primeiro, crie um tileset com
 *  apenas a camada A5. Então, configure a passabilidade normalmente e marque tiles
 *  de paede com o terreno que você escolheu nas configurações do plugin.
 *  Note que o primeiro tile da primeira coluna é sempre invisível, então é 
 *  recomendado deixar isso sinalizado no próprio tileset.
 *  
 *  4. Mapeamento
 *  
 *  O mapeamento não muda muito, na verdade, a única alteração é que tiles sem
 *  textura, vazios ou o primeiro tile da primeira linha do tileset são 
 *  transparentes e ficam parecendo buracos no jogo, e você pode configurar como
 *  o teto aparece mudando a região dos tiles. Se a região de teto for 0, então
 *  todos os tiles sem região terão um teto.
 *
 *  5. Comandos de pugin
 * 
 *  FPLE setResolution <x | v[n]>    : Define a resolução do canvas do FPLE
 *                                     (quanto maior, melhor)
 *  FPLE setViewDistance <x | v[n]>  : Define o raio de visão do jogador
 *
 *  Exemplos:
 *  FPLE setResolution 0.5           : Define a resolução como metade do normal
 *  FPLE setResolution v[42]         : Define a resolução como o valor da
 *                                     variável número 42 
 *
 *  FPLE setViewDistance 3           : Define o raio de visão como 3 tiles
 *  FPLE setViewDistance v[42]       : Define o raio de visão como o valor da
 *                                     variável número 42
 *
 *
 *                                   Créditos
 *
 *  - Masked, por criar;
 *  - Equipe do three.js (https://github.com/mrdoob/three.js/graphs/contributors), 
 *    pela biblioteca lindona.
 */

"use strict";

// This plugin uses three.js (http://threejs.org/)
if (!THREE)
    throw new error('FPLE: Unable to find three.js, please follow the plugin' +
        ' instructions and try again.');

// Import for compatibility check
var Imported = Imported || {};
Imported['MBS - FPLE'] = 1.00;

// MBS module
var MBS = MBS || {};
MBS.FPLE = {};

// Global fple scene object
var $fple;

//-----------------------------------------------------------------------------
// MBS.FPLE
// 
// FPLE settings module

(function ($) {
    
    // Parameter loading
    $.Filename = document.currentScript.src;
    $.Params   = PluginManager.parameters(decodeURI(/([^\/]+)\.js$/.exec($.Filename)[1]));
    
    // Settings
    $.viewRadius    = Number($.Params['View Distance']);
    $.lightColor    = $.Params['Light Color'];
    $.wallTerrain   = Number($.Params['Wall Terrain']);
    $.ceilRegion    = Number($.Params['Ceiling Region']);
    $.materialType  = $.Params['Material Type'];
    $.textureFilter = $.Params['Texture Filter'];
    $.textureFormat = $.Params['Texture Format'];
    $.anisotropy    = Number($.Params['Texture Anisotropy']);
    $.antialias     = !!Number($.Params['Antialiasing']);
    $.precision     = $.Params['Shader Precision'];
    
    // Geometries
    $.floorGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    $.wallGeometry  = new THREE.BoxGeometry(1.0, 2.0, 1.0);
    $.ceilGeometry  = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    
    // Heights
    $.floorHeight  = 0;
    $.wallHeight   = 0.5;
    $.ceilHeight   = 2;
    $.cameraHeight = 1;
    
    // Image files format string
    $.textureFileFormat = "img/textures/%1_%2-%3.%4";
    $.parallaxFileFormat = "img/parallaxes/%1.%2";
    
    // Resizes the FPLE canvas to change the game resolution
    $.setPixelRate = function(n) {
        if (!Graphics._fple_renderer) return;
        Graphics._fple_renderer.setSize(Graphics.width * n, Graphics.height * n);
        Graphics._updateFPLE();
    };

})(MBS.FPLE);

//-----------------------------------------------------------------------------
// MBS.FPLE.Map
// 
// FPLE Map, this converts $dataMap into a 3D cubic map

MBS.FPLE.Map = function() {
    this.initialize.apply(this, arguments);
};

(function() {
    
    /**
     * Map initialization.
     */
    MBS.FPLE.Map.prototype.initialize = function() {
        this._createTextureLoader();
        this.clearCache();
        this.refresh();
    };
    
    /**
     * Creates the Map's texture loader.
     */
    MBS.FPLE.Map.prototype._createTextureLoader = function() {
        this._textureLoader = new THREE.TextureLoader();
    };
    
    /**
     * Clears the map cache. 
     * Used just for creating '_cache' and/or reloading textures.
     */
    MBS.FPLE.Map.prototype.clearCache = function() {
        this._cache = {
            textures: {
                floors: {},
                walls:  {}
            },
            materials: {}
        };
    };
    
    /**
     * Extracts $dataMap data.
     */
    MBS.FPLE.Map.prototype.refresh = function() {
        // Clears all loaded data
        this._data = [];
        
        // Loads mapa data
        var width = $dataMap.width;
        var height = $dataMap.height;
        var data = $dataMap.data;
        
        for (var x = 0; x < width; x++) {
            this._data[x] = [];
            for (var y = 0; y < height; y++) {
                // Store tile ID
                this._data[x][y] = data[y * width + x];      
            }
        }
    };
    
    /**
     * Gets a cached texture or loads it if it's hasn't been used yet.
     * 
     * @param {String} filename The file from where to load the texture.
     */
    MBS.FPLE.Map.prototype.getTexture = function(filename, wall) {

        // Load texture from cache or from file
        var cache;
        if (!!wall)
            cache = this._cache.textures.walls[filename];
        else
            cache = this._cache.textures.floors[filename];

        if (cache)
            return cache;

        var texture = this._textureLoader.load( filename );

        // Apply desired filter
        if (MBS.FPLE.textureFilter.match(/^nearest$/i))
            texture.minFilter = THREE.NearestMipMapNearestFilter;
        else
            texture.minFilter = THREE.LinearMipMapLinearFilter;

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = MBS.FPLE.anisotropy;

        if (texture.image)
            texture.needsUpdate = true;      

        // Store it on cache
        if (wall) {
            texture.repeat = new THREE.Vector2(1, 2);
            this._cache.textures.walls[filename] = texture;
        } else
            this._cache.textures.floors[filename] = texture;

        return texture;
    };
    
    /**
     * Gets a cached material or loads it if it's hasn't been used yet.
     * 
     * @param {String} filename The file from where to load the material texture.
     */
    MBS.FPLE.Map.prototype.getMaterial = function(filename, wall) {
        var material;
        
        // Don't lose your time if it has already been loaded
        if (this._cache.materials[filename]) {
            material = this._cache.materials[filename];
            
        // Load it otherwise
        } else {
            var texture = this.getTexture(filename, wall);
            var opts = { map: texture, transparent: true };

            // Use desired material type
            if (MBS.FPLE.materialType.match(/^phong$/i))
                material = new THREE.MeshPhongMaterial(opts);
            else if (MBS.FPLE.materialType.match(/^lambert$/i))
                material = new THREE.MeshLambertMaterial(opts);
            else
                material = new THREE.MeshBasicMaterial(opts);
            
            // Store it on cache
            this._cache.materials[filename] = material;
        }
        
        return material;
    };
    
    /**
     * Adds this map's data to a three.js scene
     * 
     * @param {THREE.Scene} scene The scene to add the objects into.
     * @returns The scene where the objects were added.
     */
    MBS.FPLE.Map.prototype.toScene = function(scene) {
        scene = scene || new THREE.Scene();
        
        this._applyTiles(scene);
        this._applyEvents(scene);
        
        return scene;
    };
    
    /**
     * Adds this map's tiles to a three.js scene
     * 
     * @param {THREE.Scene} scene The scene to add the cubes into. If not 
     * defined, a new scene is used.
     */
    MBS.FPLE.Map.prototype._applyTiles = function(scene) {

        // Forward declarations
        var tile, 
            row, 
            col, 
            filename, 
            material, 
            cube;
        
        for (var x = 0; x < this._data.length; x++) {
            for (var y = 0; y < this._data[x].length; y++) {
                
                tile = this._data[x][y];
                col = (Math.floor(tile / 128) % 2 * 8 + tile % 8); // srsly?
                row = (Math.floor(tile % 256 / 8) % 16); // wow, such formula
                
                // Do not draw the first tile at the first row
                if (col === 0 && row === 0) continue;
                
                // Material for this tile
                filename = MBS.FPLE.textureFileFormat.format(
                        $dataMap.tilesetId, 
                        row, 
                        col,
                        MBS.FPLE.textureFormat);

                // Floor and wall
                if ($gameMap.terrainTag(x, y) === MBS.FPLE.wallTerrain) {
                    material = this.getMaterial(filename, true);
                    cube = new THREE.Mesh(MBS.FPLE.wallGeometry, material);
                    cube.position.set(x, MBS.FPLE.wallHeight, y);
                } else {
                    material = this.getMaterial(filename);
                    cube = new THREE.Mesh(MBS.FPLE.floorGeometry, material);
                    cube.position.set(x, MBS.FPLE.floorHeight, y);
                }
                
                scene.add(cube);
                
                // Ceiling
                if ($gameMap.regionId(x, y) === MBS.FPLE.ceilRegion) {
                    material = this.getMaterial(filename);
                    cube = new THREE.Mesh(MBS.FPLE.ceilGeometry, material);
                    cube.position.set(x, MBS.FPLE.ceilHeight, y);
                    
                    scene.add(cube);
                }
            }
        }
    };

    /**
     * Adds this map's events to a three.js scene
     * 
     * @param {THREE.Scene} scene The scene to add the sprites into. If not 
     * defined, a new scene is used.
     */
    MBS.FPLE.Map.prototype._applyEvents = function(scene) {
        /*
        this._event_sprites = {};
        $gameMap.events().forEach((function(event) {
            var texture, material, sprite;

            texture = this._textureLoader.load('img/characters/' + event.characterName() + '.' + MBS.FPLE.textureFormat);
            texture.minFilter = THREE.LinearFilter;
            texture.offset = new THREE.Vector2( 0.25 / 3.0, 0.875);
            texture.repeat = new THREE.Vector2( 0.25 / 3.0, 0.125);
            texture.needsUpdate = true;

            material = new THREE.SpriteMaterial({ map: texture });
            sprite = new THREE.Sprite(material);
            sprite.position.set(event._realX, 1, event._realY);

            this._event_sprites[event] = sprite;
            scene.add(sprite);

        }).bind(this));
        */
    };

    /**
     * Updates this map
     */
    MBS.FPLE.Map.prototype.update = function(scene) {
        this._updateEvents();
    };

    /**
     * Updates this map's events
     */
    MBS.FPLE.Map.prototype._updateEvents = function(scene) {
        /*
        $gameMap.events().forEach((function(event) {
            var sprite = this._event_sprites[event];

            sprite.position.set(event._realX, 1, event._realY);

        }).bind(this));
        */
    };

})();

//-----------------------------------------------------------------------------
// MBS.FPLE.Camera
// 
// FPLE Camera, this is a subclass of THREE.PerspectiveCamera with some utils
// used by FPLE

MBS.FPLE.Camera = function() {
    this.initialize.apply(this, arguments);
};

MBS.FPLE.Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
MBS.FPLE.Camera.prototype.constructor = MBS.FPLE.Camera;

(function() {
    
    /**
     * Camera initialization.
     */
    MBS.FPLE.Camera.prototype.initialize = function() {
        THREE.PerspectiveCamera.apply(this, [
            // FOV
            75,
            // Aspect ratio
            1.0 * Graphics.width / Graphics.height,
            // Near frustrum
            0.2,
            // Far frustrum
            MBS.FPLE.viewRadius
        ]);
        this.up = new THREE.Vector3(0,1,0);
        this.lookAt(new THREE.Vector3(1, 0, $gamePlayer.y + 1));
        this.rotation.y = THREE.Math.degToRad($gamePlayer.cameraAngle());
    };
    
    /**
     * Updates the camera rotation and position based on the player.
     */
    MBS.FPLE.Camera.prototype.update = function() {
        this._updatePosition();
        this._updateRotation();
    };
    
    /**
     * Updates the camera position
     */
    MBS.FPLE.Camera.prototype._updatePosition = function() {
        this.position.set($gamePlayer._realX, 1, $gamePlayer._realY);
    };
    
    /**
     * Updates the camera rotation
     */
    MBS.FPLE.Camera.prototype._updateRotation = function() {
        var radians = THREE.Math.degToRad($gamePlayer.cameraAngle());
        var rotation = this.rotation.y;
        
        var dA = radians - rotation;
        var dB = Math.PI * 2 + radians - rotation;
        var dC = -Math.PI * 2 + radians - rotation;
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
        
        if (Math.round(n * 10) / 10 === 0) {
            this.rotation.y = radians;
        } else {
            this.rotation.y += THREE.Math.degToRad(t) * 5;
        }
        
        this.rotation.y %= (Math.PI * 2);
    };
    
})();

//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

(function() {
    
    /**
     * Returns the camera angle representing the player direction.
     */
    Game_Player.prototype.cameraAngle = function() {
        var d = this.direction();
        var theta = 0;
            
        if (d === 4)
            theta = 90.0;
        else if (d === 6)
            theta = 270.0;
        else if (d === 2)
            theta = 0.0;
        else if (d === 8)
            theta = 180.0;
        
        return theta;
    };
    
    /**
     * Moves the player around according to FPLE rules
     */
    Game_Player.prototype.moveByInput = function() {
        if (!$fple) return;
        if ($fple.camera.rotation.y === THREE.Math.degToRad(this.cameraAngle()) &&
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
    
})();

//-----------------------------------------------------------------------------
// MBS.FPLE.ParallaxScene
// 
// FPLE Parallax Scene, this is a subclass of THREE.Scene with some utils used 
// by FPLE. This is used to create a skydome on the scene when there's no 
// ceiling.

MBS.FPLE.ParallaxScene = function() {
    THREE.Scene.call(this);
    this.initialize.apply(this, arguments);
};

MBS.FPLE.ParallaxScene.prototype = Object.create(THREE.Scene.prototype);
MBS.FPLE.ParallaxScene.prototype.constructor = MBS.FPLE.Scene;

(function() {

    /**
     * Initializes the FPLE Parallax three.js scene.
     */
    MBS.FPLE.ParallaxScene.prototype.initialize = function() {
        this._createTextureLoader();
        this._createSkydome();
        this._createCamera();
    };

    /**
     * Creates a texture loader for the current scene.
     */
    MBS.FPLE.ParallaxScene.prototype._createTextureLoader = function() {
        this._textureLoader = new THREE.TextureLoader();
    };

    /**
     * Creates FPLE Parallax skydome
     */
    MBS.FPLE.ParallaxScene.prototype._createSkydome = function() {
        var texture;
        
        if ($dataMap.parallaxName.length > 0)
            texture = this._textureLoader.load( 
                MBS.FPLE.parallaxFileFormat.format(
                    $dataMap.parallaxName, 
                    MBS.FPLE.textureFormat
                ) 
            );
        else
            texture = null;

        this._skydome = new THREE.Mesh(
            new THREE.SphereGeometry(1000, 32, 32),
            new THREE.MeshBasicMaterial({
                map: texture,
                depthWrite: false,
            })
        );
        this._skydome.material.side = THREE.BackSide;

        this.add(this._skydome);
    };

    /**
     * Creates the camera for the scene.
     */
    MBS.FPLE.ParallaxScene.prototype._createCamera = function() {
        this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this._camera.target = new THREE.Vector3(0, 0, 0);
    };

    /**
     * Updates the FPLE Parallax according to a given camera.
     */
    MBS.FPLE.ParallaxScene.prototype.update = function(camera) {
        this._camera.rotation.y = -camera.rotation.y;
    };

    /**
     * @property camera
     * @type THREE.PerspectiveCamera
     * 
     * THREE js camera used to display the parallax
     */
    /**
     * @property skydome
     * @type THREE.Mesh
     *
     * Sky mesh
     */
    Object.defineProperties(MBS.FPLE.ParallaxScene.prototype, {
        // [read-only] FPLE Scene camera
        camera: {
            get: function() {
                return this._camera;
            }
        },
        // [read-only] Parallax sky sphere
        skydome: {
            get: function() {
                return this._skydome;
            }
        }
    });
})();

//-----------------------------------------------------------------------------
// MBS.FPLE.Scene
// 
// FPLE Scene, this is a subclass of THREE.Scene with some utils used by FPLE.
// This automatically creates instances of MBS.FPLE.Map and MBS.FPLE.Camera.

MBS.FPLE.Scene = function() {
    THREE.Scene.call(this);
    this.initialize.apply(this, arguments);
};

MBS.FPLE.Scene.prototype = Object.create(THREE.Scene.prototype);
MBS.FPLE.Scene.prototype.constructor = MBS.FPLE.Scene;

(function() {
    
    /**
     * Initializes the FPLE three.js scene.
     */
    MBS.FPLE.Scene.prototype.initialize = function() {
        this._createMap();
        this._createParallax();
        this._createCamera();
        this._createLight();
        Graphics.startFPLE();
    };
    
    /**
     * Creates the cubic map for the scene.
     */
    MBS.FPLE.Scene.prototype._createMap = function() {
        this._map = new MBS.FPLE.Map();
        this._map.toScene(this);
    };

    /**
     * Creates the parallax sub-scene for FPLE.
     */
    MBS.FPLE.Scene.prototype._createParallax = function() {
        // Loading the texture for the current map's parallax
        var texture;
        if ($dataMap.parallaxName.length > 0)
            texture = new THREE.TextureLoader().load( 
                MBS.FPLE.parallaxFileFormat.format(
                    $dataMap.parallaxName, 
                    MBS.FPLE.textureFormat
                ) 
            );
        else
            texture = null;

        this._skydome = new THREE.Mesh(
            new THREE.SphereGeometry(256, 8, 8),
            new THREE.MeshBasicMaterial({
                map: texture,
                depthWrite: false,
            })
        );
        this._skydome.material.side = THREE.BackSide; // See the texture from inside
        this.add(this._skydome);
    };
    
    /**
     * Creates the camera for the scene.
     */
    MBS.FPLE.Scene.prototype._createCamera = function() {
        this._camera = new MBS.FPLE.Camera();
    };
    
    /**
     * Creates the light for the scene.
     */
    MBS.FPLE.Scene.prototype._createLight = function() {
        this._light = new THREE.PointLight(parseInt(MBS.FPLE.lightColor, 16), 1, MBS.FPLE.viewRadius);
        this.add(this._light);
    };
    
    /**
     * Updates the scene.
     */
    MBS.FPLE.Scene.prototype.update = function() {
        this._updateMap();
        this._updateCamera();
        this._updateLight();
    };
    
    /**
     * Updates the map.
     */
    MBS.FPLE.Scene.prototype._updateMap = function() {
        this._map.update();
    };

    /**
     * Updates the camera.
     */
    MBS.FPLE.Scene.prototype._updateCamera = function() {
        this._camera.update();
    };

    /**
     * Updates the light.
     */
    MBS.FPLE.Scene.prototype._updateLight = function() {
        this._light.position.copy(this._camera.position);

        if (this._light.distance != MBS.FPLE.viewRadius)
            this._light.distance = MBS.FPLE.viewRadius;
    };
    
    /**
     * Terminates the scene process.
     */
    MBS.FPLE.Scene.prototype.terminate = function() {
        Graphics.terminateFPLE();
    };
    
    /**
     * @property map
     * @type MBS.FPLE.Map
     * 
     * FPLE map used to draw the map as a 3D labyrinth on screen.
     */
    /**
     * @property skydome
     * @type THREE.Mesh
     *
     * FPLE Parallax sky mesh.
     */
    /**
     * @property camera
     * @type MBS.FPLE.Camera
     * 
     * FPLE camera used to control the... camera?
     */
    Object.defineProperties(MBS.FPLE.Scene.prototype, {
        
        // [read-only] FPLE map
        map: {
            get: function() {
                return this._map;
            }
        },
        
        // [read-only] Parallax Scene
        skydome: {
            get: function() {
                return this._skydome;
            }
        },

        // [read-only] FPLE Scene camera
        camera: {
            get: function() {
                return this._camera;
            }
        }
    });
    
})();

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.
// Added MBS.FPLE.Scene.

(function() {
    
    var aliasCreateDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    
    /**
     * Creates the display-related objects
     */
    Scene_Map.prototype.createDisplayObjects = function() {
        aliasCreateDisplayObjects.apply(this, arguments);
        //this.createPictures();
        this._createFPLE();
    };

    /**
     * Creates the scene's spriteset. Changed to not to display the map.
     */
    Scene_Map.prototype.createSpriteset = function() {
        this._spriteset = new Spriteset_Base();
        this._spriteset._blackScreen.opacity = 0;
        this.addChild(this._spriteset);
    };

    /**
     * Creates the pictures for the scene
     */
    Scene_Map.prototype.createPictures = function() {
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        var x = (Graphics.width - width) / 2;
        var y = (Graphics.height - height) / 2;
        this._pictureContainer = new Sprite();
        this._pictureContainer.setFrame(x, y, width, height);
        for (var i = 1; i <= $gameScreen.maxPictures(); i++) {
            this._pictureContainer.addChild(new Sprite_Picture(i));
        }
        this.addChild(this._pictureContainer);
    };
    
    /**
     * Creates the FPLE Scene for the map
     */
    Scene_Map.prototype._createFPLE = function() {
        this._fple = new MBS.FPLE.Scene();
        $fple = this._fple;
    };
    
    var aliasUpdateMain = Scene_Map.prototype.updateMain;
    
    /**
     * Updates the scene's main objects
     */
    Scene_Map.prototype.updateMain = function() {
        aliasUpdateMain.apply(this, arguments);
        this._updateFPLE();
    };
    
    /**
     * Updates the FPLE Scene
     */
    Scene_Map.prototype._updateFPLE = function() {
        this._fple.update();
    };
    
    var aliasStop = Scene_Map.prototype.stop;
    
    /**
     * Stops the scene process
     */
    Scene_Map.prototype.stop = function() {
        this._fple.terminate();
        $fple = null;
        aliasStop.apply(this, arguments);
    };
    
})();

//-----------------------------------------------------------------------------
// Graphics
// 
// The static class that carries out graphics processing.
// Added FPLE start and terminate functions.

(function() {
    
    /**
     * Starts FPLE rendering process
     */
    Graphics.startFPLE = function() {
        if (!this._fple_renderer)
            this._createFPLERenderer();
    };

    /**
     * Creates a WebGL renderer used to process FPLE scene
     */
    Graphics._createFPLERenderer = function() {
        this._fple_renderer = new THREE.WebGLRenderer({
            antialias: MBS.FPLE.antialias,
            transparent: true,
            canvas: this._fple_canvas
        });
        this._fple_renderer.setSize(this._width, this._height);

        // Adds the renderer canvas to the document body, using GameCanvas
        // would cause incompatibilities with PIXI
        if (!this._fple_canvas) {
            this._fple_canvas = this._fple_renderer.domElement;
            this._fple_canvas.id = "FPLECanvas";
            
            this._centerElement(this._fple_canvas);
            document.body.appendChild(this._fple_renderer.domElement);
        }

        // Fit canvas on screen
        this._updateFPLE();
    };
    
    var aliasUpdateAll = Graphics._updateAllElements;

    /**
     * Updates all graphical elements
     */
    Graphics._updateAllElements = function() {
        aliasUpdateAll.apply(this, arguments);
        this._updateFPLE();
    };

    /**
     * Updates FPLE canvas
     */
    Graphics._updateFPLE = function() {
        if (!this._fple_canvas) return;
        this._fple_canvas.style.width = "100%";
        this._fple_canvas.style.height = "100%";
    };

    /**
     * Terminates FPLE rendering process.
     */
    Graphics.terminateFPLE = function() {
        this._fple_renderer.clear();
        this._fple_renderer = null;
    };
    
    /**
     * Creates the PIXI renderer.
     */
    Graphics._createRenderer = function() {
        PIXI.dontSayHello = true;
        var width = this._width;
        var height = this._height;
        var options = { view: this._canvas, transparent: true };
        try {
            this._renderer = PIXI.autoDetectRenderer(width, height, options);
        } catch (e) {
            this._renderer = null;
        }
    };
    
    /**
     * Renders the stage to the game screen.
     */
    Graphics.render = function(stage) {
        if (this._skipCount === 0) {
            var startTime = Date.now();

            if (!!this._fple_renderer && !!$fple) {
                this._fple_renderer.render($fple, $fple.camera);
            }

            if (stage) {
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
    
})();

//-----------------------------------------------------------------------------
// Game_Interpreter
// 
// Plugin commands

(function() {

    var aliasPluginCommand = Game_Interpreter.prototype.pluginCommand;

    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        aliasPluginCommand.apply(this, arguments);

        if (command == 'FPLE') {

            var match;

            if (args[0] == 'setResolution') {
                if (args[1]) {
                    if (match = args[1].match(/v\[(\d+)\]/i)) {
                        args[1] = args[1].replace(match[0], 
                            $gameVariables.value(Number(match[1])));
                    }

                    MBS.FPLE.setPixelRate(Number(args[1]));
                } else {
                    console.error('FPLE: PluginCommand: no resolution specified.');
                }

            } else if (args[0] == 'setViewDistance') {
                if (args[1]) {
                    if (match = args[1].match(/v\[(\d+)\]/i)) {
                        args[1] = args[1].replace(match[0], 
                            $gameVariables.value(Number(match[1])));
                    }

                    MBS.FPLE.viewRadius = Number(args[1]);
                } else {
                    console.error('FPLE: PluginCommand: no view distance specified.');
                }
            }

        }
    };

})();
