import { MyObject } from "./myObject2.js";

function main() {
    /** @type {HTMLCanvasElement} */
    var CANVAS = document.getElementById("mycanvas");
    CANVAS.width = window.innerWidth ;
    CANVAS.height = window.innerHeight;

  /*===================== CAMERA/MOUSE VARIABLES ===================== */
var mouseDown = false;
var mouseX = 0;
var mouseY = 0;
var rotationX = 0;
var rotationY = 0;
var sensitivity = 0.005;

var cameraZ = -25;
var zoomSensitivity = 0.05;

// --- BARU: Variabel untuk Panning (Geser) ---
var panX = 0;
var panY = 0;
var panSensitivity = 0.01; // Sesuaikan sensitivitas geser
var dragMode = "none"; // Bisa "rotate" atau "pan"

    /*===================== GET WEBGL CONTEXT ===================== */
    var GL;
    try {
        // UBAH BARIS INI: tambahkan { alpha: true }
        GL = CANVAS.getContext("webgl", { antialias: true, alpha: true }); 
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    /*========================= SHADERS ========================= */
    var shader_vertex_source = `
        attribute vec3 position;
        uniform mat4 Pmatrix, Vmatrix, Mmatrix;
        attribute vec3 color;
        varying vec3 vColor;
        void main(void) {
            gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);
            vColor = color;
        }`;
    var shader_fragment_source = `
        precision mediump float;
        varying vec3 vColor;
        void main(void) {
            gl_FragColor = vec4(vColor, 1.);
        }`;

    var compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");
    var SHADER_PROGRAM = GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);
    GL.linkProgram(SHADER_PROGRAM);

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.useProgram(SHADER_PROGRAM);

    // ====================== ANIMATE LOOP ======================
    

    // ====================== MEMBUAT LATAR TEMPAT ======================
    
    // 1. Tanah
    var tanah = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    tanah.generateCuboid(30, 0.5, 20, [0.4, 0.8, 0.4]);

    // 2. Pohon
    var batangPohon = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    var daunPohon = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    batangPohon.generateCylinder(0.5, 4, [0.5, 0.3, 0.1]);
    daunPohon.generateSphere(1.8, [0.1, 5, 0.1]);       
    
    // 3. Rumah (BARU)
    var dindingRumah = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    var atapRumah = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    dindingRumah.generateCuboid(3, 3, 3, [0.9, 0.8, 0.7]); // Dinding warna krem
    atapRumah.generatePyramid(3.5, 2, [0.6, 0.2, 0.1]);     // Atap warna coklat tua

    var apples = [];
    var appleCount = 40; // Jumlah apel
    var appleColor = [0.9, 0.1, 0.1]; // Warna merah
    var appleSpreadRadius = 3.5; // Seberapa jauh menyebar
    // Batang pohon Anda tingginya 8 (karena height=4 * 2 di generateCylinder)
    var appleCrownY = 0.0; // Pusat mahkota apel (di atas batang)
    
    for (let i = 0; i < appleCount; i++) {
        var apple = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
        apple.generateSphere(0.3, appleColor); // Buat apel kecil

        // Buat posisi acak dalam bentuk bola di sekitar puncak pohon
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var x = appleSpreadRadius * Math.sin(phi) * Math.cos(theta);
        var y = appleSpreadRadius * Math.sin(phi) * Math.sin(theta);
        var z = appleSpreadRadius * Math.cos(phi);

        // Set posisi apel (relatif terhadap batangPohon)
        LIBS.translateX(apple.POSITION_MATRIX, x);
        LIBS.translateY(apple.POSITION_MATRIX, y + appleCrownY);
        LIBS.translateZ(apple.POSITION_MATRIX, z);

        // Tambahkan apel sebagai child dari batangPohon
        daunPohon.addChild(apple);
        apples.push(apple);
    }

    // ====================== MEMBUAT FLAPPLE ======================
   
    var badanFlapple =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    badanFlapple.generateBadanFlapple();

    var kepalaFlapple =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    kepalaFlapple.generateKepalaFlapple();

    var tanduk =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    tanduk.generateTanduk();


    var bagianBawahFlapple =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    bagianBawahFlapple.generateWadahFlapple();

    var topiFlapple =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    topiFlapple.generateTopiFlapple();

    var mataKiriFlapple=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    mataKiriFlapple.generateMataFlapple();

    var pupilKiri =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    pupilKiri.generatePupil();

    var mataKananFlapple=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    mataKananFlapple.generateMataFlapple();
    
    var pupilKanan =new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    pupilKanan.generatePupil();

    var tanganKananFlapple=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    tanganKananFlapple.generateTanganFlapple();

    var tanganKiriFlapple=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    tanganKiriFlapple.generateTanganFlapple();

    var sayapKanan=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    sayapKanan.generateEllipseSayap();

    var sayapKiri=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    sayapKiri.generateEllipseSayap();

    var jariKiri1=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    jariKiri1.generateEllipseJari(0.6,0.3,0.3);

    var jariKiri2=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    jariKiri2.generateEllipseJari(0.3,0.6,0.3);

    var jariKanan1=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    jariKanan1.generateEllipseJari(0.6,0.3,0.3);

    var jariKanan2=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    jariKanan2.generateEllipseJari(0.3,0.6,0.3);

    var mesh=new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    mesh.generateKubus();

    // HYDRA
    var hydrapple = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    hydrapple.generateHydrapple();

    // APPLETUN
    var appletun = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    appletun.generateAppletun();

    // DIPPLIN
    var dipplin = new MyObject(GL, SHADER_PROGRAM, _position, _color, _Mmatrix);
    dipplin.generateDipplin();




    // ====================== ATUR POSISI OBJEK ======================
    LIBS.translateY(tanah.POSITION_MATRIX, 0); 

    LIBS.translateX(batangPohon.POSITION_MATRIX, -13);
    LIBS.translateY(batangPohon.POSITION_MATRIX, 0);

    LIBS.translateX(daunPohon.POSITION_MATRIX, -13);
    LIBS.translateY(daunPohon.POSITION_MATRIX, 10);

    // Posisikan rumah di sebelah kanan
    LIBS.translateX(dindingRumah.POSITION_MATRIX, 13);
    LIBS.translateY(dindingRumah.POSITION_MATRIX, 0);

    LIBS.translateX(atapRumah.POSITION_MATRIX, 13);
    LIBS.translateY(atapRumah.POSITION_MATRIX, 6);

    /*========================= POSITIO FLAPPLE ========================= */
    LIBS.translateX(badanFlapple.POSITION_MATRIX, 0);
    LIBS.translateY(badanFlapple.POSITION_MATRIX, 10);

    LIBS.translateX(kepalaFlapple.POSITION_MATRIX, -1);
    LIBS.translateY(kepalaFlapple.POSITION_MATRIX, 11.4);
    LIBS.translateZ(kepalaFlapple.POSITION_MATRIX, 11);
    LIBS.rotateX(kepalaFlapple.POSITION_MATRIX,LIBS.degToRad(-90) );
    LIBS.rotateY(kepalaFlapple.POSITION_MATRIX,LIBS.degToRad(0));
    LIBS.rotateZ(kepalaFlapple.POSITION_MATRIX,LIBS.degToRad(90) );


    LIBS.translateY(tanduk.POSITION_MATRIX,15)
    LIBS.translateZ(tanduk.POSITION_MATRIX,12.5)
    LIBS.translateX(tanduk.POSITION_MATRIX,0.5)


    LIBS.rotateX(tanduk.POSITION_MATRIX,4.6 );
    LIBS.rotateZ(tanduk.POSITION_MATRIX,0 );
    LIBS.rotateY(tanduk.POSITION_MATRIX,0.05 );

    LIBS.translateY(bagianBawahFlapple.POSITION_MATRIX, -3);
    LIBS.translateX(bagianBawahFlapple.POSITION_MATRIX, 0);

    LIBS.translateX(topiFlapple.POSITION_MATRIX, -12.4);
    LIBS.translateY(topiFlapple.POSITION_MATRIX,12);
    LIBS.translateZ(topiFlapple.POSITION_MATRIX, 0);
    LIBS.rotateY(topiFlapple.POSITION_MATRIX,LIBS.degToRad(0) );
    LIBS.rotateZ(topiFlapple.POSITION_MATRIX,LIBS.degToRad(-90) );
    LIBS.rotateX(topiFlapple.POSITION_MATRIX,LIBS.degToRad(25) );

    LIBS.translateX(mataKiriFlapple.POSITION_MATRIX, 4.5);
    LIBS.translateY(mataKiriFlapple.POSITION_MATRIX, 3.8);
    LIBS.translateZ(mataKiriFlapple.POSITION_MATRIX, 6.7);
    LIBS.rotateX(mataKiriFlapple.POSITION_MATRIX,LIBS.degToRad(-30));
    // LIBS.rotateY(mataKiriFlapple.POSITION_MATRIX,LIBS.degToRad(30));
    LIBS.rotateZ(mataKiriFlapple.POSITION_MATRIX,LIBS.degToRad(30));

    LIBS.translateX(mataKananFlapple.POSITION_MATRIX, -4.8);
    LIBS.translateY(mataKananFlapple.POSITION_MATRIX, 2.8);
    LIBS.translateZ(mataKananFlapple.POSITION_MATRIX, 6.7);
    LIBS.rotateX(mataKananFlapple.POSITION_MATRIX,LIBS.degToRad(-30));
    LIBS.rotateY(mataKananFlapple.POSITION_MATRIX,LIBS.degToRad(0));
    LIBS.rotateZ(mataKananFlapple.POSITION_MATRIX,LIBS.degToRad(-30));

    LIBS.translateZ(pupilKanan.POSITION_MATRIX,0.2 );
    LIBS.translateY(pupilKanan.POSITION_MATRIX,-0.3 );

    LIBS.translateZ(pupilKiri.POSITION_MATRIX,0.2 );
    LIBS.translateY(pupilKiri.POSITION_MATRIX,-0.3 );



    LIBS.translateX(tanganKananFlapple.POSITION_MATRIX,-8);
    LIBS.translateY(tanganKananFlapple.POSITION_MATRIX,8.5);
    LIBS.translateZ(tanganKananFlapple.POSITION_MATRIX,0 );
    LIBS.rotateZ(tanganKananFlapple.POSITION_MATRIX, LIBS.degToRad(-70));
    LIBS.rotateX(tanganKananFlapple.POSITION_MATRIX, LIBS.degToRad(0));
    LIBS.rotateY(tanganKananFlapple.POSITION_MATRIX, LIBS.degToRad(0));    
    
    LIBS.translateX(tanganKiriFlapple.POSITION_MATRIX, 7.4);
    LIBS.translateY(tanganKiriFlapple.POSITION_MATRIX, 8.3 );
    LIBS.translateZ(tanganKiriFlapple.POSITION_MATRIX, 0 );
    LIBS.rotateZ(tanganKiriFlapple.POSITION_MATRIX, LIBS.degToRad(-70));
    LIBS.rotateX(tanganKiriFlapple.POSITION_MATRIX, LIBS.degToRad(0));
    LIBS.rotateY(tanganKiriFlapple.POSITION_MATRIX,LIBS.degToRad(180));

    LIBS.translateY(sayapKanan.POSITION_MATRIX, 8.8 );
    LIBS.translateX(sayapKanan.POSITION_MATRIX, 15.3 );
    LIBS.translateZ(sayapKanan.POSITION_MATRIX, 0 );
    LIBS.rotateZ(sayapKanan.POSITION_MATRIX, LIBS.degToRad(120));
    LIBS.rotateX(sayapKanan.POSITION_MATRIX, LIBS.degToRad(180));
    LIBS.rotateY(sayapKanan.POSITION_MATRIX, LIBS.degToRad(0));

    
    LIBS.translateY(sayapKiri.POSITION_MATRIX, 0);
    LIBS.translateX(sayapKiri.POSITION_MATRIX, -4 );
    LIBS.translateZ(sayapKiri.POSITION_MATRIX, -0.3 );
    LIBS.rotateZ(sayapKiri.POSITION_MATRIX,LIBS.degToRad(0));
    LIBS.rotateX(sayapKiri.POSITION_MATRIX, LIBS.degToRad(0));
    LIBS.rotateY(sayapKiri.POSITION_MATRIX, LIBS.degToRad(0));

    LIBS.translateY(jariKiri1.POSITION_MATRIX, 0.3);
    LIBS.translateX(jariKiri1.POSITION_MATRIX, -1.7 );
    LIBS.translateZ(jariKiri1.POSITION_MATRIX, 0 );

    LIBS.translateY(jariKiri2.POSITION_MATRIX, 0.2);
    LIBS.translateX(jariKiri2.POSITION_MATRIX, -2 );
    LIBS.translateZ(jariKiri2.POSITION_MATRIX, 0);
    // LIBS.rotateY(jariKiri2.POSITION_MATRIX,LIBS.degToRad());


    
    LIBS.translateY(jariKanan1.POSITION_MATRIX, 0.3);
    LIBS.translateX(jariKanan1.POSITION_MATRIX, 1.8 );
    LIBS.translateZ(jariKanan1.POSITION_MATRIX, 0 );

    LIBS.translateY(jariKanan2.POSITION_MATRIX, 0.3);
    LIBS.translateX(jariKanan2.POSITION_MATRIX, 2 );
    LIBS.translateZ(jariKanan2.POSITION_MATRIX, 0);


    // HYDRA
    LIBS.translateX(hydrapple.POSITION_MATRIX, 5); // Posisi X
    LIBS.translateY(hydrapple.POSITION_MATRIX, 2    ); // Posisi Y
    LIBS.translateZ(hydrapple.POSITION_MATRIX, 5); // Posisi Z


    // APPTUN   
    LIBS.translateX(appletun.POSITION_MATRIX, -10); // Posisi di kiri
    LIBS.translateY(appletun.POSITION_MATRIX, 2);
    LIBS.translateZ(appletun.POSITION_MATRIX, 0);

    // DIPLIN
    LIBS.translateX(dipplin.POSITION_MATRIX, -3);
    LIBS.translateY(dipplin.POSITION_MATRIX, 2.3);
    LIBS.translateZ(dipplin.POSITION_MATRIX, 0);

    // CHILD
    badanFlapple.addChild(kepalaFlapple);
    badanFlapple.addChild(bagianBawahFlapple);
    kepalaFlapple.addChild(topiFlapple);

    kepalaFlapple.addChild(tanduk);
    kepalaFlapple.addChild(mataKiriFlapple);
    kepalaFlapple.addChild(mataKananFlapple);
    badanFlapple.addChild(tanganKananFlapple);
    badanFlapple.addChild(tanganKiriFlapple);
    tanganKananFlapple.addChild(sayapKanan);
    tanganKiriFlapple.addChild(sayapKiri);
    tanganKiriFlapple.addChild(jariKiri1);  
    tanganKiriFlapple.addChild(jariKiri2);
    tanganKananFlapple.addChild(jariKanan1);
    tanganKananFlapple.addChild(jariKanan2);
    mataKananFlapple.addChild(pupilKanan);
    mataKiriFlapple.addChild(pupilKiri);

    









    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);

    /*========================= MOUSE EVENTS ========================= */

// Mencegah menu konteks (menu klik kanan) muncul di canvas
CANVAS.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

CANVAS.addEventListener('mousedown', function (e) {
    e.preventDefault();
    mouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Tentukan mode berdasarkan tombol mouse
    if (e.button === 0) { // Klik Kiri
        dragMode = "rotate";
        CANVAS.style.cursor = 'grabbing';
    } else if (e.button === 2) { // Klik Kanan
        dragMode = "pan";
        CANVAS.style.cursor = 'move';
    }
});

document.addEventListener('mouseup', function (e) {
    mouseDown = false;
    dragMode = "none";
    CANVAS.style.cursor = 'grab';
});

document.addEventListener('mousemove', function (e) {
    if (!mouseDown) return; // Keluar jika mouse tidak sedang ditekan

    var deltaX = e.clientX - mouseX;
    var deltaY = e.clientY - mouseY;

    if (dragMode === "rotate") {
        // --- Mode Rotasi (kode lama Anda) ---
        rotationY += deltaX * sensitivity;
        rotationX += deltaY * sensitivity;
        // Baris ini membatasi putaran (agar tidak terbalik)
        rotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotationX));

    } else if (dragMode === "pan") {
        // --- Mode Panning (BARU) ---
        // Menggeser kamera
        // deltaX menggeser panX
        // deltaY menggeser panY (dibalik, agar mouse ke atas = kamera ke atas)
        panX += deltaX * panSensitivity;
        panY -= deltaY * panSensitivity;
    }

    // Perbarui posisi mouse terakhir
    mouseX = e.clientX;
    mouseY = e.clientY;
});

CANVAS.style.cursor = 'grab';

// Event listener untuk zoom (TIDAK BERUBAH)
CANVAS.addEventListener('wheel', function(e) {
    e.preventDefault(); 
    cameraZ += e.deltaY * zoomSensitivity;
    cameraZ = Math.max(-50, Math.min(-10, cameraZ));
});

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0, 0, 0, 0); 
    GL.clearDepth(1.0);

    // Setup semua objek
    // LATAR BELAKANG
    tanah.setup();
    batangPohon.setup();
    daunPohon.setup();
    dindingRumah.setup();
    atapRumah.setup();
    mesh.setup();
    


    // POKEMON FLAPPE
    badanFlapple.setup();

    hydrapple.setup();

    appletun.setup();

    dipplin.setup();


        

    var hoverMatrix = LIBS.get_I4();
    var flapMatrixKiri = LIBS.get_I4();
    var flapMatrixKanan = LIBS.get_I4();

    var animate = function (time) {
        // Konversi waktu dari milidetik ke detik
        var timeInSeconds = time * 0.001;

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        var VIEWMATRIX = LIBS.get_I4();

        // 1. Urutan Kamera (kode Anda sudah benar)
        LIBS.translateZ(VIEWMATRIX, cameraZ);
        LIBS.translateX(VIEWMATRIX, panX);
        LIBS.translateY(VIEWMATRIX, panY);
        LIBS.rotateX(VIEWMATRIX, rotationX);
        LIBS.rotateY(VIEWMATRIX, rotationY);

        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

        // ==========================================================
        // --- MULAI KODE ANIMASI (TARUH DI SINI) ---
        // ==========================================================

        // --- 1. Animasi Hover (Naik-Turun) ---
        // Kita terapkan ini ke badan, dan semua child akan ikut
        var hoverSpeed = 1;
        var hoverAmplitude = 0.2; // Seberapa jauh naik-turunnya
        var hoverY = Math.sin(timeInSeconds * hoverSpeed) * hoverAmplitude;
        
        // Reset matriks hover dan terapkan translasi Y
        hoverMatrix = LIBS.get_I4(); // Reset ke identitas
        LIBS.translateY(hoverMatrix, hoverY);
        
        // Set matriks gerak badan
        badanFlapple.MOVE_MATRIX = hoverMatrix;

        // --- 2. Animasi Kepak TANGAN ---
        var flapSpeed = 1;
        var flapRangeY = Math.PI/20; // 60 derajat
        var flapAngle = Math.sin(timeInSeconds * flapSpeed) * flapRangeY;

        // a. Sayap Kiri
        flapMatrixKiri = LIBS.get_I4(); // Reset
        
        // PENTING: Ganti 'rotateZ' ke 'rotateX' atau 'rotateY' jika
        // sayap Anda berputar ke arah yang salah.
        LIBS.rotateY(flapMatrixKiri, flapAngle);
        
        // // Terapkan ke matriks gerak sayap kiri
        tanganKiriFlapple.MOVE_MATRIX = flapMatrixKiri;
        sayapKiri.MOVE_MATRIX = flapMatrixKiri;
        jariKiri1.MOVE_MATRIX = flapMatrixKiri;
        jariKiri2.MOVE_MATRIX = flapMatrixKiri;
        

        // b. Sayap Kanan (arah berlawanan)
        flapMatrixKanan = LIBS.get_I4(); // Reset
        LIBS.rotateY(flapMatrixKanan, -flapAngle); // Gunakan -flapAngle
        
        // Terapkan ke matriks gerak sayap kanan
        tanganKananFlapple.MOVE_MATRIX = flapMatrixKanan;
        sayapKanan.MOVE_MATRIX = flapMatrixKanan;
        jariKanan1.MOVE_MATRIX = flapMatrixKanan;
        jariKanan2.MOVE_MATRIX = flapMatrixKanan;
        


        

        // ==========================================================
        // --- AKHIR KODE ANIMASI ---
        // ==========================================================


        // Render semua objek
        // Kita hanya perlu me-render objek "root" (induk)
        // Anak-anaknya akan di-render secara otomatis oleh fungsi render() mereka
        tanah.render(LIBS.get_I4());
        batangPohon.render(LIBS.get_I4());
        daunPohon.render(LIBS.get_I4());
        dindingRumah.render(LIBS.get_I4());
        atapRumah.render(LIBS.get_I4());
        badanFlapple.render(LIBS.get_I4()); // <--- Cukup panggil ini
        hydrapple.render(LIBS.get_I4());
        appletun.render(LIBS.get_I4());
        dipplin.render(LIBS.get_I4());




        GL.flush();
        window.requestAnimationFrame(animate);
    };
    animate(0);

    /*========================= WINDOW RESIZE ========================= */
    window.addEventListener('resize', function () {
        CANVAS.width = window.innerWidth;
        CANVAS.height = window.innerHeight;
        PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
    });
}

window.addEventListener('load', main);