/**
 * TERRANOVA — Marco Geoestadístico Nacional (MGN) INEGI
 * Catálogo Geoespacial Oficial de los 32 Estados, Municipios y Localidades de México
 * Proyección y Referencia: EPSG:4326 (WGS84) / EPSG:6362 (ITRF2008)
 */

export interface MexicanState {
  cve_ent: string;
  name: string;
  shortName: string;
  capital: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  municipalityCount: number;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  polygon: [number, number][]; // Polígono perimetral representativo
}

export interface MexicanMunicipality {
  cve_geo: string;
  cve_ent: string;
  cve_mun: string;
  name: string;
  headquarters: string;
  center: [number, number];
  population: number;
  localityCount: number;
  polygon: [number, number][];
}

export interface MexicanLocality {
  cve_geo: string;
  cve_ent: string;
  cve_mun: string;
  cve_loc: string;
  name: string;
  type: 'URBANA' | 'RURAL';
  center: [number, number];
  population: number;
}

export function createBoxPolygon(center: [number, number], widthDeg: number = 0.08, heightDeg: number = 0.06): [number, number][] {
  const [lng, lat] = center;
  const hw = widthDeg / 2;
  const hh = heightDeg / 2;
  return [
    [Number((lng - hw).toFixed(4)), Number((lat + hh).toFixed(4))],
    [Number((lng + hw).toFixed(4)), Number((lat + hh).toFixed(4))],
    [Number((lng + hw).toFixed(4)), Number((lat - hh).toFixed(4))],
    [Number((lng - hw).toFixed(4)), Number((lat - hh).toFixed(4))],
    [Number((lng - hw).toFixed(4)), Number((lat + hh).toFixed(4))],
  ];
}

// 1. Catálogo Completo de las 32 Entidades Federativas de los Estados Unidos Mexicanos
export const MEXICAN_STATES: MexicanState[] = [
  {
    "cve_ent": "01",
    "name": "Aguascalientes",
    "shortName": "Ags.",
    "capital": "Aguascalientes",
    "center": [
      -102.296,
      21.881
    ],
    "zoom": 9.8,
    "municipalityCount": 11,
    "bbox": [
      -102.87,
      21.62,
      -101.85,
      22.45
    ],
    "polygon": [
      [
        -102.6,
        22.4
      ],
      [
        -102.05,
        22.35
      ],
      [
        -101.88,
        21.85
      ],
      [
        -102.15,
        21.65
      ],
      [
        -102.75,
        21.75
      ],
      [
        -102.85,
        22.15
      ],
      [
        -102.6,
        22.4
      ]
    ]
  },
  {
    "cve_ent": "02",
    "name": "Baja California",
    "shortName": "B.C.",
    "capital": "Mexicali",
    "center": [
      -115.468,
      30.84
    ],
    "zoom": 7,
    "municipalityCount": 7,
    "bbox": [
      -117.3,
      28,
      -112.75,
      32.72
    ],
    "polygon": [
      [
        -117.15,
        32.55
      ],
      [
        -114.75,
        32.72
      ],
      [
        -113.8,
        29.5
      ],
      [
        -112.8,
        28
      ],
      [
        -114.1,
        28
      ],
      [
        -115.8,
        30
      ],
      [
        -116.7,
        31.85
      ],
      [
        -117.15,
        32.55
      ]
    ]
  },
  {
    "cve_ent": "03",
    "name": "Baja California Sur",
    "shortName": "B.C.S.",
    "capital": "La Paz",
    "center": [
      -111.666,
      26.044
    ],
    "zoom": 7,
    "municipalityCount": 5,
    "bbox": [
      -115.55,
      22.85,
      -109.4,
      28
    ],
    "polygon": [
      [
        -114.1,
        28
      ],
      [
        -112.8,
        28
      ],
      [
        -111.3,
        25
      ],
      [
        -109.8,
        22.88
      ],
      [
        -110.4,
        23.4
      ],
      [
        -112.3,
        25.5
      ],
      [
        -114.5,
        27.2
      ],
      [
        -114.1,
        28
      ]
    ]
  },
  {
    "cve_ent": "04",
    "name": "Campeche",
    "shortName": "Camp.",
    "capital": "San Francisco de Campeche",
    "center": [
      -90.534,
      19.03
    ],
    "zoom": 7.5,
    "municipalityCount": 13,
    "bbox": [
      -92.47,
      17.8,
      -89.15,
      20.85
    ],
    "polygon": [
      [
        -90.45,
        20.8
      ],
      [
        -89.2,
        20
      ],
      [
        -89.15,
        17.8
      ],
      [
        -91.4,
        17.9
      ],
      [
        -92.45,
        18.6
      ],
      [
        -91.8,
        19
      ],
      [
        -90.55,
        19.85
      ],
      [
        -90.45,
        20.8
      ]
    ]
  },
  {
    "cve_ent": "05",
    "name": "Coahuila de Zaragoza",
    "shortName": "Coah.",
    "capital": "Saltillo",
    "center": [
      -101.8,
      27.3
    ],
    "zoom": 6.8,
    "municipalityCount": 38,
    "bbox": [
      -103.95,
      24.5,
      -99.8,
      29.9
    ],
    "polygon": [
      [
        -102.5,
        29.85
      ],
      [
        -100.5,
        28.5
      ],
      [
        -100,
        27
      ],
      [
        -101,
        25
      ],
      [
        -103.5,
        25
      ],
      [
        -103.8,
        27.5
      ],
      [
        -102.5,
        29.85
      ]
    ]
  },
  {
    "cve_ent": "06",
    "name": "Colima",
    "shortName": "Col.",
    "capital": "Colima",
    "center": [
      -103.724,
      19.243
    ],
    "zoom": 9.8,
    "municipalityCount": 10,
    "bbox": [
      -104.7,
      18.7,
      -103.45,
      19.6
    ],
    "polygon": [
      [
        -103.7,
        19.55
      ],
      [
        -103.5,
        19.1
      ],
      [
        -103.75,
        18.8
      ],
      [
        -104.35,
        18.9
      ],
      [
        -104.6,
        19.2
      ],
      [
        -103.7,
        19.55
      ]
    ]
  },
  {
    "cve_ent": "07",
    "name": "Chiapas",
    "shortName": "Chis.",
    "capital": "Tuxtla Gutiérrez",
    "center": [
      -92.637,
      16.5
    ],
    "zoom": 7.2,
    "municipalityCount": 124,
    "bbox": [
      -94.25,
      14.5,
      -90.35,
      17.98
    ],
    "polygon": [
      [
        -93.5,
        17.9
      ],
      [
        -91.5,
        17.5
      ],
      [
        -90.5,
        16.5
      ],
      [
        -92.2,
        14.6
      ],
      [
        -93.8,
        16
      ],
      [
        -94.1,
        16.8
      ],
      [
        -93.5,
        17.9
      ]
    ]
  },
  {
    "cve_ent": "08",
    "name": "Chihuahua",
    "shortName": "Chih.",
    "capital": "Chihuahua",
    "center": [
      -106.069,
      28.635
    ],
    "zoom": 6.5,
    "municipalityCount": 67,
    "bbox": [
      -109.1,
      25.55,
      -103.3,
      31.8
    ],
    "polygon": [
      [
        -108.5,
        31.75
      ],
      [
        -106.4,
        31.75
      ],
      [
        -103.5,
        29
      ],
      [
        -103.8,
        26.5
      ],
      [
        -107,
        26
      ],
      [
        -108.8,
        27
      ],
      [
        -108.5,
        31.75
      ]
    ]
  },
  {
    "cve_ent": "09",
    "name": "Ciudad de México",
    "shortName": "CDMX",
    "capital": "Alcaldía Cuauhtémoc",
    "center": [
      -99.133,
      19.432
    ],
    "zoom": 10.8,
    "municipalityCount": 16,
    "bbox": [
      -99.36,
      19.05,
      -98.94,
      19.59
    ],
    "polygon": [
      [
        -99.18,
        19.58
      ],
      [
        -99.05,
        19.52
      ],
      [
        -98.96,
        19.35
      ],
      [
        -99.1,
        19.1
      ],
      [
        -99.25,
        19.15
      ],
      [
        -99.34,
        19.32
      ],
      [
        -99.18,
        19.58
      ]
    ]
  },
  {
    "cve_ent": "10",
    "name": "Durango",
    "shortName": "Dgo.",
    "capital": "Victoria de Durango",
    "center": [
      -104.653,
      24.5
    ],
    "zoom": 6.8,
    "municipalityCount": 39,
    "bbox": [
      -107.25,
      22.35,
      -102.45,
      26.85
    ],
    "polygon": [
      [
        -105.5,
        26.7
      ],
      [
        -103.5,
        26
      ],
      [
        -103.8,
        24
      ],
      [
        -104.5,
        22.5
      ],
      [
        -106.5,
        23
      ],
      [
        -107.1,
        25
      ],
      [
        -105.5,
        26.7
      ]
    ]
  },
  {
    "cve_ent": "11",
    "name": "Guanajuato",
    "shortName": "Gto.",
    "capital": "Guanajuato",
    "center": [
      -101.257,
      21.019
    ],
    "zoom": 8.5,
    "municipalityCount": 46,
    "bbox": [
      -102.1,
      19.9,
      -99.65,
      21.85
    ],
    "polygon": [
      [
        -101.5,
        21.8
      ],
      [
        -100,
        21.5
      ],
      [
        -100.2,
        20.1
      ],
      [
        -101.5,
        20
      ],
      [
        -102,
        20.8
      ],
      [
        -101.5,
        21.8
      ]
    ]
  },
  {
    "cve_ent": "12",
    "name": "Guerrero",
    "shortName": "Gro.",
    "capital": "Chilpancingo de los Bravo",
    "center": [
      -99.9,
      17.5
    ],
    "zoom": 7.5,
    "municipalityCount": 85,
    "bbox": [
      -102.2,
      16.3,
      -98,
      18.85
    ],
    "polygon": [
      [
        -101.5,
        18.8
      ],
      [
        -98.5,
        18.2
      ],
      [
        -98.2,
        16.5
      ],
      [
        -100,
        16.8
      ],
      [
        -102,
        17.8
      ],
      [
        -101.5,
        18.8
      ]
    ]
  },
  {
    "cve_ent": "13",
    "name": "Hidalgo",
    "shortName": "Hgo.",
    "capital": "Pachuca de Soto",
    "center": [
      -98.733,
      20.101
    ],
    "zoom": 8.5,
    "municipalityCount": 84,
    "bbox": [
      -99.88,
      19.6,
      -97.95,
      21.4
    ],
    "polygon": [
      [
        -98.8,
        21.35
      ],
      [
        -98.1,
        20.8
      ],
      [
        -98.3,
        19.7
      ],
      [
        -99.3,
        19.7
      ],
      [
        -99.8,
        20.5
      ],
      [
        -98.8,
        21.35
      ]
    ]
  },
  {
    "cve_ent": "14",
    "name": "Jalisco",
    "shortName": "Jal.",
    "capital": "Guadalajara",
    "center": [
      -103.349,
      20.659
    ],
    "zoom": 7.5,
    "municipalityCount": 125,
    "bbox": [
      -105.7,
      18.9,
      -101.5,
      22.75
    ],
    "polygon": [
      [
        -103.8,
        22.7
      ],
      [
        -102,
        21.8
      ],
      [
        -102.5,
        19.5
      ],
      [
        -104.5,
        19
      ],
      [
        -105.5,
        20.5
      ],
      [
        -103.8,
        22.7
      ]
    ]
  },
  {
    "cve_ent": "15",
    "name": "Estado de México",
    "shortName": "Edomex",
    "capital": "Toluca de Lerdo",
    "center": [
      -99.655,
      19.282
    ],
    "zoom": 8.5,
    "municipalityCount": 125,
    "bbox": [
      -100.6,
      18.35,
      -98.6,
      20.3
    ],
    "polygon": [
      [
        -99.5,
        20.25
      ],
      [
        -98.7,
        19.8
      ],
      [
        -98.8,
        18.8
      ],
      [
        -100.2,
        18.5
      ],
      [
        -100.4,
        19.5
      ],
      [
        -99.5,
        20.25
      ]
    ]
  },
  {
    "cve_ent": "16",
    "name": "Michoacán de Ocampo",
    "shortName": "Mich.",
    "capital": "Morelia",
    "center": [
      -101.8,
      19.2
    ],
    "zoom": 7.5,
    "municipalityCount": 113,
    "bbox": [
      -103.75,
      17.9,
      -100.05,
      20.4
    ],
    "polygon": [
      [
        -101.8,
        20.35
      ],
      [
        -100.2,
        19.8
      ],
      [
        -101,
        18
      ],
      [
        -103.5,
        18.2
      ],
      [
        -103.2,
        19.8
      ],
      [
        -101.8,
        20.35
      ]
    ]
  },
  {
    "cve_ent": "17",
    "name": "Morelos",
    "shortName": "Mor.",
    "capital": "Cuernavaca",
    "center": [
      -99.23,
      18.926
    ],
    "zoom": 9.8,
    "municipalityCount": 36,
    "bbox": [
      -99.5,
      18.35,
      -98.65,
      19.15
    ],
    "polygon": [
      [
        -99.2,
        19.12
      ],
      [
        -98.7,
        18.95
      ],
      [
        -98.8,
        18.4
      ],
      [
        -99.4,
        18.45
      ],
      [
        -99.2,
        19.12
      ]
    ]
  },
  {
    "cve_ent": "18",
    "name": "Nayarit",
    "shortName": "Nay.",
    "capital": "Tepic",
    "center": [
      -104.895,
      21.8
    ],
    "zoom": 8,
    "municipalityCount": 20,
    "bbox": [
      -105.75,
      20.6,
      -103.7,
      23.05
    ],
    "polygon": [
      [
        -105,
        23
      ],
      [
        -104,
        22
      ],
      [
        -104.5,
        21
      ],
      [
        -105.6,
        20.7
      ],
      [
        -105.5,
        22.2
      ],
      [
        -105,
        23
      ]
    ]
  },
  {
    "cve_ent": "19",
    "name": "Nuevo León",
    "shortName": "N.L.",
    "capital": "Monterrey",
    "center": [
      -99.8,
      25.5
    ],
    "zoom": 7,
    "municipalityCount": 51,
    "bbox": [
      -101.2,
      23.15,
      -98.4,
      27.8
    ],
    "polygon": [
      [
        -100.2,
        27.75
      ],
      [
        -99,
        26.5
      ],
      [
        -98.8,
        24.5
      ],
      [
        -100,
        23.2
      ],
      [
        -100.8,
        24.5
      ],
      [
        -100.5,
        26.5
      ],
      [
        -100.2,
        27.75
      ]
    ]
  },
  {
    "cve_ent": "20",
    "name": "Oaxaca",
    "shortName": "Oax.",
    "capital": "Oaxaca de Juárez",
    "center": [
      -96.726,
      17.065
    ],
    "zoom": 7,
    "municipalityCount": 570,
    "bbox": [
      -98.6,
      15.65,
      -93.85,
      18.7
    ],
    "polygon": [
      [
        -97,
        18.65
      ],
      [
        -94.5,
        17
      ],
      [
        -95,
        15.8
      ],
      [
        -97.5,
        15.9
      ],
      [
        -98.3,
        16.8
      ],
      [
        -97,
        18.65
      ]
    ]
  },
  {
    "cve_ent": "21",
    "name": "Puebla",
    "shortName": "Pue.",
    "capital": "Heroica Puebla de Zaragoza",
    "center": [
      -98.206,
      19.043
    ],
    "zoom": 8.2,
    "municipalityCount": 217,
    "bbox": [
      -98.85,
      17.85,
      -96.7,
      20.85
    ],
    "polygon": [
      [
        -97.8,
        20.8
      ],
      [
        -97.2,
        19.5
      ],
      [
        -96.8,
        18.3
      ],
      [
        -98.3,
        17.9
      ],
      [
        -98.7,
        18.7
      ],
      [
        -98.6,
        19.6
      ],
      [
        -97.8,
        20.8
      ]
    ]
  },
  {
    "cve_ent": "22",
    "name": "Querétaro",
    "shortName": "Qro.",
    "capital": "Santiago de Querétaro",
    "center": [
      -100,
      20.8
    ],
    "zoom": 8.8,
    "municipalityCount": 18,
    "bbox": [
      -100.6,
      20,
      -99,
      21.65
    ],
    "polygon": [
      [
        -99.3,
        21.6
      ],
      [
        -99.1,
        20.8
      ],
      [
        -100,
        20.1
      ],
      [
        -100.55,
        20.5
      ],
      [
        -100.2,
        21.2
      ],
      [
        -99.3,
        21.6
      ]
    ]
  },
  {
    "cve_ent": "23",
    "name": "Quintana Roo",
    "shortName": "Q. Roo",
    "capital": "Chetumal",
    "center": [
      -87.8,
      19.6
    ],
    "zoom": 7.5,
    "municipalityCount": 11,
    "bbox": [
      -89.3,
      17.8,
      -86.7,
      21.6
    ],
    "polygon": [
      [
        -87,
        21.55
      ],
      [
        -86.8,
        20
      ],
      [
        -88.2,
        18.2
      ],
      [
        -89.2,
        18.8
      ],
      [
        -87.8,
        21
      ],
      [
        -87,
        21.55
      ]
    ]
  },
  {
    "cve_ent": "24",
    "name": "San Luis Potosí",
    "shortName": "S.L.P.",
    "capital": "San Luis Potosí",
    "center": [
      -100.978,
      22.5
    ],
    "zoom": 7.2,
    "municipalityCount": 59,
    "bbox": [
      -102.3,
      21.15,
      -98.3,
      24.5
    ],
    "polygon": [
      [
        -101,
        24.4
      ],
      [
        -98.8,
        22.5
      ],
      [
        -99,
        21.3
      ],
      [
        -101.5,
        21.5
      ],
      [
        -102.2,
        23
      ],
      [
        -101,
        24.4
      ]
    ]
  },
  {
    "cve_ent": "25",
    "name": "Sinaloa",
    "shortName": "Sin.",
    "capital": "Culiacán Rosales",
    "center": [
      -107.394,
      25.172
    ],
    "zoom": 7,
    "municipalityCount": 20,
    "bbox": [
      -109.45,
      22.5,
      -105.4,
      27.05
    ],
    "polygon": [
      [
        -109.1,
        27
      ],
      [
        -107,
        26
      ],
      [
        -105.8,
        23
      ],
      [
        -105.45,
        22.6
      ],
      [
        -106.5,
        23.3
      ],
      [
        -108,
        25
      ],
      [
        -109.3,
        26
      ],
      [
        -109.1,
        27
      ]
    ]
  },
  {
    "cve_ent": "26",
    "name": "Sonora",
    "shortName": "Son.",
    "capital": "Hermosillo",
    "center": [
      -110.955,
      29.072
    ],
    "zoom": 6.5,
    "municipalityCount": 72,
    "bbox": [
      -115.05,
      26.3,
      -108.4,
      32.5
    ],
    "polygon": [
      [
        -114.8,
        32.48
      ],
      [
        -111,
        31.35
      ],
      [
        -108.8,
        31.3
      ],
      [
        -108.5,
        27
      ],
      [
        -109.8,
        26.35
      ],
      [
        -111.5,
        28
      ],
      [
        -113.5,
        30.5
      ],
      [
        -114.8,
        32.48
      ]
    ]
  },
  {
    "cve_ent": "27",
    "name": "Tabasco",
    "shortName": "Tab.",
    "capital": "Villahermosa",
    "center": [
      -92.93,
      17.989
    ],
    "zoom": 8.2,
    "municipalityCount": 17,
    "bbox": [
      -94.15,
      17.25,
      -90.98,
      18.65
    ],
    "polygon": [
      [
        -93.5,
        18.55
      ],
      [
        -91.5,
        18.6
      ],
      [
        -91,
        17.8
      ],
      [
        -91.8,
        17.3
      ],
      [
        -93.6,
        17.4
      ],
      [
        -94,
        18
      ],
      [
        -93.5,
        18.55
      ]
    ]
  },
  {
    "cve_ent": "28",
    "name": "Tamaulipas",
    "shortName": "Tamps.",
    "capital": "Ciudad Victoria",
    "center": [
      -98.836,
      24.266
    ],
    "zoom": 7,
    "municipalityCount": 43,
    "bbox": [
      -100.15,
      22.2,
      -97.12,
      27.7
    ],
    "polygon": [
      [
        -99.5,
        27.65
      ],
      [
        -97.5,
        26
      ],
      [
        -97.75,
        22.3
      ],
      [
        -98.8,
        22.4
      ],
      [
        -99.8,
        23.2
      ],
      [
        -100.1,
        24.5
      ],
      [
        -99.2,
        26
      ],
      [
        -99.5,
        27.65
      ]
    ]
  },
  {
    "cve_ent": "29",
    "name": "Tlaxcala",
    "shortName": "Tlax.",
    "capital": "Tlaxcala de Xicohténcatl",
    "center": [
      -98.237,
      19.318
    ],
    "zoom": 10,
    "municipalityCount": 60,
    "bbox": [
      -98.65,
      19.1,
      -97.65,
      19.75
    ],
    "polygon": [
      [
        -98.3,
        19.72
      ],
      [
        -97.75,
        19.55
      ],
      [
        -97.9,
        19.15
      ],
      [
        -98.4,
        19.12
      ],
      [
        -98.6,
        19.45
      ],
      [
        -98.3,
        19.72
      ]
    ]
  },
  {
    "cve_ent": "30",
    "name": "Veracruz de Ignacio de la Llave",
    "shortName": "Ver.",
    "capital": "Xalapa-Enríquez",
    "center": [
      -96.134,
      19.173
    ],
    "zoom": 7,
    "municipalityCount": 212,
    "bbox": [
      -98.7,
      17.15,
      -93.6,
      22.48
    ],
    "polygon": [
      [
        -98.2,
        22.45
      ],
      [
        -97.2,
        21
      ],
      [
        -95.8,
        19
      ],
      [
        -94,
        17.5
      ],
      [
        -94.5,
        17.2
      ],
      [
        -96,
        18.2
      ],
      [
        -97,
        19
      ],
      [
        -97.8,
        20.5
      ],
      [
        -98.2,
        22.45
      ]
    ]
  },
  {
    "cve_ent": "31",
    "name": "Yucatán",
    "shortName": "Yuc.",
    "capital": "Mérida",
    "center": [
      -89.592,
      20.709
    ],
    "zoom": 8,
    "municipalityCount": 106,
    "bbox": [
      -90.45,
      19.55,
      -87.55,
      21.65
    ],
    "polygon": [
      [
        -89.5,
        21.6
      ],
      [
        -88,
        21.55
      ],
      [
        -87.6,
        20.8
      ],
      [
        -89,
        19.65
      ],
      [
        -90.3,
        19.8
      ],
      [
        -90.4,
        21
      ],
      [
        -89.5,
        21.6
      ]
    ]
  },
  {
    "cve_ent": "32",
    "name": "Zacatecas",
    "shortName": "Zac.",
    "capital": "Zacatecas",
    "center": [
      -102.583,
      22.77
    ],
    "zoom": 7.2,
    "municipalityCount": 58,
    "bbox": [
      -104.4,
      21.05,
      -100.8,
      25.15
    ],
    "polygon": [
      [
        -102,
        25.1
      ],
      [
        -101,
        24
      ],
      [
        -101.8,
        22.5
      ],
      [
        -102.8,
        21.3
      ],
      [
        -104.2,
        22
      ],
      [
        -103.5,
        23.5
      ],
      [
        -103.8,
        24.8
      ],
      [
        -102,
        25.1
      ]
    ]
  }
];

// 2. Catálogo Oficial de Municipios de los 32 Estados de México (INEGI MGN cve_geo 5 dígitos)
export const MEXICAN_MUNICIPALITIES: MexicanMunicipality[] = [
  {
    "cve_geo": "01001",
    "cve_ent": "01",
    "cve_mun": "001",
    "name": "Aguascalientes",
    "headquarters": "Aguascalientes",
    "center": [
      -102.296,
      21.881
    ],
    "population": 948990,
    "localityCount": 18,
    "polygon": [
      [
        -102.341,
        21.916
      ],
      [
        -102.251,
        21.916
      ],
      [
        -102.251,
        21.846
      ],
      [
        -102.341,
        21.846
      ],
      [
        -102.341,
        21.916
      ]
    ]
  },
  {
    "cve_geo": "01005",
    "cve_ent": "01",
    "cve_mun": "005",
    "name": "Jesús María",
    "headquarters": "Jesús María",
    "center": [
      -102.344,
      21.961
    ],
    "population": 130184,
    "localityCount": 12,
    "polygon": [
      [
        -102.389,
        21.996
      ],
      [
        -102.299,
        21.996
      ],
      [
        -102.299,
        21.926
      ],
      [
        -102.389,
        21.926
      ],
      [
        -102.389,
        21.996
      ]
    ]
  },
  {
    "cve_geo": "01003",
    "cve_ent": "01",
    "cve_mun": "003",
    "name": "Calvillo",
    "headquarters": "Calvillo",
    "center": [
      -102.719,
      21.847
    ],
    "population": 58250,
    "localityCount": 9,
    "polygon": [
      [
        -102.764,
        21.882
      ],
      [
        -102.674,
        21.882
      ],
      [
        -102.674,
        21.812
      ],
      [
        -102.764,
        21.812
      ],
      [
        -102.764,
        21.882
      ]
    ]
  },
  {
    "cve_geo": "02002",
    "cve_ent": "02",
    "cve_mun": "002",
    "name": "Mexicali",
    "headquarters": "Mexicali",
    "center": [
      -115.468,
      32.651
    ],
    "population": 1049792,
    "localityCount": 25,
    "polygon": [
      [
        -115.513,
        32.686
      ],
      [
        -115.423,
        32.686
      ],
      [
        -115.423,
        32.616
      ],
      [
        -115.513,
        32.616
      ],
      [
        -115.513,
        32.686
      ]
    ]
  },
  {
    "cve_geo": "02004",
    "cve_ent": "02",
    "cve_mun": "004",
    "name": "Tijuana",
    "headquarters": "Tijuana",
    "center": [
      -117.038,
      32.514
    ],
    "population": 1922523,
    "localityCount": 34,
    "polygon": [
      [
        -117.083,
        32.549
      ],
      [
        -116.993,
        32.549
      ],
      [
        -116.993,
        32.479
      ],
      [
        -117.083,
        32.479
      ],
      [
        -117.083,
        32.549
      ]
    ]
  },
  {
    "cve_geo": "02001",
    "cve_ent": "02",
    "cve_mun": "001",
    "name": "Ensenada",
    "headquarters": "Ensenada",
    "center": [
      -116.603,
      31.866
    ],
    "population": 443807,
    "localityCount": 20,
    "polygon": [
      [
        -116.648,
        31.901
      ],
      [
        -116.558,
        31.901
      ],
      [
        -116.558,
        31.831
      ],
      [
        -116.648,
        31.831
      ],
      [
        -116.648,
        31.901
      ]
    ]
  },
  {
    "cve_geo": "03003",
    "cve_ent": "03",
    "cve_mun": "003",
    "name": "La Paz",
    "headquarters": "La Paz",
    "center": [
      -110.312,
      24.142
    ],
    "population": 292241,
    "localityCount": 16,
    "polygon": [
      [
        -110.357,
        24.177
      ],
      [
        -110.267,
        24.177
      ],
      [
        -110.267,
        24.107
      ],
      [
        -110.357,
        24.107
      ],
      [
        -110.357,
        24.177
      ]
    ]
  },
  {
    "cve_geo": "03008",
    "cve_ent": "03",
    "cve_mun": "008",
    "name": "Los Cabos",
    "headquarters": "San José del Cabo",
    "center": [
      -109.697,
      23.062
    ],
    "population": 351111,
    "localityCount": 22,
    "polygon": [
      [
        -109.742,
        23.097
      ],
      [
        -109.652,
        23.097
      ],
      [
        -109.652,
        23.027
      ],
      [
        -109.742,
        23.027
      ],
      [
        -109.742,
        23.097
      ]
    ]
  },
  {
    "cve_geo": "04002",
    "cve_ent": "04",
    "cve_mun": "002",
    "name": "Campeche",
    "headquarters": "San Francisco de Campeche",
    "center": [
      -90.534,
      19.83
    ],
    "population": 294077,
    "localityCount": 14,
    "polygon": [
      [
        -90.579,
        19.865
      ],
      [
        -90.489,
        19.865
      ],
      [
        -90.489,
        19.795
      ],
      [
        -90.579,
        19.795
      ],
      [
        -90.579,
        19.865
      ]
    ]
  },
  {
    "cve_geo": "04003",
    "cve_ent": "04",
    "cve_mun": "003",
    "name": "Carmen",
    "headquarters": "Ciudad del Carmen",
    "center": [
      -91.817,
      18.643
    ],
    "population": 248845,
    "localityCount": 18,
    "polygon": [
      [
        -91.862,
        18.678
      ],
      [
        -91.772,
        18.678
      ],
      [
        -91.772,
        18.608
      ],
      [
        -91.862,
        18.608
      ],
      [
        -91.862,
        18.678
      ]
    ]
  },
  {
    "cve_geo": "05030",
    "cve_ent": "05",
    "cve_mun": "030",
    "name": "Saltillo",
    "headquarters": "Saltillo",
    "center": [
      -100.999,
      25.423
    ],
    "population": 879958,
    "localityCount": 28,
    "polygon": [
      [
        -101.044,
        25.458
      ],
      [
        -100.954,
        25.458
      ],
      [
        -100.954,
        25.388
      ],
      [
        -101.044,
        25.388
      ],
      [
        -101.044,
        25.458
      ]
    ]
  },
  {
    "cve_geo": "05035",
    "cve_ent": "05",
    "cve_mun": "035",
    "name": "Torreón",
    "headquarters": "Torreón",
    "center": [
      -103.433,
      25.542
    ],
    "population": 720848,
    "localityCount": 24,
    "polygon": [
      [
        -103.478,
        25.577
      ],
      [
        -103.388,
        25.577
      ],
      [
        -103.388,
        25.507
      ],
      [
        -103.478,
        25.507
      ],
      [
        -103.478,
        25.577
      ]
    ]
  },
  {
    "cve_geo": "05018",
    "cve_ent": "05",
    "cve_mun": "018",
    "name": "Monclova",
    "headquarters": "Monclova",
    "center": [
      -101.42,
      26.906
    ],
    "population": 237951,
    "localityCount": 15,
    "polygon": [
      [
        -101.465,
        26.941
      ],
      [
        -101.375,
        26.941
      ],
      [
        -101.375,
        26.871
      ],
      [
        -101.465,
        26.871
      ],
      [
        -101.465,
        26.941
      ]
    ]
  },
  {
    "cve_geo": "06002",
    "cve_ent": "06",
    "cve_mun": "002",
    "name": "Colima",
    "headquarters": "Colima",
    "center": [
      -103.724,
      19.243
    ],
    "population": 157048,
    "localityCount": 11,
    "polygon": [
      [
        -103.769,
        19.278
      ],
      [
        -103.679,
        19.278
      ],
      [
        -103.679,
        19.208
      ],
      [
        -103.769,
        19.208
      ],
      [
        -103.769,
        19.278
      ]
    ]
  },
  {
    "cve_geo": "06007",
    "cve_ent": "06",
    "cve_mun": "007",
    "name": "Manzanillo",
    "headquarters": "Manzanillo",
    "center": [
      -104.316,
      19.052
    ],
    "population": 191031,
    "localityCount": 17,
    "polygon": [
      [
        -104.361,
        19.087
      ],
      [
        -104.271,
        19.087
      ],
      [
        -104.271,
        19.017
      ],
      [
        -104.361,
        19.017
      ],
      [
        -104.361,
        19.087
      ]
    ]
  },
  {
    "cve_geo": "06010",
    "cve_ent": "06",
    "cve_mun": "010",
    "name": "Villa de Álvarez",
    "headquarters": "Villa de Álvarez",
    "center": [
      -103.74,
      19.266
    ],
    "population": 149762,
    "localityCount": 10,
    "polygon": [
      [
        -103.785,
        19.301
      ],
      [
        -103.695,
        19.301
      ],
      [
        -103.695,
        19.231
      ],
      [
        -103.785,
        19.231
      ],
      [
        -103.785,
        19.301
      ]
    ]
  },
  {
    "cve_geo": "07101",
    "cve_ent": "07",
    "cve_mun": "101",
    "name": "Tuxtla Gutiérrez",
    "headquarters": "Tuxtla Gutiérrez",
    "center": [
      -93.116,
      16.753
    ],
    "population": 604147,
    "localityCount": 32,
    "polygon": [
      [
        -93.161,
        16.788
      ],
      [
        -93.071,
        16.788
      ],
      [
        -93.071,
        16.718
      ],
      [
        -93.161,
        16.718
      ],
      [
        -93.161,
        16.788
      ]
    ]
  },
  {
    "cve_geo": "07078",
    "cve_ent": "07",
    "cve_mun": "078",
    "name": "San Cristóbal de las Casas",
    "headquarters": "San Cristóbal",
    "center": [
      -92.637,
      16.737
    ],
    "population": 215874,
    "localityCount": 25,
    "polygon": [
      [
        -92.682,
        16.772
      ],
      [
        -92.592,
        16.772
      ],
      [
        -92.592,
        16.702
      ],
      [
        -92.682,
        16.702
      ],
      [
        -92.682,
        16.772
      ]
    ]
  },
  {
    "cve_geo": "07089",
    "cve_ent": "07",
    "cve_mun": "089",
    "name": "Tapachula",
    "headquarters": "Tapachula",
    "center": [
      -92.263,
      14.904
    ],
    "population": 353706,
    "localityCount": 29,
    "polygon": [
      [
        -92.308,
        14.939
      ],
      [
        -92.218,
        14.939
      ],
      [
        -92.218,
        14.869
      ],
      [
        -92.308,
        14.869
      ],
      [
        -92.308,
        14.939
      ]
    ]
  },
  {
    "cve_geo": "08019",
    "cve_ent": "08",
    "cve_mun": "019",
    "name": "Chihuahua",
    "headquarters": "Chihuahua",
    "center": [
      -106.069,
      28.635
    ],
    "population": 937674,
    "localityCount": 36,
    "polygon": [
      [
        -106.114,
        28.67
      ],
      [
        -106.024,
        28.67
      ],
      [
        -106.024,
        28.6
      ],
      [
        -106.114,
        28.6
      ],
      [
        -106.114,
        28.67
      ]
    ]
  },
  {
    "cve_geo": "08037",
    "cve_ent": "08",
    "cve_mun": "037",
    "name": "Juárez",
    "headquarters": "Ciudad Juárez",
    "center": [
      -106.485,
      31.739
    ],
    "population": 1512450,
    "localityCount": 45,
    "polygon": [
      [
        -106.53,
        31.774
      ],
      [
        -106.44,
        31.774
      ],
      [
        -106.44,
        31.704
      ],
      [
        -106.53,
        31.704
      ],
      [
        -106.53,
        31.774
      ]
    ]
  },
  {
    "cve_geo": "08021",
    "cve_ent": "08",
    "cve_mun": "021",
    "name": "Cuauhtémoc",
    "headquarters": "Cuauhtémoc",
    "center": [
      -106.865,
      28.406
    ],
    "population": 180638,
    "localityCount": 19,
    "polygon": [
      [
        -106.91,
        28.441
      ],
      [
        -106.82,
        28.441
      ],
      [
        -106.82,
        28.371
      ],
      [
        -106.91,
        28.371
      ],
      [
        -106.91,
        28.441
      ]
    ]
  },
  {
    "cve_geo": "09015",
    "cve_ent": "09",
    "cve_mun": "015",
    "name": "Cuauhtémoc",
    "headquarters": "Alcaldía Cuauhtémoc",
    "center": [
      -99.155,
      19.432
    ],
    "population": 545884,
    "localityCount": 34,
    "polygon": [
      [
        -99.2,
        19.467
      ],
      [
        -99.11,
        19.467
      ],
      [
        -99.11,
        19.397
      ],
      [
        -99.2,
        19.397
      ],
      [
        -99.2,
        19.467
      ]
    ]
  },
  {
    "cve_geo": "09016",
    "cve_ent": "09",
    "cve_mun": "016",
    "name": "Miguel Hidalgo",
    "headquarters": "Alcaldía Miguel Hidalgo",
    "center": [
      -99.192,
      19.435
    ],
    "population": 414470,
    "localityCount": 28,
    "polygon": [
      [
        -99.237,
        19.47
      ],
      [
        -99.147,
        19.47
      ],
      [
        -99.147,
        19.4
      ],
      [
        -99.237,
        19.4
      ],
      [
        -99.237,
        19.47
      ]
    ]
  },
  {
    "cve_geo": "09014",
    "cve_ent": "09",
    "cve_mun": "014",
    "name": "Benito Juárez",
    "headquarters": "Alcaldía Benito Juárez",
    "center": [
      -99.16,
      19.38
    ],
    "population": 434153,
    "localityCount": 30,
    "polygon": [
      [
        -99.205,
        19.415
      ],
      [
        -99.115,
        19.415
      ],
      [
        -99.115,
        19.345
      ],
      [
        -99.205,
        19.345
      ],
      [
        -99.205,
        19.415
      ]
    ]
  },
  {
    "cve_geo": "09010",
    "cve_ent": "09",
    "cve_mun": "010",
    "name": "Álvaro Obregón",
    "headquarters": "Alcaldía Álvaro Obregón",
    "center": [
      -99.205,
      19.36
    ],
    "population": 759137,
    "localityCount": 42,
    "polygon": [
      [
        -99.25,
        19.395
      ],
      [
        -99.16,
        19.395
      ],
      [
        -99.16,
        19.325
      ],
      [
        -99.25,
        19.325
      ],
      [
        -99.25,
        19.395
      ]
    ]
  },
  {
    "cve_geo": "09003",
    "cve_ent": "09",
    "cve_mun": "003",
    "name": "Coyoacán",
    "headquarters": "Alcaldía Coyoacán",
    "center": [
      -99.162,
      19.349
    ],
    "population": 614447,
    "localityCount": 36,
    "polygon": [
      [
        -99.207,
        19.384
      ],
      [
        -99.117,
        19.384
      ],
      [
        -99.117,
        19.314
      ],
      [
        -99.207,
        19.314
      ],
      [
        -99.207,
        19.384
      ]
    ]
  },
  {
    "cve_geo": "09007",
    "cve_ent": "09",
    "cve_mun": "007",
    "name": "Iztapalapa",
    "headquarters": "Alcaldía Iztapalapa",
    "center": [
      -99.092,
      19.355
    ],
    "population": 1835486,
    "localityCount": 58,
    "polygon": [
      [
        -99.137,
        19.39
      ],
      [
        -99.047,
        19.39
      ],
      [
        -99.047,
        19.32
      ],
      [
        -99.137,
        19.32
      ],
      [
        -99.137,
        19.39
      ]
    ]
  },
  {
    "cve_geo": "10005",
    "cve_ent": "10",
    "cve_mun": "005",
    "name": "Durango",
    "headquarters": "Victoria de Durango",
    "center": [
      -104.653,
      24.027
    ],
    "population": 688697,
    "localityCount": 26,
    "polygon": [
      [
        -104.698,
        24.062
      ],
      [
        -104.608,
        24.062
      ],
      [
        -104.608,
        23.992
      ],
      [
        -104.698,
        23.992
      ],
      [
        -104.698,
        24.062
      ]
    ]
  },
  {
    "cve_geo": "10007",
    "cve_ent": "10",
    "cve_mun": "007",
    "name": "Gómez Palacio",
    "headquarters": "Gómez Palacio",
    "center": [
      -103.498,
      25.573
    ],
    "population": 372750,
    "localityCount": 21,
    "polygon": [
      [
        -103.543,
        25.608
      ],
      [
        -103.453,
        25.608
      ],
      [
        -103.453,
        25.538
      ],
      [
        -103.543,
        25.538
      ],
      [
        -103.543,
        25.608
      ]
    ]
  },
  {
    "cve_geo": "10012",
    "cve_ent": "10",
    "cve_mun": "012",
    "name": "Lerdo",
    "headquarters": "Lerdo",
    "center": [
      -103.525,
      25.534
    ],
    "population": 163313,
    "localityCount": 15,
    "polygon": [
      [
        -103.57,
        25.569
      ],
      [
        -103.48,
        25.569
      ],
      [
        -103.48,
        25.499
      ],
      [
        -103.57,
        25.499
      ],
      [
        -103.57,
        25.569
      ]
    ]
  },
  {
    "cve_geo": "11015",
    "cve_ent": "11",
    "cve_mun": "015",
    "name": "Guanajuato",
    "headquarters": "Guanajuato",
    "center": [
      -101.257,
      21.019
    ],
    "population": 194500,
    "localityCount": 22,
    "polygon": [
      [
        -101.302,
        21.054
      ],
      [
        -101.212,
        21.054
      ],
      [
        -101.212,
        20.984
      ],
      [
        -101.302,
        20.984
      ],
      [
        -101.302,
        21.054
      ]
    ]
  },
  {
    "cve_geo": "11020",
    "cve_ent": "11",
    "cve_mun": "020",
    "name": "León",
    "headquarters": "León de los Aldama",
    "center": [
      -101.682,
      21.122
    ],
    "population": 1721215,
    "localityCount": 48,
    "polygon": [
      [
        -101.727,
        21.157
      ],
      [
        -101.637,
        21.157
      ],
      [
        -101.637,
        21.087
      ],
      [
        -101.727,
        21.087
      ],
      [
        -101.727,
        21.157
      ]
    ]
  },
  {
    "cve_geo": "11017",
    "cve_ent": "11",
    "cve_mun": "017",
    "name": "Irapuato",
    "headquarters": "Irapuato",
    "center": [
      -101.347,
      20.673
    ],
    "population": 592953,
    "localityCount": 31,
    "polygon": [
      [
        -101.392,
        20.708
      ],
      [
        -101.302,
        20.708
      ],
      [
        -101.302,
        20.638
      ],
      [
        -101.392,
        20.638
      ],
      [
        -101.392,
        20.708
      ]
    ]
  },
  {
    "cve_geo": "11007",
    "cve_ent": "11",
    "cve_mun": "007",
    "name": "Celaya",
    "headquarters": "Celaya",
    "center": [
      -100.814,
      20.523
    ],
    "population": 521169,
    "localityCount": 29,
    "polygon": [
      [
        -100.859,
        20.558
      ],
      [
        -100.769,
        20.558
      ],
      [
        -100.769,
        20.488
      ],
      [
        -100.859,
        20.488
      ],
      [
        -100.859,
        20.558
      ]
    ]
  },
  {
    "cve_geo": "12029",
    "cve_ent": "12",
    "cve_mun": "029",
    "name": "Chilpancingo de los Bravo",
    "headquarters": "Chilpancingo",
    "center": [
      -99.5,
      17.551
    ],
    "population": 283354,
    "localityCount": 24,
    "polygon": [
      [
        -99.545,
        17.586
      ],
      [
        -99.455,
        17.586
      ],
      [
        -99.455,
        17.516
      ],
      [
        -99.545,
        17.516
      ],
      [
        -99.545,
        17.586
      ]
    ]
  },
  {
    "cve_geo": "12001",
    "cve_ent": "12",
    "cve_mun": "001",
    "name": "Acapulco de Juárez",
    "headquarters": "Acapulco",
    "center": [
      -99.873,
      16.853
    ],
    "population": 779566,
    "localityCount": 41,
    "polygon": [
      [
        -99.918,
        16.888
      ],
      [
        -99.828,
        16.888
      ],
      [
        -99.828,
        16.818
      ],
      [
        -99.918,
        16.818
      ],
      [
        -99.918,
        16.888
      ]
    ]
  },
  {
    "cve_geo": "12035",
    "cve_ent": "12",
    "cve_mun": "035",
    "name": "Iguala de la Independencia",
    "headquarters": "Iguala",
    "center": [
      -99.539,
      18.344
    ],
    "population": 154173,
    "localityCount": 18,
    "polygon": [
      [
        -99.584,
        18.379
      ],
      [
        -99.494,
        18.379
      ],
      [
        -99.494,
        18.309
      ],
      [
        -99.584,
        18.309
      ],
      [
        -99.584,
        18.379
      ]
    ]
  },
  {
    "cve_geo": "13048",
    "cve_ent": "13",
    "cve_mun": "048",
    "name": "Pachuca de Soto",
    "headquarters": "Pachuca",
    "center": [
      -98.733,
      20.101
    ],
    "population": 314331,
    "localityCount": 20,
    "polygon": [
      [
        -98.778,
        20.136
      ],
      [
        -98.688,
        20.136
      ],
      [
        -98.688,
        20.066
      ],
      [
        -98.778,
        20.066
      ],
      [
        -98.778,
        20.136
      ]
    ]
  },
  {
    "cve_geo": "13051",
    "cve_ent": "13",
    "cve_mun": "051",
    "name": "Mineral de la Reforma",
    "headquarters": "Pachuquilla",
    "center": [
      -98.718,
      20.082
    ],
    "population": 202749,
    "localityCount": 16,
    "polygon": [
      [
        -98.763,
        20.117
      ],
      [
        -98.673,
        20.117
      ],
      [
        -98.673,
        20.047
      ],
      [
        -98.763,
        20.047
      ],
      [
        -98.763,
        20.117
      ]
    ]
  },
  {
    "cve_geo": "13077",
    "cve_ent": "13",
    "cve_mun": "077",
    "name": "Tulancingo de Bravo",
    "headquarters": "Tulancingo",
    "center": [
      -98.369,
      20.083
    ],
    "population": 168369,
    "localityCount": 19,
    "polygon": [
      [
        -98.414,
        20.118
      ],
      [
        -98.324,
        20.118
      ],
      [
        -98.324,
        20.048
      ],
      [
        -98.414,
        20.048
      ],
      [
        -98.414,
        20.118
      ]
    ]
  },
  {
    "cve_geo": "14039",
    "cve_ent": "14",
    "cve_mun": "039",
    "name": "Guadalajara",
    "headquarters": "Guadalajara",
    "center": [
      -103.3496,
      20.6597
    ],
    "population": 1385629,
    "localityCount": 38,
    "polygon": [
      [
        -103.3946,
        20.6947
      ],
      [
        -103.3046,
        20.6947
      ],
      [
        -103.3046,
        20.6247
      ],
      [
        -103.3946,
        20.6247
      ],
      [
        -103.3946,
        20.6947
      ]
    ]
  },
  {
    "cve_geo": "14120",
    "cve_ent": "14",
    "cve_mun": "120",
    "name": "Zapopan",
    "headquarters": "Zapopan",
    "center": [
      -103.393,
      20.723
    ],
    "population": 1476491,
    "localityCount": 44,
    "polygon": [
      [
        -103.438,
        20.758
      ],
      [
        -103.348,
        20.758
      ],
      [
        -103.348,
        20.688
      ],
      [
        -103.438,
        20.688
      ],
      [
        -103.438,
        20.758
      ]
    ]
  },
  {
    "cve_geo": "14098",
    "cve_ent": "14",
    "cve_mun": "098",
    "name": "San Pedro Tlaquepaque",
    "headquarters": "Tlaquepaque",
    "center": [
      -103.315,
      20.638
    ],
    "population": 687127,
    "localityCount": 27,
    "polygon": [
      [
        -103.36,
        20.673
      ],
      [
        -103.27,
        20.673
      ],
      [
        -103.27,
        20.603
      ],
      [
        -103.36,
        20.603
      ],
      [
        -103.36,
        20.673
      ]
    ]
  },
  {
    "cve_geo": "14097",
    "cve_ent": "14",
    "cve_mun": "097",
    "name": "Tlajomulco de Zúñiga",
    "headquarters": "Tlajomulco",
    "center": [
      -103.443,
      20.473
    ],
    "population": 727750,
    "localityCount": 31,
    "polygon": [
      [
        -103.488,
        20.508
      ],
      [
        -103.398,
        20.508
      ],
      [
        -103.398,
        20.438
      ],
      [
        -103.488,
        20.438
      ],
      [
        -103.488,
        20.508
      ]
    ]
  },
  {
    "cve_geo": "14067",
    "cve_ent": "14",
    "cve_mun": "067",
    "name": "Puerto Vallarta",
    "headquarters": "Puerto Vallarta",
    "center": [
      -105.225,
      20.653
    ],
    "population": 291839,
    "localityCount": 23,
    "polygon": [
      [
        -105.27,
        20.688
      ],
      [
        -105.18,
        20.688
      ],
      [
        -105.18,
        20.618
      ],
      [
        -105.27,
        20.618
      ],
      [
        -105.27,
        20.688
      ]
    ]
  },
  {
    "cve_geo": "15106",
    "cve_ent": "15",
    "cve_mun": "106",
    "name": "Toluca",
    "headquarters": "Toluca de Lerdo",
    "center": [
      -99.655,
      19.282
    ],
    "population": 910608,
    "localityCount": 37,
    "polygon": [
      [
        -99.7,
        19.317
      ],
      [
        -99.61,
        19.317
      ],
      [
        -99.61,
        19.247
      ],
      [
        -99.7,
        19.247
      ],
      [
        -99.7,
        19.317
      ]
    ]
  },
  {
    "cve_geo": "15057",
    "cve_ent": "15",
    "cve_mun": "057",
    "name": "Naucalpan de Juárez",
    "headquarters": "Naucalpan",
    "center": [
      -99.238,
      19.478
    ],
    "population": 834434,
    "localityCount": 33,
    "polygon": [
      [
        -99.283,
        19.513
      ],
      [
        -99.193,
        19.513
      ],
      [
        -99.193,
        19.443
      ],
      [
        -99.283,
        19.443
      ],
      [
        -99.283,
        19.513
      ]
    ]
  },
  {
    "cve_geo": "15104",
    "cve_ent": "15",
    "cve_mun": "104",
    "name": "Tlalnepantla de Baz",
    "headquarters": "Tlalnepantla",
    "center": [
      -99.196,
      19.539
    ],
    "population": 672202,
    "localityCount": 29,
    "polygon": [
      [
        -99.241,
        19.574
      ],
      [
        -99.151,
        19.574
      ],
      [
        -99.151,
        19.504
      ],
      [
        -99.241,
        19.504
      ],
      [
        -99.241,
        19.574
      ]
    ]
  },
  {
    "cve_geo": "15033",
    "cve_ent": "15",
    "cve_mun": "033",
    "name": "Ecatepec de Morelos",
    "headquarters": "San Cristóbal Ecatepec",
    "center": [
      -99.049,
      19.601
    ],
    "population": 1645352,
    "localityCount": 52,
    "polygon": [
      [
        -99.094,
        19.636
      ],
      [
        -99.004,
        19.636
      ],
      [
        -99.004,
        19.566
      ],
      [
        -99.094,
        19.566
      ],
      [
        -99.094,
        19.636
      ]
    ]
  },
  {
    "cve_geo": "15058",
    "cve_ent": "15",
    "cve_mun": "058",
    "name": "Nezahualcóyotl",
    "headquarters": "Ciudad Nezahualcóyotl",
    "center": [
      -98.988,
      19.4
    ],
    "population": 1077208,
    "localityCount": 40,
    "polygon": [
      [
        -99.033,
        19.435
      ],
      [
        -98.943,
        19.435
      ],
      [
        -98.943,
        19.365
      ],
      [
        -99.033,
        19.365
      ],
      [
        -99.033,
        19.435
      ]
    ]
  },
  {
    "cve_geo": "16053",
    "cve_ent": "16",
    "cve_mun": "053",
    "name": "Morelia",
    "headquarters": "Morelia",
    "center": [
      -101.185,
      19.706
    ],
    "population": 849053,
    "localityCount": 35,
    "polygon": [
      [
        -101.23,
        19.741
      ],
      [
        -101.14,
        19.741
      ],
      [
        -101.14,
        19.671
      ],
      [
        -101.23,
        19.671
      ],
      [
        -101.23,
        19.741
      ]
    ]
  },
  {
    "cve_geo": "16102",
    "cve_ent": "16",
    "cve_mun": "102",
    "name": "Uruapan",
    "headquarters": "Uruapan",
    "center": [
      -102.062,
      19.418
    ],
    "population": 356786,
    "localityCount": 22,
    "polygon": [
      [
        -102.107,
        19.453
      ],
      [
        -102.017,
        19.453
      ],
      [
        -102.017,
        19.383
      ],
      [
        -102.107,
        19.383
      ],
      [
        -102.107,
        19.453
      ]
    ]
  },
  {
    "cve_geo": "16108",
    "cve_ent": "16",
    "cve_mun": "108",
    "name": "Zamora",
    "headquarters": "Zamora de Hidalgo",
    "center": [
      -102.288,
      19.985
    ],
    "population": 204860,
    "localityCount": 18,
    "polygon": [
      [
        -102.333,
        20.02
      ],
      [
        -102.243,
        20.02
      ],
      [
        -102.243,
        19.95
      ],
      [
        -102.333,
        19.95
      ],
      [
        -102.333,
        20.02
      ]
    ]
  },
  {
    "cve_geo": "17007",
    "cve_ent": "17",
    "cve_mun": "007",
    "name": "Cuernavaca",
    "headquarters": "Cuernavaca",
    "center": [
      -99.23,
      18.926
    ],
    "population": 378476,
    "localityCount": 26,
    "polygon": [
      [
        -99.275,
        18.961
      ],
      [
        -99.185,
        18.961
      ],
      [
        -99.185,
        18.891
      ],
      [
        -99.275,
        18.891
      ],
      [
        -99.275,
        18.961
      ]
    ]
  },
  {
    "cve_geo": "17011",
    "cve_ent": "17",
    "cve_mun": "011",
    "name": "Jiutepec",
    "headquarters": "Jiutepec",
    "center": [
      -99.176,
      18.881
    ],
    "population": 215357,
    "localityCount": 19,
    "polygon": [
      [
        -99.221,
        18.916
      ],
      [
        -99.131,
        18.916
      ],
      [
        -99.131,
        18.846
      ],
      [
        -99.221,
        18.846
      ],
      [
        -99.221,
        18.916
      ]
    ]
  },
  {
    "cve_geo": "17006",
    "cve_ent": "17",
    "cve_mun": "006",
    "name": "Cuautla",
    "headquarters": "Cuautla",
    "center": [
      -98.956,
      18.813
    ],
    "population": 187267,
    "localityCount": 17,
    "polygon": [
      [
        -99.001,
        18.848
      ],
      [
        -98.911,
        18.848
      ],
      [
        -98.911,
        18.778
      ],
      [
        -99.001,
        18.778
      ],
      [
        -99.001,
        18.848
      ]
    ]
  },
  {
    "cve_geo": "18017",
    "cve_ent": "18",
    "cve_mun": "017",
    "name": "Tepic",
    "headquarters": "Tepic",
    "center": [
      -104.895,
      21.503
    ],
    "population": 425924,
    "localityCount": 24,
    "polygon": [
      [
        -104.94,
        21.538
      ],
      [
        -104.85,
        21.538
      ],
      [
        -104.85,
        21.468
      ],
      [
        -104.94,
        21.468
      ],
      [
        -104.94,
        21.538
      ]
    ]
  },
  {
    "cve_geo": "18020",
    "cve_ent": "18",
    "cve_mun": "020",
    "name": "Bahía de Banderas",
    "headquarters": "Valle de Banderas",
    "center": [
      -105.253,
      20.798
    ],
    "population": 187632,
    "localityCount": 20,
    "polygon": [
      [
        -105.298,
        20.833
      ],
      [
        -105.208,
        20.833
      ],
      [
        -105.208,
        20.763
      ],
      [
        -105.298,
        20.763
      ],
      [
        -105.298,
        20.833
      ]
    ]
  },
  {
    "cve_geo": "19039",
    "cve_ent": "19",
    "cve_mun": "039",
    "name": "Monterrey",
    "headquarters": "Monterrey",
    "center": [
      -100.3161,
      25.6866
    ],
    "population": 1142994,
    "localityCount": 39,
    "polygon": [
      [
        -100.3611,
        25.7216
      ],
      [
        -100.2711,
        25.7216
      ],
      [
        -100.2711,
        25.6516
      ],
      [
        -100.3611,
        25.6516
      ],
      [
        -100.3611,
        25.7216
      ]
    ]
  },
  {
    "cve_geo": "19019",
    "cve_ent": "19",
    "cve_mun": "019",
    "name": "San Pedro Garza García",
    "headquarters": "San Pedro",
    "center": [
      -100.404,
      25.665
    ],
    "population": 132169,
    "localityCount": 16,
    "polygon": [
      [
        -100.449,
        25.7
      ],
      [
        -100.359,
        25.7
      ],
      [
        -100.359,
        25.63
      ],
      [
        -100.449,
        25.63
      ],
      [
        -100.449,
        25.7
      ]
    ]
  },
  {
    "cve_geo": "19026",
    "cve_ent": "19",
    "cve_mun": "026",
    "name": "Guadalupe",
    "headquarters": "Guadalupe",
    "center": [
      -100.256,
      25.677
    ],
    "population": 643143,
    "localityCount": 27,
    "polygon": [
      [
        -100.301,
        25.712
      ],
      [
        -100.211,
        25.712
      ],
      [
        -100.211,
        25.642
      ],
      [
        -100.301,
        25.642
      ],
      [
        -100.301,
        25.712
      ]
    ]
  },
  {
    "cve_geo": "19046",
    "cve_ent": "19",
    "cve_mun": "046",
    "name": "San Nicolás de los Garza",
    "headquarters": "San Nicolás",
    "center": [
      -100.286,
      25.748
    ],
    "population": 412190,
    "localityCount": 23,
    "polygon": [
      [
        -100.331,
        25.783
      ],
      [
        -100.241,
        25.783
      ],
      [
        -100.241,
        25.713
      ],
      [
        -100.331,
        25.713
      ],
      [
        -100.331,
        25.783
      ]
    ]
  },
  {
    "cve_geo": "19006",
    "cve_ent": "19",
    "cve_mun": "006",
    "name": "Apodaca",
    "headquarters": "Apodaca",
    "center": [
      -100.188,
      25.781
    ],
    "population": 656464,
    "localityCount": 28,
    "polygon": [
      [
        -100.233,
        25.816
      ],
      [
        -100.143,
        25.816
      ],
      [
        -100.143,
        25.746
      ],
      [
        -100.233,
        25.746
      ],
      [
        -100.233,
        25.816
      ]
    ]
  },
  {
    "cve_geo": "20067",
    "cve_ent": "20",
    "cve_mun": "067",
    "name": "Oaxaca de Juárez",
    "headquarters": "Oaxaca de Juárez",
    "center": [
      -96.726,
      17.065
    ],
    "population": 270955,
    "localityCount": 25,
    "polygon": [
      [
        -96.771,
        17.1
      ],
      [
        -96.681,
        17.1
      ],
      [
        -96.681,
        17.03
      ],
      [
        -96.771,
        17.03
      ],
      [
        -96.771,
        17.1
      ]
    ]
  },
  {
    "cve_geo": "20184",
    "cve_ent": "20",
    "cve_mun": "184",
    "name": "San Juan Bautista Tuxtepec",
    "headquarters": "Tuxtepec",
    "center": [
      -96.126,
      18.088
    ],
    "population": 159452,
    "localityCount": 21,
    "polygon": [
      [
        -96.171,
        18.123
      ],
      [
        -96.081,
        18.123
      ],
      [
        -96.081,
        18.053
      ],
      [
        -96.171,
        18.053
      ],
      [
        -96.171,
        18.123
      ]
    ]
  },
  {
    "cve_geo": "20079",
    "cve_ent": "20",
    "cve_mun": "079",
    "name": "Salina Cruz",
    "headquarters": "Salina Cruz",
    "center": [
      -95.197,
      16.183
    ],
    "population": 84438,
    "localityCount": 14,
    "polygon": [
      [
        -95.242,
        16.218
      ],
      [
        -95.152,
        16.218
      ],
      [
        -95.152,
        16.148
      ],
      [
        -95.242,
        16.148
      ],
      [
        -95.242,
        16.218
      ]
    ]
  },
  {
    "cve_geo": "21114",
    "cve_ent": "21",
    "cve_mun": "114",
    "name": "Puebla",
    "headquarters": "Heroica Puebla de Zaragoza",
    "center": [
      -98.2062,
      19.0438
    ],
    "population": 1692181,
    "localityCount": 135,
    "polygon": [
      [
        -98.2512,
        19.0788
      ],
      [
        -98.1612,
        19.0788
      ],
      [
        -98.1612,
        19.0088
      ],
      [
        -98.2512,
        19.0088
      ],
      [
        -98.2512,
        19.0788
      ]
    ]
  },
  {
    "cve_geo": "21140",
    "cve_ent": "21",
    "cve_mun": "140",
    "name": "San Pedro Cholula",
    "headquarters": "Cholula de Rivadavia",
    "center": [
      -98.306,
      19.063
    ],
    "population": 138433,
    "localityCount": 28,
    "polygon": [
      [
        -98.351,
        19.098
      ],
      [
        -98.261,
        19.098
      ],
      [
        -98.261,
        19.028
      ],
      [
        -98.351,
        19.028
      ],
      [
        -98.351,
        19.098
      ]
    ]
  },
  {
    "cve_geo": "21119",
    "cve_ent": "21",
    "cve_mun": "119",
    "name": "San Andrés Cholula",
    "headquarters": "San Andrés Cholula",
    "center": [
      -98.298,
      19.028
    ],
    "population": 154448,
    "localityCount": 22,
    "polygon": [
      [
        -98.343,
        19.063
      ],
      [
        -98.253,
        19.063
      ],
      [
        -98.253,
        18.993
      ],
      [
        -98.343,
        18.993
      ],
      [
        -98.343,
        19.063
      ]
    ]
  },
  {
    "cve_geo": "21019",
    "cve_ent": "21",
    "cve_mun": "019",
    "name": "Atlixco",
    "headquarters": "Atlixco",
    "center": [
      -98.431,
      18.908
    ],
    "population": 141793,
    "localityCount": 104,
    "polygon": [
      [
        -98.476,
        18.943
      ],
      [
        -98.386,
        18.943
      ],
      [
        -98.386,
        18.873
      ],
      [
        -98.476,
        18.873
      ],
      [
        -98.476,
        18.943
      ]
    ]
  },
  {
    "cve_geo": "21156",
    "cve_ent": "21",
    "cve_mun": "156",
    "name": "Tehuacán",
    "headquarters": "Tehuacán",
    "center": [
      -97.393,
      18.462
    ],
    "population": 327312,
    "localityCount": 95,
    "polygon": [
      [
        -97.438,
        18.497
      ],
      [
        -97.348,
        18.497
      ],
      [
        -97.348,
        18.427
      ],
      [
        -97.438,
        18.427
      ],
      [
        -97.438,
        18.497
      ]
    ]
  },
  {
    "cve_geo": "22014",
    "cve_ent": "22",
    "cve_mun": "014",
    "name": "Querétaro",
    "headquarters": "Santiago de Querétaro",
    "center": [
      -100.3899,
      20.5888
    ],
    "population": 1049777,
    "localityCount": 48,
    "polygon": [
      [
        -100.4349,
        20.6238
      ],
      [
        -100.3449,
        20.6238
      ],
      [
        -100.3449,
        20.5538
      ],
      [
        -100.4349,
        20.5538
      ],
      [
        -100.4349,
        20.6238
      ]
    ]
  },
  {
    "cve_geo": "22016",
    "cve_ent": "22",
    "cve_mun": "016",
    "name": "San Juan del Río",
    "headquarters": "San Juan del Río",
    "center": [
      -100,
      20.388
    ],
    "population": 297823,
    "localityCount": 26,
    "polygon": [
      [
        -100.045,
        20.423
      ],
      [
        -99.955,
        20.423
      ],
      [
        -99.955,
        20.353
      ],
      [
        -100.045,
        20.353
      ],
      [
        -100.045,
        20.423
      ]
    ]
  },
  {
    "cve_geo": "22006",
    "cve_ent": "22",
    "cve_mun": "006",
    "name": "Corregidora",
    "headquarters": "El Pueblito",
    "center": [
      -100.44,
      20.53
    ],
    "population": 212567,
    "localityCount": 21,
    "polygon": [
      [
        -100.485,
        20.565
      ],
      [
        -100.395,
        20.565
      ],
      [
        -100.395,
        20.495
      ],
      [
        -100.485,
        20.495
      ],
      [
        -100.485,
        20.565
      ]
    ]
  },
  {
    "cve_geo": "22011",
    "cve_ent": "22",
    "cve_mun": "011",
    "name": "El Marqués",
    "headquarters": "La Cañada",
    "center": [
      -100.32,
      20.62
    ],
    "population": 231668,
    "localityCount": 24,
    "polygon": [
      [
        -100.365,
        20.655
      ],
      [
        -100.275,
        20.655
      ],
      [
        -100.275,
        20.585
      ],
      [
        -100.365,
        20.585
      ],
      [
        -100.365,
        20.655
      ]
    ]
  },
  {
    "cve_geo": "23004",
    "cve_ent": "23",
    "cve_mun": "004",
    "name": "Othón P. Blanco",
    "headquarters": "Chetumal",
    "center": [
      -88.296,
      18.503
    ],
    "population": 233648,
    "localityCount": 22,
    "polygon": [
      [
        -88.341,
        18.538
      ],
      [
        -88.251,
        18.538
      ],
      [
        -88.251,
        18.468
      ],
      [
        -88.341,
        18.468
      ],
      [
        -88.341,
        18.538
      ]
    ]
  },
  {
    "cve_geo": "23005",
    "cve_ent": "23",
    "cve_mun": "005",
    "name": "Benito Juárez",
    "headquarters": "Cancún",
    "center": [
      -86.851,
      21.161
    ],
    "population": 911503,
    "localityCount": 36,
    "polygon": [
      [
        -86.896,
        21.196
      ],
      [
        -86.806,
        21.196
      ],
      [
        -86.806,
        21.126
      ],
      [
        -86.896,
        21.126
      ],
      [
        -86.896,
        21.196
      ]
    ]
  },
  {
    "cve_geo": "23008",
    "cve_ent": "23",
    "cve_mun": "008",
    "name": "Solidaridad",
    "headquarters": "Playa del Carmen",
    "center": [
      -87.073,
      20.627
    ],
    "population": 333800,
    "localityCount": 25,
    "polygon": [
      [
        -87.118,
        20.662
      ],
      [
        -87.028,
        20.662
      ],
      [
        -87.028,
        20.592
      ],
      [
        -87.118,
        20.592
      ],
      [
        -87.118,
        20.662
      ]
    ]
  },
  {
    "cve_geo": "24028",
    "cve_ent": "24",
    "cve_mun": "028",
    "name": "San Luis Potosí",
    "headquarters": "San Luis Potosí",
    "center": [
      -100.978,
      22.156
    ],
    "population": 911908,
    "localityCount": 38,
    "polygon": [
      [
        -101.023,
        22.191
      ],
      [
        -100.933,
        22.191
      ],
      [
        -100.933,
        22.121
      ],
      [
        -101.023,
        22.121
      ],
      [
        -101.023,
        22.191
      ]
    ]
  },
  {
    "cve_geo": "24035",
    "cve_ent": "24",
    "cve_mun": "035",
    "name": "Soledad de Graciano Sánchez",
    "headquarters": "Soledad",
    "center": [
      -100.94,
      22.183
    ],
    "population": 332072,
    "localityCount": 24,
    "polygon": [
      [
        -100.985,
        22.218
      ],
      [
        -100.895,
        22.218
      ],
      [
        -100.895,
        22.148
      ],
      [
        -100.985,
        22.148
      ],
      [
        -100.985,
        22.218
      ]
    ]
  },
  {
    "cve_geo": "24013",
    "cve_ent": "24",
    "cve_mun": "013",
    "name": "Ciudad Valles",
    "headquarters": "Ciudad Valles",
    "center": [
      -99.014,
      21.988
    ],
    "population": 179392,
    "localityCount": 21,
    "polygon": [
      [
        -99.059,
        22.023
      ],
      [
        -98.969,
        22.023
      ],
      [
        -98.969,
        21.953
      ],
      [
        -99.059,
        21.953
      ],
      [
        -99.059,
        22.023
      ]
    ]
  },
  {
    "cve_geo": "25006",
    "cve_ent": "25",
    "cve_mun": "006",
    "name": "Culiacán",
    "headquarters": "Culiacán Rosales",
    "center": [
      -107.394,
      24.808
    ],
    "population": 1003530,
    "localityCount": 42,
    "polygon": [
      [
        -107.439,
        24.843
      ],
      [
        -107.349,
        24.843
      ],
      [
        -107.349,
        24.773
      ],
      [
        -107.439,
        24.773
      ],
      [
        -107.439,
        24.843
      ]
    ]
  },
  {
    "cve_geo": "25012",
    "cve_ent": "25",
    "cve_mun": "012",
    "name": "Mazatlán",
    "headquarters": "Mazatlán",
    "center": [
      -106.424,
      23.232
    ],
    "population": 501440,
    "localityCount": 29,
    "polygon": [
      [
        -106.469,
        23.267
      ],
      [
        -106.379,
        23.267
      ],
      [
        -106.379,
        23.197
      ],
      [
        -106.469,
        23.197
      ],
      [
        -106.469,
        23.267
      ]
    ]
  },
  {
    "cve_geo": "25001",
    "cve_ent": "25",
    "cve_mun": "001",
    "name": "Ahome",
    "headquarters": "Los Mochis",
    "center": [
      -108.995,
      25.793
    ],
    "population": 459310,
    "localityCount": 26,
    "polygon": [
      [
        -109.04,
        25.828
      ],
      [
        -108.95,
        25.828
      ],
      [
        -108.95,
        25.758
      ],
      [
        -109.04,
        25.758
      ],
      [
        -109.04,
        25.828
      ]
    ]
  },
  {
    "cve_geo": "26030",
    "cve_ent": "26",
    "cve_mun": "030",
    "name": "Hermosillo",
    "headquarters": "Hermosillo",
    "center": [
      -110.955,
      29.072
    ],
    "population": 936263,
    "localityCount": 39,
    "polygon": [
      [
        -111,
        29.107
      ],
      [
        -110.91,
        29.107
      ],
      [
        -110.91,
        29.037
      ],
      [
        -111,
        29.037
      ],
      [
        -111,
        29.107
      ]
    ]
  },
  {
    "cve_geo": "26018",
    "cve_ent": "26",
    "cve_mun": "018",
    "name": "Cajeme",
    "headquarters": "Ciudad Obregón",
    "center": [
      -109.93,
      27.486
    ],
    "population": 436484,
    "localityCount": 28,
    "polygon": [
      [
        -109.975,
        27.521
      ],
      [
        -109.885,
        27.521
      ],
      [
        -109.885,
        27.451
      ],
      [
        -109.975,
        27.451
      ],
      [
        -109.975,
        27.521
      ]
    ]
  },
  {
    "cve_geo": "26043",
    "cve_ent": "26",
    "cve_mun": "043",
    "name": "Nogales",
    "headquarters": "Heroica Nogales",
    "center": [
      -110.942,
      31.308
    ],
    "population": 264782,
    "localityCount": 19,
    "polygon": [
      [
        -110.987,
        31.343
      ],
      [
        -110.897,
        31.343
      ],
      [
        -110.897,
        31.273
      ],
      [
        -110.987,
        31.273
      ],
      [
        -110.987,
        31.343
      ]
    ]
  },
  {
    "cve_geo": "27004",
    "cve_ent": "27",
    "cve_mun": "004",
    "name": "Centro",
    "headquarters": "Villahermosa",
    "center": [
      -92.93,
      17.989
    ],
    "population": 683607,
    "localityCount": 34,
    "polygon": [
      [
        -92.975,
        18.024
      ],
      [
        -92.885,
        18.024
      ],
      [
        -92.885,
        17.954
      ],
      [
        -92.975,
        17.954
      ],
      [
        -92.975,
        18.024
      ]
    ]
  },
  {
    "cve_geo": "27002",
    "cve_ent": "27",
    "cve_mun": "002",
    "name": "Cárdenas",
    "headquarters": "Heroica Cárdenas",
    "center": [
      -93.376,
      18.002
    ],
    "population": 243229,
    "localityCount": 23,
    "polygon": [
      [
        -93.421,
        18.037
      ],
      [
        -93.331,
        18.037
      ],
      [
        -93.331,
        17.967
      ],
      [
        -93.421,
        17.967
      ],
      [
        -93.421,
        18.037
      ]
    ]
  },
  {
    "cve_geo": "27008",
    "cve_ent": "27",
    "cve_mun": "008",
    "name": "Comalcalco",
    "headquarters": "Comalcalco",
    "center": [
      -93.28,
      18.26
    ],
    "population": 214877,
    "localityCount": 20,
    "polygon": [
      [
        -93.325,
        18.295
      ],
      [
        -93.235,
        18.295
      ],
      [
        -93.235,
        18.225
      ],
      [
        -93.325,
        18.225
      ],
      [
        -93.325,
        18.295
      ]
    ]
  },
  {
    "cve_geo": "28041",
    "cve_ent": "28",
    "cve_mun": "041",
    "name": "Victoria",
    "headquarters": "Ciudad Victoria",
    "center": [
      -99.141,
      23.736
    ],
    "population": 349688,
    "localityCount": 25,
    "polygon": [
      [
        -99.186,
        23.771
      ],
      [
        -99.096,
        23.771
      ],
      [
        -99.096,
        23.701
      ],
      [
        -99.186,
        23.701
      ],
      [
        -99.186,
        23.771
      ]
    ]
  },
  {
    "cve_geo": "28032",
    "cve_ent": "28",
    "cve_mun": "032",
    "name": "Reynosa",
    "headquarters": "Reynosa",
    "center": [
      -98.278,
      26.08
    ],
    "population": 704767,
    "localityCount": 37,
    "polygon": [
      [
        -98.323,
        26.115
      ],
      [
        -98.233,
        26.115
      ],
      [
        -98.233,
        26.045
      ],
      [
        -98.323,
        26.045
      ],
      [
        -98.323,
        26.115
      ]
    ]
  },
  {
    "cve_geo": "28022",
    "cve_ent": "28",
    "cve_mun": "022",
    "name": "Matamoros",
    "headquarters": "Heroica Matamoros",
    "center": [
      -97.502,
      25.869
    ],
    "population": 541979,
    "localityCount": 31,
    "polygon": [
      [
        -97.547,
        25.904
      ],
      [
        -97.457,
        25.904
      ],
      [
        -97.457,
        25.834
      ],
      [
        -97.547,
        25.834
      ],
      [
        -97.547,
        25.904
      ]
    ]
  },
  {
    "cve_geo": "28038",
    "cve_ent": "28",
    "cve_mun": "038",
    "name": "Tampico",
    "headquarters": "Tampico",
    "center": [
      -97.861,
      22.256
    ],
    "population": 297562,
    "localityCount": 22,
    "polygon": [
      [
        -97.906,
        22.291
      ],
      [
        -97.816,
        22.291
      ],
      [
        -97.816,
        22.221
      ],
      [
        -97.906,
        22.221
      ],
      [
        -97.906,
        22.291
      ]
    ]
  },
  {
    "cve_geo": "29033",
    "cve_ent": "29",
    "cve_mun": "033",
    "name": "Tlaxcala",
    "headquarters": "Tlaxcala de Xicohténcatl",
    "center": [
      -98.237,
      19.318
    ],
    "population": 99896,
    "localityCount": 18,
    "polygon": [
      [
        -98.282,
        19.353
      ],
      [
        -98.192,
        19.353
      ],
      [
        -98.192,
        19.283
      ],
      [
        -98.282,
        19.283
      ],
      [
        -98.282,
        19.353
      ]
    ]
  },
  {
    "cve_geo": "29005",
    "cve_ent": "29",
    "cve_mun": "005",
    "name": "Apizaco",
    "headquarters": "Apizaco",
    "center": [
      -98.143,
      19.416
    ],
    "population": 80725,
    "localityCount": 15,
    "polygon": [
      [
        -98.188,
        19.451
      ],
      [
        -98.098,
        19.451
      ],
      [
        -98.098,
        19.381
      ],
      [
        -98.188,
        19.381
      ],
      [
        -98.188,
        19.451
      ]
    ]
  },
  {
    "cve_geo": "29013",
    "cve_ent": "29",
    "cve_mun": "013",
    "name": "Huamantla",
    "headquarters": "Huamantla",
    "center": [
      -97.923,
      19.314
    ],
    "population": 98764,
    "localityCount": 16,
    "polygon": [
      [
        -97.968,
        19.349
      ],
      [
        -97.878,
        19.349
      ],
      [
        -97.878,
        19.279
      ],
      [
        -97.968,
        19.279
      ],
      [
        -97.968,
        19.349
      ]
    ]
  },
  {
    "cve_geo": "30087",
    "cve_ent": "30",
    "cve_mun": "087",
    "name": "Xalapa",
    "headquarters": "Xalapa-Enríquez",
    "center": [
      -96.915,
      19.539
    ],
    "population": 488531,
    "localityCount": 32,
    "polygon": [
      [
        -96.96,
        19.574
      ],
      [
        -96.87,
        19.574
      ],
      [
        -96.87,
        19.504
      ],
      [
        -96.96,
        19.504
      ],
      [
        -96.96,
        19.574
      ]
    ]
  },
  {
    "cve_geo": "30193",
    "cve_ent": "30",
    "cve_mun": "193",
    "name": "Veracruz",
    "headquarters": "Veracruz",
    "center": [
      -96.134,
      19.173
    ],
    "population": 607209,
    "localityCount": 38,
    "polygon": [
      [
        -96.179,
        19.208
      ],
      [
        -96.089,
        19.208
      ],
      [
        -96.089,
        19.138
      ],
      [
        -96.179,
        19.138
      ],
      [
        -96.179,
        19.208
      ]
    ]
  },
  {
    "cve_geo": "30039",
    "cve_ent": "30",
    "cve_mun": "039",
    "name": "Coatzacoalcos",
    "headquarters": "Coatzacoalcos",
    "center": [
      -94.447,
      18.14
    ],
    "population": 310698,
    "localityCount": 24,
    "polygon": [
      [
        -94.492,
        18.175
      ],
      [
        -94.402,
        18.175
      ],
      [
        -94.402,
        18.105
      ],
      [
        -94.492,
        18.105
      ],
      [
        -94.492,
        18.175
      ]
    ]
  },
  {
    "cve_geo": "30044",
    "cve_ent": "30",
    "cve_mun": "044",
    "name": "Córdoba",
    "headquarters": "Córdoba",
    "center": [
      -96.936,
      18.894
    ],
    "population": 204337,
    "localityCount": 20,
    "polygon": [
      [
        -96.981,
        18.929
      ],
      [
        -96.891,
        18.929
      ],
      [
        -96.891,
        18.859
      ],
      [
        -96.981,
        18.859
      ],
      [
        -96.981,
        18.929
      ]
    ]
  },
  {
    "cve_geo": "31050",
    "cve_ent": "31",
    "cve_mun": "050",
    "name": "Mérida",
    "headquarters": "Mérida",
    "center": [
      -89.592,
      20.709
    ],
    "population": 995129,
    "localityCount": 46,
    "polygon": [
      [
        -89.637,
        20.744
      ],
      [
        -89.547,
        20.744
      ],
      [
        -89.547,
        20.674
      ],
      [
        -89.637,
        20.674
      ],
      [
        -89.637,
        20.744
      ]
    ]
  },
  {
    "cve_geo": "31102",
    "cve_ent": "31",
    "cve_mun": "102",
    "name": "Valladolid",
    "headquarters": "Valladolid",
    "center": [
      -88.202,
      20.689
    ],
    "population": 85460,
    "localityCount": 18,
    "polygon": [
      [
        -88.247,
        20.724
      ],
      [
        -88.157,
        20.724
      ],
      [
        -88.157,
        20.654
      ],
      [
        -88.247,
        20.654
      ],
      [
        -88.247,
        20.724
      ]
    ]
  },
  {
    "cve_geo": "31059",
    "cve_ent": "31",
    "cve_mun": "059",
    "name": "Progreso",
    "headquarters": "Progreso",
    "center": [
      -89.664,
      21.283
    ],
    "population": 66008,
    "localityCount": 14,
    "polygon": [
      [
        -89.709,
        21.318
      ],
      [
        -89.619,
        21.318
      ],
      [
        -89.619,
        21.248
      ],
      [
        -89.709,
        21.248
      ],
      [
        -89.709,
        21.318
      ]
    ]
  },
  {
    "cve_geo": "32056",
    "cve_ent": "32",
    "cve_mun": "056",
    "name": "Zacatecas",
    "headquarters": "Zacatecas",
    "center": [
      -102.583,
      22.77
    ],
    "population": 149607,
    "localityCount": 21,
    "polygon": [
      [
        -102.628,
        22.805
      ],
      [
        -102.538,
        22.805
      ],
      [
        -102.538,
        22.735
      ],
      [
        -102.628,
        22.735
      ],
      [
        -102.628,
        22.805
      ]
    ]
  },
  {
    "cve_geo": "32017",
    "cve_ent": "32",
    "cve_mun": "017",
    "name": "Guadalupe",
    "headquarters": "Guadalupe",
    "center": [
      -102.512,
      22.751
    ],
    "population": 211740,
    "localityCount": 23,
    "polygon": [
      [
        -102.557,
        22.786
      ],
      [
        -102.467,
        22.786
      ],
      [
        -102.467,
        22.716
      ],
      [
        -102.557,
        22.716
      ],
      [
        -102.557,
        22.786
      ]
    ]
  },
  {
    "cve_geo": "32010",
    "cve_ent": "32",
    "cve_mun": "010",
    "name": "Fresnillo",
    "headquarters": "Fresnillo",
    "center": [
      -102.869,
      23.177
    ],
    "population": 240532,
    "localityCount": 25,
    "polygon": [
      [
        -102.914,
        23.212
      ],
      [
        -102.824,
        23.212
      ],
      [
        -102.824,
        23.142
      ],
      [
        -102.914,
        23.142
      ],
      [
        -102.914,
        23.212
      ]
    ]
  }
];

// 3. Catálogo de Localidades Urbanas y Rurales de México (INEGI cve_geo 9 dígitos)
export const MEXICAN_LOCALITIES: MexicanLocality[] = [
  {
    "cve_geo": "010010001",
    "cve_ent": "01",
    "cve_mun": "001",
    "cve_loc": "0001",
    "name": "Aguascalientes (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.296,
      21.881
    ],
    "population": 616844
  },
  {
    "cve_geo": "010010002",
    "cve_ent": "01",
    "cve_mun": "001",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Aguascalientes",
    "type": "URBANA",
    "center": [
      -102.276,
      21.901
    ],
    "population": 237248
  },
  {
    "cve_geo": "010010003",
    "cve_ent": "01",
    "cve_mun": "001",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Aguascalientes",
    "type": "RURAL",
    "center": [
      -102.326,
      21.856
    ],
    "population": 94899
  },
  {
    "cve_geo": "010050001",
    "cve_ent": "01",
    "cve_mun": "005",
    "cve_loc": "0001",
    "name": "Jesús María (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.344,
      21.961
    ],
    "population": 84620
  },
  {
    "cve_geo": "010050002",
    "cve_ent": "01",
    "cve_mun": "005",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Jesús María",
    "type": "URBANA",
    "center": [
      -102.324,
      21.981
    ],
    "population": 32546
  },
  {
    "cve_geo": "010050003",
    "cve_ent": "01",
    "cve_mun": "005",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Jesús María",
    "type": "RURAL",
    "center": [
      -102.374,
      21.936
    ],
    "population": 13018
  },
  {
    "cve_geo": "010030001",
    "cve_ent": "01",
    "cve_mun": "003",
    "cve_loc": "0001",
    "name": "Calvillo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.719,
      21.847
    ],
    "population": 37863
  },
  {
    "cve_geo": "010030002",
    "cve_ent": "01",
    "cve_mun": "003",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Calvillo",
    "type": "URBANA",
    "center": [
      -102.699,
      21.867
    ],
    "population": 14563
  },
  {
    "cve_geo": "010030003",
    "cve_ent": "01",
    "cve_mun": "003",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Calvillo",
    "type": "RURAL",
    "center": [
      -102.749,
      21.822
    ],
    "population": 5825
  },
  {
    "cve_geo": "020020001",
    "cve_ent": "02",
    "cve_mun": "002",
    "cve_loc": "0001",
    "name": "Mexicali (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -115.468,
      32.651
    ],
    "population": 682365
  },
  {
    "cve_geo": "020020002",
    "cve_ent": "02",
    "cve_mun": "002",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Mexicali",
    "type": "URBANA",
    "center": [
      -115.448,
      32.671
    ],
    "population": 262448
  },
  {
    "cve_geo": "020020003",
    "cve_ent": "02",
    "cve_mun": "002",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Mexicali",
    "type": "RURAL",
    "center": [
      -115.498,
      32.626
    ],
    "population": 104979
  },
  {
    "cve_geo": "020040001",
    "cve_ent": "02",
    "cve_mun": "004",
    "cve_loc": "0001",
    "name": "Tijuana (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -117.038,
      32.514
    ],
    "population": 1249640
  },
  {
    "cve_geo": "020040002",
    "cve_ent": "02",
    "cve_mun": "004",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tijuana",
    "type": "URBANA",
    "center": [
      -117.018,
      32.534
    ],
    "population": 480631
  },
  {
    "cve_geo": "020040003",
    "cve_ent": "02",
    "cve_mun": "004",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tijuana",
    "type": "RURAL",
    "center": [
      -117.068,
      32.489
    ],
    "population": 192252
  },
  {
    "cve_geo": "020010001",
    "cve_ent": "02",
    "cve_mun": "001",
    "cve_loc": "0001",
    "name": "Ensenada (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -116.603,
      31.866
    ],
    "population": 288475
  },
  {
    "cve_geo": "020010002",
    "cve_ent": "02",
    "cve_mun": "001",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Ensenada",
    "type": "URBANA",
    "center": [
      -116.583,
      31.886
    ],
    "population": 110952
  },
  {
    "cve_geo": "020010003",
    "cve_ent": "02",
    "cve_mun": "001",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Ensenada",
    "type": "RURAL",
    "center": [
      -116.633,
      31.841
    ],
    "population": 44381
  },
  {
    "cve_geo": "030030001",
    "cve_ent": "03",
    "cve_mun": "003",
    "cve_loc": "0001",
    "name": "La Paz (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -110.312,
      24.142
    ],
    "population": 189957
  },
  {
    "cve_geo": "030030002",
    "cve_ent": "03",
    "cve_mun": "003",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana La Paz",
    "type": "URBANA",
    "center": [
      -110.292,
      24.162
    ],
    "population": 73060
  },
  {
    "cve_geo": "030030003",
    "cve_ent": "03",
    "cve_mun": "003",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural La Paz",
    "type": "RURAL",
    "center": [
      -110.342,
      24.117
    ],
    "population": 29224
  },
  {
    "cve_geo": "030080001",
    "cve_ent": "03",
    "cve_mun": "008",
    "cve_loc": "0001",
    "name": "Los Cabos (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -109.697,
      23.062
    ],
    "population": 228222
  },
  {
    "cve_geo": "030080002",
    "cve_ent": "03",
    "cve_mun": "008",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Los Cabos",
    "type": "URBANA",
    "center": [
      -109.677,
      23.082
    ],
    "population": 87778
  },
  {
    "cve_geo": "030080003",
    "cve_ent": "03",
    "cve_mun": "008",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Los Cabos",
    "type": "RURAL",
    "center": [
      -109.727,
      23.037
    ],
    "population": 35111
  },
  {
    "cve_geo": "040020001",
    "cve_ent": "04",
    "cve_mun": "002",
    "cve_loc": "0001",
    "name": "Campeche (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -90.534,
      19.83
    ],
    "population": 191150
  },
  {
    "cve_geo": "040020002",
    "cve_ent": "04",
    "cve_mun": "002",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Campeche",
    "type": "URBANA",
    "center": [
      -90.514,
      19.85
    ],
    "population": 73519
  },
  {
    "cve_geo": "040020003",
    "cve_ent": "04",
    "cve_mun": "002",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Campeche",
    "type": "RURAL",
    "center": [
      -90.564,
      19.805
    ],
    "population": 29408
  },
  {
    "cve_geo": "040030001",
    "cve_ent": "04",
    "cve_mun": "003",
    "cve_loc": "0001",
    "name": "Carmen (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -91.817,
      18.643
    ],
    "population": 161749
  },
  {
    "cve_geo": "040030002",
    "cve_ent": "04",
    "cve_mun": "003",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Carmen",
    "type": "URBANA",
    "center": [
      -91.797,
      18.663
    ],
    "population": 62211
  },
  {
    "cve_geo": "040030003",
    "cve_ent": "04",
    "cve_mun": "003",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Carmen",
    "type": "RURAL",
    "center": [
      -91.847,
      18.618
    ],
    "population": 24885
  },
  {
    "cve_geo": "050300001",
    "cve_ent": "05",
    "cve_mun": "030",
    "cve_loc": "0001",
    "name": "Saltillo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.999,
      25.423
    ],
    "population": 571973
  },
  {
    "cve_geo": "050300002",
    "cve_ent": "05",
    "cve_mun": "030",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Saltillo",
    "type": "URBANA",
    "center": [
      -100.979,
      25.443
    ],
    "population": 219990
  },
  {
    "cve_geo": "050300003",
    "cve_ent": "05",
    "cve_mun": "030",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Saltillo",
    "type": "RURAL",
    "center": [
      -101.029,
      25.398
    ],
    "population": 87996
  },
  {
    "cve_geo": "050350001",
    "cve_ent": "05",
    "cve_mun": "035",
    "cve_loc": "0001",
    "name": "Torreón (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.433,
      25.542
    ],
    "population": 468551
  },
  {
    "cve_geo": "050350002",
    "cve_ent": "05",
    "cve_mun": "035",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Torreón",
    "type": "URBANA",
    "center": [
      -103.413,
      25.562
    ],
    "population": 180212
  },
  {
    "cve_geo": "050350003",
    "cve_ent": "05",
    "cve_mun": "035",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Torreón",
    "type": "RURAL",
    "center": [
      -103.463,
      25.517
    ],
    "population": 72085
  },
  {
    "cve_geo": "050180001",
    "cve_ent": "05",
    "cve_mun": "018",
    "cve_loc": "0001",
    "name": "Monclova (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -101.42,
      26.906
    ],
    "population": 154668
  },
  {
    "cve_geo": "050180002",
    "cve_ent": "05",
    "cve_mun": "018",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Monclova",
    "type": "URBANA",
    "center": [
      -101.4,
      26.926
    ],
    "population": 59488
  },
  {
    "cve_geo": "050180003",
    "cve_ent": "05",
    "cve_mun": "018",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Monclova",
    "type": "RURAL",
    "center": [
      -101.45,
      26.881
    ],
    "population": 23795
  },
  {
    "cve_geo": "060020001",
    "cve_ent": "06",
    "cve_mun": "002",
    "cve_loc": "0001",
    "name": "Colima (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.724,
      19.243
    ],
    "population": 102081
  },
  {
    "cve_geo": "060020002",
    "cve_ent": "06",
    "cve_mun": "002",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Colima",
    "type": "URBANA",
    "center": [
      -103.704,
      19.263
    ],
    "population": 39262
  },
  {
    "cve_geo": "060020003",
    "cve_ent": "06",
    "cve_mun": "002",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Colima",
    "type": "RURAL",
    "center": [
      -103.754,
      19.218
    ],
    "population": 15705
  },
  {
    "cve_geo": "060070001",
    "cve_ent": "06",
    "cve_mun": "007",
    "cve_loc": "0001",
    "name": "Manzanillo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -104.316,
      19.052
    ],
    "population": 124170
  },
  {
    "cve_geo": "060070002",
    "cve_ent": "06",
    "cve_mun": "007",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Manzanillo",
    "type": "URBANA",
    "center": [
      -104.296,
      19.072
    ],
    "population": 47758
  },
  {
    "cve_geo": "060070003",
    "cve_ent": "06",
    "cve_mun": "007",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Manzanillo",
    "type": "RURAL",
    "center": [
      -104.346,
      19.027
    ],
    "population": 19103
  },
  {
    "cve_geo": "060100001",
    "cve_ent": "06",
    "cve_mun": "010",
    "cve_loc": "0001",
    "name": "Villa de Álvarez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.74,
      19.266
    ],
    "population": 97345
  },
  {
    "cve_geo": "060100002",
    "cve_ent": "06",
    "cve_mun": "010",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Villa de Álvarez",
    "type": "URBANA",
    "center": [
      -103.72,
      19.286
    ],
    "population": 37441
  },
  {
    "cve_geo": "060100003",
    "cve_ent": "06",
    "cve_mun": "010",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Villa de Álvarez",
    "type": "RURAL",
    "center": [
      -103.77,
      19.241
    ],
    "population": 14976
  },
  {
    "cve_geo": "071010001",
    "cve_ent": "07",
    "cve_mun": "101",
    "cve_loc": "0001",
    "name": "Tuxtla Gutiérrez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -93.116,
      16.753
    ],
    "population": 392696
  },
  {
    "cve_geo": "071010002",
    "cve_ent": "07",
    "cve_mun": "101",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tuxtla Gutiérrez",
    "type": "URBANA",
    "center": [
      -93.096,
      16.773
    ],
    "population": 151037
  },
  {
    "cve_geo": "071010003",
    "cve_ent": "07",
    "cve_mun": "101",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tuxtla Gutiérrez",
    "type": "RURAL",
    "center": [
      -93.146,
      16.728
    ],
    "population": 60415
  },
  {
    "cve_geo": "070780001",
    "cve_ent": "07",
    "cve_mun": "078",
    "cve_loc": "0001",
    "name": "San Cristóbal de las Casas (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -92.637,
      16.737
    ],
    "population": 140318
  },
  {
    "cve_geo": "070780002",
    "cve_ent": "07",
    "cve_mun": "078",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Cristóbal de las Casas",
    "type": "URBANA",
    "center": [
      -92.617,
      16.757
    ],
    "population": 53969
  },
  {
    "cve_geo": "070780003",
    "cve_ent": "07",
    "cve_mun": "078",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Cristóbal de las Casas",
    "type": "RURAL",
    "center": [
      -92.667,
      16.712
    ],
    "population": 21587
  },
  {
    "cve_geo": "070890001",
    "cve_ent": "07",
    "cve_mun": "089",
    "cve_loc": "0001",
    "name": "Tapachula (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -92.263,
      14.904
    ],
    "population": 229909
  },
  {
    "cve_geo": "070890002",
    "cve_ent": "07",
    "cve_mun": "089",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tapachula",
    "type": "URBANA",
    "center": [
      -92.243,
      14.924
    ],
    "population": 88427
  },
  {
    "cve_geo": "070890003",
    "cve_ent": "07",
    "cve_mun": "089",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tapachula",
    "type": "RURAL",
    "center": [
      -92.293,
      14.879
    ],
    "population": 35371
  },
  {
    "cve_geo": "080190001",
    "cve_ent": "08",
    "cve_mun": "019",
    "cve_loc": "0001",
    "name": "Chihuahua (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -106.069,
      28.635
    ],
    "population": 609488
  },
  {
    "cve_geo": "080190002",
    "cve_ent": "08",
    "cve_mun": "019",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Chihuahua",
    "type": "URBANA",
    "center": [
      -106.049,
      28.655
    ],
    "population": 234419
  },
  {
    "cve_geo": "080190003",
    "cve_ent": "08",
    "cve_mun": "019",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Chihuahua",
    "type": "RURAL",
    "center": [
      -106.099,
      28.61
    ],
    "population": 93767
  },
  {
    "cve_geo": "080370001",
    "cve_ent": "08",
    "cve_mun": "037",
    "cve_loc": "0001",
    "name": "Juárez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -106.485,
      31.739
    ],
    "population": 983093
  },
  {
    "cve_geo": "080370002",
    "cve_ent": "08",
    "cve_mun": "037",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Juárez",
    "type": "URBANA",
    "center": [
      -106.465,
      31.759
    ],
    "population": 378113
  },
  {
    "cve_geo": "080370003",
    "cve_ent": "08",
    "cve_mun": "037",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Juárez",
    "type": "RURAL",
    "center": [
      -106.515,
      31.714
    ],
    "population": 151245
  },
  {
    "cve_geo": "080210001",
    "cve_ent": "08",
    "cve_mun": "021",
    "cve_loc": "0001",
    "name": "Cuauhtémoc (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -106.865,
      28.406
    ],
    "population": 117415
  },
  {
    "cve_geo": "080210002",
    "cve_ent": "08",
    "cve_mun": "021",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Cuauhtémoc",
    "type": "URBANA",
    "center": [
      -106.845,
      28.426
    ],
    "population": 45160
  },
  {
    "cve_geo": "080210003",
    "cve_ent": "08",
    "cve_mun": "021",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Cuauhtémoc",
    "type": "RURAL",
    "center": [
      -106.895,
      28.381
    ],
    "population": 18064
  },
  {
    "cve_geo": "090150001",
    "cve_ent": "09",
    "cve_mun": "015",
    "cve_loc": "0001",
    "name": "Cuauhtémoc (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.155,
      19.432
    ],
    "population": 354825
  },
  {
    "cve_geo": "090150002",
    "cve_ent": "09",
    "cve_mun": "015",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Cuauhtémoc",
    "type": "URBANA",
    "center": [
      -99.135,
      19.452
    ],
    "population": 136471
  },
  {
    "cve_geo": "090150003",
    "cve_ent": "09",
    "cve_mun": "015",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Cuauhtémoc",
    "type": "RURAL",
    "center": [
      -99.185,
      19.407
    ],
    "population": 54588
  },
  {
    "cve_geo": "090160001",
    "cve_ent": "09",
    "cve_mun": "016",
    "cve_loc": "0001",
    "name": "Miguel Hidalgo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.192,
      19.435
    ],
    "population": 269406
  },
  {
    "cve_geo": "090160002",
    "cve_ent": "09",
    "cve_mun": "016",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Miguel Hidalgo",
    "type": "URBANA",
    "center": [
      -99.172,
      19.455
    ],
    "population": 103618
  },
  {
    "cve_geo": "090160003",
    "cve_ent": "09",
    "cve_mun": "016",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Miguel Hidalgo",
    "type": "RURAL",
    "center": [
      -99.222,
      19.41
    ],
    "population": 41447
  },
  {
    "cve_geo": "090140001",
    "cve_ent": "09",
    "cve_mun": "014",
    "cve_loc": "0001",
    "name": "Benito Juárez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.16,
      19.38
    ],
    "population": 282199
  },
  {
    "cve_geo": "090140002",
    "cve_ent": "09",
    "cve_mun": "014",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Benito Juárez",
    "type": "URBANA",
    "center": [
      -99.14,
      19.4
    ],
    "population": 108538
  },
  {
    "cve_geo": "090140003",
    "cve_ent": "09",
    "cve_mun": "014",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Benito Juárez",
    "type": "RURAL",
    "center": [
      -99.19,
      19.355
    ],
    "population": 43415
  },
  {
    "cve_geo": "090100001",
    "cve_ent": "09",
    "cve_mun": "010",
    "cve_loc": "0001",
    "name": "Álvaro Obregón (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.205,
      19.36
    ],
    "population": 493439
  },
  {
    "cve_geo": "090100002",
    "cve_ent": "09",
    "cve_mun": "010",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Álvaro Obregón",
    "type": "URBANA",
    "center": [
      -99.185,
      19.38
    ],
    "population": 189784
  },
  {
    "cve_geo": "090100003",
    "cve_ent": "09",
    "cve_mun": "010",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Álvaro Obregón",
    "type": "RURAL",
    "center": [
      -99.235,
      19.335
    ],
    "population": 75914
  },
  {
    "cve_geo": "090030001",
    "cve_ent": "09",
    "cve_mun": "003",
    "cve_loc": "0001",
    "name": "Coyoacán (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.162,
      19.349
    ],
    "population": 399391
  },
  {
    "cve_geo": "090030002",
    "cve_ent": "09",
    "cve_mun": "003",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Coyoacán",
    "type": "URBANA",
    "center": [
      -99.142,
      19.369
    ],
    "population": 153612
  },
  {
    "cve_geo": "090030003",
    "cve_ent": "09",
    "cve_mun": "003",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Coyoacán",
    "type": "RURAL",
    "center": [
      -99.192,
      19.324
    ],
    "population": 61445
  },
  {
    "cve_geo": "090070001",
    "cve_ent": "09",
    "cve_mun": "007",
    "cve_loc": "0001",
    "name": "Iztapalapa (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.092,
      19.355
    ],
    "population": 1193066
  },
  {
    "cve_geo": "090070002",
    "cve_ent": "09",
    "cve_mun": "007",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Iztapalapa",
    "type": "URBANA",
    "center": [
      -99.072,
      19.375
    ],
    "population": 458872
  },
  {
    "cve_geo": "090070003",
    "cve_ent": "09",
    "cve_mun": "007",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Iztapalapa",
    "type": "RURAL",
    "center": [
      -99.122,
      19.33
    ],
    "population": 183549
  },
  {
    "cve_geo": "100050001",
    "cve_ent": "10",
    "cve_mun": "005",
    "cve_loc": "0001",
    "name": "Durango (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -104.653,
      24.027
    ],
    "population": 447653
  },
  {
    "cve_geo": "100050002",
    "cve_ent": "10",
    "cve_mun": "005",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Durango",
    "type": "URBANA",
    "center": [
      -104.633,
      24.047
    ],
    "population": 172174
  },
  {
    "cve_geo": "100050003",
    "cve_ent": "10",
    "cve_mun": "005",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Durango",
    "type": "RURAL",
    "center": [
      -104.683,
      24.002
    ],
    "population": 68870
  },
  {
    "cve_geo": "100070001",
    "cve_ent": "10",
    "cve_mun": "007",
    "cve_loc": "0001",
    "name": "Gómez Palacio (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.498,
      25.573
    ],
    "population": 242288
  },
  {
    "cve_geo": "100070002",
    "cve_ent": "10",
    "cve_mun": "007",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Gómez Palacio",
    "type": "URBANA",
    "center": [
      -103.478,
      25.593
    ],
    "population": 93188
  },
  {
    "cve_geo": "100070003",
    "cve_ent": "10",
    "cve_mun": "007",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Gómez Palacio",
    "type": "RURAL",
    "center": [
      -103.528,
      25.548
    ],
    "population": 37275
  },
  {
    "cve_geo": "100120001",
    "cve_ent": "10",
    "cve_mun": "012",
    "cve_loc": "0001",
    "name": "Lerdo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.525,
      25.534
    ],
    "population": 106153
  },
  {
    "cve_geo": "100120002",
    "cve_ent": "10",
    "cve_mun": "012",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Lerdo",
    "type": "URBANA",
    "center": [
      -103.505,
      25.554
    ],
    "population": 40828
  },
  {
    "cve_geo": "100120003",
    "cve_ent": "10",
    "cve_mun": "012",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Lerdo",
    "type": "RURAL",
    "center": [
      -103.555,
      25.509
    ],
    "population": 16331
  },
  {
    "cve_geo": "110150001",
    "cve_ent": "11",
    "cve_mun": "015",
    "cve_loc": "0001",
    "name": "Guanajuato (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -101.257,
      21.019
    ],
    "population": 126425
  },
  {
    "cve_geo": "110150002",
    "cve_ent": "11",
    "cve_mun": "015",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Guanajuato",
    "type": "URBANA",
    "center": [
      -101.237,
      21.039
    ],
    "population": 48625
  },
  {
    "cve_geo": "110150003",
    "cve_ent": "11",
    "cve_mun": "015",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Guanajuato",
    "type": "RURAL",
    "center": [
      -101.287,
      20.994
    ],
    "population": 19450
  },
  {
    "cve_geo": "110200001",
    "cve_ent": "11",
    "cve_mun": "020",
    "cve_loc": "0001",
    "name": "León (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -101.682,
      21.122
    ],
    "population": 1118790
  },
  {
    "cve_geo": "110200002",
    "cve_ent": "11",
    "cve_mun": "020",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana León",
    "type": "URBANA",
    "center": [
      -101.662,
      21.142
    ],
    "population": 430304
  },
  {
    "cve_geo": "110200003",
    "cve_ent": "11",
    "cve_mun": "020",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural León",
    "type": "RURAL",
    "center": [
      -101.712,
      21.097
    ],
    "population": 172122
  },
  {
    "cve_geo": "110170001",
    "cve_ent": "11",
    "cve_mun": "017",
    "cve_loc": "0001",
    "name": "Irapuato (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -101.347,
      20.673
    ],
    "population": 385419
  },
  {
    "cve_geo": "110170002",
    "cve_ent": "11",
    "cve_mun": "017",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Irapuato",
    "type": "URBANA",
    "center": [
      -101.327,
      20.693
    ],
    "population": 148238
  },
  {
    "cve_geo": "110170003",
    "cve_ent": "11",
    "cve_mun": "017",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Irapuato",
    "type": "RURAL",
    "center": [
      -101.377,
      20.648
    ],
    "population": 59295
  },
  {
    "cve_geo": "110070001",
    "cve_ent": "11",
    "cve_mun": "007",
    "cve_loc": "0001",
    "name": "Celaya (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.814,
      20.523
    ],
    "population": 338760
  },
  {
    "cve_geo": "110070002",
    "cve_ent": "11",
    "cve_mun": "007",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Celaya",
    "type": "URBANA",
    "center": [
      -100.794,
      20.543
    ],
    "population": 130292
  },
  {
    "cve_geo": "110070003",
    "cve_ent": "11",
    "cve_mun": "007",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Celaya",
    "type": "RURAL",
    "center": [
      -100.844,
      20.498
    ],
    "population": 52117
  },
  {
    "cve_geo": "120290001",
    "cve_ent": "12",
    "cve_mun": "029",
    "cve_loc": "0001",
    "name": "Chilpancingo de los Bravo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.5,
      17.551
    ],
    "population": 184180
  },
  {
    "cve_geo": "120290002",
    "cve_ent": "12",
    "cve_mun": "029",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Chilpancingo de los Bravo",
    "type": "URBANA",
    "center": [
      -99.48,
      17.571
    ],
    "population": 70839
  },
  {
    "cve_geo": "120290003",
    "cve_ent": "12",
    "cve_mun": "029",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Chilpancingo de los Bravo",
    "type": "RURAL",
    "center": [
      -99.53,
      17.526
    ],
    "population": 28335
  },
  {
    "cve_geo": "120010001",
    "cve_ent": "12",
    "cve_mun": "001",
    "cve_loc": "0001",
    "name": "Acapulco de Juárez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.873,
      16.853
    ],
    "population": 506718
  },
  {
    "cve_geo": "120010002",
    "cve_ent": "12",
    "cve_mun": "001",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Acapulco de Juárez",
    "type": "URBANA",
    "center": [
      -99.853,
      16.873
    ],
    "population": 194892
  },
  {
    "cve_geo": "120010003",
    "cve_ent": "12",
    "cve_mun": "001",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Acapulco de Juárez",
    "type": "RURAL",
    "center": [
      -99.903,
      16.828
    ],
    "population": 77957
  },
  {
    "cve_geo": "120350001",
    "cve_ent": "12",
    "cve_mun": "035",
    "cve_loc": "0001",
    "name": "Iguala de la Independencia (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.539,
      18.344
    ],
    "population": 100212
  },
  {
    "cve_geo": "120350002",
    "cve_ent": "12",
    "cve_mun": "035",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Iguala de la Independencia",
    "type": "URBANA",
    "center": [
      -99.519,
      18.364
    ],
    "population": 38543
  },
  {
    "cve_geo": "120350003",
    "cve_ent": "12",
    "cve_mun": "035",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Iguala de la Independencia",
    "type": "RURAL",
    "center": [
      -99.569,
      18.319
    ],
    "population": 15417
  },
  {
    "cve_geo": "130480001",
    "cve_ent": "13",
    "cve_mun": "048",
    "cve_loc": "0001",
    "name": "Pachuca de Soto (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.733,
      20.101
    ],
    "population": 204315
  },
  {
    "cve_geo": "130480002",
    "cve_ent": "13",
    "cve_mun": "048",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Pachuca de Soto",
    "type": "URBANA",
    "center": [
      -98.713,
      20.121
    ],
    "population": 78583
  },
  {
    "cve_geo": "130480003",
    "cve_ent": "13",
    "cve_mun": "048",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Pachuca de Soto",
    "type": "RURAL",
    "center": [
      -98.763,
      20.076
    ],
    "population": 31433
  },
  {
    "cve_geo": "130510001",
    "cve_ent": "13",
    "cve_mun": "051",
    "cve_loc": "0001",
    "name": "Mineral de la Reforma (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.718,
      20.082
    ],
    "population": 131787
  },
  {
    "cve_geo": "130510002",
    "cve_ent": "13",
    "cve_mun": "051",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Mineral de la Reforma",
    "type": "URBANA",
    "center": [
      -98.698,
      20.102
    ],
    "population": 50687
  },
  {
    "cve_geo": "130510003",
    "cve_ent": "13",
    "cve_mun": "051",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Mineral de la Reforma",
    "type": "RURAL",
    "center": [
      -98.748,
      20.057
    ],
    "population": 20275
  },
  {
    "cve_geo": "130770001",
    "cve_ent": "13",
    "cve_mun": "077",
    "cve_loc": "0001",
    "name": "Tulancingo de Bravo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.369,
      20.083
    ],
    "population": 109440
  },
  {
    "cve_geo": "130770002",
    "cve_ent": "13",
    "cve_mun": "077",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tulancingo de Bravo",
    "type": "URBANA",
    "center": [
      -98.349,
      20.103
    ],
    "population": 42092
  },
  {
    "cve_geo": "130770003",
    "cve_ent": "13",
    "cve_mun": "077",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tulancingo de Bravo",
    "type": "RURAL",
    "center": [
      -98.399,
      20.058
    ],
    "population": 16837
  },
  {
    "cve_geo": "140390001",
    "cve_ent": "14",
    "cve_mun": "039",
    "cve_loc": "0001",
    "name": "Guadalajara (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.3496,
      20.6597
    ],
    "population": 900659
  },
  {
    "cve_geo": "140390002",
    "cve_ent": "14",
    "cve_mun": "039",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Guadalajara",
    "type": "URBANA",
    "center": [
      -103.3296,
      20.6797
    ],
    "population": 346407
  },
  {
    "cve_geo": "140390003",
    "cve_ent": "14",
    "cve_mun": "039",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Guadalajara",
    "type": "RURAL",
    "center": [
      -103.3796,
      20.6347
    ],
    "population": 138563
  },
  {
    "cve_geo": "141200001",
    "cve_ent": "14",
    "cve_mun": "120",
    "cve_loc": "0001",
    "name": "Zapopan (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.393,
      20.723
    ],
    "population": 959719
  },
  {
    "cve_geo": "141200002",
    "cve_ent": "14",
    "cve_mun": "120",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Zapopan",
    "type": "URBANA",
    "center": [
      -103.373,
      20.743
    ],
    "population": 369123
  },
  {
    "cve_geo": "141200003",
    "cve_ent": "14",
    "cve_mun": "120",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Zapopan",
    "type": "RURAL",
    "center": [
      -103.423,
      20.698
    ],
    "population": 147649
  },
  {
    "cve_geo": "140980001",
    "cve_ent": "14",
    "cve_mun": "098",
    "cve_loc": "0001",
    "name": "San Pedro Tlaquepaque (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.315,
      20.638
    ],
    "population": 446633
  },
  {
    "cve_geo": "140980002",
    "cve_ent": "14",
    "cve_mun": "098",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Pedro Tlaquepaque",
    "type": "URBANA",
    "center": [
      -103.295,
      20.658
    ],
    "population": 171782
  },
  {
    "cve_geo": "140980003",
    "cve_ent": "14",
    "cve_mun": "098",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Pedro Tlaquepaque",
    "type": "RURAL",
    "center": [
      -103.345,
      20.613
    ],
    "population": 68713
  },
  {
    "cve_geo": "140970001",
    "cve_ent": "14",
    "cve_mun": "097",
    "cve_loc": "0001",
    "name": "Tlajomulco de Zúñiga (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -103.443,
      20.473
    ],
    "population": 473038
  },
  {
    "cve_geo": "140970002",
    "cve_ent": "14",
    "cve_mun": "097",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tlajomulco de Zúñiga",
    "type": "URBANA",
    "center": [
      -103.423,
      20.493
    ],
    "population": 181938
  },
  {
    "cve_geo": "140970003",
    "cve_ent": "14",
    "cve_mun": "097",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tlajomulco de Zúñiga",
    "type": "RURAL",
    "center": [
      -103.473,
      20.448
    ],
    "population": 72775
  },
  {
    "cve_geo": "140670001",
    "cve_ent": "14",
    "cve_mun": "067",
    "cve_loc": "0001",
    "name": "Puerto Vallarta (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -105.225,
      20.653
    ],
    "population": 189695
  },
  {
    "cve_geo": "140670002",
    "cve_ent": "14",
    "cve_mun": "067",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Puerto Vallarta",
    "type": "URBANA",
    "center": [
      -105.205,
      20.673
    ],
    "population": 72960
  },
  {
    "cve_geo": "140670003",
    "cve_ent": "14",
    "cve_mun": "067",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Puerto Vallarta",
    "type": "RURAL",
    "center": [
      -105.255,
      20.628
    ],
    "population": 29184
  },
  {
    "cve_geo": "151060001",
    "cve_ent": "15",
    "cve_mun": "106",
    "cve_loc": "0001",
    "name": "Toluca (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.655,
      19.282
    ],
    "population": 591895
  },
  {
    "cve_geo": "151060002",
    "cve_ent": "15",
    "cve_mun": "106",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Toluca",
    "type": "URBANA",
    "center": [
      -99.635,
      19.302
    ],
    "population": 227652
  },
  {
    "cve_geo": "151060003",
    "cve_ent": "15",
    "cve_mun": "106",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Toluca",
    "type": "RURAL",
    "center": [
      -99.685,
      19.257
    ],
    "population": 91061
  },
  {
    "cve_geo": "150570001",
    "cve_ent": "15",
    "cve_mun": "057",
    "cve_loc": "0001",
    "name": "Naucalpan de Juárez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.238,
      19.478
    ],
    "population": 542382
  },
  {
    "cve_geo": "150570002",
    "cve_ent": "15",
    "cve_mun": "057",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Naucalpan de Juárez",
    "type": "URBANA",
    "center": [
      -99.218,
      19.498
    ],
    "population": 208609
  },
  {
    "cve_geo": "150570003",
    "cve_ent": "15",
    "cve_mun": "057",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Naucalpan de Juárez",
    "type": "RURAL",
    "center": [
      -99.268,
      19.453
    ],
    "population": 83443
  },
  {
    "cve_geo": "151040001",
    "cve_ent": "15",
    "cve_mun": "104",
    "cve_loc": "0001",
    "name": "Tlalnepantla de Baz (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.196,
      19.539
    ],
    "population": 436931
  },
  {
    "cve_geo": "151040002",
    "cve_ent": "15",
    "cve_mun": "104",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tlalnepantla de Baz",
    "type": "URBANA",
    "center": [
      -99.176,
      19.559
    ],
    "population": 168051
  },
  {
    "cve_geo": "151040003",
    "cve_ent": "15",
    "cve_mun": "104",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tlalnepantla de Baz",
    "type": "RURAL",
    "center": [
      -99.226,
      19.514
    ],
    "population": 67220
  },
  {
    "cve_geo": "150330001",
    "cve_ent": "15",
    "cve_mun": "033",
    "cve_loc": "0001",
    "name": "Ecatepec de Morelos (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.049,
      19.601
    ],
    "population": 1069479
  },
  {
    "cve_geo": "150330002",
    "cve_ent": "15",
    "cve_mun": "033",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Ecatepec de Morelos",
    "type": "URBANA",
    "center": [
      -99.029,
      19.621
    ],
    "population": 411338
  },
  {
    "cve_geo": "150330003",
    "cve_ent": "15",
    "cve_mun": "033",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Ecatepec de Morelos",
    "type": "RURAL",
    "center": [
      -99.079,
      19.576
    ],
    "population": 164535
  },
  {
    "cve_geo": "150580001",
    "cve_ent": "15",
    "cve_mun": "058",
    "cve_loc": "0001",
    "name": "Nezahualcóyotl (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.988,
      19.4
    ],
    "population": 700185
  },
  {
    "cve_geo": "150580002",
    "cve_ent": "15",
    "cve_mun": "058",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Nezahualcóyotl",
    "type": "URBANA",
    "center": [
      -98.968,
      19.42
    ],
    "population": 269302
  },
  {
    "cve_geo": "150580003",
    "cve_ent": "15",
    "cve_mun": "058",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Nezahualcóyotl",
    "type": "RURAL",
    "center": [
      -99.018,
      19.375
    ],
    "population": 107721
  },
  {
    "cve_geo": "160530001",
    "cve_ent": "16",
    "cve_mun": "053",
    "cve_loc": "0001",
    "name": "Morelia (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -101.185,
      19.706
    ],
    "population": 551884
  },
  {
    "cve_geo": "160530002",
    "cve_ent": "16",
    "cve_mun": "053",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Morelia",
    "type": "URBANA",
    "center": [
      -101.165,
      19.726
    ],
    "population": 212263
  },
  {
    "cve_geo": "160530003",
    "cve_ent": "16",
    "cve_mun": "053",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Morelia",
    "type": "RURAL",
    "center": [
      -101.215,
      19.681
    ],
    "population": 84905
  },
  {
    "cve_geo": "161020001",
    "cve_ent": "16",
    "cve_mun": "102",
    "cve_loc": "0001",
    "name": "Uruapan (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.062,
      19.418
    ],
    "population": 231911
  },
  {
    "cve_geo": "161020002",
    "cve_ent": "16",
    "cve_mun": "102",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Uruapan",
    "type": "URBANA",
    "center": [
      -102.042,
      19.438
    ],
    "population": 89197
  },
  {
    "cve_geo": "161020003",
    "cve_ent": "16",
    "cve_mun": "102",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Uruapan",
    "type": "RURAL",
    "center": [
      -102.092,
      19.393
    ],
    "population": 35679
  },
  {
    "cve_geo": "161080001",
    "cve_ent": "16",
    "cve_mun": "108",
    "cve_loc": "0001",
    "name": "Zamora (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.288,
      19.985
    ],
    "population": 133159
  },
  {
    "cve_geo": "161080002",
    "cve_ent": "16",
    "cve_mun": "108",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Zamora",
    "type": "URBANA",
    "center": [
      -102.268,
      20.005
    ],
    "population": 51215
  },
  {
    "cve_geo": "161080003",
    "cve_ent": "16",
    "cve_mun": "108",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Zamora",
    "type": "RURAL",
    "center": [
      -102.318,
      19.96
    ],
    "population": 20486
  },
  {
    "cve_geo": "170070001",
    "cve_ent": "17",
    "cve_mun": "007",
    "cve_loc": "0001",
    "name": "Cuernavaca (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.23,
      18.926
    ],
    "population": 246009
  },
  {
    "cve_geo": "170070002",
    "cve_ent": "17",
    "cve_mun": "007",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Cuernavaca",
    "type": "URBANA",
    "center": [
      -99.21,
      18.946
    ],
    "population": 94619
  },
  {
    "cve_geo": "170070003",
    "cve_ent": "17",
    "cve_mun": "007",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Cuernavaca",
    "type": "RURAL",
    "center": [
      -99.26,
      18.901
    ],
    "population": 37848
  },
  {
    "cve_geo": "170110001",
    "cve_ent": "17",
    "cve_mun": "011",
    "cve_loc": "0001",
    "name": "Jiutepec (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.176,
      18.881
    ],
    "population": 139982
  },
  {
    "cve_geo": "170110002",
    "cve_ent": "17",
    "cve_mun": "011",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Jiutepec",
    "type": "URBANA",
    "center": [
      -99.156,
      18.901
    ],
    "population": 53839
  },
  {
    "cve_geo": "170110003",
    "cve_ent": "17",
    "cve_mun": "011",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Jiutepec",
    "type": "RURAL",
    "center": [
      -99.206,
      18.856
    ],
    "population": 21536
  },
  {
    "cve_geo": "170060001",
    "cve_ent": "17",
    "cve_mun": "006",
    "cve_loc": "0001",
    "name": "Cuautla (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.956,
      18.813
    ],
    "population": 121724
  },
  {
    "cve_geo": "170060002",
    "cve_ent": "17",
    "cve_mun": "006",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Cuautla",
    "type": "URBANA",
    "center": [
      -98.936,
      18.833
    ],
    "population": 46817
  },
  {
    "cve_geo": "170060003",
    "cve_ent": "17",
    "cve_mun": "006",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Cuautla",
    "type": "RURAL",
    "center": [
      -98.986,
      18.788
    ],
    "population": 18727
  },
  {
    "cve_geo": "180170001",
    "cve_ent": "18",
    "cve_mun": "017",
    "cve_loc": "0001",
    "name": "Tepic (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -104.895,
      21.503
    ],
    "population": 276851
  },
  {
    "cve_geo": "180170002",
    "cve_ent": "18",
    "cve_mun": "017",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tepic",
    "type": "URBANA",
    "center": [
      -104.875,
      21.523
    ],
    "population": 106481
  },
  {
    "cve_geo": "180170003",
    "cve_ent": "18",
    "cve_mun": "017",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tepic",
    "type": "RURAL",
    "center": [
      -104.925,
      21.478
    ],
    "population": 42592
  },
  {
    "cve_geo": "180200001",
    "cve_ent": "18",
    "cve_mun": "020",
    "cve_loc": "0001",
    "name": "Bahía de Banderas (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -105.253,
      20.798
    ],
    "population": 121961
  },
  {
    "cve_geo": "180200002",
    "cve_ent": "18",
    "cve_mun": "020",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Bahía de Banderas",
    "type": "URBANA",
    "center": [
      -105.233,
      20.818
    ],
    "population": 46908
  },
  {
    "cve_geo": "180200003",
    "cve_ent": "18",
    "cve_mun": "020",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Bahía de Banderas",
    "type": "RURAL",
    "center": [
      -105.283,
      20.773
    ],
    "population": 18763
  },
  {
    "cve_geo": "190390001",
    "cve_ent": "19",
    "cve_mun": "039",
    "cve_loc": "0001",
    "name": "Monterrey (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.3161,
      25.6866
    ],
    "population": 742946
  },
  {
    "cve_geo": "190390002",
    "cve_ent": "19",
    "cve_mun": "039",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Monterrey",
    "type": "URBANA",
    "center": [
      -100.2961,
      25.7066
    ],
    "population": 285749
  },
  {
    "cve_geo": "190390003",
    "cve_ent": "19",
    "cve_mun": "039",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Monterrey",
    "type": "RURAL",
    "center": [
      -100.3461,
      25.6616
    ],
    "population": 114299
  },
  {
    "cve_geo": "190190001",
    "cve_ent": "19",
    "cve_mun": "019",
    "cve_loc": "0001",
    "name": "San Pedro Garza García (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.404,
      25.665
    ],
    "population": 85910
  },
  {
    "cve_geo": "190190002",
    "cve_ent": "19",
    "cve_mun": "019",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Pedro Garza García",
    "type": "URBANA",
    "center": [
      -100.384,
      25.685
    ],
    "population": 33042
  },
  {
    "cve_geo": "190190003",
    "cve_ent": "19",
    "cve_mun": "019",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Pedro Garza García",
    "type": "RURAL",
    "center": [
      -100.434,
      25.64
    ],
    "population": 13217
  },
  {
    "cve_geo": "190260001",
    "cve_ent": "19",
    "cve_mun": "026",
    "cve_loc": "0001",
    "name": "Guadalupe (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.256,
      25.677
    ],
    "population": 418043
  },
  {
    "cve_geo": "190260002",
    "cve_ent": "19",
    "cve_mun": "026",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Guadalupe",
    "type": "URBANA",
    "center": [
      -100.236,
      25.697
    ],
    "population": 160786
  },
  {
    "cve_geo": "190260003",
    "cve_ent": "19",
    "cve_mun": "026",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Guadalupe",
    "type": "RURAL",
    "center": [
      -100.286,
      25.652
    ],
    "population": 64314
  },
  {
    "cve_geo": "190460001",
    "cve_ent": "19",
    "cve_mun": "046",
    "cve_loc": "0001",
    "name": "San Nicolás de los Garza (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.286,
      25.748
    ],
    "population": 267924
  },
  {
    "cve_geo": "190460002",
    "cve_ent": "19",
    "cve_mun": "046",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Nicolás de los Garza",
    "type": "URBANA",
    "center": [
      -100.266,
      25.768
    ],
    "population": 103048
  },
  {
    "cve_geo": "190460003",
    "cve_ent": "19",
    "cve_mun": "046",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Nicolás de los Garza",
    "type": "RURAL",
    "center": [
      -100.316,
      25.723
    ],
    "population": 41219
  },
  {
    "cve_geo": "190060001",
    "cve_ent": "19",
    "cve_mun": "006",
    "cve_loc": "0001",
    "name": "Apodaca (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.188,
      25.781
    ],
    "population": 426702
  },
  {
    "cve_geo": "190060002",
    "cve_ent": "19",
    "cve_mun": "006",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Apodaca",
    "type": "URBANA",
    "center": [
      -100.168,
      25.801
    ],
    "population": 164116
  },
  {
    "cve_geo": "190060003",
    "cve_ent": "19",
    "cve_mun": "006",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Apodaca",
    "type": "RURAL",
    "center": [
      -100.218,
      25.756
    ],
    "population": 65646
  },
  {
    "cve_geo": "200670001",
    "cve_ent": "20",
    "cve_mun": "067",
    "cve_loc": "0001",
    "name": "Oaxaca de Juárez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -96.726,
      17.065
    ],
    "population": 176121
  },
  {
    "cve_geo": "200670002",
    "cve_ent": "20",
    "cve_mun": "067",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Oaxaca de Juárez",
    "type": "URBANA",
    "center": [
      -96.706,
      17.085
    ],
    "population": 67739
  },
  {
    "cve_geo": "200670003",
    "cve_ent": "20",
    "cve_mun": "067",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Oaxaca de Juárez",
    "type": "RURAL",
    "center": [
      -96.756,
      17.04
    ],
    "population": 27096
  },
  {
    "cve_geo": "201840001",
    "cve_ent": "20",
    "cve_mun": "184",
    "cve_loc": "0001",
    "name": "San Juan Bautista Tuxtepec (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -96.126,
      18.088
    ],
    "population": 103644
  },
  {
    "cve_geo": "201840002",
    "cve_ent": "20",
    "cve_mun": "184",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Juan Bautista Tuxtepec",
    "type": "URBANA",
    "center": [
      -96.106,
      18.108
    ],
    "population": 39863
  },
  {
    "cve_geo": "201840003",
    "cve_ent": "20",
    "cve_mun": "184",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Juan Bautista Tuxtepec",
    "type": "RURAL",
    "center": [
      -96.156,
      18.063
    ],
    "population": 15945
  },
  {
    "cve_geo": "200790001",
    "cve_ent": "20",
    "cve_mun": "079",
    "cve_loc": "0001",
    "name": "Salina Cruz (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -95.197,
      16.183
    ],
    "population": 54885
  },
  {
    "cve_geo": "200790002",
    "cve_ent": "20",
    "cve_mun": "079",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Salina Cruz",
    "type": "URBANA",
    "center": [
      -95.177,
      16.203
    ],
    "population": 21110
  },
  {
    "cve_geo": "200790003",
    "cve_ent": "20",
    "cve_mun": "079",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Salina Cruz",
    "type": "RURAL",
    "center": [
      -95.227,
      16.158
    ],
    "population": 8444
  },
  {
    "cve_geo": "211140001",
    "cve_ent": "21",
    "cve_mun": "114",
    "cve_loc": "0001",
    "name": "Puebla (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.2062,
      19.0438
    ],
    "population": 1099918
  },
  {
    "cve_geo": "211140002",
    "cve_ent": "21",
    "cve_mun": "114",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Puebla",
    "type": "URBANA",
    "center": [
      -98.1862,
      19.0638
    ],
    "population": 423045
  },
  {
    "cve_geo": "211140003",
    "cve_ent": "21",
    "cve_mun": "114",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Puebla",
    "type": "RURAL",
    "center": [
      -98.2362,
      19.0188
    ],
    "population": 169218
  },
  {
    "cve_geo": "211400001",
    "cve_ent": "21",
    "cve_mun": "140",
    "cve_loc": "0001",
    "name": "San Pedro Cholula (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.306,
      19.063
    ],
    "population": 89981
  },
  {
    "cve_geo": "211400002",
    "cve_ent": "21",
    "cve_mun": "140",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Pedro Cholula",
    "type": "URBANA",
    "center": [
      -98.286,
      19.083
    ],
    "population": 34608
  },
  {
    "cve_geo": "211400003",
    "cve_ent": "21",
    "cve_mun": "140",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Pedro Cholula",
    "type": "RURAL",
    "center": [
      -98.336,
      19.038
    ],
    "population": 13843
  },
  {
    "cve_geo": "211190001",
    "cve_ent": "21",
    "cve_mun": "119",
    "cve_loc": "0001",
    "name": "San Andrés Cholula (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.298,
      19.028
    ],
    "population": 100391
  },
  {
    "cve_geo": "211190002",
    "cve_ent": "21",
    "cve_mun": "119",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Andrés Cholula",
    "type": "URBANA",
    "center": [
      -98.278,
      19.048
    ],
    "population": 38612
  },
  {
    "cve_geo": "211190003",
    "cve_ent": "21",
    "cve_mun": "119",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Andrés Cholula",
    "type": "RURAL",
    "center": [
      -98.328,
      19.003
    ],
    "population": 15445
  },
  {
    "cve_geo": "210190001",
    "cve_ent": "21",
    "cve_mun": "019",
    "cve_loc": "0001",
    "name": "Atlixco (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.431,
      18.908
    ],
    "population": 92165
  },
  {
    "cve_geo": "210190002",
    "cve_ent": "21",
    "cve_mun": "019",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Atlixco",
    "type": "URBANA",
    "center": [
      -98.411,
      18.928
    ],
    "population": 35448
  },
  {
    "cve_geo": "210190003",
    "cve_ent": "21",
    "cve_mun": "019",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Atlixco",
    "type": "RURAL",
    "center": [
      -98.461,
      18.883
    ],
    "population": 14179
  },
  {
    "cve_geo": "211560001",
    "cve_ent": "21",
    "cve_mun": "156",
    "cve_loc": "0001",
    "name": "Tehuacán (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -97.393,
      18.462
    ],
    "population": 212753
  },
  {
    "cve_geo": "211560002",
    "cve_ent": "21",
    "cve_mun": "156",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tehuacán",
    "type": "URBANA",
    "center": [
      -97.373,
      18.482
    ],
    "population": 81828
  },
  {
    "cve_geo": "211560003",
    "cve_ent": "21",
    "cve_mun": "156",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tehuacán",
    "type": "RURAL",
    "center": [
      -97.423,
      18.437
    ],
    "population": 32731
  },
  {
    "cve_geo": "220140001",
    "cve_ent": "22",
    "cve_mun": "014",
    "cve_loc": "0001",
    "name": "Querétaro (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.3899,
      20.5888
    ],
    "population": 682355
  },
  {
    "cve_geo": "220140002",
    "cve_ent": "22",
    "cve_mun": "014",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Querétaro",
    "type": "URBANA",
    "center": [
      -100.3699,
      20.6088
    ],
    "population": 262444
  },
  {
    "cve_geo": "220140003",
    "cve_ent": "22",
    "cve_mun": "014",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Querétaro",
    "type": "RURAL",
    "center": [
      -100.4199,
      20.5638
    ],
    "population": 104978
  },
  {
    "cve_geo": "220160001",
    "cve_ent": "22",
    "cve_mun": "016",
    "cve_loc": "0001",
    "name": "San Juan del Río (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100,
      20.388
    ],
    "population": 193585
  },
  {
    "cve_geo": "220160002",
    "cve_ent": "22",
    "cve_mun": "016",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Juan del Río",
    "type": "URBANA",
    "center": [
      -99.98,
      20.408
    ],
    "population": 74456
  },
  {
    "cve_geo": "220160003",
    "cve_ent": "22",
    "cve_mun": "016",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Juan del Río",
    "type": "RURAL",
    "center": [
      -100.03,
      20.363
    ],
    "population": 29782
  },
  {
    "cve_geo": "220060001",
    "cve_ent": "22",
    "cve_mun": "006",
    "cve_loc": "0001",
    "name": "Corregidora (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.44,
      20.53
    ],
    "population": 138169
  },
  {
    "cve_geo": "220060002",
    "cve_ent": "22",
    "cve_mun": "006",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Corregidora",
    "type": "URBANA",
    "center": [
      -100.42,
      20.55
    ],
    "population": 53142
  },
  {
    "cve_geo": "220060003",
    "cve_ent": "22",
    "cve_mun": "006",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Corregidora",
    "type": "RURAL",
    "center": [
      -100.47,
      20.505
    ],
    "population": 21257
  },
  {
    "cve_geo": "220110001",
    "cve_ent": "22",
    "cve_mun": "011",
    "cve_loc": "0001",
    "name": "El Marqués (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.32,
      20.62
    ],
    "population": 150584
  },
  {
    "cve_geo": "220110002",
    "cve_ent": "22",
    "cve_mun": "011",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana El Marqués",
    "type": "URBANA",
    "center": [
      -100.3,
      20.64
    ],
    "population": 57917
  },
  {
    "cve_geo": "220110003",
    "cve_ent": "22",
    "cve_mun": "011",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural El Marqués",
    "type": "RURAL",
    "center": [
      -100.35,
      20.595
    ],
    "population": 23167
  },
  {
    "cve_geo": "230040001",
    "cve_ent": "23",
    "cve_mun": "004",
    "cve_loc": "0001",
    "name": "Othón P. Blanco (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -88.296,
      18.503
    ],
    "population": 151871
  },
  {
    "cve_geo": "230040002",
    "cve_ent": "23",
    "cve_mun": "004",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Othón P. Blanco",
    "type": "URBANA",
    "center": [
      -88.276,
      18.523
    ],
    "population": 58412
  },
  {
    "cve_geo": "230040003",
    "cve_ent": "23",
    "cve_mun": "004",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Othón P. Blanco",
    "type": "RURAL",
    "center": [
      -88.326,
      18.478
    ],
    "population": 23365
  },
  {
    "cve_geo": "230050001",
    "cve_ent": "23",
    "cve_mun": "005",
    "cve_loc": "0001",
    "name": "Benito Juárez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -86.851,
      21.161
    ],
    "population": 592477
  },
  {
    "cve_geo": "230050002",
    "cve_ent": "23",
    "cve_mun": "005",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Benito Juárez",
    "type": "URBANA",
    "center": [
      -86.831,
      21.181
    ],
    "population": 227876
  },
  {
    "cve_geo": "230050003",
    "cve_ent": "23",
    "cve_mun": "005",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Benito Juárez",
    "type": "RURAL",
    "center": [
      -86.881,
      21.136
    ],
    "population": 91150
  },
  {
    "cve_geo": "230080001",
    "cve_ent": "23",
    "cve_mun": "008",
    "cve_loc": "0001",
    "name": "Solidaridad (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -87.073,
      20.627
    ],
    "population": 216970
  },
  {
    "cve_geo": "230080002",
    "cve_ent": "23",
    "cve_mun": "008",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Solidaridad",
    "type": "URBANA",
    "center": [
      -87.053,
      20.647
    ],
    "population": 83450
  },
  {
    "cve_geo": "230080003",
    "cve_ent": "23",
    "cve_mun": "008",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Solidaridad",
    "type": "RURAL",
    "center": [
      -87.103,
      20.602
    ],
    "population": 33380
  },
  {
    "cve_geo": "240280001",
    "cve_ent": "24",
    "cve_mun": "028",
    "cve_loc": "0001",
    "name": "San Luis Potosí (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.978,
      22.156
    ],
    "population": 592740
  },
  {
    "cve_geo": "240280002",
    "cve_ent": "24",
    "cve_mun": "028",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana San Luis Potosí",
    "type": "URBANA",
    "center": [
      -100.958,
      22.176
    ],
    "population": 227977
  },
  {
    "cve_geo": "240280003",
    "cve_ent": "24",
    "cve_mun": "028",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural San Luis Potosí",
    "type": "RURAL",
    "center": [
      -101.008,
      22.131
    ],
    "population": 91191
  },
  {
    "cve_geo": "240350001",
    "cve_ent": "24",
    "cve_mun": "035",
    "cve_loc": "0001",
    "name": "Soledad de Graciano Sánchez (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -100.94,
      22.183
    ],
    "population": 215847
  },
  {
    "cve_geo": "240350002",
    "cve_ent": "24",
    "cve_mun": "035",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Soledad de Graciano Sánchez",
    "type": "URBANA",
    "center": [
      -100.92,
      22.203
    ],
    "population": 83018
  },
  {
    "cve_geo": "240350003",
    "cve_ent": "24",
    "cve_mun": "035",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Soledad de Graciano Sánchez",
    "type": "RURAL",
    "center": [
      -100.97,
      22.158
    ],
    "population": 33207
  },
  {
    "cve_geo": "240130001",
    "cve_ent": "24",
    "cve_mun": "013",
    "cve_loc": "0001",
    "name": "Ciudad Valles (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.014,
      21.988
    ],
    "population": 116605
  },
  {
    "cve_geo": "240130002",
    "cve_ent": "24",
    "cve_mun": "013",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Ciudad Valles",
    "type": "URBANA",
    "center": [
      -98.994,
      22.008
    ],
    "population": 44848
  },
  {
    "cve_geo": "240130003",
    "cve_ent": "24",
    "cve_mun": "013",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Ciudad Valles",
    "type": "RURAL",
    "center": [
      -99.044,
      21.963
    ],
    "population": 17939
  },
  {
    "cve_geo": "250060001",
    "cve_ent": "25",
    "cve_mun": "006",
    "cve_loc": "0001",
    "name": "Culiacán (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -107.394,
      24.808
    ],
    "population": 652295
  },
  {
    "cve_geo": "250060002",
    "cve_ent": "25",
    "cve_mun": "006",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Culiacán",
    "type": "URBANA",
    "center": [
      -107.374,
      24.828
    ],
    "population": 250883
  },
  {
    "cve_geo": "250060003",
    "cve_ent": "25",
    "cve_mun": "006",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Culiacán",
    "type": "RURAL",
    "center": [
      -107.424,
      24.783
    ],
    "population": 100353
  },
  {
    "cve_geo": "250120001",
    "cve_ent": "25",
    "cve_mun": "012",
    "cve_loc": "0001",
    "name": "Mazatlán (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -106.424,
      23.232
    ],
    "population": 325936
  },
  {
    "cve_geo": "250120002",
    "cve_ent": "25",
    "cve_mun": "012",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Mazatlán",
    "type": "URBANA",
    "center": [
      -106.404,
      23.252
    ],
    "population": 125360
  },
  {
    "cve_geo": "250120003",
    "cve_ent": "25",
    "cve_mun": "012",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Mazatlán",
    "type": "RURAL",
    "center": [
      -106.454,
      23.207
    ],
    "population": 50144
  },
  {
    "cve_geo": "250010001",
    "cve_ent": "25",
    "cve_mun": "001",
    "cve_loc": "0001",
    "name": "Ahome (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -108.995,
      25.793
    ],
    "population": 298552
  },
  {
    "cve_geo": "250010002",
    "cve_ent": "25",
    "cve_mun": "001",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Ahome",
    "type": "URBANA",
    "center": [
      -108.975,
      25.813
    ],
    "population": 114828
  },
  {
    "cve_geo": "250010003",
    "cve_ent": "25",
    "cve_mun": "001",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Ahome",
    "type": "RURAL",
    "center": [
      -109.025,
      25.768
    ],
    "population": 45931
  },
  {
    "cve_geo": "260300001",
    "cve_ent": "26",
    "cve_mun": "030",
    "cve_loc": "0001",
    "name": "Hermosillo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -110.955,
      29.072
    ],
    "population": 608571
  },
  {
    "cve_geo": "260300002",
    "cve_ent": "26",
    "cve_mun": "030",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Hermosillo",
    "type": "URBANA",
    "center": [
      -110.935,
      29.092
    ],
    "population": 234066
  },
  {
    "cve_geo": "260300003",
    "cve_ent": "26",
    "cve_mun": "030",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Hermosillo",
    "type": "RURAL",
    "center": [
      -110.985,
      29.047
    ],
    "population": 93626
  },
  {
    "cve_geo": "260180001",
    "cve_ent": "26",
    "cve_mun": "018",
    "cve_loc": "0001",
    "name": "Cajeme (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -109.93,
      27.486
    ],
    "population": 283715
  },
  {
    "cve_geo": "260180002",
    "cve_ent": "26",
    "cve_mun": "018",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Cajeme",
    "type": "URBANA",
    "center": [
      -109.91,
      27.506
    ],
    "population": 109121
  },
  {
    "cve_geo": "260180003",
    "cve_ent": "26",
    "cve_mun": "018",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Cajeme",
    "type": "RURAL",
    "center": [
      -109.96,
      27.461
    ],
    "population": 43648
  },
  {
    "cve_geo": "260430001",
    "cve_ent": "26",
    "cve_mun": "043",
    "cve_loc": "0001",
    "name": "Nogales (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -110.942,
      31.308
    ],
    "population": 172108
  },
  {
    "cve_geo": "260430002",
    "cve_ent": "26",
    "cve_mun": "043",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Nogales",
    "type": "URBANA",
    "center": [
      -110.922,
      31.328
    ],
    "population": 66196
  },
  {
    "cve_geo": "260430003",
    "cve_ent": "26",
    "cve_mun": "043",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Nogales",
    "type": "RURAL",
    "center": [
      -110.972,
      31.283
    ],
    "population": 26478
  },
  {
    "cve_geo": "270040001",
    "cve_ent": "27",
    "cve_mun": "004",
    "cve_loc": "0001",
    "name": "Centro (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -92.93,
      17.989
    ],
    "population": 444345
  },
  {
    "cve_geo": "270040002",
    "cve_ent": "27",
    "cve_mun": "004",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Centro",
    "type": "URBANA",
    "center": [
      -92.91,
      18.009
    ],
    "population": 170902
  },
  {
    "cve_geo": "270040003",
    "cve_ent": "27",
    "cve_mun": "004",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Centro",
    "type": "RURAL",
    "center": [
      -92.96,
      17.964
    ],
    "population": 68361
  },
  {
    "cve_geo": "270020001",
    "cve_ent": "27",
    "cve_mun": "002",
    "cve_loc": "0001",
    "name": "Cárdenas (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -93.376,
      18.002
    ],
    "population": 158099
  },
  {
    "cve_geo": "270020002",
    "cve_ent": "27",
    "cve_mun": "002",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Cárdenas",
    "type": "URBANA",
    "center": [
      -93.356,
      18.022
    ],
    "population": 60807
  },
  {
    "cve_geo": "270020003",
    "cve_ent": "27",
    "cve_mun": "002",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Cárdenas",
    "type": "RURAL",
    "center": [
      -93.406,
      17.977
    ],
    "population": 24323
  },
  {
    "cve_geo": "270080001",
    "cve_ent": "27",
    "cve_mun": "008",
    "cve_loc": "0001",
    "name": "Comalcalco (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -93.28,
      18.26
    ],
    "population": 139670
  },
  {
    "cve_geo": "270080002",
    "cve_ent": "27",
    "cve_mun": "008",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Comalcalco",
    "type": "URBANA",
    "center": [
      -93.26,
      18.28
    ],
    "population": 53719
  },
  {
    "cve_geo": "270080003",
    "cve_ent": "27",
    "cve_mun": "008",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Comalcalco",
    "type": "RURAL",
    "center": [
      -93.31,
      18.235
    ],
    "population": 21488
  },
  {
    "cve_geo": "280410001",
    "cve_ent": "28",
    "cve_mun": "041",
    "cve_loc": "0001",
    "name": "Victoria (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -99.141,
      23.736
    ],
    "population": 227297
  },
  {
    "cve_geo": "280410002",
    "cve_ent": "28",
    "cve_mun": "041",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Victoria",
    "type": "URBANA",
    "center": [
      -99.121,
      23.756
    ],
    "population": 87422
  },
  {
    "cve_geo": "280410003",
    "cve_ent": "28",
    "cve_mun": "041",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Victoria",
    "type": "RURAL",
    "center": [
      -99.171,
      23.711
    ],
    "population": 34969
  },
  {
    "cve_geo": "280320001",
    "cve_ent": "28",
    "cve_mun": "032",
    "cve_loc": "0001",
    "name": "Reynosa (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.278,
      26.08
    ],
    "population": 458099
  },
  {
    "cve_geo": "280320002",
    "cve_ent": "28",
    "cve_mun": "032",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Reynosa",
    "type": "URBANA",
    "center": [
      -98.258,
      26.1
    ],
    "population": 176192
  },
  {
    "cve_geo": "280320003",
    "cve_ent": "28",
    "cve_mun": "032",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Reynosa",
    "type": "RURAL",
    "center": [
      -98.308,
      26.055
    ],
    "population": 70477
  },
  {
    "cve_geo": "280220001",
    "cve_ent": "28",
    "cve_mun": "022",
    "cve_loc": "0001",
    "name": "Matamoros (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -97.502,
      25.869
    ],
    "population": 352286
  },
  {
    "cve_geo": "280220002",
    "cve_ent": "28",
    "cve_mun": "022",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Matamoros",
    "type": "URBANA",
    "center": [
      -97.482,
      25.889
    ],
    "population": 135495
  },
  {
    "cve_geo": "280220003",
    "cve_ent": "28",
    "cve_mun": "022",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Matamoros",
    "type": "RURAL",
    "center": [
      -97.532,
      25.844
    ],
    "population": 54198
  },
  {
    "cve_geo": "280380001",
    "cve_ent": "28",
    "cve_mun": "038",
    "cve_loc": "0001",
    "name": "Tampico (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -97.861,
      22.256
    ],
    "population": 193415
  },
  {
    "cve_geo": "280380002",
    "cve_ent": "28",
    "cve_mun": "038",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tampico",
    "type": "URBANA",
    "center": [
      -97.841,
      22.276
    ],
    "population": 74391
  },
  {
    "cve_geo": "280380003",
    "cve_ent": "28",
    "cve_mun": "038",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tampico",
    "type": "RURAL",
    "center": [
      -97.891,
      22.231
    ],
    "population": 29756
  },
  {
    "cve_geo": "290330001",
    "cve_ent": "29",
    "cve_mun": "033",
    "cve_loc": "0001",
    "name": "Tlaxcala (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.237,
      19.318
    ],
    "population": 64932
  },
  {
    "cve_geo": "290330002",
    "cve_ent": "29",
    "cve_mun": "033",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Tlaxcala",
    "type": "URBANA",
    "center": [
      -98.217,
      19.338
    ],
    "population": 24974
  },
  {
    "cve_geo": "290330003",
    "cve_ent": "29",
    "cve_mun": "033",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Tlaxcala",
    "type": "RURAL",
    "center": [
      -98.267,
      19.293
    ],
    "population": 9990
  },
  {
    "cve_geo": "290050001",
    "cve_ent": "29",
    "cve_mun": "005",
    "cve_loc": "0001",
    "name": "Apizaco (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -98.143,
      19.416
    ],
    "population": 52471
  },
  {
    "cve_geo": "290050002",
    "cve_ent": "29",
    "cve_mun": "005",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Apizaco",
    "type": "URBANA",
    "center": [
      -98.123,
      19.436
    ],
    "population": 20181
  },
  {
    "cve_geo": "290050003",
    "cve_ent": "29",
    "cve_mun": "005",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Apizaco",
    "type": "RURAL",
    "center": [
      -98.173,
      19.391
    ],
    "population": 8073
  },
  {
    "cve_geo": "290130001",
    "cve_ent": "29",
    "cve_mun": "013",
    "cve_loc": "0001",
    "name": "Huamantla (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -97.923,
      19.314
    ],
    "population": 64197
  },
  {
    "cve_geo": "290130002",
    "cve_ent": "29",
    "cve_mun": "013",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Huamantla",
    "type": "URBANA",
    "center": [
      -97.903,
      19.334
    ],
    "population": 24691
  },
  {
    "cve_geo": "290130003",
    "cve_ent": "29",
    "cve_mun": "013",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Huamantla",
    "type": "RURAL",
    "center": [
      -97.953,
      19.289
    ],
    "population": 9876
  },
  {
    "cve_geo": "300870001",
    "cve_ent": "30",
    "cve_mun": "087",
    "cve_loc": "0001",
    "name": "Xalapa (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -96.915,
      19.539
    ],
    "population": 317545
  },
  {
    "cve_geo": "300870002",
    "cve_ent": "30",
    "cve_mun": "087",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Xalapa",
    "type": "URBANA",
    "center": [
      -96.895,
      19.559
    ],
    "population": 122133
  },
  {
    "cve_geo": "300870003",
    "cve_ent": "30",
    "cve_mun": "087",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Xalapa",
    "type": "RURAL",
    "center": [
      -96.945,
      19.514
    ],
    "population": 48853
  },
  {
    "cve_geo": "301930001",
    "cve_ent": "30",
    "cve_mun": "193",
    "cve_loc": "0001",
    "name": "Veracruz (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -96.134,
      19.173
    ],
    "population": 394686
  },
  {
    "cve_geo": "301930002",
    "cve_ent": "30",
    "cve_mun": "193",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Veracruz",
    "type": "URBANA",
    "center": [
      -96.114,
      19.193
    ],
    "population": 151802
  },
  {
    "cve_geo": "301930003",
    "cve_ent": "30",
    "cve_mun": "193",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Veracruz",
    "type": "RURAL",
    "center": [
      -96.164,
      19.148
    ],
    "population": 60721
  },
  {
    "cve_geo": "300390001",
    "cve_ent": "30",
    "cve_mun": "039",
    "cve_loc": "0001",
    "name": "Coatzacoalcos (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -94.447,
      18.14
    ],
    "population": 201954
  },
  {
    "cve_geo": "300390002",
    "cve_ent": "30",
    "cve_mun": "039",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Coatzacoalcos",
    "type": "URBANA",
    "center": [
      -94.427,
      18.16
    ],
    "population": 77675
  },
  {
    "cve_geo": "300390003",
    "cve_ent": "30",
    "cve_mun": "039",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Coatzacoalcos",
    "type": "RURAL",
    "center": [
      -94.477,
      18.115
    ],
    "population": 31070
  },
  {
    "cve_geo": "300440001",
    "cve_ent": "30",
    "cve_mun": "044",
    "cve_loc": "0001",
    "name": "Córdoba (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -96.936,
      18.894
    ],
    "population": 132819
  },
  {
    "cve_geo": "300440002",
    "cve_ent": "30",
    "cve_mun": "044",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Córdoba",
    "type": "URBANA",
    "center": [
      -96.916,
      18.914
    ],
    "population": 51084
  },
  {
    "cve_geo": "300440003",
    "cve_ent": "30",
    "cve_mun": "044",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Córdoba",
    "type": "RURAL",
    "center": [
      -96.966,
      18.869
    ],
    "population": 20434
  },
  {
    "cve_geo": "310500001",
    "cve_ent": "31",
    "cve_mun": "050",
    "cve_loc": "0001",
    "name": "Mérida (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -89.592,
      20.709
    ],
    "population": 646834
  },
  {
    "cve_geo": "310500002",
    "cve_ent": "31",
    "cve_mun": "050",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Mérida",
    "type": "URBANA",
    "center": [
      -89.572,
      20.729
    ],
    "population": 248782
  },
  {
    "cve_geo": "310500003",
    "cve_ent": "31",
    "cve_mun": "050",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Mérida",
    "type": "RURAL",
    "center": [
      -89.622,
      20.684
    ],
    "population": 99513
  },
  {
    "cve_geo": "311020001",
    "cve_ent": "31",
    "cve_mun": "102",
    "cve_loc": "0001",
    "name": "Valladolid (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -88.202,
      20.689
    ],
    "population": 55549
  },
  {
    "cve_geo": "311020002",
    "cve_ent": "31",
    "cve_mun": "102",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Valladolid",
    "type": "URBANA",
    "center": [
      -88.182,
      20.709
    ],
    "population": 21365
  },
  {
    "cve_geo": "311020003",
    "cve_ent": "31",
    "cve_mun": "102",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Valladolid",
    "type": "RURAL",
    "center": [
      -88.232,
      20.664
    ],
    "population": 8546
  },
  {
    "cve_geo": "310590001",
    "cve_ent": "31",
    "cve_mun": "059",
    "cve_loc": "0001",
    "name": "Progreso (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -89.664,
      21.283
    ],
    "population": 42905
  },
  {
    "cve_geo": "310590002",
    "cve_ent": "31",
    "cve_mun": "059",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Progreso",
    "type": "URBANA",
    "center": [
      -89.644,
      21.303
    ],
    "population": 16502
  },
  {
    "cve_geo": "310590003",
    "cve_ent": "31",
    "cve_mun": "059",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Progreso",
    "type": "RURAL",
    "center": [
      -89.694,
      21.258
    ],
    "population": 6601
  },
  {
    "cve_geo": "320560001",
    "cve_ent": "32",
    "cve_mun": "056",
    "cve_loc": "0001",
    "name": "Zacatecas (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.583,
      22.77
    ],
    "population": 97245
  },
  {
    "cve_geo": "320560002",
    "cve_ent": "32",
    "cve_mun": "056",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Zacatecas",
    "type": "URBANA",
    "center": [
      -102.563,
      22.79
    ],
    "population": 37402
  },
  {
    "cve_geo": "320560003",
    "cve_ent": "32",
    "cve_mun": "056",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Zacatecas",
    "type": "RURAL",
    "center": [
      -102.613,
      22.745
    ],
    "population": 14961
  },
  {
    "cve_geo": "320170001",
    "cve_ent": "32",
    "cve_mun": "017",
    "cve_loc": "0001",
    "name": "Guadalupe (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.512,
      22.751
    ],
    "population": 137631
  },
  {
    "cve_geo": "320170002",
    "cve_ent": "32",
    "cve_mun": "017",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Guadalupe",
    "type": "URBANA",
    "center": [
      -102.492,
      22.771
    ],
    "population": 52935
  },
  {
    "cve_geo": "320170003",
    "cve_ent": "32",
    "cve_mun": "017",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Guadalupe",
    "type": "RURAL",
    "center": [
      -102.542,
      22.726
    ],
    "population": 21174
  },
  {
    "cve_geo": "320100001",
    "cve_ent": "32",
    "cve_mun": "010",
    "cve_loc": "0001",
    "name": "Fresnillo (Cabecera / Centro Histórico)",
    "type": "URBANA",
    "center": [
      -102.869,
      23.177
    ],
    "population": 156346
  },
  {
    "cve_geo": "320100002",
    "cve_ent": "32",
    "cve_mun": "010",
    "cve_loc": "0002",
    "name": "Sector Norte - Zona Metropolitana Fresnillo",
    "type": "URBANA",
    "center": [
      -102.849,
      23.197
    ],
    "population": 60133
  },
  {
    "cve_geo": "320100003",
    "cve_ent": "32",
    "cve_mun": "010",
    "cve_loc": "0003",
    "name": "Comunidad Ejidal / Localidad Rural Fresnillo",
    "type": "RURAL",
    "center": [
      -102.899,
      23.152
    ],
    "population": 24053
  }
];

/**
 * 4. Generador de GeoJSON para los 32 Estados de México
 */
export function getMexicanStatesGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: MEXICAN_STATES.map((state) => ({
      type: 'Feature',
      id: state.cve_ent,
      properties: {
        cve_ent: state.cve_ent,
        name: state.name,
        shortName: state.shortName,
        capital: state.capital,
        municipalityCount: state.municipalityCount,
        zoom: state.zoom,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [state.polygon],
      },
    })),
  };
}

/**
 * 5. Generador de GeoJSON para Municipios (filtrable por cve_ent)
 */
export function getMexicanMunicipalitiesGeoJSON(filterCveEnt?: string) {
  const filtered = filterCveEnt
    ? MEXICAN_MUNICIPALITIES.filter((m) => m.cve_ent === filterCveEnt)
    : MEXICAN_MUNICIPALITIES;

  return {
    type: 'FeatureCollection',
    features: filtered.map((mun) => ({
      type: 'Feature',
      id: mun.cve_geo,
      properties: {
        cve_geo: mun.cve_geo,
        cve_ent: mun.cve_ent,
        cve_mun: mun.cve_mun,
        name: mun.name,
        headquarters: mun.headquarters,
        population: mun.population,
        localityCount: mun.localityCount,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [mun.polygon],
      },
    })),
  };
}

/**
 * 6. Generador de GeoJSON para Localidades (Puntos)
 */
export function getMexicanLocalitiesGeoJSON(filterCveEnt?: string, filterCveMun?: string) {
  let filtered = MEXICAN_LOCALITIES;
  if (filterCveEnt) filtered = filtered.filter((l) => l.cve_ent === filterCveEnt);
  if (filterCveMun) filtered = filtered.filter((l) => l.cve_mun === filterCveMun);

  return {
    type: 'FeatureCollection',
    features: filtered.map((loc) => ({
      type: 'Feature',
      id: loc.cve_geo,
      properties: {
        cve_geo: loc.cve_geo,
        cve_ent: loc.cve_ent,
        cve_mun: loc.cve_mun,
        cve_loc: loc.cve_loc,
        name: loc.name,
        type: loc.type,
        population: loc.population,
      },
      geometry: {
        type: 'Point',
        coordinates: loc.center,
      },
    })),
  };
}
