// All site copy and business data in one place. Edit here, rebuild, republish.
// Sources: the team's "Proyecto CREA" presentation and cost sheet. Items marked
// `pending` are still waiting for confirmed data from the team.

import type { Flavor } from "./store";
import { palette } from "./palette";

export const brand = {
  name: "COW SHOTS",
  slogan: "Fuel. Grow. Perform.",
  legalName: "Cow Shots Wellness, S. de R.L. de C.V.",
  address: "Av. Lázaro Cárdenas No. 2423, Local 37, Trébol Park, Col. Del Valle Oriente, San Pedro Garza García, N.L., C.P. 66260",
  project: "Proyecto CREA · Prepa Anáhuac",
};

export const pack = {
  shots: 3,
  mlPerShot: 60,
  price: 269,
  currency: "MXN",
};

export const flavors: Record<Flavor, { name: string; image: string; milk: string }> = {
  vanilla: { name: "Vainilla", image: "brand/bottle-vainilla.jpg", milk: palette.vanilla },
  chocolate: { name: "Chocolate", image: "brand/bottle-chocolate.jpg", milk: palette.chocolate },
  strawberry: { name: "Fresa", image: "brand/bottle-fresa.jpg", milk: palette.strawberry },
};

export const formatPrice = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${pack.currency}`;

export const story = [
  {
    n: "01",
    kicker: "El problema",
    title: "El calostro casi siempre viene en polvo.",
    body: "Sobres, cápsulas y botes que hay que medir, mezclar y cargar. Para quien entrena y vive con prisa, eso es un paso más que se salta.",
  },
  {
    n: "02",
    kicker: "La solución",
    title: "Líquido y listo para tomar.",
    body: "Calostro bovino en un shot individual. Sin mezclar con agua, sin preparar nada. Lo abres y lo tomas.",
  },
  {
    n: "03",
    kicker: "Para quién",
    title: "Hecho para gente que se mueve.",
    body: "Deportistas, personas que van al gimnasio y cualquiera con un estilo de vida activo que quiere cuidar su alimentación.",
  },
  {
    n: "04",
    kicker: "Tres sabores",
    title: "Vainilla, Chocolate y Fresa.",
    body: "Paquetes de 3 shots de 60 mL. Fáciles de llevar al gimnasio, a la escuela o a donde vayas.",
  },
];

export const benefits = [
  { title: "Rendimiento y recuperación", icon: "muscle" },
  { title: "Sistema inmunológico", icon: "shield" },
  { title: "Salud digestiva", icon: "gut" },
  { title: "Piel y cabello", icon: "leaf" },
] as const;

export const benefitsIntro =
  "El calostro bovino, conocido como “Liquid Gold”, es la primera leche que produce la vaca después del parto. Contiene nutrientes y factores de crecimiento como el IGF-1, y puede apoyar la salud digestiva, el sistema inmunológico, la piel, el cabello y la recuperación del cuerpo.";

export const features = [
  "Fácil y rápido de consumir",
  "Shot individual",
  "Origen natural",
  "Pensado para el mercado fitness",
  "Práctico para llevar",
];

export const competitors = {
  rows: ["Formato", "Precio aprox.", "Puntos de venta", "Valor agregado", "Punto débil"],
  brands: [
    {
      name: "COW SHOTS",
      ours: true,
      cells: [
        "Shot líquido, listo para tomar",
        "$269 MXN · 3 shots",
        "En línea, gimnasios, tiendas fitness y eventos deportivos",
        "Rápido, portátil y fácil de consumir",
        "Marca nueva; necesita validación, distribución y más sabores",
      ],
    },
    {
      name: "Armra",
      cells: [
        "Polvo y sticks",
        "MXN $956 travel sticks / $2,301 frasco",
        "E-commerce propio y retail wellness en EUA",
        "Branding fuerte y variedad de formatos",
        "Precio alto para uso frecuente",
      ],
    },
    {
      name: "Cowboy Colostrum",
      cells: [
        "Polvo",
        "MXN $1,222 botella / $1,398 kit",
        "Web oficial, venta directa",
        "Whole first-day colostrum y sabores atractivos",
        "Precio elevado y menor presencia física",
      ],
    },
    {
      name: "WonderCow",
      cells: [
        "Polvo, sobres y cápsulas",
        "MXN $796 sobres / $1,151 polvo",
        "Web oficial y marketplaces",
        "Varios formatos, propuesta más accesible",
        "Menor diferenciación visual",
      ],
    },
  ],
};

export const business = {
  channels: ["Venta en línea", "Gimnasios", "Tiendas fitness", "Eventos deportivos"],
  payments: ["Tarjeta", "Efectivo", "Transferencia"],
};

export const about = {
  // Origin story as written by the team.
  origin:
    "Cow Shots nació cuando un compañero del equipo, fan del gimnasio, vio en un rancho cómo alimentaban a un becerro con calostro. Preguntó qué era, investigó y descubrió su uso en nutrición deportiva. De esa curiosidad salió la idea: crear un shot práctico para gente activa. Así empezó Cow Shots.",
  originPending: false,
  mission:
    "Impulsar la salud, energía y crecimiento de nuestros consumidores mediante el poder nutricional del calostro.",
  vision:
    "Convertir a Cow Shots en una marca reconocida dentro del mundo deportivo, ofreciendo un boost de nutrición y energía que impulse la salud, el crecimiento y el rendimiento de las personas activas.",
  values: [
    { name: "Innovación", text: "Crear una forma práctica y diferente de consumir calostro." },
    { name: "Calidad", text: "Ofrecer productos de buena calidad para deportistas y personas activas." },
    { name: "Practicidad", text: "Hacer que complementar la alimentación sea rápido y fácil." },
    { name: "Responsabilidad", text: "Ofrecer un producto pensado para acompañar un estilo de vida activo." },
  ],
};

export const team = [
  { name: "Beto Senties", role: "Director General", photo: "team/beto.jpg", text: "Define cómo se lanzan los shots, a qué cliente van dirigidos y toma las decisiones finales." },
  { name: "Gabriel Carrillo", role: "Gerente de Marketing", photo: "team/gabriel.jpg", text: "Decide cómo presentar y vender: empaque, mensaje, precio, redes sociales y promociones." },
  { name: "Arturo Cantú", role: "Jefe de Operaciones", photo: "team/arturo.jpg", text: "Producción y distribución: proveedores, envases, calidad, almacenamiento y entregas." },
  { name: "Andrés García", role: "Administración y Finanzas", photo: "team/andres.jpg", text: "Costos, inversión, precio de venta, presupuesto, pagos y temas legales." },
  { name: "Ramiro Botello", role: "Innovación y Tecnología", photo: "team/ramiro.jpg", text: "Página web, tienda en línea, sistemas de cobro e inventarios." },
];

export const socials: { name: string; handle?: string; url?: string }[] = [
  { name: "Instagram", handle: "@cowshotswellness", url: "https://www.instagram.com/cowshotswellness/" },
];

export const references = [
  "Cleveland Clinic. (2025). Cholesterol levels. Cleveland Clinic.",
  "Harvard T.H. Chan School of Public Health. (2024). The nutrition source. Harvard University.",
  "National Institutes of Health. (2024). Dietary supplements. MedlinePlus.",
  "National Library of Medicine. (2023). Bovine colostrum and its potential health benefits. National Library of Medicine.",
];
