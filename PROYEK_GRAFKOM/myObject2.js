// myObject.js

export class MyObject {
  GL = null;
  SHADER_PROGRAM = null;

  _position = null;
  _color = null;
  _MMatrix = null;

  OBJECT_VERTEX = null;
  OBJECT_FACES = null;

  vertex = [];
  faces = [];

  POSITION_MATRIX = LIBS.get_I4(); // Mpos
  MOVE_MATRIX = LIBS.get_I4(); // Mmove

  childs = [];

  addChild(child) {
    this.childs.push(child);
  }

  constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix) {
    this.GL = GL;
    this.SHADER_PROGRAM = SHADER_PROGRAM;
    this._position = _position;
    this._color = _color;
    this._MMatrix = _Mmatrix;
  }

  /**=============================  FUNGSI GENERATE BENTUK FLAPPLE  =================== */

generateBadanFlapple(
    length = 5,
    max_width = 1.5,
    min_width_factor = 0.5,
    thickness = 1,
    segments_along_length = 60,
    segments_around_circumference = 10,
    bend_frequency = 1.7,
    bend_amplitude = 1.2,
    
    color_sisi_dua = [0.2, 0.6, 0.2], // Hijau (Bawah)
    color_sisi_satu = [0.75, 0.89, 0.67] // Krem (Atas)
) {
    this.vertex = [];
    this.faces = [];

    // --- PERUBAHAN: Loop 'k' (lapisan) dihapus ---
    // Kita hanya membuat satu bentuk, bukan dua.

    for (let i = 0; i <= segments_along_length; i++) {
        const u_norm = i / segments_along_length; // Normalized position along the length (0 to 1)

        // 1. Variasi lebar sepanjang tubuh
        const width_factor = min_width_factor + (1 - min_width_factor) * Math.sin(u_norm * Math.PI);
        const current_width = max_width * width_factor;

        // 2. Menghitung posisi Y (sepanjang tubuh) dan X (tikungan)
        const y_base = (u_norm - 0.5) * length; 
        const x_bend_offset = bend_amplitude * Math.sin(u_norm * Math.PI * bend_frequency);

        // Loop untuk membuat penampang elips
        for (let j = 0; j <= segments_around_circumference; j++) {
            const v_norm = j / segments_around_circumference; // Normalized position around circumference (0 to 1)
            const angle = v_norm * 2 * Math.PI; // 0 sampai 360 derajat

            // Bentuk penampang elips
            const x_offset = (current_width / 2) * Math.cos(angle);
            const z_offset = (thickness / 2) * Math.sin(angle); 

            // --- PERUBAHAN DI SINI: Logika warna berdasarkan angle ---
            // angle < Math.PI (0-180 derajat) adalah separuh atas (z positif)
            // angle >= Math.PI (180-360 derajat) adalah separuh bawah (z negatif)
            const current_color = (angle < Math.PI) ? color_sisi_satu : color_sisi_dua;

            // Koordinat final
            const final_x = x_bend_offset + x_offset;
            const final_y = y_base;
            // --- PERUBAHAN: 'z_offset_base' dihapus ---
            const final_z = z_offset; 

            this.vertex.push(final_x, final_y, final_z);
            this.vertex.push(current_color[0], current_color[1], current_color[2]);
        }
    }


    // --- Membuat Faces ---
    const points_per_segment_u = segments_around_circumference + 1;
    
    // --- PERUBAHAN: Loop 'k' (lapisan) dihapus ---
    // Kita hanya membuat faces untuk satu lapisan
    
    for (let i = 0; i < segments_along_length; i++) { // Sepanjang tubuh
        for (let j = 0; j < segments_around_circumference; j++) { // Keliling penampang
            
            // --- PERUBAHAN: 'layer_start_index' dihapus ---
            const idx_current_segment_curr_around = (i * points_per_segment_u) + j;
            const idx_current_segment_next_around = (i * points_per_segment_u) + j + 1;
            const idx_next_segment_curr_around = ((i + 1) * points_per_segment_u) + j;
            const idx_next_segment_next_around = ((i + 1) * points_per_segment_u) + j + 1;

            // Quad untuk sisi melingkar
            this.faces.push(idx_current_segment_curr_around, idx_next_segment_curr_around, idx_next_segment_next_around);
            this.faces.push(idx_current_segment_curr_around, idx_next_segment_next_around, idx_current_segment_next_around);
        }
    }
}

   generateTanduk(
    length = 2,
    radiusX = 0.2,
    radiusZ = 0.2,
    bendAmplitude = -0.2,
    bendFrequency = 1.,
    bendDirection = 1,
    color = [0.2, 0.6, 0.2],
    radialSegments = 30,
    angularSegments = 30
) {
    this.vertex = [];
    this.faces = [];

    // Loop dari ujung lancip (puncak) ke ujung lebar (bukaan)
    for (let i = 0; i <= radialSegments; i++) {
        // u adalah parameter yang berjalan dari 0 (puncak) ke 1 (bukaan)
        const u = i / radialSegments;

        // --- Logika Lengkungan (Bend) ---
        // Offset dihitung berdasarkan posisi sepanjang tanduk (u)
        // Semakin dekat ke bukaan (u=1), semakin besar offsetnya.
        const bendOffset = bendAmplitude * Math.sin(u * Math.PI * bendFrequency) * bendDirection;

        // Loop untuk membuat lingkaran elips di setiap segmen radial
        for (let j = 0; j <= angularSegments; j++) {
            // v adalah parameter sudut dari 0 hingga 2*PI
            const v = j * 2 * Math.PI / angularSegments;
            const cosV = Math.cos(v);
            const sinV = Math.sin(v);

            // --- Persamaan Parametrik untuk Paraboloid Eliptik ---
            // Tanduk diorientasikan sepanjang sumbu Y
            // Radius x dan z bertambah seiring dengan u (jarak dari puncak)
            const x_base = radiusX * u * cosV;
            const z_base = radiusZ * u * sinV;
            // Posisi y ditentukan oleh u^2, yang menciptakan kurva parabolik
            const y_base = length * u * u;

            // --- Terapkan Lengkungan ---
            // Tambahkan offset hanya pada sumbu X
            const final_x = x_base + bendOffset;
            const final_y = y_base;
            const final_z = z_base;

            // Masukkan koordinat vertex dan warna
            this.vertex.push(final_x, final_y, final_z);
            this.vertex.push(color[0], color[1], color[2]); // Koreksi kecil: menggunakan color[2] untuk biru
        }
    }

    // --- Pembuatan Faces (Indeks) ---
    // Logika ini sama persis karena kita masih membuat grid 2D (radial x angular)
    for (let i = 0; i < radialSegments; i++) {
        for (let j = 0; j < angularSegments; j++) {
            const first = (i * (angularSegments + 1)) + j;
            const second = first + angularSegments + 1;

            this.faces.push(first, second, first + 1);
            this.faces.push(second, second + 1, first + 1);
        }
    }
}


generateTopiFlapple(
 width = 0.7,
  height = 2.3,
  thickness = 0.2,
  segment_u = 40, // Digunakan sebagai 'radialSegments' (vertikal)
  segment_v = 10, // Digunakan sebagai 'angularSegments' (melingkar)
 ) {
  this.vertex = [];
  this.faces = [];

  // --- Mengadopsi Logika Bentuk Bicone dari 'Topi' ---
  const lengthBottom = height ;
  const lengthTop = height ;
  const totalLength = lengthTop + lengthBottom;
  const x_radius = width ;
  const z_radius = width / 2.0;

  // --- 1. GENERATE VERTICES ---
  for (let k = 0; k <= 1; k++) {
    const z_offset_base = k === 0 ? -thickness / 2 : thickness / 2;
    const warna = k === 1 ? [1.0, 0.0, 0.0] : [0.96, 0.96, 0.86];

    for (let i = 0; i <= segment_u; i++) {
      const u = i / segment_u;
      let y_pos, scaleFactor;

      if (u * totalLength < lengthBottom) {
        const u_bottom = (u * totalLength) / lengthBottom;
        y_pos = -lengthBottom + (u * totalLength);
        scaleFactor = u_bottom;
      } else {
        const u_top = (u * totalLength - lengthBottom) / lengthTop;
        y_pos = u_top * lengthTop;
        scaleFactor = 1.0 - u_top;
      }

      // --- PERUBAHAN DI SINI ---
      // Baris ini yang menyebabkan 'ring' di tengah. Kita nonaktifkan.
      // const asymmetrical_y_offset =
      //   Math.sin(u * Math.PI * 2) * (thickness * 0.1);
      // --- AKHIR PERUBAHAN ---

      const z_jitter = (Math.random() - 0.5) * (thickness * 0.1);

      for (let j = 0; j <= segment_v; j++) {
        const v = j / segment_v;
        const angle = v * Math.PI * 2;
        const x = Math.cos(angle) * x_radius * scaleFactor;
        const z_shape = Math.sin(angle) * z_radius * scaleFactor;
        const z_coord = z_shape + z_offset_base + z_jitter;
        
        // --- PERUBAHAN DI SINI ---
        // Kita gunakan 'y_pos' murni tanpa 'asymmetrical_y_offset'
        this.vertex.push(
          x,
          y_pos, // <-- HANYA y_pos
          z_coord
        );
        // --- AKHIR PERUBAHAN ---

        this.vertex.push(...warna);
      }
    }
  }

  // --- 2. GENERATE FACES (PERMUKAAN DEPAN & BELAKANG) ---
  const points_per_layer = (segment_u + 1) * (segment_v + 1);

  for (let k = 0; k <= 1; k++) {
    const base_idx = k * points_per_layer;
    const isReversed = (k === 1); 

    for (let i = 0; i < segment_u; i++) {
      for (let j = 0; j < segment_v; j++) {
        
        const first = base_idx + (i * (segment_v + 1)) + j;
        const second = first + segment_v + 1;

        if (isReversed) {
          this.faces.push(first, first + 1, second);
          this.faces.push(second, first + 1, second + 1);
        } else {
          this.faces.push(first, second, first + 1);
          this.faces.push(second, second + 1, first + 1);
        }
      }
    }
  }

  // --- 3. GENERATE CONNECTING FACES (MENIRU "TEPI" SAYAP) ---
  const j_kanan = 0; 
  const j_kiri = Math.floor(segment_v / 2); 

  for (let i = 0; i < segment_u; i++) {
    
    // --- Logika "Kanan" (di j=j_kanan) ---
    const l0_i_kanan = (i * (segment_v + 1)) + j_kanan;
    const l1_i_kanan = l0_i_kanan + points_per_layer;
    const l0_next_i_kanan = ((i + 1) * (segment_v + 1)) + j_kanan;
    const l1_next_i_kanan = l0_next_i_kanan + points_per_layer;
    
    this.faces.push(l0_i_kanan, l0_next_i_kanan, l1_next_i_kanan);
    this.faces.push(l0_i_kanan, l1_next_i_kanan, l1_i_kanan);

    // --- Logika "Kiri" (di j=j_kiri) ---
    const l0_i_kiri = (i * (segment_v + 1)) + j_kiri;
    const l1_i_kiri = l0_i_kiri + points_per_layer;
    const l0_next_i_kiri = ((i + 1) * (segment_v + 1)) + j_kiri;
    const l1_next_i_kiri = l0_next_i_kiri + points_per_layer;

    this.faces.push(l0_i_kiri, l1_next_i_kiri, l0_next_i_kiri);
    this.faces.push(l0_i_kiri, l1_i_kiri, l1_next_i_kiri);
  }
}

generateKepalaFlapple(
    radiusX = 0.7,
    radiusY = 1.7,
    radiusZ = 0.7,
    taperFactor = 1.6,
    bendAmplitude = 1,
    bendFrequency = 0.4,
    bendDirection = 1,
    color = [0.2, 0.6, 0.2],      // Warna utama (misal: Hijau)
    color_krem = [0.75, 0.89, 0.67], // Warna kedua (Krem)
    
    // Parameter 'color_split_point' tidak lagi digunakan
    // color_split_point = 0.5,     

    latitudeBands = 30,
    longitudeBands = 30
) {
    this.vertex = [];
    this.faces = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const lat_norm = latNumber / latitudeBands; // 0 (atas) ke 1 (bawah)

        const modified_lat_norm = Math.pow(lat_norm, taperFactor);
        const theta = modified_lat_norm * Math.PI;
        const sinTheta = Math.sin(theta);
        const x_bend_offset = bendAmplitude * Math.sin(lat_norm * Math.PI * bendFrequency) * bendDirection;

        // --- LOGIKA WARNA DIPINDAHKAN DARI SINI ---

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi); // cosPhi menentukan X (kiri/kanan)

            // --- PERUBAHAN DI SINI: Logika warna berdasarkan 'cosPhi' ---
            // Jika cosPhi >= 0 (Sisi KANAN / X positif), gunakan 'color' (hijau)
            // Jika cosPhi < 0 (Sisi KIRI / X negatif), gunakan 'color_krem'
            const current_color = (cosPhi >= 0) ? color : color_krem;
            // -------------------------------------------------------------

            const x_base = radiusX * cosPhi * sinTheta;
            const y_base = radiusY * -Math.cos(latNumber * Math.PI / latitudeBands);
            const z_base = radiusZ * sinPhi * sinTheta;

            const final_x = x_base + x_bend_offset;
            const final_y = y_base;
            const final_z = z_base;

            this.vertex.push(final_x, final_y, final_z);
            this.vertex.push(current_color[0], current_color[1], current_color[2]);
        }
    }

    // Faces (tidak berubah)
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            this.faces.push(first, second, first + 1);
            this.faces.push(second, second + 1, first + 1);
        }
    }
}

  generatePupil (a=0.1,b=0.1,c=0.1, color = [0, 0, 0], latitudeBands = 30, longitudeBands = 30) {
    this.vertex = [];
    this.faces = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = a * cosPhi * sinTheta;
            const y = b * cosTheta;
            const z = c * sinPhi * sinTheta;

            // Interleave vertex dan color, sama seperti fungsi Anda yang lain
            this.vertex.push(x, y, z);
            this.vertex.push(...color);
        }
    }

    // Pembuatan Faces (Indeks)
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            this.faces.push(first, second, first + 1);
            this.faces.push(second, second + 1, first + 1);
        }
    }
  }

  generateMataFlapple(
    radiusX = 0.7,
    radiusY = 0.2,
    radiusZ = 0.2,
    taperFactor = 1.5, // Defaultnya membuat bagian atas lebih kecil
    color = [1, 0.8, 0],
    latitudeBands = 30,
    longitudeBands = 30
) {
    this.vertex = [];
    this.faces = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        // lat_norm berjalan dari 0.0 (puncak atas) ke 1.0 (puncak bawah)
        const lat_norm = latNumber / latitudeBands;

        // --- INI BAGIAN PENTING UNTUK PERUNCINGAN ---
        // Kita memodifikasi progresi vertikal menggunakan Math.pow().
        // Ini mengubah 'theta' sehingga lebar elips (sinTheta)
        // tidak lagi simetris dari atas ke bawah.
        const modified_lat_norm = Math.pow(lat_norm, taperFactor);
        const theta = modified_lat_norm * Math.PI;
        
        const sinTheta = Math.sin(theta);
        const cosLatNorm = Math.cos(lat_norm * Math.PI); // Untuk posisi Y

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // Koordinat X dan Z menggunakan theta yang sudah dimodifikasi
            // untuk menciptakan efek peruncingan.
            const x = radiusX * sinTheta * cosPhi;
            const z = radiusZ * sinTheta * sinPhi;
            
            // Koordinat Y menggunakan progresi linear asli agar tinggi objek
            // tetap terjaga dan tidak terdistorsi.
            const y = radiusY * -cosLatNorm;

            this.vertex.push(x, y, z);
            this.vertex.push(...color);
        }
    }

    // --- Pembuatan Faces (Indeks) ---
    // Logika ini tidak perlu diubah, sama seperti elipsoid standar.
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            this.faces.push(first, second, first + 1);
            this.faces.push(second, second + 1, first + 1);
        }
    }
}


  generateWadahFlapple(
    radius = 4,
    height = 2,
    thickness = 0.5, // <-- BARU: Parameter ketebalan diaktifkan
    segment_radial = 40,
    segment_vertikal = 30,
    wave_frequency = 6,
    wave_amplitude = 1 // Default 0, tapi bisa diisi untuk gelombang
) {
    this.vertex = [];
    this.faces = [];

    const warna_dalam = [0.96, 0.96, 0.86]; // Merah
    const warna_luar = [1, 0, 0]; // --- BARU: Warna Krem (Beige)
    
    // --- BARU: Helper untuk indexing ---
    const points_per_shell = 1 + segment_vertikal * segment_radial;

    // Index untuk sisi DALAM (Merah)
    const getIndexInner = (v, u) => {
        if (v === 0) return 0; // Titik tengah bawah DALAM
        return 1 + (v - 1) * segment_radial + u;
    };
    
    // Index untuk sisi LUAR (Krem)
    const getIndexOuter = (v, u) => {
        if (v === 0) return points_per_shell; // Titik tengah bawah LUAR
        return points_per_shell + 1 + (v - 1) * segment_radial + u;
    };

    // =======================================================
    // 1. BUAT VERTICES (Titik-titik)
    // =======================================================

    // --- A. Buat Vertices Sisi DALAM (Merah) ---

    // Titik tengah bawah DALAM
    this.vertex.push(0, 0, 0, ...warna_dalam);

    // Cincin-cincin vertikal DALAM
    for (let v = 1; v <= segment_vertikal; v++) {
        const v_norm = v / segment_vertikal;
        const base_r_mid = Math.sqrt(v_norm) * radius;

        for (let u = 0; u < segment_radial; u++) {
            const u_norm = u / segment_radial;
            const angle = u_norm * 2 * Math.PI;

            const scaled_wave_amplitude = wave_amplitude * v_norm;
            const wave_effect = scaled_wave_amplitude * Math.sin(angle * wave_frequency);
            
            const r_mid = base_r_mid;
            // Posisi Y Sisi DALAM
            const y_pos = (v_norm * height) + wave_effect; 

            const x_mid = r_mid * Math.cos(angle);
            const z_mid = r_mid * Math.sin(angle);
            
            this.vertex.push(x_mid, y_pos, z_mid, ...warna_dalam);
        }
    }

    // --- B. Buat Vertices Sisi LUAR (Krem) ---
    //    (Offset/digeser ke bawah sebesar 'thickness')

    // Titik tengah bawah LUAR
    this.vertex.push(0, -thickness, 0, ...warna_luar); // Digeser ke bawah

    // Cincin-cincin vertikal LUAR
    for (let v = 1; v <= segment_vertikal; v++) {
        const v_norm = v / segment_vertikal;
        // Profil radius sama persis dengan sisi dalam
        const base_r_mid = Math.sqrt(v_norm) * radius; 

        for (let u = 0; u < segment_radial; u++) {
            const u_norm = u / segment_radial;
            const angle = u_norm * 2 * Math.PI;

            const scaled_wave_amplitude = wave_amplitude * v_norm;
            const wave_effect = scaled_wave_amplitude * Math.sin(angle * wave_frequency);
            
            const r_mid = base_r_mid;
            // Posisi Y Sisi LUAR (Sama seperti dalam, tapi dikurangi thickness)
            const y_pos = (v_norm * height) + wave_effect - thickness; // <-- Perbedaan

            const x_mid = r_mid * Math.cos(angle);
            const z_mid = r_mid * Math.sin(angle);
            
            this.vertex.push(x_mid, y_pos, z_mid, ...warna_luar);
        }
    }

    // =======================================================
    // 2. BUAT FACES (Permukaan)
    // =======================================================

    // --- A. Buat Faces Sisi DALAM (Merah) ---
    const bottom_idx_inner = getIndexInner(0, 0);
    for (let u = 0; u < segment_radial; u++) {
        const u_next = (u + 1) % segment_radial;
        const idx1 = getIndexInner(1, u);
        const idx2 = getIndexInner(1, u_next);
        this.faces.push(bottom_idx_inner, idx1, idx2); // Arah putaran dalam
    }

    for (let v = 1; v < segment_vertikal; v++) {
        for (let u = 0; u < segment_radial; u++) {
            const u_next = (u + 1) % segment_radial;
            const idx1 = getIndexInner(v, u);
            const idx2 = getIndexInner(v, u_next);
            const idx3 = getIndexInner(v + 1, u_next);
            const idx4 = getIndexInner(v + 1, u);
            this.faces.push(idx1, idx3, idx2); // Arah putaran dalam
            this.faces.push(idx1, idx4, idx3);
        }
    }

    // --- B. Buat Faces Sisi LUAR (Krem) ---
    // --- BARU ---
    const bottom_idx_outer = getIndexOuter(0, 0);
    for (let u = 0; u < segment_radial; u++) {
        const u_next = (u + 1) % segment_radial;
        // Gunakan getIndexOuter
        const idx1 = getIndexOuter(1, u);
        const idx2 = getIndexOuter(1, u_next);
        // Arah putaran dibalik (idx2, idx1) agar terlihat dari luar
        this.faces.push(bottom_idx_outer, idx2, idx1); 
    }

    for (let v = 1; v < segment_vertikal; v++) {
        for (let u = 0; u < segment_radial; u++) {
            const u_next = (u + 1) % segment_radial;
            const idx1 = getIndexOuter(v, u);
            const idx2 = getIndexOuter(v, u_next);
            const idx3 = getIndexOuter(v + 1, u_next);
            const idx4 = getIndexOuter(v + 1, u);
            // Arah putaran dibalik agar terlihat dari luar
            this.faces.push(idx1, idx2, idx3); 
            this.faces.push(idx1, idx3, idx4);
        }
    }

    // --- C. Buat Faces "Bibir" Penyambung (Krem) ---
    // --- BARU ---
    // Ini menyambungkan cincin teratas sisi dalam dan sisi luar
    const v_top = segment_vertikal;
    for (let u = 0; u < segment_radial; u++) {
        const u_next = (u + 1) % segment_radial;

        const idx1_in = getIndexInner(v_top, u);
        const idx2_in = getIndexInner(v_top, u_next);
        const idx1_out = getIndexOuter(v_top, u);
        const idx2_out = getIndexOuter(v_top, u_next);

        // Membuat 2 segitiga (quad) untuk menutup celah
        this.faces.push(idx1_in, idx2_in, idx2_out);
        this.faces.push(idx1_in, idx2_out, idx1_out);
    }
}

 generateTanganFlapple(
    a = 0.3, b =2, c = 0.3, 
    stack = 30, 
    step = 30,
    bend_amplitude = 1, // <-- BARU: Seberapa jauh lengkungannya
    bend_frequency = 1    // <-- BARU: Berapa banyak tikungan (1 = C-shape, 2 = S-shape)
) {
    this.vertex = [];
    this.faces = [];

    for (var i = 0; i <= stack; i++) {
        // --- PERBAIKAN BUG ---
        // i_norm berjalan dari 0 ke 1
        const i_norm = i / stack; 
        // u berjalan dari -PI/2 ke PI/2, agar cos(u) selalu positif (0 ke 1 ke 0)
        var u = i_norm * Math.PI - (Math.PI / 2); 
        // --- AKHIR PERBAIKAN BUG ---

        // --- LOGIKA LENGKUNGAN ---
        // Hitung pergeseran (offset) di sumbu X berdasarkan posisi (i_norm)
        // Ini adalah "tulang punggung" yang melengkung
        const x_bend_offset = bend_amplitude * Math.sin(i_norm * Math.PI * bend_frequency);
        // --- AKHIR LOGIKA LENGKUNGAN ---

        for (var j = 0; j <= step; j++) {
            // --- PERBAIKAN BUG ---
            var v = (j / step) * Math.PI * 2; // j dinormalisasi dengan step
            // --- AKHIR PERBAIKAN BUG ---

            var radiusScale = Math.pow(Math.cos(u), 0.7); // Sekarang aman dari NaN

            // Hitung bentuk penampang lokal
            var x_local = a * Math.cos(v) * radiusScale;
            var y = b * Math.sin(u); // Posisi Y (panjang) dari -1 ke 1
            var z_local = c * Math.sin(v) * radiusScale;

            // --- APLIKASI LENGKUNGAN ---
            // Tambahkan offset lengkungan ke posisi x lokal
            var x = x_local + x_bend_offset; 
            var z = z_local;
            // --- AKHIR APLIKASI LENGKUNGAN ---

            this.vertex.push(x, y, z);
            this.vertex.push(0.2, 0.6, 0.2); // Warna
        }
    }

    // Pembuatan Faces (Tidak perlu diubah)
    for (var i = 0; i < stack; i++) {
      for (var j = 0; j < step; j++) {
        var first = i * (step + 1) + j;
        var second = first + step + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }
}

 generateEllipseJari(
    a = 0.2, b =0.3, c = 0.6, stack = 50, step = 50, 
    asymmetry_factor = 10// <-- BARU: < 1 = Bawah besar, > 1 = Atas besar
) {
    this.vertex = [];
    this.faces = [];

    for (var i = 0; i <= stack; i++) {
        // --- MODIFIKASI ASIMETRIS ---
        // i_norm berjalan dari 0.0 sampai 1.0
        var i_norm = i / stack; 
        
        // Terapkan Math.pow untuk 'melengkungkan' distribusi i_norm
        // Ini akan menggeser bagian terlebar (equator)
        var warped_i_norm = Math.pow(i_norm, asymmetry_factor);

        // u sekarang dihitung dari nilai yang sudah 'melengkung'
        var u = warped_i_norm * Math.PI;
        // --- AKHIR MODIFIKASI ---

      for (var j = 0; j <= step; j++) {
        // v adalah sudut azimuthal (horizontal), dari 0 sampai 2*PI (0 sampai 360 derajat)
        var v = (j / step) * 2 * Math.PI;

        // Rumus parametrik (tidak berubah, tapi 'u' sekarang asimetris)
        var x = a * Math.sin(u) * Math.cos(v);
        var y = b * Math.cos(u);
        var z = c * Math.sin(u) * Math.sin(v);

        this.vertex.push(x, y, z);
        this.vertex.push(0.2, 0.6, 0.2);
      }
    }

    // Logika untuk membuat faces (segitiga) tidak perlu diubah.
    for (var i = 0; i < stack; i++) {
      for (var j = 0; j < step; j++) {
        var first = i * (step + 1) + j;
        var second = first + step + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }
  }


generateEllipseSayap(
  width = 3,
  height = 8,
  thickness = 0.5,
  segment_u = 40,
  segment_v = 10,
  wave_frequency = 5, // Menggunakan 5 untuk 3 tonjolan
  wave_amplitude = 0.5, // <-- NILAI INI MUNGKIN PERLU DISESUAIKAN (lebih kecil)
  c_bend_amount = 1// <-- TAMBAHAN: Kontrol kelengkungan 'C', sesuaikan nilainya
) {
  this.vertex = [];
  this.faces = [];

  for (let k = 0; k <= 1; k++) {
    const z_offset_base = k === 0 ? -thickness / 2 : thickness / 2;
    const warna = k === 1 ? [1.0, 0.0, 0.0] : [0.96, 0.96, 0.86];

    for (let i = 0; i <= segment_u; i++) {
      const u_norm = i / segment_u;
      const base_radius_factor = Math.sin(u_norm * Math.PI);

      // --- Bagian Gelombang (tidak berubah) ---
      const wave_effect =
        wave_amplitude * Math.sin(u_norm * Math.PI * wave_frequency);
      const waved_radius_factor = base_radius_factor + wave_effect;
      // --- Akhir Bagian Gelombang ---

      const x_coord_kanan = (base_radius_factor * width) / 2;
      const x_coord_kiri = (waved_radius_factor * width) / 2;

      const y_coord = (u_norm - 0.5) * height;

      // --- PERUBAHAN UNTUK BENTUK C ---
      // Hitung offset Z untuk membuat lengkungan.
      // Math.sin(u_norm * Math.PI) bernilai 0 di ujung (u=0, u=1)
      // dan 1 di tengah (u=0.5), menciptakan lengkungan C.
      const z_bend_offset = Math.sin(u_norm * Math.PI) * c_bend_amount;
      // --- AKHIR PERUBAHAN ---

      const asymmetrical_y_offset =
        Math.sin(u_norm * Math.PI * 2) * (thickness * 0.1);
      
      // Tambahkan z_bend_offset ke perhitungan z_coord
      const z_coord =
        z_offset_base +               // Offset tebal asli
        z_bend_offset +               // Offset lengkungan C
        (Math.random() - 0.5) * (thickness * 0.1); // Random noise

      this.vertex.push(
        x_coord_kanan,
        y_coord + asymmetrical_y_offset,
        z_coord // z_coord sekarang melengkung
      );
      this.vertex.push(...warna);

      this.vertex.push(
        -x_coord_kiri,
        y_coord + asymmetrical_y_offset,
        z_coord // z_coord sekarang melengkung
      );
      this.vertex.push(...warna);
    }
  }

  // --- Bagian Faces tidak berubah ---
  const total_points_per_layer = (segment_u + 1) * 2;
  for (let k = 0; k <= 1; k++) {
    const layer_start_index = k * total_points_per_layer;
    for (let i = 0; i < segment_u; i++) {
      const idx1_right = layer_start_index + i * 2;
      const idx2_right = layer_start_index + (i + 1) * 2;
      const idx1_left = layer_start_index + i * 2 + 1;
      const idx2_left = layer_start_index + (i + 1) * 2 + 1;

      if (k === 1) {
        this.faces.push(idx1_left, idx2_left, idx1_right);
        this.faces.push(idx2_left, idx2_right, idx1_right);
      } else {
        this.faces.push(idx1_right, idx2_right, idx2_left);
        this.faces.push(idx1_right, idx2_left, idx1_left);
      }
    }
  }

  for (let i = 0; i <= segment_u; i++) {
    const top_right_idx = total_points_per_layer + i * 2;
    const bottom_right_idx = i * 2;
    const next_top_right_idx = total_points_per_layer + (i + 1) * 2;
    const next_bottom_right_idx = (i + 1) * 2;

    if (i < segment_u) {
      this.faces.push(
        bottom_right_idx,
        next_bottom_right_idx,
        next_top_right_idx
      );
      this.faces.push(bottom_right_idx, next_top_right_idx, top_right_idx);
    }

    const top_left_idx = total_points_per_layer + i * 2 + 1;
    const bottom_left_idx = i * 2 + 1;
    const next_top_left_idx = total_points_per_layer + (i + 1) * 2 + 1;
    const next_bottom_left_idx = (i + 1) * 2 + 1;

    if (i < segment_u) {
      this.faces.push(
        bottom_left_idx,
        next_top_left_idx,
        next_bottom_left_idx
      );
      this.faces.push(bottom_left_idx, top_left_idx, next_top_left_idx);
    }
  }
}





  /**=============================  FUNGSI GENERATE BENTUK LATAR =================== */

  // FUNGSI BARU: Membuat Piramida (untuk atap)
  generatePyramid(size, height, color) {
    this.vertex = [];
    this.faces = [];
    const s = size;
    const h = height * 2;

    // Hanya 5 titik unik yang diperlukan untuk sebuah piramida
    const positions = [
      // Alas (4 titik)
      s,0,-s, // 0
      -s,0,-s, // 1
      -s,0,s, // 2
      s,0,s, // 3
      // Puncak (1 titik)
      0,h,0, // 4
    ];

    for (let i = 0; i < positions.length; i += 3) {
      this.vertex.push(positions[i], positions[i + 1], positions[i + 2]);
      this.vertex.push(color[0], color[1], color[2]);
    }

    // Faces merujuk pada indeks dari 5 titik di atas
    this.faces = [
      // Alas
      0,1,2,0,2,3,
      // Sisi-sisi segitiga
      0,3,4, // Sisi kanan
      3,2,4, // Sisi depan
      2,1,4, // Sisi kiri
      1,0,4, // Sisi belakang
    ];
  }

  generateCuboid(length, height, width, color) {
    this.vertex = [];
    this.faces = [];

    const l = length;
    const h = height * 2; // Tinggi total
    const w = width;

    // Hanya 8 titik unik untuk sebuah balok
    const positions = [
      -l,
      0,
      w, // 0
      l,
      0,
      w, // 1
      l,
      h,
      w, // 2
      -l,
      h,
      w, // 3
      -l,
      0,
      -w, // 4
      l,
      0,
      -w, // 5
      l,
      h,
      -w, // 6
      -l,
      h,
      -w, // 7
    ];

    for (let i = 0; i < positions.length; i += 3) {
      this.vertex.push(positions[i], positions[i + 1], positions[i + 2]);
      // BUG Diperbaiki: Menggunakan semua komponen warna
      this.vertex.push(color[0], color[1], color[2]);
    }

    this.faces = [
      0,
      1,
      2,
      0,
      2,
      3, // Depan
      1,
      5,
      6,
      1,
      6,
      2, // Kanan
      5,
      4,
      7,
      5,
      7,
      6, // Belakang
      4,
      0,
      3,
      4,
      3,
      7, // Kiri
      3,
      2,
      6,
      3,
      6,
      7, // Atas
      4,
      5,
      1,
      4,
      1,
      0, // Bawah
    ];
  }

  generateCylinder(radius, height, color, segments = 30) {
    this.vertex = [];
    this.faces = [];

    const r = radius * 2;
    const h = height * 2;

    // Buat sisi silinder
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);

      // Titik atas (y=h) dan titik bawah (y=0)
      this.vertex.push(x, h, z, color[0], color[1], color[2]); // Atas
      this.vertex.push(x, 0, z, color[0], color[1], color[2]); // Bawah
    }

    // Tambahkan titik pusat untuk tutup atas dan bawah
    const topCenterIndex = (segments + 1) * 2;
    this.vertex.push(0, h, 0, color[0], color[1], color[2]);
    const bottomCenterIndex = topCenterIndex + 1;
    this.vertex.push(0, 0, 0, color[0], color[1], color[2]);

    for (let i = 0; i < segments; i++) {
      const topCurrent = i * 2;
      const bottomCurrent = topCurrent + 1;
      const topNext = topCurrent + 2;
      const bottomNext = topCurrent + 3;

      // Sisi silinder
      this.faces.push(bottomCurrent, topNext, topCurrent);
      this.faces.push(bottomCurrent, bottomNext, topNext);

      // Tutup Atas (menghubungkan ke titik pusat atas)
      this.faces.push(topNext, topCenterIndex, topCurrent);

      // Tutup Bawah (menghubungkan ke titik pusat bawah)
      this.faces.push(bottomCurrent, bottomCenterIndex, bottomNext);
    }
  }

  generateSphere(radius, color, latitudeBands = 30, longitudeBands = 30) {
    this.vertex = [];
    this.faces = [];
    const r = radius * 2;

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longitudeBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        this.vertex.push(r * x, r * y, r * z, color[0], color[1], color[2]);
      }
    }
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
        const first = latNumber * (longitudeBands + 1) + longNumber;
        const second = first + longitudeBands + 1;
        this.faces.push(
          first,
          second,
          first + 1,
          second,
          second + 1,
          first + 1
        );
      }
    }
  }

  // TANAH
  generateKubus(size = 1.0, color = [1, 0, 0]) {
    this.vertex = [];
    this.faces = [];

    // Ukuran setengah untuk membuatnya berpusat di (0,0,0)
    const s = size * 1;
    const c = color; // [r, g, b]

    // Buat 8 titik (vertices) dari kubus
    // Setiap vertex didefinisikan oleh [posisi] dan [warna]
    const vertices = [
      // Depan (Z positif)
      [-s, -s, +s], // 0: bawah-kiri
      [+s, -s, +s], // 1: bawah-kanan
      [+s, +s, +s], // 2: atas-kanan
      [-s, +s, +s], // 3: atas-kiri
      // Belakang (Z negatif)
      [-s, -s, -s], // 4: bawah-kiri
      [+s, -s, -s], // 5: bawah-kanan
      [+s, +s, -s], // 6: atas-kanan
      [-s, +s, -s]  // 7: atas-kiri
    ];

    // --- 1. Isi array this.vertex ---
    // Kita "unroll" 8 vertex di atas menjadi 24 vertex (4 per sisi)
    // karena di WebGL murni, vertex yang sama di sisi yang berbeda
    // mungkin perlu data 'normal' yang berbeda (meski di sini hanya warna).
    // Tapi untuk membuatnya eksplisit dengan format Anda (x,y,z,r,g,b),
    // kita akan mendefinisikan 36 vertex (6 vertex per sisi x 6 sisi)
    
    this.vertex = []; // Kosongkan dulu
    
    // Fungsi bantu untuk menambahkan 1 sisi (2 segitiga)
    const addFace = (v1, v2, v3, v4) => {
        this.vertex.push(...v1, ...c); // Titik 1
        this.vertex.push(...v2, ...c); // Titik 2
        this.vertex.push(...v3, ...c); // Titik 3
        
        this.vertex.push(...v1, ...c); // Titik 1
        this.vertex.push(...v3, ...c); // Titik 3
        this.vertex.push(...v4, ...c); // Titik 4
    };

    addFace(vertices[0], vertices[1], vertices[2], vertices[3]); // Depan
    addFace(vertices[4], vertices[7], vertices[6], vertices[5]); // Belakang
    addFace(vertices[3], vertices[2], vertices[6], vertices[7]); // Atas
    addFace(vertices[0], vertices[4], vertices[5], vertices[1]); // Bawah
    addFace(vertices[1], vertices[5], vertices[6], vertices[2]); // Kanan
    addFace(vertices[0], vertices[3], vertices[7], vertices[4]); // Kiri
    
    // --- 2. Isi array this.faces ---
    // Karena kita sudah mendefinisikan vertex secara eksplisit
    // untuk setiap segitiga (total 36 vertex),
    // array 'faces' (indeks) kita sekarang sangat sederhana:
    // [0, 1, 2, 3, 4, 5, ..., 33, 34, 35]
    
    this.faces = [];
    for (let i = 0; i < this.vertex.length / 6; i++) {
        this.faces.push(i);
    }
  }

  // Tambahkan method ini ke dalam class MyObject di myObject2.js
// Method ini menggantikan generateDipplin() yang sudah ada

generateDipplin() {
    this.vertex = [];
    this.faces = [];

    /*===================== BUILD DIPPLIN ===================== */
    var dipplin_vertex = [];
    var dipplin_faces = [];

    // --- Badan Apel (Ellipsoid) ---
    var radius = 1.4;
    var appleBottomY = -radius * 0.75;
    var latitudeBands = 32;
    var longitudeBands = 32;

    var syrupColor = [0.75, 0.15, 0.12]; 
    var appleColor = [0.85, 0.20, 0.12]; 
    var appleBottomColor = [0.85, 0.20, 0.12]; 

    // Syrup drip params
    var numDrips = 7;
    var dripDepth = 0.25;
    var syrupBaseLine = 0.5;

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;

            var x = Math.cos(phi) * sinTheta;
            var y = cosTheta;
            var z = Math.sin(phi) * sinTheta;

            // Ellipsoid scaling (flatten Y)
            var yPos = radius * y * 0.85;
            dipplin_vertex.push(radius * x, yPos, radius * z);

            // Color with drip logic
            var dripCycle = (phi * numDrips) / (2.0 * Math.PI);
            var dripPhase = dripCycle - Math.floor(dripCycle);
            var dripAmount = 0.0;
            if (dripPhase < 0.5) {
                var wave = (1.0 - Math.cos(dripPhase * 2.0 * Math.PI * 2.0)) / 2.0;
                dripAmount = Math.pow(wave, 1.5);
            }
            var y_threshold = syrupBaseLine - (dripAmount * dripDepth);

            if (y > y_threshold) {
                dipplin_vertex.push(syrupColor[0], syrupColor[1], syrupColor[2]);
            } else if (y > -0.3) {
                dipplin_vertex.push(appleColor[0], appleColor[1], appleColor[2]);
            } else {
                dipplin_vertex.push(appleBottomColor[0], appleBottomColor[1], appleBottomColor[2]);
            }
        }
    }

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            dipplin_faces.push(first, second, first + 1, second, second + 1, first + 1);
        }
    }

    // --- Stem (Elliptic Paraboloid) ---
    var stemColor = [0.35, 0.50, 0.18];
    var stemA = 1.6;
    var stemHeight = 1.8;
    var stemBaseY = radius * 0.85;
    var stemSegments = 28;
    var stemRadialSegs = 16;
    var stemVertexOffset = dipplin_vertex.length / 6;

    var eps = 1e-4;
    for (var i = 0; i <= stemSegments; i++) {
        var t = i / stemSegments;
        var y = stemBaseY + (1.0 - t) * stemHeight;
        var y_rel = Math.max(0.0, t * stemHeight);
        var r = Math.sqrt(y_rel / stemA + eps) * 0.28;
        r *= (0.7 + 0.3 * t);

        for (var j = 0; j <= stemRadialSegs; j++) {
            var angle = (j / stemRadialSegs) * 2 * Math.PI;
            var x = r * Math.cos(angle);
            var z = r * Math.sin(angle);

            var colorMult = 0.9 + 0.1 * Math.cos(angle * 2.0);
            dipplin_vertex.push(x, y, z, stemColor[0]*colorMult, stemColor[1]*colorMult, stemColor[2]*colorMult);
        }
    }

    for (var i = 0; i < stemSegments; i++) {
        for (var j = 0; j < stemRadialSegs; j++) {
            var first = stemVertexOffset + i * (stemRadialSegs + 1) + j;
            var second = first + (stemRadialSegs + 1);
            dipplin_faces.push(first, second, first + 1);
            dipplin_faces.push(second, second + 1, first + 1);
        }
    }

    // --- Eyes (Ellipsoid small) ---
    function createEye(offsetX, offsetY, offsetZ) {
        var eyeSegments = 16;
        var eyeWhiteColor = [0.98, 0.96, 0.88];
        var pupilColor = [0.08, 0.08, 0.10];
        
        var eyeVertexOffset = dipplin_vertex.length / 6;
        var eyeWidth = 0.18;   
        var eyeHeight = 0.45;  
        var eyeDepth = 0.06;   
        
        for (let lat = 0; lat <= eyeSegments; lat++) {
            var theta = lat * Math.PI / eyeSegments;
            for (let lon = 0; lon <= eyeSegments; lon++) {
                var phi = lon * 2 * Math.PI / eyeSegments;
                var x = Math.cos(phi) * Math.sin(theta);
                var y = Math.cos(theta);
                var z = Math.sin(phi) * Math.sin(theta);
                
                dipplin_vertex.push(
                    (eyeWidth * x) + offsetX,
                    (eyeHeight * y) + offsetY,
                    (eyeDepth * z) + offsetZ,
                    eyeWhiteColor[0], eyeWhiteColor[1], eyeWhiteColor[2]
                );
            }
        }
        
        for (let lat = 0; lat < eyeSegments; lat++) {
            for (let lon = 0; lon < eyeSegments; lon++) {
                var first = eyeVertexOffset + (lat * (eyeSegments + 1)) + lon;
                var second = first + eyeSegments + 1;
                dipplin_faces.push(first, second, first + 1);
                dipplin_faces.push(second, second + 1, first + 1);
            }
        }
        
        var pupilVertexOffset = dipplin_vertex.length / 6;
        var pupilRadiusX = 0.03;  
        var pupilRadiusY = 0.05;  
        
        dipplin_vertex.push(
            offsetX, offsetY, offsetZ + eyeDepth + 0.02,
            pupilColor[0], pupilColor[1], pupilColor[2]
        );
        
        for (let i = 0; i <= eyeSegments; i++) {
            var angle = (i / eyeSegments) * 2 * Math.PI;
            dipplin_vertex.push(
                offsetX + pupilRadiusX * Math.cos(angle),
                offsetY + pupilRadiusY * Math.sin(angle),
                offsetZ + eyeDepth + 0.02,
                pupilColor[0], pupilColor[1], pupilColor[2]
            );
        }
        
        for (let i = 1; i <= eyeSegments; i++) {
            dipplin_faces.push(
                pupilVertexOffset, 
                pupilVertexOffset + i, 
                pupilVertexOffset + (i % eyeSegments) + 1
            );
        }
    }

    var appleTopY = radius * 0.85;
    createEye(-0.22, appleTopY + 0.35, 0.35);  
    createEye(0.22, appleTopY + 0.35, 0.35);

    // --- Caramel pool ---
    var caramelRadius = 1.7;
    var caramelHeight = 0.08;
    var caramelSegments = 36;
    var caramelColor = [0.7, 0.1, 0.12];
    var caramelVertexOffset = dipplin_vertex.length / 6;

    dipplin_vertex.push(0, appleBottomY, 0, caramelColor[0], caramelColor[1], caramelColor[2]);
    var topCenterIndex = caramelVertexOffset;
    dipplin_vertex.push(0, appleBottomY - caramelHeight, 0, caramelColor[0], caramelColor[1], caramelColor[2]);
    var bottomCenterIndex = caramelVertexOffset + 1;

    for (let i = 0; i <= caramelSegments; i++) {
        var angle = (i / caramelSegments) * 2 * Math.PI;
        var currentRadius = caramelRadius + (Math.random() - 0.5) * 0.25;
        var x = currentRadius * Math.cos(angle);
        var z = currentRadius * Math.sin(angle);

        dipplin_vertex.push(x, appleBottomY, z, caramelColor[0], caramelColor[1], caramelColor[2]);
        dipplin_vertex.push(x, appleBottomY - caramelHeight, z, caramelColor[0], caramelColor[1], caramelColor[2]);
    }
    
    for (let i = 0; i < caramelSegments; i++) {
        var first = caramelVertexOffset + 2 + i * 2;
        var second = first + 2;

        dipplin_faces.push(topCenterIndex, first, second);
        dipplin_faces.push(bottomCenterIndex, second + 1, first + 1);
        dipplin_faces.push(first, first + 1, second);
        dipplin_faces.push(second, first + 1, second + 1);
    }

    // --- Tail (cylinder-like) ---
    var tailColor = [0.55, 0.75, 0.22];
    var tailSegments = 35; 
    var tailRadialSegments = 8; 
    var tailLength = 2.2; 
    var tailInitialRadius = 0.22;
    var tailVertexOffset = dipplin_vertex.length / 6;

    var tailBaseX = -radius * 0.75;
    var tailBaseY = appleBottomY + 0.6; 
    var tailBaseZ = 0; 

    for (let i = 0; i <= tailSegments; i++) {
        let t = i / tailSegments; 
        let currentX = tailBaseX - Math.sin(t * Math.PI * 0.75) * tailLength * 0.45;
        let currentY = tailBaseY + t * tailLength * 0.35; 
        let currentZ = tailBaseZ + t * tailLength * 0.38; 
        let currentRadius = tailInitialRadius * (1 - t * 0.55); 

        for (let j = 0; j <= tailRadialSegments; j++) {
            let angle = (j / tailRadialSegments) * 2 * Math.PI;
            let xOffset = currentRadius * Math.cos(angle);
            let yOffset = currentRadius * Math.sin(angle);
            let rotatedX = xOffset * Math.cos(-Math.PI / 4) - yOffset * Math.sin(-Math.PI / 4);
            let rotatedY = xOffset * Math.sin(-Math.PI / 4) + yOffset * Math.cos(-Math.PI / 4);
            
            dipplin_vertex.push(
                currentX + rotatedX, currentY + rotatedY, currentZ,
                tailColor[0], tailColor[1], tailColor[2]
            );
        }
    }

    for (let i = 0; i < tailSegments; i++) {
        for (let j = 0; j < tailRadialSegments; j++) {
            let first = tailVertexOffset + i * (tailRadialSegments + 1) + j;
            let second = first + (tailRadialSegments + 1);
            dipplin_faces.push(first, second, first + 1);
            dipplin_faces.push(second, second + 1, first + 1);
        }
    }

    // --- Tail head (ellipsoid) ---
    var headRadius = 0.32;
    var headSegments = 18;
    var headColor = [0.55, 0.75, 0.22];
    var headVertexOffset = dipplin_vertex.length / 6;

    var headT = 1.0;
    var headCenterX = tailBaseX - Math.sin(headT * Math.PI * 0.75) * tailLength * 0.45;
    var headCenterY = tailBaseY + headT * tailLength * 0.35;
    var headCenterZ = tailBaseZ + headT * tailLength * 0.38;

    for (let lat = 0; lat <= headSegments; lat++) {
        var theta = lat * Math.PI / headSegments;
        for (let lon = 0; lon <= headSegments; lon++) {
            var phi = lon * 2 * Math.PI / headSegments;
            var x = headRadius * Math.cos(phi) * Math.sin(theta);
            var y = headRadius * Math.cos(theta);
            var z = headRadius * Math.sin(phi) * Math.sin(theta);
            
            dipplin_vertex.push(
                x + headCenterX, y + headCenterY, z + headCenterZ,
                headColor[0], headColor[1], headColor[2]
            );
        }
    }

    for (let lat = 0; lat < headSegments; lat++) {
        for (let lon = 0; lon < headSegments; lon++) {
            var first = headVertexOffset + (lat * (headSegments + 1)) + lon;
            var second = first + headSegments + 1;
            dipplin_faces.push(first, second, first + 1, second, second + 1, first + 1);
        }
    }

    // --- Leaves (Elliptic Paraboloid surfaces) ---
    var leafColor = [0.12, 0.55, 0.18]; 

    function createLeafParaboloid(leafBaseX, leafBaseY, leafBaseZ, rotationX, rotationY, rotationZ, leafLength, leafWidth, densityX, densityZ, coef) {
        var leafVertexOffset = dipplin_vertex.length / 6;

        for (var iz = 0; iz <= densityZ; iz++) {
            var vz = iz / densityZ;
            var zLocal = vz * leafLength;
            for (var ix = 0; ix <= densityX; ix++) {
                var ux = ix / densityX;
                var xLocal = (ux - 0.5) * leafWidth;

                var nxScaled = xLocal / (leafWidth / 2);
                var nzScaled = (zLocal - leafLength * 0.5) / (leafLength / 2);
                var yLocal = -coef * (nxScaled * nxScaled + nzScaled * nzScaled);

                var x = xLocal, y = yLocal, z = zLocal;
                
                // Rotate X
                var ry = y * Math.cos(rotationX) - z * Math.sin(rotationX);
                var rz = y * Math.sin(rotationX) + z * Math.cos(rotationX);
                y = ry; z = rz;
                
                // Rotate Y
                var rx = x * Math.cos(rotationY) + z * Math.sin(rotationY);
                rz = -x * Math.sin(rotationY) + z * Math.cos(rotationY);
                x = rx; z = rz;
                
                // Rotate Z
                rx = x * Math.cos(rotationZ) - y * Math.sin(rotationZ);
                ry = x * Math.sin(rotationZ) + y * Math.cos(rotationZ);
                x = rx; y = ry;

                var finalX = leafBaseX + x;
                var finalY = leafBaseY + y;
                var finalZ = leafBaseZ + z;

                dipplin_vertex.push(finalX, finalY, finalZ, leafColor[0], leafColor[1], leafColor[2]);
            }
        }

        for (var iz = 0; iz < densityZ; iz++) {
            for (var ix = 0; ix < densityX; ix++) {
                var a = leafVertexOffset + iz * (densityX + 1) + ix;
                var b = a + 1;
                var c = a + (densityX + 1);
                var d = c + 1;
                dipplin_faces.push(a, c, b);
                dipplin_faces.push(b, c, d);
            }
        }
    }

    var leafBaseYOffset = headCenterY + headRadius * 0.15;
    createLeafParaboloid(headCenterX + 0.08, leafBaseYOffset + 0.35, headCenterZ - 0.05, 
                -Math.PI / 6.0, -Math.PI / 4.2, Math.PI / 12, 0.9, 0.45, 10, 14, 0.18);

    createLeafParaboloid(headCenterX + 0.08, leafBaseYOffset + 0.35, headCenterZ + 0.05, 
                -Math.PI / 6.0, Math.PI / 4.2, -Math.PI / 12, 0.9, 0.45, 10, 14, 0.18);

    // Set vertex dan faces dari class
    this.vertex = dipplin_vertex;
    this.faces = dipplin_faces;
}
  // Tambahkan method ini ke dalam class MyObject di myObject2.js

generateAppletun() {
    this.vertex = [];
    this.faces = [];

    /*===================== HELPER FUNCTIONS ===================== */
    function apply_matrix(matrix, vertex) {
        var x = vertex[0], y = vertex[1], z = vertex[2];
        return [
            matrix[0]*x + matrix[4]*y + matrix[8]*z + matrix[12],
            matrix[1]*x + matrix[5]*y + matrix[9]*z + matrix[13],
            matrix[2]*x + matrix[6]*y + matrix[10]*z + matrix[14]
        ];
    }

    /*===================== GENERATE CONE ===================== */
    function generateCone(vertices, indices, radius, height, radialSegments, color, transformMatrix) {
        const startVertexIndex = vertices.length / 6;

        let apexX = 0, apexY = height / 2, apexZ = 0;
        if (transformMatrix) [apexX, apexY, apexZ] = apply_matrix(transformMatrix, [apexX, apexY, apexZ]);
        vertices.push(apexX, apexY, apexZ, ...color);
        const apexIndex = startVertexIndex;

        for (let i = 0; i <= radialSegments; i++) {
            const angle = i * 2 * Math.PI / radialSegments;
            let x = radius * Math.cos(angle);
            let y = -height / 2;
            let z = radius * Math.sin(angle);
            if (transformMatrix) [x, y, z] = apply_matrix(transformMatrix, [x, y, z]);
            vertices.push(x, y, z, ...color);
        }

        const baseCircleStartIndex = startVertexIndex + 1;
        for (let i = 0; i < radialSegments; i++) {
            indices.push(apexIndex, baseCircleStartIndex + i, baseCircleStartIndex + i + 1);
        }

        let baseCenterActualX = 0, baseCenterActualY = -height / 2, baseCenterActualZ = 0;
        if (transformMatrix) [baseCenterActualX, baseCenterActualY, baseCenterActualZ] = apply_matrix(transformMatrix, [baseCenterActualX, baseCenterActualY, baseCenterActualZ]);
        vertices.push(baseCenterActualX, baseCenterActualY, baseCenterActualZ, ...color);
        const actualBaseCenterIndex = vertices.length / 6 - 1;

        for (let i = 0; i < radialSegments; i++) {
            indices.push(actualBaseCenterIndex, baseCircleStartIndex + i + 1, baseCircleStartIndex + i);
        }
    }

    /*===================== GENERATE CUBE ===================== */
    function generateCube(vertices, indices, size, color, transformMatrix) {
        const startVertexIndex = vertices.length / 6;
        const halfSize = size / 2;

        const cubeVertices = [
            -halfSize, -halfSize,  halfSize, ...color,
             halfSize, -halfSize,  halfSize, ...color,
             halfSize,  halfSize,  halfSize, ...color,
            -halfSize,  halfSize,  halfSize, ...color,
            -halfSize, -halfSize, -halfSize, ...color,
            -halfSize,  halfSize, -halfSize, ...color,
             halfSize,  halfSize, -halfSize, ...color,
             halfSize, -halfSize, -halfSize, ...color,
            -halfSize,  halfSize, -halfSize, ...color,
            -halfSize,  halfSize,  halfSize, ...color,
             halfSize,  halfSize,  halfSize, ...color,
             halfSize,  halfSize, -halfSize, ...color,
            -halfSize, -halfSize, -halfSize, ...color,
             halfSize, -halfSize, -halfSize, ...color,
             halfSize, -halfSize,  halfSize, ...color,
            -halfSize, -halfSize,  halfSize, ...color,
             halfSize, -halfSize, -halfSize, ...color,
             halfSize,  halfSize, -halfSize, ...color,
             halfSize,  halfSize,  halfSize, ...color,
             halfSize, -halfSize,  halfSize, ...color,
            -halfSize, -halfSize, -halfSize, ...color,
            -halfSize, -halfSize,  halfSize, ...color,
            -halfSize,  halfSize,  halfSize, ...color,
            -halfSize,  halfSize, -halfSize, ...color
        ];

        const cubeIndices = [
            0, 1, 2,      0, 2, 3,    4, 5, 6,      4, 6, 7,
            8, 9, 10,     8, 10, 11,   12, 13, 14,   12, 14, 15,
            16, 17, 18,   16, 18, 19,  20, 21, 22,   20, 22, 23
        ];

        for (let i = 0; i < cubeVertices.length; i += 6) {
            let x = cubeVertices[i];
            let y = cubeVertices[i+1];
            let z = cubeVertices[i+2];
            if (transformMatrix) [x, y, z] = apply_matrix(transformMatrix, [x, y, z]);
            vertices.push(x, y, z, ...color);
        }

        for (let i = 0; i < cubeIndices.length; i++) {
            indices.push(cubeIndices[i] + startVertexIndex);
        }
    }

    /*===================== GENERATE TORUS ARCH ===================== */
    function generateTorusArch(vertices, indices, majorRadius, minorRadius, majorSegments, minorSegments, color, transformMatrix) {
        const startVertexIndex = vertices.length / 6;

        for (let j = 0; j <= minorSegments; j++) {
            const minorAngle = j * 2 * Math.PI / minorSegments;
            const r_cos_v = minorRadius * Math.cos(minorAngle);
            const r_sin_v = minorRadius * Math.sin(minorAngle);

            for (let i = 0; i <= majorSegments; i++) {
                const majorAngle = (i / majorSegments) * Math.PI;
                const cos_u = Math.cos(majorAngle);
                const sin_u = Math.sin(majorAngle);

                let x = r_sin_v;
                let y = (majorRadius + r_cos_v) * sin_u;
                let z = (majorRadius + r_cos_v) * cos_u;

                if (transformMatrix) [x, y, z] = apply_matrix(transformMatrix, [x, y, z]);
                vertices.push(x, y, z, ...color);
            }
        }

        for (let j = 0; j < minorSegments; j++) {
            for (let i = 0; i < majorSegments; i++) {
                const first = (j * (majorSegments + 1)) + i + startVertexIndex;
                const second = first + majorSegments + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
    }

    /*===================== GENERATE SPHERE ===================== */
    function generateSphere(vertices, indices, radius, latBands, longBands, color, options) {
        options = options || {};
        const startVertexIndex = vertices.length / 6;
        const scale = options.scale || { x: 1, y: 1, z: 1 };
        const pos = options.positionOffset || { x: 0, y: 0, z: 0 };
        const latStart = options.latStart !== undefined ? options.latStart : 0;
        const latEnd = options.latEnd !== undefined ? options.latEnd : Math.PI;
        const transformMatrix = options.transformMatrix || null;

        for (let latNumber = 0; latNumber <= latBands; latNumber++) {
            const theta = latStart + latNumber * (latEnd - latStart) / latBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= longBands; longNumber++) {
                const phi = longNumber * 2 * Math.PI / longBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                x = radius * x * scale.x + pos.x;
                y = radius * y * scale.y + pos.y;
                z = radius * z * scale.z + pos.z;

                if (transformMatrix) {
                    [x, y, z] = apply_matrix(transformMatrix, [x, y, z]);
                }
                vertices.push(x, y, z, ...color);
            }
        }

        for (let latNumber = 0; latNumber < latBands; latNumber++) {
            for (let longNumber = 0; longNumber < longBands; longNumber++) {
                const first = (latNumber * (longBands + 1)) + longNumber + startVertexIndex;
                const second = first + longBands + 1;
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
    }

    /*===================== BUILD APPLETUN ===================== */
    var appletun_vertex = [];
    var appletun_faces = [];

    // Parameters untuk anyaman pai
    const pieRadius = 1.15;
    const pieScaleY = 1.2;
    const pieScaleXZ = 1.55;
    const latticeLandRadius = pieRadius * pieScaleXZ * 0.8;
    const latticePeakY = pieRadius * pieScaleY;
    const latticeLandY = latticePeakY * Math.sqrt(1 - Math.pow(latticeLandRadius, 2) / Math.pow(pieRadius * pieScaleXZ, 2));
    const archMajorRadius = latticeLandRadius;
    const archMinorRadius = 0.15;
    const archColor = [0.93, 0.72, 0.45];
    const archHeight = latticePeakY - latticeLandY;
    const archScaleY = archHeight / archMajorRadius;

    // BAGIAN 1: BADAN APEL (BAWAH)
    generateSphere(appletun_vertex, appletun_faces, 1.1, 30, 30, [0.84, 0.87, 0.53], {
        scale: { x: 1.5, y: 1.2, z: 1.5 }, latStart: Math.PI / 2.1, latEnd: Math.PI
    });

    // BAGIAN 2: TUTUP PAI (ATAS)
    generateSphere(appletun_vertex, appletun_faces, 1.15, 30, 30, [0.85, 0.65, 0.4], {
        scale: { x: 1.55, y: 1.2, z: 1.55 }, latStart: 0, latEnd: Math.PI / 2.1
    });

    // BAGIAN 3: ANYAMAN PAI
    const numStripsPerDirection = 2;
    const stripSpacing = 1.0;
    for (let i = 0; i < numStripsPerDirection; i++) {
        let transform = LIBS.get_I4();
        LIBS.translateX(transform, (i - (numStripsPerDirection - 1) / 2) * stripSpacing);
        LIBS.scaleY(transform, archScaleY);
        LIBS.translateY(transform, latticeLandY);
        generateTorusArch(appletun_vertex, appletun_faces, archMajorRadius, archMinorRadius, 30, 15, archColor, transform);
    }
    for (let i = 0; i < numStripsPerDirection; i++) {
        let transform = LIBS.get_I4();
        LIBS.translateZ(transform, (i - (numStripsPerDirection - 1) / 2) * stripSpacing);
        LIBS.scaleY(transform, archScaleY);
        LIBS.translateY(transform, latticeLandY);
        LIBS.rotateY(transform, Math.PI / 2);
        generateTorusArch(appletun_vertex, appletun_faces, archMajorRadius, archMinorRadius, 30, 15, archColor, transform);
    }

    // BAGIAN 4: DAUN
    const leaf_start_index = appletun_vertex.length / 6;
    appletun_vertex.push(
        0.0, 1.25, 0.0, 0.81, 0.36, 0.41,
        -0.2, 1.5, 0.05, 0.81, 0.36, 0.41,
        0.0, 1.9, 0.0, 0.81, 0.36, 0.41,
        0.2, 1.5, -0.05, 0.81, 0.36, 0.41,
        0.0, 1.25, 0.0, 0.55, 0.76, 0.44,
        -0.2, 1.5, -0.05, 0.55, 0.76, 0.44,
        0.0, 1.9, 0.0, 0.55, 0.76, 0.44,
        0.2, 1.5, 0.05, 0.55, 0.76, 0.44
    );
    appletun_faces.push(
        leaf_start_index, leaf_start_index + 1, leaf_start_index + 2,
        leaf_start_index, leaf_start_index + 2, leaf_start_index + 3,
        leaf_start_index + 4, leaf_start_index + 5, leaf_start_index + 6,
        leaf_start_index + 4, leaf_start_index + 6, leaf_start_index + 7
    );

    // BAGIAN 5: KEPALA
    generateSphere(appletun_vertex, appletun_faces, 1, 20, 20, [0.4, 0.6, 0.3], {
        scale: { x: 0.7, y: 0.6, z: 0.7 }, positionOffset: { x: 0, y: -0.4, z: 1.7 }
    });

    // BAGIAN 6: MATA
    generateSphere(appletun_vertex, appletun_faces, 1, 10, 10, [0, 0, 0], {
        scale: { x: 0.05, y: 0.05, z: 0.05 }, positionOffset: { x: -0.25, y: -0.3, z: 2.35 }
    });
    generateSphere(appletun_vertex, appletun_faces, 1, 10, 10, [0, 0, 0], {
        scale: { x: 0.05, y: 0.05, z: 0.05 }, positionOffset: { x: 0.25, y: -0.3, z: 2.35 }
    });

    // BAGIAN 7: KAKI & CAKAR
    const legColor = [0.3, 0.5, 0.2];
    const clawColor = [0.2, 0.3, 0.15];
    const legBaseY = -0.9;
    const legScaleY = 0.35;
    const legScaleX = 0.5;
    const legScaleZ = 0.6;
    const legOutX = 1.2;
    const legOutZ = 0.8;
    const clawY = legBaseY - (legScaleY / 2);
    const clawSize = 0.15;
    const clawZOffset = 0.5;
    const clawXOffset = 0.2;

    // Kaki Depan Kiri
    let transformFL = LIBS.get_I4();
    LIBS.translateY(transformFL, legBaseY);
    LIBS.translateX(transformFL, -legOutX);
    LIBS.translateZ(transformFL, legOutZ);
    LIBS.scaleX(transformFL, legScaleX);
    LIBS.scaleY(transformFL, legScaleY);
    LIBS.scaleZ(transformFL, legScaleZ);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, legColor, { transformMatrix: transformFL });

    let transformClawFL1 = LIBS.get_I4();
    LIBS.translateY(transformClawFL1, clawY);
    LIBS.translateX(transformClawFL1, -legOutX);
    LIBS.translateZ(transformClawFL1, legOutZ + clawZOffset);
    LIBS.rotateX(transformClawFL1, LIBS.degToRad(-10));
    LIBS.scale(transformClawFL1, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawFL1);

    let transformClawFL2 = LIBS.get_I4();
    LIBS.translateY(transformClawFL2, clawY);
    LIBS.translateX(transformClawFL2, -legOutX - clawXOffset);
    LIBS.translateZ(transformClawFL2, legOutZ + clawZOffset - 0.05);
    LIBS.rotateX(transformClawFL2, LIBS.degToRad(-10));
    LIBS.scale(transformClawFL2, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawFL2);

    // Kaki Depan Kanan
    let transformFR = LIBS.get_I4();
    LIBS.translateY(transformFR, legBaseY);
    LIBS.translateX(transformFR, legOutX);
    LIBS.translateZ(transformFR, legOutZ);
    LIBS.scaleX(transformFR, legScaleX);
    LIBS.scaleY(transformFR, legScaleY);
    LIBS.scaleZ(transformFR, legScaleZ);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, legColor, { transformMatrix: transformFR });

    let transformClawFR1 = LIBS.get_I4();
    LIBS.translateY(transformClawFR1, clawY);
    LIBS.translateX(transformClawFR1, legOutX);
    LIBS.translateZ(transformClawFR1, legOutZ + clawZOffset);
    LIBS.rotateX(transformClawFR1, LIBS.degToRad(-10));
    LIBS.scale(transformClawFR1, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawFR1);

    let transformClawFR2 = LIBS.get_I4();
    LIBS.translateY(transformClawFR2, clawY);
    LIBS.translateX(transformClawFR2, legOutX + clawXOffset);
    LIBS.translateZ(transformClawFR2, legOutZ + clawZOffset - 0.05);
    LIBS.rotateX(transformClawFR2, LIBS.degToRad(-10));
    LIBS.scale(transformClawFR2, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawFR2);

    // Kaki Belakang Kiri
    let transformBL = LIBS.get_I4();
    LIBS.translateY(transformBL, legBaseY);
    LIBS.translateX(transformBL, -legOutX);
    LIBS.translateZ(transformBL, -legOutZ);
    LIBS.scaleX(transformBL, legScaleX);
    LIBS.scaleY(transformBL, legScaleY);
    LIBS.scaleZ(transformBL, legScaleZ);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, legColor, { transformMatrix: transformBL });

    let transformClawBL1 = LIBS.get_I4();
    LIBS.translateY(transformClawBL1, clawY);
    LIBS.translateX(transformClawBL1, -legOutX);
    LIBS.translateZ(transformClawBL1, -legOutZ + clawZOffset);
    LIBS.rotateX(transformClawBL1, LIBS.degToRad(-10));
    LIBS.scale(transformClawBL1, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawBL1);

    let transformClawBL2 = LIBS.get_I4();
    LIBS.translateY(transformClawBL2, clawY);
    LIBS.translateX(transformClawBL2, -legOutX - clawXOffset);
    LIBS.translateZ(transformClawBL2, -legOutZ + clawZOffset - 0.05);
    LIBS.rotateX(transformClawBL2, LIBS.degToRad(-10));
    LIBS.scale(transformClawBL2, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawBL2);

    // Kaki Belakang Kanan
    let transformBR = LIBS.get_I4();
    LIBS.translateY(transformBR, legBaseY);
    LIBS.translateX(transformBR, legOutX);
    LIBS.translateZ(transformBR, -legOutZ);
    LIBS.scaleX(transformBR, legScaleX);
    LIBS.scaleY(transformBR, legScaleY);
    LIBS.scaleZ(transformBR, legScaleZ);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, legColor, { transformMatrix: transformBR });

    let transformClawBR1 = LIBS.get_I4();
    LIBS.translateY(transformClawBR1, clawY);
    LIBS.translateX(transformClawBR1, legOutX);
    LIBS.translateZ(transformClawBR1, -legOutZ + clawZOffset);
    LIBS.rotateX(transformClawBR1, LIBS.degToRad(-10));
    LIBS.scale(transformClawBR1, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawBR1);

    let transformClawBR2 = LIBS.get_I4();
    LIBS.translateY(transformClawBR2, clawY);
    LIBS.translateX(transformClawBR2, legOutX + clawXOffset);
    LIBS.translateZ(transformClawBR2, -legOutZ + clawZOffset - 0.05);
    LIBS.rotateX(transformClawBR2, LIBS.degToRad(-10));
    LIBS.scale(transformClawBR2, clawSize);
    generateCube(appletun_vertex, appletun_faces, 1.0, clawColor, transformClawBR2);

    // BAGIAN 8: EKOR
    const tailColor = [0.3, 0.5, 0.2];
    let transformTail = LIBS.get_I4();
    LIBS.translateY(transformTail, -0.40);
    LIBS.translateZ(transformTail, -1.9);
    LIBS.rotateX(transformTail, LIBS.degToRad(-110));
    LIBS.scaleX(transformTail, 0.5);
    LIBS.scaleY(transformTail, 0.9);
    LIBS.scaleZ(transformTail, 0.5);
    generateCone(appletun_vertex, appletun_faces, 1.0, 1.0, 20, tailColor, transformTail);

    // BAGIAN 9: LEHER
    const neckColor = [0.4, 0.6, 0.3];
    let transformNeck = LIBS.get_I4();
    LIBS.translateY(transformNeck, -0.7);
    LIBS.translateZ(transformNeck, 1.5);
    LIBS.scaleX(transformNeck, 0.4);
    LIBS.scaleY(transformNeck, 0.18);
    LIBS.scaleZ(transformNeck, 0.6);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, neckColor, { transformMatrix: transformNeck });

    // BAGIAN 10: HELM MERAH
    const redHelmetColor = [0.81, 0.36, 0.41];
    let transformHelmet = LIBS.get_I4();
    LIBS.translateY(transformHelmet, -0.05);
    LIBS.translateZ(transformHelmet, 1.7);
    LIBS.scaleX(transformHelmet, 0.8);
    LIBS.scaleY(transformHelmet, 0.5);
    LIBS.scaleZ(transformHelmet, 0.8);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 20, 20, redHelmetColor, {
        transformMatrix: transformHelmet,
        latStart: 0,
        latEnd: Math.PI / 1.5
    });

    // BAGIAN 11: TELINGA
    const earColor = [0.35, 0.5, 0.25];
    // Telinga Kiri
    let transformEarL = LIBS.get_I4();
    LIBS.translateY(transformEarL, -0.5);
    LIBS.translateX(transformEarL, -0.5);
    LIBS.translateZ(transformEarL, 1.7);
    LIBS.rotateZ(transformEarL, LIBS.degToRad(20));
    LIBS.rotateY(transformEarL, LIBS.degToRad(-30));
    LIBS.scaleX(transformEarL, 0.2);
    LIBS.scaleY(transformEarL, 0.5);
    LIBS.scaleZ(transformEarL, 0.3);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, earColor, { transformMatrix: transformEarL });

    // Telinga Kanan
    let transformEarR = LIBS.get_I4();
    LIBS.translateY(transformEarR, -0.5);
    LIBS.translateX(transformEarR, 0.5);
    LIBS.translateZ(transformEarR, 1.7);
    LIBS.rotateZ(transformEarR, LIBS.degToRad(-20));
    LIBS.rotateY(transformEarR, LIBS.degToRad(30));
    LIBS.scaleX(transformEarR, 0.2);
    LIBS.scaleY(transformEarR, 0.5);
    LIBS.scaleZ(transformEarR, 0.3);
    generateSphere(appletun_vertex, appletun_faces, 1.0, 15, 15, earColor, { transformMatrix: transformEarR });

    // Set vertex dan faces dari class
    this.vertex = appletun_vertex;
    this.faces = appletun_faces;
}
  
// Tambahkan method ini ke dalam class MyObject di myObject2.js

generateHydrapple() {
    this.vertex = [];
    this.faces = [];

    /*===================== HELPER FUNCTION ===================== */
    function combineGeometry(geometries) {
        var combinedVertices = [];
        var combinedFaces = [];
        var vertexOffset = 0;

        for (var i = 0; i < geometries.length; i++) {
            var geom = geometries[i];
            combinedVertices.push.apply(combinedVertices, geom.vertices);

            for (var j = 0; j < geom.faces.length; j++) {
                combinedFaces.push(geom.faces[j] + vertexOffset);
            }
            vertexOffset += (geom.vertices.length / 6);
        }
        return { vertices: combinedVertices, faces: combinedFaces };
    }

    /*===================== BUILD HYDRAPPLE BODY ===================== */
    function buildHydrappleBody() {
        var vertices = [];
        var faces = [];
        var radius = 1.5; 
        var latitudeBands = 30; 
        var longitudeBands = 30; 

        const COLOR_DRIP = [0.85, 0.30, 0.20]; 
        const COLOR_APPLE = [0.85, 0.20, 0.12]; 

        for (var lat = 0; lat <= latitudeBands; lat++) {
            var theta = lat * Math.PI / latitudeBands; 
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta); 

            for (var lon = 0; lon <= longitudeBands; lon++) {
                var phi = lon * 2 * Math.PI / longitudeBands; 
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = radius * cosPhi * sinTheta;
                var y = radius * cosTheta * 0.9; 
                var z = radius * sinPhi * sinTheta;

                if (y < 0) {
                    var scale = 1.0 - (y / (radius * 0.9)) * 0.2;
                    x *= scale;
                    z *= scale;
                }

                var r, g, b;
                var normalizedY = cosTheta; 

                if (normalizedY > 0.65) { 
                    r = COLOR_DRIP[0];
                    g = COLOR_DRIP[1];
                    b = COLOR_DRIP[2];
                } else if (normalizedY > 0.5) {
                    var t = (normalizedY - 0.5) / 0.15; 
                    r = COLOR_DRIP[0] * t + COLOR_APPLE[0] * (1 - t);
                    g = COLOR_DRIP[1] * t + COLOR_APPLE[1] * (1 - t);
                    b = COLOR_DRIP[2] * t + COLOR_APPLE[2] * (1 - t);
                } else {
                    r = COLOR_APPLE[0];
                    g = COLOR_APPLE[1];
                    b = COLOR_APPLE[2];
                }
                
                vertices.push(x, y, z, r, g, b);
            }
        }

        for (var lat = 0; lat < latitudeBands; lat++) {
            for (var lon = 0; lon < longitudeBands; lon++) {
                var first = (lat * (longitudeBands + 1)) + lon;
                var second = first + (longitudeBands + 1);

                var v1 = first;
                var v2 = second;
                var v3 = first + 1;
                var v4 = second + 1;

                faces.push(v1, v2, v3);
                faces.push(v3, v2, v4);
            }
        }
        
        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE NECK ===================== */
    function buildHydrappleNeck() {
        var vertices = [];
        var faces = [];
        var radius = 0.4;
        var height = 5.0;
        var heightSegments = 30;
        var radialSegments = 12;

        const COLOR_TIP_GREEN = [0.3, 0.7, 0.2];
        const COLOR_BASE_CREAM = [0.9, 0.85, 0.7];
        
        var y_base_offset = 0.5;
        var z_base_offset = -0.8;

        for (var i = 0; i <= heightSegments; i++) {
            var t_height = i / heightSegments;
            var y_raw = t_height * height;

            for (var j = 0; j <= radialSegments; j++) {
                var t_radial = j / radialSegments;
                var angle = t_radial * 2.0 * Math.PI;

                var x_raw = Math.cos(angle) * radius;
                var z_raw = Math.sin(angle) * radius;

                var bend_amount = 1.5;
                var bend_freq = 0.8;
                var x_deformed = x_raw + Math.sin(y_raw * bend_freq) * bend_amount;
                var z_deformed = z_raw - y_raw * 0.3;

                var x_final = x_deformed;
                var y_final = y_raw + y_base_offset;
                var z_final = z_deformed + z_base_offset;

                var x_rel = x_final; 
                var z_rel = z_final - z_base_offset; 

                var rot_angle = LIBS.degToRad(90);
                var cos_a = Math.cos(rot_angle);
                var sin_a = Math.sin(rot_angle);

                var x_rotated = x_rel * cos_a + z_rel * sin_a;
                var z_rotated = -x_rel * sin_a + z_rel * cos_a;

                x_final = x_rotated;
                z_final = z_rotated + z_base_offset;

                var r, g, b;
                if (Math.cos(angle) > 0) {
                    r = COLOR_TIP_GREEN[0];
                    g = COLOR_TIP_GREEN[1];
                    b = COLOR_TIP_GREEN[2];
                } else {
                    r = COLOR_BASE_CREAM[0];
                    g = COLOR_BASE_CREAM[1];
                    b = COLOR_BASE_CREAM[2];
                }

                vertices.push(x_final, y_final, z_final, r, g, b);
            }
        }

        for (var i = 0; i < heightSegments; i++) {
            for (var j = 0; j < radialSegments; j++) {
                var first = (i * (radialSegments + 1)) + j;
                var second = first + (radialSegments + 1);

                var v1 = first;
                var v2 = second;
                var v3 = first + 1;
                var v4 = second + 1;

                faces.push(v1, v2, v3);
                faces.push(v3, v2, v4);
            }
        }

        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE TAIL ===================== */
    function buildHydrappleTail() {
        var vertices = [];
        var faces = [];
        
        const COLOR_TIP_GREEN = [0.3, 0.7, 0.2];
        const COLOR_BASE_CREAM = [0.9, 0.85, 0.7];
        
        var base_x = 0.0;
        var base_y = 0.0;
        var z_base = -1.2;
        var base_radius = 0.4;
        var height = 1.3;
        var apex_radius = 0.2;
        var radialSegments = 12;
        var tipSegments = 6;

        function getColorForPos(x, y, z) {
            if (y > base_y) { 
                return COLOR_TIP_GREEN;
            } else {
                return COLOR_BASE_CREAM;
            }
        }

        var cone_length = height - apex_radius;
        var z_joint = z_base - cone_length; 

        var v_offset = 0; 

        var c = getColorForPos(base_x, base_y, z_base);
        vertices.push(base_x, base_y, z_base, c[0], c[1], c[2]);
        var v_base_center = v_offset;
        v_offset++;

        var v_base_ring_start = v_offset;
        for (var i = 0; i < radialSegments; i++) {
            var angle = (i / radialSegments) * 2.0 * Math.PI;
            var x = base_x + base_radius * Math.cos(angle);
            var y = base_y + base_radius * Math.sin(angle);
            var z = z_base;
            var c_ring = getColorForPos(x, y, z);
            vertices.push(x, y, z, c_ring[0], c_ring[1], c_ring[2]);
            v_offset++;
        }

        var v_apex_ring_start = v_offset;
        for (var i = 0; i < radialSegments; i++) {
            var angle = (i / radialSegments) * 2.0 * Math.PI;
            var x = base_x + apex_radius * Math.cos(angle);
            var y = base_y + apex_radius * Math.sin(angle);
            var z = z_joint;
            var c_ring = getColorForPos(x, y, z);
            vertices.push(x, y, z, c_ring[0], c_ring[1], c_ring[2]);
            v_offset++;
        }

        for (var i = 0; i < radialSegments; i++) {
            var next_i = (i + 1) % radialSegments;
            faces.push(v_base_center, v_base_ring_start + next_i, v_base_ring_start + i);
            var v1 = v_base_ring_start + i;
            var v2 = v_base_ring_start + next_i;
            var v3 = v_apex_ring_start + i;
            var v4 = v_apex_ring_start + next_i;
            faces.push(v1, v2, v3);
            faces.push(v2, v4, v3);
        }

        for (var j = 1; j <= tipSegments; j++) {
            var t_lat = j / tipSegments;
            var theta = t_lat * (Math.PI / 2.0);
            
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            var current_z = z_joint - (apex_radius * sinTheta);
            var current_radius = apex_radius * cosTheta;

            if (j === tipSegments) {
                var x_pole = base_x;
                var y_pole = base_y;
                var c_tip = getColorForPos(x_pole, y_pole, current_z);
                vertices.push(x_pole, y_pole, current_z, c_tip[0], c_tip[1], c_tip[2]);
                v_offset++;
            } else {
                for (var i = 0; i < radialSegments; i++) {
                    var angle = (i / radialSegments) * 2.0 * Math.PI;
                    var x = base_x + current_radius * Math.cos(angle);
                    var y = base_y + current_radius * Math.sin(angle);
                    var c_tip = getColorForPos(x, y, current_z);
                    vertices.push(x, y, current_z, c_tip[0], c_tip[1], c_tip[2]);
                    v_offset++;
                }
            }
        }
        
        var v_pole_index = v_offset - 1; 
        
        for (var j = 0; j < tipSegments - 1; j++) {
            var v_ring_curr_start = v_apex_ring_start + (j * radialSegments);
            var v_ring_next_start = v_apex_ring_start + ((j + 1) * radialSegments);
            
            for (var i = 0; i < radialSegments; i++) {
                var next_i = (i + 1) % radialSegments;
                var v1 = v_ring_curr_start + i;
                var v2 = v_ring_curr_start + next_i;
                var v3 = v_ring_next_start + i;
                var v4 = v_ring_next_start + next_i;
                faces.push(v1, v2, v3);
                faces.push(v2, v4, v3);
            }
        }
        
        var v_last_ring_start = v_apex_ring_start + ((tipSegments - 1) * radialSegments);
        for (var i = 0; i < radialSegments; i++) {
            var next_i = (i + 1) % radialSegments;
            faces.push(v_last_ring_start + i, v_last_ring_start + next_i, v_pole_index);
        }

        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE HEAD ===================== */
    function buildHydrappleHead() {
        var vertices = [];
        var faces = [];

        const COLOR_GREEN = [0.3, 0.7, 0.2];

        var p = [
            [-1.9, 6.1,  0.3], [-1.1, 6.1,  0.3], [-1.1, 6.7,  0.3], [-1.9, 6.7,  0.3],
            [-1.7, 5.9,  2.3], [-1.3, 5.9,  2.3], [-1.3, 6.5,  2.3], [-1.7, 6.5,  2.3]
        ];
        
        vertices.push(p[0][0], p[0][1], p[0][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[1][0], p[1][1], p[1][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[4][0], p[4][1], p[4][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[5][0], p[5][1], p[5][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[3][0], p[3][1], p[3][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[2][0], p[2][1], p[2][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[7][0], p[7][1], p[7][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);
        vertices.push(p[6][0], p[6][1], p[6][2], COLOR_GREEN[0], COLOR_GREEN[1], COLOR_GREEN[2]);

        faces.push(
            0, 1, 3, 0, 3, 2,
            4, 5, 7, 4, 7, 6,
            0, 4, 5, 0, 5, 1,
            2, 3, 7, 2, 7, 6,
            0, 2, 6, 0, 6, 4,
            1, 3, 7, 1, 7, 5
        );
        
        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE JAW ===================== */
    function buildHydrappleJaw() {
        var vertices = [];
        var faces = [];

        const COLOR_CREAM = [0.9, 0.85, 0.7];

        var p = [
            [-2.0, 5.6,  0.3], [-1.2, 5.6,  0.3], [-1.2, 6.0,  0.3], [-1.8, 6.0,  0.3],
            [-1.6, 5.3,  1.8], [-1.4, 5.3,  1.8], [-1.4, 5.7,  1.8], [-1.6, 5.7,  1.8]
        ];

        vertices.push(p[0][0], p[0][1], p[0][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[1][0], p[1][1], p[1][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[4][0], p[4][1], p[4][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[5][0], p[5][1], p[5][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[3][0], p[3][1], p[3][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[2][0], p[2][1], p[2][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[7][0], p[7][1], p[7][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        vertices.push(p[6][0], p[6][1], p[6][2], COLOR_CREAM[0], COLOR_CREAM[1], COLOR_CREAM[2]);
        
        faces.push(
            0, 1, 3, 0, 3, 2,
            4, 5, 7, 4, 7, 6,
            0, 4, 5, 0, 5, 1,
            2, 3, 7, 2, 7, 6,
            0, 2, 6, 0, 6, 4,
            1, 3, 7, 1, 7, 5
        );
        
        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE TONGUE ===================== */
    function buildHydrappleTongue() {
        var vertices = [];
        var faces = [];

        const COLOR_TONGUE = [0.9, 0.2, 0.3];

        var p = [
            [-1.6, 5.95,  0.3], [-1.4, 5.95,  0.3], [-1.4, 6.05,  0.3], [-1.6, 6.05,  0.3],
            [-1.6, 5.75,  2.6], [-1.4, 5.75,  2.6], [-1.4, 5.85,  2.6], [-1.6, 5.85,  2.6]
        ];

        for (var i = 0; i < p.length; i++) {
            vertices.push(p[i][0], p[i][1], p[i][2], COLOR_TONGUE[0], COLOR_TONGUE[1], COLOR_TONGUE[2]);
        }

        faces.push(
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            0, 1, 5, 0, 5, 4,
            3, 2, 6, 3, 6, 7,
            0, 3, 7, 0, 7, 4,
            1, 2, 6, 1, 6, 5
        );
        
        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD NECK CONNECTOR ===================== */
    function buildNeckConnector() {
        var vertices = [];
        var faces = [];

        const COLOR_TIP_GREEN = [0.3, 0.7, 0.2];
        const COLOR_BASE_CREAM = [0.9, 0.85, 0.7];
        
        var y_bottom = 5.5; 
        var y_top = 6.2;    
        var radius = 0.35;  
        var radialSegments = 12; 
        var centerX = -1.5; 
        var centerZ = 0.3;  

        var v_offset = 0;

        var v_bottom_ring_start = v_offset;
        for (var j = 0; j <= radialSegments; j++) {
            var angle = (j / radialSegments) * 2.0 * Math.PI;
            var x = centerX + Math.cos(angle) * radius;
            var z = centerZ + Math.sin(angle) * radius;

            var r, g, b;
            if (Math.sin(angle) > 0) {
                r = COLOR_BASE_CREAM[0]; g = COLOR_BASE_CREAM[1]; b = COLOR_BASE_CREAM[2];
            } else {
                r = COLOR_TIP_GREEN[0]; g = COLOR_TIP_GREEN[1]; b = COLOR_TIP_GREEN[2];
            }

            vertices.push(x, y_bottom, z, r, g, b); 
            v_offset++;
        } 

        var v_top_ring_start = v_offset;
        for (var j = 0; j <= radialSegments; j++) {
            var angle = (j / radialSegments) * 2.0 * Math.PI;
            var x = centerX + Math.cos(angle) * radius;
            var z = centerZ + Math.sin(angle) * radius;

            var r, g, b;
            if (Math.sin(angle) > 0) {
                r = COLOR_BASE_CREAM[0]; g = COLOR_BASE_CREAM[1]; b = COLOR_BASE_CREAM[2];
            } else {
                r = COLOR_TIP_GREEN[0]; g = COLOR_TIP_GREEN[1]; b = COLOR_TIP_GREEN[2];
            }

            vertices.push(x, y_top, z, r, g, b);
            v_offset++;
        } 

        var v_bottom_center_idx = v_offset;
        vertices.push(centerX, y_bottom, centerZ, COLOR_BASE_CREAM[0], COLOR_BASE_CREAM[1], COLOR_BASE_CREAM[2]);
        v_offset++; 

        var v_top_center_idx = v_offset;
        vertices.push(centerX, y_top, centerZ, COLOR_TIP_GREEN[0], COLOR_TIP_GREEN[1], COLOR_TIP_GREEN[2]);
        v_offset++;

        for (var j = 0; j < radialSegments; j++) {
            var v1 = v_bottom_ring_start + j;
            var v2 = v_top_ring_start + j;
            var v3 = v_bottom_ring_start + j + 1;
            var v4 = v_top_ring_start + j + 1;

            faces.push(v1, v2, v3);
            faces.push(v3, v2, v4);
        }

        for (var j = 0; j < radialSegments; j++) {
            var v1 = v_bottom_ring_start + j;
            var v2 = v_bottom_ring_start + j + 1;
            faces.push(v_bottom_center_idx, v2, v1);
        }

        for (var j = 0; j < radialSegments; j++) {
            var v1 = v_top_ring_start + j;
            var v2 = v_top_ring_start + j + 1;
            faces.push(v_top_center_idx, v1, v2);
        }
        
        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE EYES ===================== */
    function buildEyes() {
        var vertices = [];
        var faces = [];
        var v_offset = 0;
        
        const COLOR_EYE_YELLOW = [0.9, 0.9, 0.2];
        const COLOR_PUPIL_ORANGE = [0.9, 0.5, 0.1];
        
        var latBands = 8;
        var longBands = 8;
        
        function createDish(centerX, centerY, centerZ, radius, color, v_offset) {
            var dishAngle = Math.PI / 2.7; 
            
            for (var lat = 0; lat <= latBands; lat++) {
                var theta = (lat / latBands) * dishAngle;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);

                for (var lon = 0; lon <= longBands; lon++) {
                    var phi = (lon / longBands) * 2 * Math.PI; 
                    var sinPhi = Math.sin(phi);
                    var cosPhi = Math.cos(phi);

                    var x = radius * cosPhi * sinTheta;
                    var y = radius * sinPhi * sinTheta;
                    var z = radius * cosTheta;

                    vertices.push(x + centerX);
                    vertices.push(y + centerY);
                    vertices.push(z + centerZ);
                    vertices.push(color[0], color[1], color[2]);
                }
            }
            
            for (var lat = 0; lat < latBands; lat++) {
                for (var lon = 0; lon < longBands; lon++) {
                    var first = (lat * (longBands + 1)) + lon;
                    var second = first + (longBands + 1);

                    var v1 = first + v_offset;
                    var v2 = second + v_offset;
                    var v3 = first + 1 + v_offset;
                    var v4 = second + 1 + v_offset;

                    faces.push(v1, v3, v2);
                    faces.push(v3, v4, v2);
                }
            }
            
            return v_offset + (latBands + 1) * (longBands + 1);
        }

        var eyeCenters = [
            [-2.0, 6.5, 2.0],
            [-1.0, 6.5, 2.0]
        ];

        for (var e = 0; e < eyeCenters.length; e++) {
            var cx = eyeCenters[e][0];
            var cy = eyeCenters[e][1];
            var cz = eyeCenters[e][2];
            
            var mainRadius = 0.5;
            v_offset = createDish(cx, cy, cz, mainRadius, COLOR_EYE_YELLOW, v_offset);
            
            var pupilRadius = 0.25;
            var pupilCenterZ_offset = 0.4; 
            v_offset = createDish(cx, cy, cz + pupilCenterZ_offset, pupilRadius, COLOR_PUPIL_ORANGE, v_offset);
        }
        
        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD HYDRAPPLE ANTENNAE ===================== */
    function buildAntennae() {
        var vertices = [];
        var faces = [];
        var v_offset = 0;

        const COLOR_STEM = [0.4, 0.3, 0.1];
        const COLOR_MINI_APPLE = [0.8, 0.1, 0.1];

        function createBox(p_base, p_top, width, color) {
            var p = [
                [p_base[0]-width, p_base[1], p_base[2]-width],
                [p_base[0]+width, p_base[1], p_base[2]-width],
                [p_base[0]+width, p_base[1], p_base[2]+width],
                [p_base[0]-width, p_base[1], p_base[2]+width],
                [p_top[0]-width,  p_top[1],  p_top[2]-width],
                [p_top[0]+width,  p_top[1],  p_top[2]-width],
                [p_top[0]+width,  p_top[1],  p_top[2]+width],
                [p_top[0]-width,  p_top[1],  p_top[2]+width]
            ];
            
            for (var i = 0; i < p.length; i++) {
                vertices.push(p[i][0], p[i][1], p[i][2], color[0], color[1], color[2]);
            }

            var f = [
                0, 1, 2, 0, 2, 3,
                4, 5, 6, 4, 6, 7,
                0, 1, 5, 0, 5, 4,
                3, 2, 6, 3, 6, 7,
                0, 3, 7, 0, 7, 4,
                1, 2, 6, 1, 6, 5
            ];

            for (var i = 0; i < f.length; i++) {
                faces.push(f[i] + v_offset);
            }
            v_offset += 8;
        }
        
        var p1_base = [-1.6, 6.7, 0.5];
        var p1_top  = [-1.7, 7.5, 0.2];
        createBox(p1_base, p1_top, 0.05, COLOR_STEM);

        var p_apple_base = [-1.7, 7.5, 0.2];
        var p_apple_top  = [-1.7, 7.8, 0.2];
        createBox(p_apple_base, p_apple_top, 0.15, COLOR_MINI_APPLE);
        
        var p2_base = [-1.4, 6.7, 0.5];
        var p2_top  = [-1.4, 7.2, 0.3];
        createBox(p2_base, p2_top, 0.05, COLOR_STEM);

        return { vertices: vertices, faces: faces };
    }

    /*===================== BUILD THE HYDRAPPLE ===================== */
    var bodyData = buildHydrappleBody();
    var neckData = buildHydrappleNeck();
    var tailData = buildHydrappleTail(); 
    var headData = buildHydrappleHead();     
    var jawData = buildHydrappleJaw();       
    var tongueData = buildHydrappleTongue(); 
    var connectorData = buildNeckConnector(); 
    var eyesData = buildEyes();
    var antennaeData = buildAntennae();

    var hydrappleData = combineGeometry([
        bodyData, 
        neckData, 
        tailData, 
        connectorData, 
        headData, 
        jawData, 
        tongueData,
        eyesData,
        antennaeData
    ]);

    this.vertex = hydrappleData.vertices;
    this.faces = hydrappleData.faces;
}
  // /**=============================  SETUP & RENDER  =================== */

  setup() {
    this.OBJECT_VERTEX = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.bufferData(
      this.GL.ARRAY_BUFFER,
      new Float32Array(this.vertex),
      this.GL.STATIC_DRAW
    );

    this.OBJECT_COLOR = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_COLOR);
    this.GL.bufferData(
      this.GL.ARRAY_BUFFER,
      new Float32Array(this.color), // Asumsi Anda punya this.color [r,g,b, ...]
      this.GL.STATIC_DRAW
    );

    this.OBJECT_FACES = this.GL.createBuffer();
    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.bufferData(
      this.GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.faces),
      this.GL.STATIC_DRAW
    );

    

    this.childs.forEach((child) => child.setup());
  }

  render(PARENT_MATRIX) {
    var MMatrix = LIBS.multiply(PARENT_MATRIX, this.POSITION_MATRIX);
    MMatrix = LIBS.multiply(MMatrix, this.MOVE_MATRIX);

    this.GL.useProgram(this.SHADER_PROGRAM);
    this.GL.uniformMatrix4fv(this._MMatrix, false, MMatrix);

    this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
    this.GL.vertexAttribPointer(
      this._position,
      3,
      this.GL.FLOAT,
      false,
      4 * (3 + 3),
      0
    );
    this.GL.vertexAttribPointer(
      this._color,
      3,
      this.GL.FLOAT,
      false,
      4 * (3 + 3),
      4 * 3
    );
    this.GL.enableVertexAttribArray(this._color); // <-- WAJIB

    this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
    this.GL.drawElements(
      this.GL.TRIANGLES,
      this.faces.length,
      this.GL.UNSIGNED_SHORT,
      0
    );

    this.childs.forEach((child) => child.render(MMatrix));
  }
}
