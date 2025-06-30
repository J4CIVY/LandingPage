import React from "react";

const BlogSection = () => {
  const blogPosts = [
    { id: 1, title: 'Consejos para viajes largos en moto', excerpt: 'Aprende cómo prepararte para tus aventuras en carretera...', date: '10 Sept 2023' },
    { id: 2, title: 'Nuevas regulaciones de seguridad', excerpt: 'Los cambios en la normativa que todo motociclista debe conocer...', date: '28 Ago 2023' }
  ];

  return (
    <section className="py-20 px-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-950 mb-12">
          BLOG & <span className="text-[#00FF99]">NOTICIAS</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {blogPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                <img
                  src={`/${post.title}.webp`}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                <h3 className="text-xl font-bold text-slate-950 mb-3">{post.title}</h3>
                <p className="text-gray-700 mb-4">{post.excerpt}</p>
                <button className="text-red-600 font-semibold flex items-center hover:underline">
                  Leer más
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;