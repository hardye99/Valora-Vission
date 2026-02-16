import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        valora: {
          navy: '#263457',    // Azul marino exacto del texto y contorno
          green: '#92C02E',   // Verde lima del swoosh superior
          darkGreen: '#2B5C35', // Verde oscuro para degradados
          amber: '#F5A623',   // Amarillo/Naranja del iris
          iris: '#4A2C08',    // Café oscuro del centro del ojo
          light: '#F8F9FA',   // Fondo muy limpio
        }
      },
      backgroundImage: {
        'valora-gradient': 'linear-gradient(135deg, #263457 0%, #151e32 100%)', // Degradado elegante para fondos oscuros
      }
    },
  },
  plugins: [],
};
export default config;