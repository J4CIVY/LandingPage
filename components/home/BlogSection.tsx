'use client';

import React from "react";
import Link from 'next/link';
import type { BlogPost } from '@/types/index.d.ts';
import Image from "next/image";

const BlogSection: React.FC = () => {
  const cloudName: string = "dz0peilmu";
  const commonParams: string = "q_auto:best,c_fill,g_auto";

  // Función para generar los srcSets para cada imagen
  const generateImageSources = (imagePath: string) => {
    return {
      avif: `
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_683/${imagePath} 683w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1024/${imagePath} 1024w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1366/${imagePath} 1366w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_avif,w_1920/${imagePath} 1920w
      `,
      webp: `
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_683/${imagePath} 683w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1024/${imagePath} 1024w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1366/${imagePath} 1366w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_webp,w_1920/${imagePath} 1920w
      `,
      jpg: `
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_683/${imagePath} 683w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1024/${imagePath} 1024w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath} 1366w,
        https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1920/${imagePath} 1920w
      `,
      fallback: `https://res.cloudinary.com/${cloudName}/image/upload/${commonParams},f_jpg,w_1366/${imagePath}`
    };
  };

  const blogPosts: BlogPost[] = [
    { 
      id: 1, 
      title: 'Consejos para viajes largos en moto', 
      excerpt: 'Aprende cómo prepararte para tus aventuras en carretera...', 
      date: '10 Sept 2023', 
      image: 'Consejos_para_viajes_largos_en_moto_rikfdk', 
      slug: 'consejos-viajes-largos-moto' 
    },
    { 
      id: 2, 
      title: 'Nuevas regulaciones de seguridad', 
      excerpt: 'Los cambios en la normativa que todo motociclista debe conocer...', 
      date: '28 Ago 2023', 
      image: 'Nuevas_regulaciones_de_seguridad_zuc3z7', 
      slug: 'nuevas-regulaciones-seguridad' 
    }
  ];

  return (
  <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 dark:text-white mb-12">
          BLOG & <span className="text-green-400 dark:text-green-300">NOTICIAS</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post: BlogPost) => {
            const imageSources = generateImageSources(post.image);
            
            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg text-gray-700 dark:text-gray-300"
              >
                <Link href={`/blog/${post.slug}`} aria-label={`Leer más sobre ${post.title}`}>
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <picture>
                      <source type="image/avif" srcSet={imageSources.avif} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
                      <source type="image/webp" srcSet={imageSources.webp} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
                      <source type="image/jpeg" srcSet={imageSources.jpg} sizes="(max-width: 768px) 683px, (max-width: 1024px) 1024px, 1366px" />
                      <Image
                        src={imageSources.fallback}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={1366}
                        height={768}
                      />
                    </picture>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{post.date}</p>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3">{post.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{post.excerpt}</p>
                    <div className="text-red-600 dark:text-red-400 font-semibold flex items-center hover:underline">
                      Leer más
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <a
            href="/blog"
            className="bg-red-600 dark:bg-red-700 text-white dark:text-white inline-block py-3 px-6 rounded-full"
          >
            Ver todas las noticias
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

