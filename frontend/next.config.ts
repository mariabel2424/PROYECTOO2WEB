import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Docker
  output: 'standalone',
  
  // Permitir imágenes de cualquier dominio (ajusta según necesites)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
