/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Labai svarbu PDF generacijai: liepiam Next'ui nebundle'inti pdfkit
    serverComponentsExternalPackages: ["pdfkit"],
  },

  webpack(config) {
    // Papildomai – užtikrinam, kad pdfkit laikomas „external“ node moduliu
    if (!config.externals) {
      config.externals = [];
    }

    config.externals.push("pdfkit");

    return config;
  },
};

export default nextConfig;
